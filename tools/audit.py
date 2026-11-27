#!/usr/bin/env python3
"""Audit the research-os contract. Exit 1 on errors (--strict: also on warnings).
Run from anywhere: python3 tools/audit.py"""
import json
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SECTIONS = ["In short", "What we do", "Competing explanations", "What we expect",
            "Falsification", "What would make us distrust a result", "Results", "Verdict"]
EXP_ENUMS = {"status": {"planned", "running", "done", "abandoned"},
             "stage": {"preliminary", "main", "replication"},
             "ran_by": {"AI-run", "AI-assisted", "hand-run"},
             "review": {"unreviewed", "reviewed"}}
VERDICTS = {"supported", "refuted", "inconclusive"}
errors, warnings = [], []


def registry(name):
    """Parse a hand-edited data/*.js registry: the body must be strict JSON."""
    text = (ROOT / "data" / name).read_text()
    try:
        return json.loads(text[text.index("["):text.rindex("]") + 1])
    except ValueError as e:
        errors.append(f"data/{name}: body is not strict JSON ({e})")
        return []


def sections_of(md):
    """Split a page on '## Heading' lines -> {heading: body}."""
    parts = re.split(r"^## +(.+?)\s*$", md, flags=re.M)
    return dict(zip(parts[1::2], (b.strip() for b in parts[2::2])))


def first_commit_epoch(path):
    """Epoch of the first commit touching path, or None if untracked/no repo."""
    out = subprocess.run(["git", "log", "--follow", "--format=%ct", "--", path],
                         cwd=ROOT, capture_output=True, text=True).stdout.split()
    return int(out[-1]) if out else None


def flat_values(obj, acc):
    if isinstance(obj, dict):
        for v in obj.values():
            flat_values(v, acc)
    elif isinstance(obj, list):
        for v in obj:
            flat_values(v, acc)
    elif isinstance(obj, (int, float)) and not isinstance(obj, bool):
        acc.append(float(obj))


def check_numbers(slug, results_body, metrics):
    values = []
    flat_values(metrics, values)
    # standalone numbers only: not inside words (F1), ranges keep both ends
    for tok in re.findall(r"(?<![\w.])(?:\d+\.\d+|\d+)(?!\.?\d)(?!\w)", results_body):
        num = float(tok)
        if re.fullmatch(r"(19|20)\d\d", tok):  # years are not metrics
            continue
        # match if some metric value rounds to the number at its printed precision
        decimals = len(tok.split(".")[1]) if "." in tok else 0
        if not any(round(abs(v), decimals) == num or abs(v) == num for v in values):
            errors.append(f"{slug}: Results number {tok} not found in metrics.json")


def check_experiment(e):
    slug = e.get("slug", "?")
    for field, allowed in EXP_ENUMS.items():
        if e.get(field) not in allowed:
            errors.append(f"{slug}: {field}={e.get(field)!r} not in {sorted(allowed)}")
    status = e.get("status")
    page = ROOT / "exps" / f"{slug}.md"
    if not page.is_file():
        errors.append(f"{slug}: missing pre-registration exps/{slug}.md")
        return
    secs = sections_of(page.read_text())
    for s in SECTIONS:
        if s not in secs:
            errors.append(f"{slug}: exps/{slug}.md missing section '## {s}'")
    for s in SECTIONS[:6]:
        if not secs.get(s):
            errors.append(f"{slug}: pre-registration section '## {s}' is empty")
    results, verdict = secs.get("Results", ""), secs.get("Verdict", "")

    if status == "planned" and (results or verdict):
        errors.append(f"{slug}: planned but Results/Verdict already written")
    if status in ("running", "done"):
        if not (ROOT / "src" / "exps" / f"{slug}.py").is_file():
            errors.append(f"{slug}: {status} but no entrypoint src/exps/{slug}.py")
        commit = e.get("commit")
        if not commit:
            errors.append(f"{slug}: {status} but no commit pinned in experiments.js")
        elif subprocess.run(["git", "cat-file", "-e", str(commit)], cwd=ROOT,
                            capture_output=True).returncode != 0:
            errors.append(f"{slug}: pinned commit {commit} not found in git")
    if status == "running":
        prog = ROOT / "results" / slug / "progress.json"
        if not prog.is_file():
            warnings.append(f"{slug}: running but no results/{slug}/progress.json yet")
        elif time.time() - prog.stat().st_mtime > 86400:
            warnings.append(f"{slug}: progress.json older than 24h")
    if status == "done":
        if not results:
            errors.append(f"{slug}: done but Results is empty")
        if e.get("verdict") not in VERDICTS:
            errors.append(f"{slug}: done but verdict={e.get('verdict')!r}")
        metrics_path = ROOT / "results" / slug / "metrics.json"
        if not metrics_path.is_file():
            errors.append(f"{slug}: done but no results/{slug}/metrics.json")
        elif results:
            check_numbers(slug, results, json.loads(metrics_path.read_text()))
        reg, res = first_commit_epoch(f"exps/{slug}.md"), first_commit_epoch(f"results/{slug}/metrics.json")
        if reg and res and res < reg:
            errors.append(f"{slug}: metrics.json committed before the pre-registration")


def main():
    exps = registry("experiments.js")
    slugs = [e.get("slug") for e in exps]
    if len(slugs) != len(set(slugs)):
        errors.append("experiments.js: duplicate slugs")
    for e in exps:
        check_experiment(e)
    for p in registry("resources.js"):
        if p.get("status") not in ("unread", "reading", "completed"):
            errors.append(f"{p.get('slug')}: bad paper status {p.get('status')!r}")
        if p.get("status") != "unread" and not (ROOT / "notes" / f"{p.get('slug')}.md").is_file():
            warnings.append(f"{p.get('slug')}: status {p.get('status')} but no notes/{p.get('slug')}.md")
    for msg in errors:
        print(f"ERROR   {msg}")
    for msg in warnings:
        print(f"WARNING {msg}")
    print(f"{len(exps)} experiments audited: {len(errors)} errors, {len(warnings)} warnings")
    strict = "--strict" in sys.argv
    sys.exit(1 if errors or (strict and warnings) else 0)


if __name__ == "__main__":
    main()
