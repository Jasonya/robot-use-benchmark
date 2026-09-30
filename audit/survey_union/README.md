# Rebuild the source-union catalogue

This is a static source inventory, not simulator execution. Run with Python3.11 from the repository root:

```sh
python audit/survey_union/fetch_source_additions.py
python audit/survey_union/build_union_catalogue.py
python audit/survey_union/build_extension_examples.py
```

The fetcher uses the four published commits in `source_pins.json` and checks the CrossTask archive hash. It reads task code/metadata and does not download human videos or import simulator code. The builder joins the existing250-paper survey,68-work comparison and5,020-record snapshot, then adds288 official definitions. The included semantic input is a reduced copy of the previous static source index, not a new semantic-equivalence judgement.

Outputs in `content/survey_union/` retain source units, catalogue status and execution status separately. The143 registered evaluation-source records include dataset/benchmark versions and inherited review flags; unresolved resource roles remain visible. No complete-search, common-G2 or new-runtime claim is made.
