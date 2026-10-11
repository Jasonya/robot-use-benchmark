import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from urllib.parse import quote

from network import CACHE, ROOT, fetch, get_token


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("paper_ids", nargs="+")
    parser.add_argument("--query-file")
    parser.add_argument("--suffix", default="")
    args = parser.parse_args()
    rows = {r["paper_id"]: r for r in json.loads((CACHE / "project_candidates.json").read_text())}
    get_token()
    overrides = {
        "P001": "VLOG Fouhey", "P006": "Breakfast action Kuehne",
        "P007": "Charades-Ego", "P008": "EGTEA", "P009": "epic-kitchens annotations",
        "P014": "ego-exo4d", "P046": "rulstm", "P050": "PALM action anticipation",
        "P051": "USST", "P056": "forecasting hands objects",
        "P077": "cliport", "P078": "peract", "P080": "dexart",
        "P133": "RT-2 robotics transformer", "P136": "openpi", "P137": "openpi",
        "P138": "diffusion_policy", "P153": "EgoExo Gen",
        "P156": "egocentric survey", "P161": "first person action prediction survey",
        "P162": "egocentric hands survey", "P194": "cloth gripper interface",
        "P195": "world models unfolding", "P213": "vision harvest benchmark",
        "P214": "COIN interactive embodied", "P215": "world model evaluation survey",
        "P217": "TRS RVG egocentric", "P219": "FROST STA",
        "P234": "ego4dlta icvae", "P236": "ActFusion", "P239": "MVP action anticipation",
        "P242": "NAOGAT", "P243": "FactCheck action anticipation", "P245": "ICVL egocentric",
        "P246": "decision aware uncertainty egocentric",
    }
    if args.query_file:
        overrides.update(json.loads((ROOT / args.query_file).read_text()))
    def search(pid):
        query = overrides.get(pid, rows[pid]["name"].split(" / ")[0])
        url = f"https://api.github.com/search/repositories?q={quote(query)}&per_page=8"
        receipt, body = fetch(url, limit=3 * 1024 * 1024)
        data = json.loads(body) if body else {}
        result = {"paper_id": pid, "query": query, "receipt": receipt,
                  "total_count": data.get("total_count"), "results": [
                      {k: r.get(k) for k in ["full_name", "html_url", "description", "homepage", "fork", "created_at", "pushed_at"]}
                      for r in data.get("items", [])]}
        path = CACHE / "search" / f"{pid}{args.suffix}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
        return result
    with ThreadPoolExecutor(max_workers=1) as pool:
        for row in pool.map(search, args.paper_ids):
            print(json.dumps({"paper_id": row["paper_id"], "query": row["query"], "status": row["receipt"]["status"],
                              "matches": [{"repo": r["full_name"], "description": (r["description"] or "")[:260]} for r in row["results"]]}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
