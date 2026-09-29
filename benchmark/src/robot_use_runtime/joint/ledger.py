"""A real local SQLite fixture with explicit synthetic business semantics.

Each fresh idempotency key appends a claimed dispatch and updates its inventory.
The API does not observe physics or certify that a claim is true. Reusing a key
with the same payload is idempotent. A response-loss fault can occur after commit.
"""
from __future__ import annotations
from pathlib import Path
import json
import sqlite3

from ..common import digest

SQL_SCHEMA = """
CREATE TABLE catalog(sku TEXT PRIMARY KEY, visual_identity TEXT NOT NULL, label TEXT NOT NULL);
CREATE TABLE inventory(sku TEXT PRIMARY KEY, available INTEGER NOT NULL, declared_location TEXT NOT NULL);
CREATE TABLE orders(order_id TEXT PRIMARY KEY, sku TEXT NOT NULL, bay_id TEXT NOT NULL, quantity INTEGER NOT NULL, status TEXT NOT NULL);
CREATE TABLE dispatch_events(event_id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL,
  sku TEXT NOT NULL, bay_id TEXT NOT NULL, idempotency_key TEXT UNIQUE NOT NULL,
  payload_hash TEXT NOT NULL, control_step INTEGER NOT NULL);
"""


class DispatchLedger:
    def __init__(self, path: Path, order: dict, *, lose_first_commit_response=False):
        if path.exists():raise FileExistsError("Fresh per-trial database required")
        path.parent.mkdir(parents=True,exist_ok=True)
        self.path=path
        self.connection=sqlite3.connect(path)
        self.connection.executescript(SQL_SCHEMA)
        self.connection.executemany("INSERT INTO catalog VALUES(?,?,?)",[
            ("SKU-P","magenta","magenta rigid part"),("SKU-G","green","green rigid part")])
        self.connection.executemany("INSERT INTO inventory VALUES(?,?,?)",[
            ("SKU-P",1,"BUFFER"),("SKU-G",1,"BUFFER")])
        self.connection.execute("INSERT INTO orders VALUES(?,?,?,?,?)",[
            order["order_id"],order["sku"],order["bay_id"],1,"pending"])
        self.connection.commit()
        self.lose_response=bool(lose_first_commit_response)
        self.fault_fired=False
        self.last_internal_commit=None

    def catalog(self):
        return [{"sku":s,"visual_identity":v,"label":l} for s,v,l in self.connection.execute(
            "SELECT sku,visual_identity,label FROM catalog ORDER BY sku")]

    def get_order(self,order_id):
        row=self.connection.execute("SELECT order_id,sku,bay_id,quantity,status FROM orders WHERE order_id=?",[order_id]).fetchone()
        if row is None:return {"ok":False,"error":"unknown_order"}
        return {"ok":True,"order":dict(zip(["order_id","sku","bay_id","quantity","status"],row))}

    def inventory(self):
        return [{"sku":s,"available":n,"declared_location":p} for s,n,p in self.connection.execute(
            "SELECT sku,available,declared_location FROM inventory ORDER BY sku")]

    def record_dispatch(self,order_id,sku,bay_id,idempotency_key,control_step):
        if not all(isinstance(s,str) and 1<=len(s)<=160 for s in [order_id,sku,bay_id,idempotency_key]):
            return {"ok":False,"error":"invalid_argument"}
        if not self.get_order(order_id)["ok"] or sku not in {"SKU-P","SKU-G"} or bay_id not in {"BAY-L","BAY-R"}:
            return {"ok":False,"error":"unknown_identifier"}
        payload_hash=digest({"order_id":order_id,"sku":sku,"bay_id":bay_id})
        found=self.connection.execute(
            "SELECT event_id,payload_hash FROM dispatch_events WHERE idempotency_key=?",[idempotency_key]).fetchone()
        if found:
            if found[1]!=payload_hash:return {"ok":False,"error":"idempotency_payload_conflict"}
            self.last_internal_commit={"mutated":False,"event_id":found[0]}
            return {"ok":True,"event_id":found[0],"deduplicated":True}
        with self.connection:
            cursor=self.connection.execute(
                "INSERT INTO dispatch_events(order_id,sku,bay_id,idempotency_key,payload_hash,control_step) VALUES(?,?,?,?,?,?)",
                [order_id,sku,bay_id,idempotency_key,payload_hash,int(control_step)])
            self.connection.execute(
                "UPDATE inventory SET available=available-1,declared_location=? WHERE sku=?",[bay_id,sku])
            self.connection.execute("UPDATE orders SET status='completed' WHERE order_id=?",[order_id])
        event_id=int(cursor.lastrowid)
        self.last_internal_commit={"mutated":True,"event_id":event_id}
        if self.lose_response and not self.fault_fired:
            self.fault_fired=True
            return {"ok":False,"error":"transport_reply_lost","retryable":True}
        return {"ok":True,"event_id":event_id,"deduplicated":False}

    def snapshot(self):
        return {
            "catalog":self.catalog(),"inventory":self.inventory(),
            "orders":[dict(zip(["order_id","sku","bay_id","quantity","status"],r))
                      for r in self.connection.execute("SELECT * FROM orders ORDER BY order_id")],
            "dispatch_events":[dict(zip(["event_id","order_id","sku","bay_id","idempotency_key","payload_hash","control_step"],r))
                               for r in self.connection.execute("SELECT * FROM dispatch_events ORDER BY event_id")],
        }

    def close(self):self.connection.close()


def evaluate_digital_state(snapshot: dict, order: dict) -> dict:
    events=snapshot["dispatch_events"]
    orders=snapshot["orders"]
    inventory={r["sku"]:r for r in snapshot["inventory"]}
    other=next(s for s in inventory if s!=order["sku"])
    one_event=len(events)==1
    correct_event=one_event and all(events[0][k]==order[k] for k in ["order_id","sku","bay_id"])
    correct_order=(len(orders)==1 and all(orders[0][k]==order[k] for k in ["order_id","sku","bay_id","quantity"])
                   and orders[0]["status"]=="completed")
    correct_inventory=(set(inventory)=={"SKU-P","SKU-G"} and inventory[order["sku"]]["available"]==0
        and inventory[order["sku"]]["declared_location"]==order["bay_id"]
        and inventory[other]["available"]==1 and inventory[other]["declared_location"]=="BUFFER")
    return {"exactly_one_dispatch":one_event,"correct_dispatch_fields":bool(correct_event),
            "order_completed":bool(correct_order),"inventory_consistent":bool(correct_inventory),
            "digital_success":bool(correct_event and correct_order and correct_inventory)}
