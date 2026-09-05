#!/bin/zsh
# Auto-backup: commit all changes and push to GitHub.
# Invoked manually or via automated trigger/hook.

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT" || exit 0

git add -A
if ! git diff --cached --quiet; then
  git commit -q -m "auto-backup: $(date '+%Y-%m-%d %H:%M')"
fi

if ! git push -q origin HEAD 2>/dev/null; then
  echo '{"systemMessage":"⚠️ Auto-backup: changes committed locally but push to GitHub failed (offline or auth issue). They will be pushed on the next backup."}'
fi
exit 0
