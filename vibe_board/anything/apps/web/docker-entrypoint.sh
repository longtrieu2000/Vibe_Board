#!/bin/sh
set -e

LOG_DIR="/app/logs"
LOG_FILE="${LOG_DIR}/app.log"

# Ensure logs directory exists
mkdir -p "$LOG_DIR"

echo "========================================" >> "$LOG_FILE"
echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] Starting ViralBoard Web..." >> "$LOG_FILE"
echo "NODE_ENV=${NODE_ENV}" >> "$LOG_FILE"
echo "PORT=${PORT}" >> "$LOG_FILE"
echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo 'yes' || echo 'NO - MISSING!')" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Use exec so PID 1 is the node process (receives signals properly)
# Redirect stderr to stdout, then tee to both console and log file
exec node ./build/server/index.js 2>&1 | tee -a "$LOG_FILE"
