#!/bin/bash
# Usage: sbatch slurm/gpu.sbatch src/exps/<slug>.py   (run from the repo root)
#SBATCH --account=mzampier
#SBATCH --partition=contrib-gpuq
#SBATCH --gres=gpu:1
#SBATCH --cpus-per-task=8
#SBATCH --mem=64G
#SBATCH --time=24:00:00
#SBATCH --output=logs/%x-%j.out
set -euo pipefail
source .env
exec "${PYTHON:-python3}" "$@"
