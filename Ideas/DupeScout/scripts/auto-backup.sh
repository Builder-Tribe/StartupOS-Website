#!/bin/zsh
# Auto-backup: commit all changes and push to GitHub.
# Invoked by the Claude Code Stop hook (see .claude/settings.json).
cd "/Users/harshitag/Documents/Vibe Coding/Vibe Coding - Claude/DupeScout" || exit 0

git add -A
if ! git diff --cached --quiet; then
  git commit -q -m "auto-backup: $(date '+%Y-%m-%d %H:%M')"
fi

if ! git push -q origin HEAD 2>/dev/null; then
  echo '{"systemMessage":"⚠️ Auto-backup: changes committed locally but push to GitHub failed (offline or auth issue). They will be pushed on the next backup."}'
fi
exit 0
