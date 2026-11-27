# research-os

A research workspace you clone and hand to an agent. It is three things at once:

- a **lab notebook published as a static site** — Home (running + unreviewed
  experiments), Readings (papers with notes), Experiments (everything, filterable);
- a **pre-registration discipline** — every experiment commits its hypothesis,
  competing explanations, and falsification rule *before* it runs, and its
  verdict is computed against that rule, never typed;
- an **evidence chain** — every number on the site traces to a `metrics.json`
  written by that experiment's entrypoint, every big artifact to a hash in its
  manifest, machine-checked by `tools/audit.py`.

No build step, no server code, no dependencies beyond Python's standard library.

## Start a project

```bash
git clone <this-repo> my-project && cd my-project
claude                      # or your coding agent
> /new-project https://arxiv.org/abs/XXXX.XXXXX
```

The agent reads the paper, fills in the project (`data/site.js`), registers the
paper with notes, proposes a first pre-registered experiment, then serves the
site and shows it to you.

## Or by hand

```bash
python3 -m http.server 8790     # → http://localhost:8790
```

Edit the three registries in `data/` (their array bodies are strict JSON), copy
`exps/_template.md` / `notes/_template.md` for new pages, and run
`python3 tools/audit.py` to check the contract. `CLAUDE.md` documents the full
lifecycle, layout, and rules; it is written for agents but is the reference for
humans too.

## Heavy experiments

One entrypoint per experiment (`src/exps/<slug>.py`), submitted through
`slurm/` (edit the account/partition headers for your cluster). Big outputs go
under `$ARTIFACTS` (set in `.env`), never in git; the repo keeps only
hash-pinned manifests. The locally-served Home page overlays live progress from
`results/<slug>/progress.json` while jobs run.

## Publish

GitHub Pages: Settings → Pages → deploy from branch, `main`, `/ (root)`. The
published site shows the last committed state; unreviewed results stay local
until the owner reviews them (`git add -f results/<slug>/`).

MIT license.
