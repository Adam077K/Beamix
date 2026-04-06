#!/usr/bin/env python3
"""
Triple-clap detector for Beamix War Room.

Listens for three claps within a time window and triggers a shell script.
Designed to run as a macOS launchd daemon.

Install: pip install sounddevice numpy
macOS:   brew install portaudio

Usage:   python3 detector.py
         python3 detector.py --tune   (live RMS meter for calibration)
"""

import os
import sys
import time
import subprocess
import signal

import numpy as np
import sounddevice as sd

# ── Configuration ────────────────────────────────────────────
SAMPLE_RATE = 16000          # 16kHz — sufficient for clap detection, saves CPU
BLOCK_SIZE = 512             # ~32ms per chunk at 16kHz
RMS_THRESHOLD = 0.15         # Amplitude threshold (tune with --tune)
CLAP_MAX_DURATION = 0.30     # Max 300ms for a valid clap (laptop mics sustain longer)
DOUBLE_CLAP_WINDOW = 0.5     # 2 claps must land within 0.5 seconds (fast double clap)
CLAP_MIN_GAP = 0.08          # Min 80ms between claps (rejects single long sound)
COOLDOWN = 1.0               # Seconds to ignore after a trigger fires
REQUIRED_CLAPS = 2           # Number of claps to trigger

TRIGGER_SCRIPT = os.path.expanduser("~/.beamix/clap/trigger.sh")
LOG_FILE = os.path.expanduser("~/.beamix/clap.log")

# ── State ────────────────────────────────────────────────────
clap_times = []              # Timestamps of recent valid claps
last_trigger_time = 0.0
in_clap = False
clap_start_time = 0.0


def log_event(message):
    """Append a timestamped line to the audit log."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {message}\n"
    try:
        os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
        with open(LOG_FILE, "a") as f:
            f.write(line)
    except OSError:
        pass
    print(line.strip(), flush=True)


def trigger():
    """Fire the trigger script."""
    global last_trigger_time
    now = time.time()
    if now - last_trigger_time < COOLDOWN:
        return
    last_trigger_time = now

    log_event("DOUBLE CLAP DETECTED — firing trigger")
    try:
        subprocess.Popen(
            ["/bin/bash", TRIGGER_SCRIPT],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except Exception as e:
        log_event(f"ERROR running trigger: {e}")


def audio_callback(indata, frames, time_info, status):
    """Called for each audio block. Detects clap transients."""
    global in_clap, clap_start_time, clap_times

    if status:
        print(f"Audio status: {status}", file=sys.stderr, flush=True)

    rms = float(np.sqrt(np.mean(indata ** 2)))
    now = time.time()

    if rms > RMS_THRESHOLD and not in_clap:
        # Rising edge — sound started
        in_clap = True
        clap_start_time = now

    elif rms < RMS_THRESHOLD * 0.4 and in_clap:
        # Falling edge — sound ended
        in_clap = False
        duration = now - clap_start_time

        # Debug: log every detected sound event
        print(f"[DEBUG] sound duration={duration:.3f}s rms_peak, accepted={duration < CLAP_MAX_DURATION}", flush=True)

        # Filter: claps are short transients
        if duration < CLAP_MAX_DURATION:
            # Check gap from previous clap
            if not clap_times or (now - clap_times[-1]) >= CLAP_MIN_GAP:
                clap_times.append(now)
                print(f"[DEBUG] clap #{len(clap_times)} registered", flush=True)

                # Trim old claps outside the window
                clap_times = [t for t in clap_times if now - t <= DOUBLE_CLAP_WINDOW]

                # Fast double clap within window → trigger
                if len(clap_times) >= REQUIRED_CLAPS:
                    trigger()
                    clap_times = []


def run_tune_mode():
    """Live RMS meter for threshold calibration."""
    print("TUNE MODE — showing live microphone amplitude")
    print(f"Current threshold: {RMS_THRESHOLD}")
    print("Clap near your mic. Each detected clap prints its peak on a new line.")
    print("Press Ctrl+C to stop.\n")

    bar_width = 50
    tune_state = {"in_clap": False, "peak_rms": 0.0}

    def tune_callback(indata, frames, time_info, status):
        rms = float(np.sqrt(np.mean(indata ** 2)))
        filled = int(min(rms / 0.5, 1.0) * bar_width)
        bar = "#" * filled + "." * (bar_width - filled)

        if rms > RMS_THRESHOLD:
            tune_state["in_clap"] = True
            if rms > tune_state["peak_rms"]:
                tune_state["peak_rms"] = rms
            # Show live bar while sound is active
            print(f"\r[{bar}] {rms:.4f}        ", end="", flush=True)
        elif tune_state["in_clap"]:
            # Sound just ended — print the peak and move to new line
            peak = tune_state["peak_rms"]
            peak_filled = int(min(peak / 0.5, 1.0) * bar_width)
            peak_bar = "#" * peak_filled + "." * (bar_width - peak_filled)
            print(f"\r[{peak_bar}] {peak:.4f}  CLAP!")
            tune_state["in_clap"] = False
            tune_state["peak_rms"] = 0.0
        else:
            # Silence — show live bar on same line
            print(f"\r[{bar}] {rms:.4f}        ", end="", flush=True)

    try:
        with sd.InputStream(
            samplerate=SAMPLE_RATE,
            blocksize=BLOCK_SIZE,
            channels=1,
            callback=tune_callback,
        ):
            while True:
                time.sleep(0.05)
    except KeyboardInterrupt:
        print("\n\nTune mode stopped.")


def run_detector():
    """Main detection loop."""
    log_event(f"Detector started (threshold={RMS_THRESHOLD}, window={DOUBLE_CLAP_WINDOW}s, claps={REQUIRED_CLAPS})")

    if not os.path.isfile(TRIGGER_SCRIPT):
        log_event(f"WARNING: trigger script not found at {TRIGGER_SCRIPT}")

    # Graceful shutdown
    def handle_signal(signum, frame):
        log_event("Detector stopped (signal received)")
        sys.exit(0)

    signal.signal(signal.SIGTERM, handle_signal)
    signal.signal(signal.SIGINT, handle_signal)

    try:
        with sd.InputStream(
            samplerate=SAMPLE_RATE,
            blocksize=BLOCK_SIZE,
            channels=1,
            callback=audio_callback,
        ):
            log_event("Listening for fast double claps...")
            while True:
                time.sleep(0.5)
    except KeyboardInterrupt:
        log_event("Detector stopped (Ctrl+C)")
    except Exception as e:
        log_event(f"FATAL: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--tune":
        run_tune_mode()
    else:
        run_detector()
