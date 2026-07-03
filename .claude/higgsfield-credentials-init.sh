#!/usr/bin/env bash
# Writes ~/.config/higgsfield/credentials.json from environment variables.
# Set HIGGSFIELD_ACCESS_TOKEN (required) and HIGGSFIELD_REFRESH_TOKEN (optional)
# in your Claude Code environment settings — never paste them in chat.

set -euo pipefail

if [[ -z "${HIGGSFIELD_ACCESS_TOKEN:-}" ]]; then
  exit 0  # env var not configured; skip silently
fi

mkdir -p "$HOME/.config/higgsfield"

printf '{"access_token":"%s","refresh_token":"%s","auth_version":1}\n' \
  "$HIGGSFIELD_ACCESS_TOKEN" \
  "${HIGGSFIELD_REFRESH_TOKEN:-}" \
  > "$HOME/.config/higgsfield/credentials.json"

chmod 600 "$HOME/.config/higgsfield/credentials.json"
