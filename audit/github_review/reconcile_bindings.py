"""Reconcile provisional repository candidates with validated authored readings.

Keeps unselected candidates separate. Reading source bytes is not a blanket
officiality or runnable-release claim.
"""
from collections import defaultdict
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[2]
FOLDER = ROOT / "content/github_review"


def names(entry):
    return {str(entry.get(key, "")).lower() for key in
            ["requested_repo", "resolved_repo", "repo"] if entry.get(key)}


def main():
    ledger = json.loads((FOLDER / "compiled_reviews.json").read_text())
    validation = json.loads((FOLDER / "validation.json").read_text())
    if validation["status"] != "passed":
        raise SystemExit("Correct review evidence before reconciling repository identities.")
    authored = {}
    for row in ledger["rows"]:
        note = row["review"]
        if not note:
            continue
        path = FOLDER / "reviews" / f"{row['paper_id']}.json"
        raw = path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != note["review_sha256"]:
            raise SystemExit(f"{row['paper_id']}: review changed; compile and validate again first.")
        authored[row["paper_id"]] = json.loads(raw)
    bindings = json.loads((FOLDER / "repository_bindings.json").read_text())
    indexed = {row["paper_id"]: row for row in bindings}
    updated = 0
    for row in ledger["rows"]:
        note = row["review"]
        if not note:
            continue
        binding = indexed[row["paper_id"]]
        old = binding["repositories"] + binding.get("unreviewed_candidates", [])
        # An authored lead is discoverable even when it was not selected for
        # source reading. Preserve its role/access caveat without promoting it.
        for proposal in authored[row["paper_id"]].get("additional_repo_proposals", []):
            if proposal.get("host") == "huggingface" or proposal.get("provider") == "huggingface_dataset":
                # Retained in the authored review; this table binds GitHub only.
                continue
            repo = proposal.get("repo") or proposal.get("requested_repo", "")
            if not re.fullmatch(r"[\w.-]+/[\w.-]+", repo):
                raise SystemExit(f"{row['paper_id']}: invalid proposed repository {repo!r}")
            existing = next((candidate for candidate in old if repo.lower() in names(candidate)), None)
            lead = {
                "kind": "authored_discovery_lead",
                "paper_id": row["paper_id"],
                "review_sha256": note["review_sha256"],
                "proposal": proposal,
            }
            if existing is not None:
                existing["link_evidence"] = [
                    item for item in existing.get("link_evidence", [])
                    if item.get("kind") != "authored_discovery_lead"
                ] + [lead]
                continue
            old.append({
                "requested_repo": repo,
                "link_evidence": [lead],
                "selection_status": "candidate_requires_source_review",
            })
        grouped = defaultdict(list)
        for reading in note["reading_order"]:
            if reading.get("provider", "github") != "github":
                continue
            grouped[reading["repo"].lower()].append(reading)
        alias_notes = authored[row["paper_id"]].get("repository_aliases", [])
        for alias in alias_notes:
            for field in ["repo", "canonical_repo"]:
                if not re.fullmatch(r"[\w.-]+/[\w.-]+", alias.get(field, "")):
                    raise SystemExit(f"{row['paper_id']}: invalid repository alias")
            if alias["canonical_repo"].lower() not in grouped or not alias.get("evidence"):
                raise SystemExit(f"{row['paper_id']}: alias must point to a reviewed repository and have evidence")
        selected = []
        consumed = set()
        for canonical, readings in sorted(grouped.items()):
            aliases = {reading[key].lower() for reading in readings
                       for key in ["repo", "requested_repo"] if reading.get(key)}
            related_aliases = [alias for alias in alias_notes
                               if alias["canonical_repo"].lower() == canonical]
            aliases.update(alias["repo"].lower() for alias in related_aliases)
            matched = []
            for index, candidate in enumerate(old):
                if names(candidate) & aliases:
                    matched.append(candidate)
                    consumed.add(index)
            first = readings[0]
            requested = matched[0]["requested_repo"] if matched else first["requested_repo"]
            evidence, evidence_seen = [], set()
            for candidate in matched:
                for item in candidate.get("link_evidence", []):
                    fingerprint = json.dumps(item, sort_keys=True)
                    if fingerprint not in evidence_seen:
                        evidence.append(item)
                        evidence_seen.add(fingerprint)
            # Replace our previous review edge, retaining paper/project discovery.
            evidence = [item for item in evidence if item.get("kind") not in
                        {"authored_source_review", "authored_repository_alias"}]
            for alias in related_aliases:
                evidence.append({
                    "kind": "authored_repository_alias",
                    "paper_id": row["paper_id"],
                    "review_sha256": note["review_sha256"],
                    "alias": alias,
                })
            evidence.append({
                "kind": "authored_source_review", "paper_id": row["paper_id"],
                "review_file": f"content/github_review/reviews/{row['paper_id']}.json",
                "review_sha256": note["review_sha256"],
                "basis": "Pinned file sections and source-specific identity/version notes",
            })
            versions = []
            for commit in sorted({reading["commit"] for reading in readings}):
                files = sorted({reading["path"] for reading in readings if reading["commit"] == commit})
                versions.append({"commit": commit, "reviewed_files": files})
            selected.append({
                "requested_repo": requested, "resolved_repo": first["repo"],
                "aliases_in_this_review": sorted(aliases),
                "selection_status": "source_sections_recorded_at_pinned_revisions",
                "source_role": "project_or_leaderboard_website" if note["status"] == "website_only" else "reviewed_source",
                "identity_scope": "See authored paper-specific identity and version notes; roles may include dependencies.",
                "review_status": note["status"], "versions": versions,
                "link_evidence": evidence,
            })
        candidates = []
        seen = set()
        exclusions = {
            item["repo"].lower(): item["reason"]
            for item in authored[row["paper_id"]].get("excluded_repositories", [])
        }
        dispositions = {
            item["repo"].lower(): item
            for item in authored[row["paper_id"]].get("repository_candidate_dispositions", [])
        }
        for repo, disposition in dispositions.items():
            if not re.fullmatch(r"[\w.-]+/[\w.-]+", repo) or not disposition.get("reason") or not disposition.get("evidence"):
                raise SystemExit(f"{row['paper_id']}: candidate disposition needs repository, reason and evidence")
        for index, candidate in enumerate(old):
            if index in consumed:
                continue
            key = candidate["requested_repo"].lower()
            if key in seen:
                continue
            seen.add(key)
            entry = {
                **candidate, "selection_status": "not_used_in_current_authored_review",
                "candidate_scope": "Retained discovery lead, not a confirmed implementation for this paper.",
            }
            excluded_reason = next((exclusions[key] for key in names(candidate) if key in exclusions), None)
            if excluded_reason:
                entry.update(selection_status="excluded_as_unrelated", exclusion_reason=excluded_reason)
            else:
                decision = next((dispositions[key] for key in names(candidate) if key in dispositions), None)
                if decision:
                    entry.update(
                        selection_status="explained_source_lead",
                        disposition_type=decision.get("status", "scoped_followup"),
                        disposition_note=decision["reason"],
                        disposition_evidence=decision["evidence"],
                    )
            candidates.append(entry)
        binding.update(
            repositories=selected, unreviewed_candidates=candidates,
            review_status=note["status"], review_sha256=note["review_sha256"],
            discovery_status="authored_disposition_recorded",
        )
        updated += 1
    (FOLDER / "repository_bindings.json").write_text(json.dumps(bindings, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({
        "reconciled_papers": updated,
        "bound_paper_repository_edges": sum(len(row["repositories"]) for row in bindings if row.get("review_sha256")),
        "unreviewed_candidate_edges": sum(len(row.get("unreviewed_candidates", [])) for row in bindings),
        "scope": "Reviewed source roles remain distinct from implementation availability and runtime execution.",
    }, indent=2))


if __name__ == "__main__":
    main()
