# research-os — agent contract

This repo is a research operating system: a lab notebook published as a static
site, backed by pre-registered experiments and an auditable evidence chain.
Any agent working here follows this contract. Run `python3 tools/audit.py`
after every change you make; it must pass.

## Setup

A fresh clone is set up with the `/new-project` command (.claude/commands/new-project.md):
it fills `data/site.js`, registers the first paper, creates `.env` from
`.env.example`, serves the site locally, and shows it to the owner.

## Layout

- `data/site.js · resources.js · experiments.js` — hand-edited registries, the
  source of truth. Their array bodies must stay **strict JSON** (double quotes,
  `null`, no trailing commas): `tools/audit.py` parses them. Newest entries first.
- `exps/<slug>.md` — one pre-registration page per experiment (copy `_template.md`).
- `notes/<slug>.md` — one reading-note page per paper (copy `_template.md`).
- `src/lib/` — shared pure functions; `src/lib/exp.py` is the **only** writer of
  `results/<slug>/`. `src/exps/<slug>.py` — one entrypoint per experiment; no
  interesting CLI arguments: seeds, splits, revisions live in `configs/<slug>.yaml`.
- `results/<slug>/` — metrics.json, progress.json, artifacts.json, plots. Small
  files only; gitignored until the owner reviews, then `git add -f results/<slug>/`.
- Big files (checkpoints, datasets, predictions) live under `$ARTIFACTS` (set in
  `.env`), never in the repo: `datasets/<name>-<version>/`, `models/<slug>/`,
  `runs/<slug>/`, `cache/`. Record them with `exp.write_artifacts`; load another
  experiment's outputs only through `exp.resolve_artifact` (hash-verified).
- `slurm/` — gpu/cpu/array wrappers; `tools/audit.py` — contract checker.

## Experiment lifecycle

planned → running → done (→ reviewed) — or abandoned, with one line saying why.

1. **Register before running.** Add the entry to `data/experiments.js` with
   status `planned`, and write `exps/<slug>.md` with all sections through
   "What would make us distrust a result" filled. Falsification fixes the
   tolerance. Results and Verdict stay empty. **Commit this before any run.**
2. **Run.** Commit code, then submit: `sbatch slurm/gpu.sbatch src/exps/<slug>.py`
   (sweeps: `slurm/array.sbatch`, aggregated into one metrics.json — one slug,
   one verdict). Set status `running`; pin `commit` (current git hash) and
   `jobid` in experiments.js. The entrypoint calls `exp.progress()` periodically;
   never hand-edit progress.
3. **Collect.** When the job finishes (logs in `logs/`), fill Results from
   `results/<slug>/metrics.json` — every number in Results must exist there —
   and set the verdict **by applying the Falsification rule**, never by judgment.
   Set status `done`.
4. **Review is human-only.** Never set `review: "reviewed"` and never
   `git add -f results/` yourself; the owner does both.

## Hard rules

- Never write Results or a verdict into a `planned` experiment.
- Numbers from notebooks or shell output are exploratory; only entrypoint-written
  `metrics.json` values reach Results, the site, or any claim.
- No model inference or training on the login shell — everything heavy goes
  through `slurm/`. Keep the interactive shell for editing, auditing, serving.
- Add only features the owner asks for. Follow the existing plain design:
  tokens.css variables only, hairline rows, no cards or badges.
- Code style: minimal lines, no duplication, no fallbacks or dead branches —
  fail loudly; use asserts to catch bugs early.

## Commands

```bash
python3 -m http.server 8790            # serve the site → http://localhost:8790
python3 tools/audit.py [--strict]      # contract check; exit 1 on errors
sbatch slurm/gpu.sbatch src/exps/<slug>.py
```
