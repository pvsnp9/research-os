#!/bin/bash
# Usage: sbatch slurm/cpu.sbatch src/exps/<slug>.py   (run from the repo root)
#SBATCH --account=mzampier
#SBATCH --cpus-per-task=8
#SBATCH --mem=32G
#SBATCH --time=12:00:00
#SBATCH --output=logs/%x-%j.out
set -euo pipefail
source .env
exec "${PYTHON:-python3}" "$@"
