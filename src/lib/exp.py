"""The only sanctioned writer of results/<slug>/. Entrypoints import this;
notebooks may import it read-only but never write Results numbers themselves."""
import hashlib
import json
import os
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def _write(slug: str, name: str, obj) -> Path:
    out = ROOT / "results" / slug
    out.mkdir(parents=True, exist_ok=True)
    path = out / name
    path.write_text(json.dumps(obj, indent=2, sort_keys=True) + "\n")
    return path


def write_metrics(slug: str, metrics: dict) -> Path:
    """Every number that reaches a Results section must be a value in here."""
    assert isinstance(metrics, dict) and metrics, "metrics must be a non-empty dict"
    return _write(slug, "metrics.json", metrics)


def progress(slug: str, percent: float, now: str) -> Path:
    """Call periodically during a long run; Home overlays this live."""
    assert 0 <= percent <= 100
    return _write(slug, "progress.json",
                  {"percent": round(percent, 1), "now": now,
                   "updated": time.strftime("%Y-%m-%d %H:%M")})


def artifacts_root() -> Path:
    """Big outputs (checkpoints, predictions) live under $ARTIFACTS, never in git."""
    root = os.environ.get("ARTIFACTS")
    assert root, "set ARTIFACTS in .env (big files never live inside the repo)"
    return Path(root)


def write_artifacts(slug: str, paths: list) -> Path:
    """Record each produced artifact (path under $ARTIFACTS) with size + sha256."""
    root = artifacts_root()
    entries = []
    for p in paths:
        p = Path(p)
        assert p.is_file(), f"artifact missing: {p}"
        digest = hashlib.sha256(p.read_bytes()).hexdigest()
        entries.append({"path": str(p.relative_to(root)),
                        "size": p.stat().st_size, "sha256": digest})
    return _write(slug, "artifacts.json", entries)


def resolve_artifact(producer_slug: str, name: str) -> Path:
    """Load another experiment's artifact through its manifest, verifying the hash."""
    manifest = json.loads((ROOT / "results" / producer_slug / "artifacts.json").read_text())
    entry = next(e for e in manifest if e["path"].endswith(name))
    path = artifacts_root() / entry["path"]
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    assert digest == entry["sha256"], f"hash mismatch for {path}: artifact changed since recorded"
    return path
