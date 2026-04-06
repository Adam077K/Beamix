#!/bin/bash
# Sourced by Ghostty via -e flag — loads shell env + runs beamix
source ~/.zprofile 2>/dev/null
source ~/.zshrc 2>/dev/null
beamix 2 --grid
exec zsh -l
