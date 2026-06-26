---
name: setup-statusline
description: Configure the Claude Code status line to show cwd, git branch, model, and live context usage as "18.2k/1m tokens (2%)". Use when the user wants to set up, customize, or fix their statusline / context-usage indicator, or asks why the statusline shows "ctx 0".
---

# Setup Status Line

Sets up a Claude Code status line that reads:

```
support-triage-kata · ⎇ main · Opus 4.8 (1M context) · 18.2k/1m tokens (2%)
```

That is: leaf folder · git branch · model display name · context-token usage as a
fraction of a 1M-token window, with a percentage.

## How the context number works

Claude Code pipes a JSON payload to the status line command on stdin. The live
token count comes from the **last assistant turn's `usage`** in the transcript
(`input_tokens + cache_read_input_tokens + cache_creation_input_tokens`) — this is
everything currently in context. It only updates after a real model round-trip, so
a brand-new session (only local slash commands run) legitimately shows `0`.

**macOS gotcha:** do NOT use `tac` to read the transcript — it does not exist on
macOS, so the count silently stays `0`. Use `grep '"usage"' … | tail -1` instead.
This is the most common cause of a stuck `ctx 0`.

## Steps

### 1. Write `~/.claude/statusline-command.sh`

Create the file with exactly this content:

```bash
#!/usr/bin/env bash
# Claude Code status line: cwd · git branch · model · context-token usage.
# Receives a JSON payload from Claude Code on stdin.

input=$(cat)

# --- Pull fields from the payload ---------------------------------------
cur_dir=$(printf '%s' "$input" | jq -r '.workspace.current_dir // .cwd // empty')
model=$(printf '%s' "$input" | jq -r '.model.display_name // empty')
transcript=$(printf '%s' "$input" | jq -r '.transcript_path // empty')

# --- Pretty cwd (abbreviate $HOME to ~) ---------------------------------
dir_disp="$cur_dir"
case "$cur_dir" in
  "$HOME"*) dir_disp="~${cur_dir#$HOME}" ;;
esac
dir_disp="${dir_disp##*/}"   # show just the leaf folder; drop this line for full path

# --- Git branch ----------------------------------------------------------
branch=""
if git -C "$cur_dir" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  branch=$(git -C "$cur_dir" branch --show-current 2>/dev/null)
fi

# --- Context token usage -------------------------------------------------
# The last assistant turn's usage reflects everything currently in context:
# input + cache-read + cache-creation tokens.
# NOTE: use `grep … | tail -1`, NOT `tac` (tac does not exist on macOS).
ctx_tokens=0
if [ -n "$transcript" ] && [ -f "$transcript" ]; then
  usage_line=$(grep '"usage"' "$transcript" 2>/dev/null | tail -1)
  if [ -n "$usage_line" ]; then
    ctx_tokens=$(printf '%s' "$usage_line" | jq -r '
      (.message.usage // {}) |
      ((.input_tokens // 0) + (.cache_read_input_tokens // 0) + (.cache_creation_input_tokens // 0))
    ' 2>/dev/null)
  fi
fi
[ -z "$ctx_tokens" ] && ctx_tokens=0

# Format as e.g. 18.2k and a % of the 1m window.
ctx_fmt=$(awk -v t="$ctx_tokens" 'BEGIN{ if (t>=1000) printf "%.1fk", t/1000; else printf "%d", t }')
ctx_pct=$(awk -v t="$ctx_tokens" 'BEGIN{ printf "%.0f", (t/1000000)*100 }')

# --- ANSI colors ---------------------------------------------------------
# Use ANSI-C quoting ($'…') so these hold real ESC bytes. That lets us print
# the final string with `printf '%s'` (no `%b`), which avoids interpreting
# backslash escapes inside attacker-controlled fields like the cwd leaf.
DIM=$'\033[2m'; CYAN=$'\033[36m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; RESET=$'\033[0m'
ctx_color="$GREEN"
[ "$ctx_tokens" -ge 120000 ] && ctx_color="$YELLOW"     # yellow past 120k
[ "$ctx_tokens" -ge 150000 ] && ctx_color=$'\033[31m'   # red past 150k

# --- Compose -------------------------------------------------------------
out="${CYAN}${dir_disp}${RESET}"
[ -n "$branch" ] && out="${out} ${DIM}·${RESET} ${GREEN}⎇ ${branch}${RESET}"
[ -n "$model" ] && out="${out} ${DIM}·${RESET} ${model}"
out="${out} ${DIM}·${RESET} ${ctx_color}${ctx_fmt}/1m tokens (${ctx_pct}%)${RESET}"

# Colors are already real ESC bytes (ANSI-C quoting above), so print verbatim
# with '%s' — never '%b', which would interpret escapes in dynamic fields.
printf '%s' "$out"
```

### 2. Make it executable

```bash
chmod +x ~/.claude/statusline-command.sh
```

### 3. Point settings.json at it

Set the `statusLine` key in `~/.claude/settings.json` (create the file if missing,
merge the key if it exists — don't clobber other settings):

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline-command.sh"
  }
}
```

### 4. Verify

Render it with a fake payload and strip ANSI to confirm the format:

```bash
# Use mktemp for both temp files (no fixed /tmp names → no symlink/CWE-377 race).
sl_in=$(mktemp); sl_tx=$(mktemp)
printf '%s\n' '{"message":{"usage":{"input_tokens":18200}}}' > "$sl_tx"
echo '{"workspace":{"current_dir":"'"$PWD"'"},"model":{"display_name":"Opus 4.8 (1M context)"},"transcript_path":"'"$sl_tx"'"}' > "$sl_in"
bash ~/.claude/statusline-command.sh < "$sl_in" | sed 's/\x1b\[[0-9;]*m//g'; echo
rm -f "$sl_in" "$sl_tx"
```

Expected: `<leaf> · ⎇ <branch> · Opus 4.8 (1M context) · 18.2k/1m tokens (2%)`

A live session updates the number after the next model response.

## Knobs

- **Window size**: the `1000000` divisor and the `/1m` label. Change both together
  for a different context window (e.g. `200000` and `/200k`).
- **Color thresholds**: absolute token counts — yellow past 120k, red past 150k
  (`ctx_tokens -ge …`). These are independent of the window size above.
- **Full path instead of leaf**: delete the `dir_disp="${dir_disp##*/}"` line.

## Requirements

- `jq` and `awk` must be on PATH (both standard on macOS / most Linux).
