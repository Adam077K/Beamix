#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  Beamix War Room — Double Clap Trigger
#  Called by detector.py when two claps are detected.
#
#  If Ghostty is running → bring it to front
#  If Ghostty is NOT running → open it, type "beamix 2 --grid", press Enter
# ─────────────────────────────────────────────────────────────

LOG="$HOME/.beamix/clap.log"
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] TRIGGER: $1" >> "$LOG"; }

if pgrep -xi ghostty >/dev/null 2>&1; then
    log "Ghostty is running — activating"
    osascript -e 'tell application "Ghostty" to activate'
else
    log "Ghostty not running — launching + typing command"

    # Open Ghostty
    open -a Ghostty

    # Wait until Ghostty has a window (up to 5s)
    for i in $(seq 1 50); do
        WINS=$(osascript -e 'tell application "Ghostty" to return count of windows' 2>/dev/null)
        if [ "$WINS" -gt 0 ] 2>/dev/null; then
            log "Ghostty window ready (attempt $i)"
            break
        fi
        sleep 0.1
    done

    # Wait for shell prompt to fully load
    sleep 1.5

    # Type using key codes (hardware-level, works regardless of Hebrew/English layout)
    # b=11 e=14 a=0 m=46 i=34 x=7 space=49 2=19 -=27 g=5 r=15 d=2 enter=36
    osascript -e '
tell application "Ghostty" to activate
delay 0.5
tell application "System Events"
    tell process "Ghostty"
        set frontmost to true
        delay 0.3
        key code 11
        key code 14
        key code 0
        key code 46
        key code 34
        key code 7
        key code 49
        key code 19
        key code 49
        key code 27
        key code 27
        key code 5
        key code 15
        key code 34
        key code 2
        delay 0.3
        key code 36
    end tell
end tell
'
    log "Command typed and Enter pressed"
fi
