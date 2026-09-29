
CREATE TABLE catalog(sku TEXT PRIMARY KEY, visual_identity TEXT NOT NULL, label TEXT NOT NULL);
CREATE TABLE inventory(sku TEXT PRIMARY KEY, available INTEGER NOT NULL, declared_location TEXT NOT NULL);
CREATE TABLE orders(order_id TEXT PRIMARY KEY, sku TEXT NOT NULL, bay_id TEXT NOT NULL, quantity INTEGER NOT NULL, status TEXT NOT NULL);
CREATE TABLE dispatch_events(event_id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL,
  sku TEXT NOT NULL, bay_id TEXT NOT NULL, idempotency_key TEXT UNIQUE NOT NULL,
  payload_hash TEXT NOT NULL, control_step INTEGER NOT NULL);
