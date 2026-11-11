#!/usr/bin/env bash
# Empty git repository with a noreply identity, so the skill's pre-flight checks pass.
set -euo pipefail
git init -q
git config user.email "eval@users.noreply.github.com"
git config user.name "Eval"
