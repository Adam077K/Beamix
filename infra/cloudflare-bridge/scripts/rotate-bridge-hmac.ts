#!/usr/bin/env npx ts-node
/**
 * rotate-bridge-hmac.ts
 *
 * Standalone Node.js script for emergency or routine rotation of BRIDGE_HMAC_SECRET.
 * Per secret-rotation.md row #2 and cloudflare-compromise.md runbook.
 *
 * What it does:
 *   1. Reads ANTHROPIC_API_KEY from environment (Console-billed — NOT subscription OAuth).
 *   2. Generates a new BRIDGE_HMAC_SECRET value (openssl-equivalent via crypto.randomBytes).
 *   3. Writes the new secret to a temp file (NOT printed to stdout — R12 security hardening).
 *   4. For each of the 10 Routines, calls the Anthropic API to update the Routine's
 *      BRIDGE_HMAC_SECRET environment variable.
 *   5. Prints only the temp file path — Adam reads with `cat $TMPFILE` then deletes.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=<key> npx ts-node scripts/rotate-bridge-hmac.ts
 *
 * Note: BRIDGE_HMAC_SECRET rotation is an atomic swap (per secret-rotation.md).
 * Expected transition-window failure rate: <30s of HMAC failures while Routines propagate.
 * Specs received during this window will be rejected; Linear auto-retries handle recovery.
 *
 * SECURITY: This script NEVER logs any secret value.
 *   - The new secret is written ONLY to a temp file. The file path is printed.
 *   - Adam reads the file with `cat`, then immediately deletes it.
 *   - This removes the secret from terminal scrollback (R12 F14 fix).
 * Per WS2 R3.12 — no console.log of env.ROUTINE_* or any other secret.
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

// ---------------------------------------------------------------------------
// The 10 standing Routines (per ORCHESTRATION.md §2E)
// Adam fills in actual Routine IDs from Anthropic Console at deploy time.
// ---------------------------------------------------------------------------

interface RoutineEntry {
  name: string;
  envKey: string;
  routineId: string; // Placeholder — replace with actual IDs from Anthropic Console
}

const ROUTINES: RoutineEntry[] = [
  { name: "CEO Entry-point",        envKey: "ROUTINE_CEO_ENTRY_POINT_TOKEN",        routineId: "PLACEHOLDER_ROUTINE_ID" },
  { name: "Morning Digest",         envKey: "ROUTINE_MORNING_DIGEST_TOKEN",         routineId: "PLACEHOLDER_ROUTINE_ID" },
  { name: "EOD Sync",               envKey: "ROUTINE_EOD_SYNC_TOKEN",               routineId: "PLACEHOLDER_ROUTINE_ID" },
  { name: "Auto-Unblock",           envKey: "ROUTINE_AUTO_UNBLOCK_TOKEN",           routineId: "PLACEHOLDER_ROUTINE_ID" },
  { name: "Monday Standup",         envKey: "ROUTINE_MONDAY_STANDUP_TOKEN",         routineId: "PLACEHOLDER_ROUTINE_ID" },
  { name: "Friday Retro",           envKey: "ROUTINE_FRIDAY_RETRO_TOKEN",           routineId: "PLACEHOLDER_ROUTINE_ID" },
  { name: "Competitor Signal",      envKey: "ROUTINE_COMPETITOR_SIGNAL_TOKEN",      routineId: "PLACEHOLDER_ROUTINE_ID" },
  { name: "Customer Voice Signal",  envKey: "ROUTINE_CUSTOMER_VOICE_SIGNAL_TOKEN",  routineId: "PLACEHOLDER_ROUTINE_ID" },
  { name: "GEO Algorithm Signal",   envKey: "ROUTINE_GEO_ALGORITHM_SIGNAL_TOKEN",   routineId: "PLACEHOLDER_ROUTINE_ID" },
  { name: "Synthesizer",            envKey: "ROUTINE_SYNTHESIZER_TOKEN",            routineId: "PLACEHOLDER_ROUTINE_ID" },
];

// ---------------------------------------------------------------------------
// Generate a new BRIDGE_HMAC_SECRET
// Uses Node.js crypto.randomBytes — cryptographically secure 32-byte hex
// ---------------------------------------------------------------------------

function generateNewSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ---------------------------------------------------------------------------
// Write the new secret to a temp file and return the path.
// R12 F14: never print the secret to stdout. Print only the file path.
// Adam reads with `cat $TMPFILE` and immediately deletes with `rm $TMPFILE`.
// ---------------------------------------------------------------------------

function writeSecretToTempFile(secret: string): string {
  const timestamp = Date.now();
  const tmpPath = path.join(os.tmpdir(), `bridge-hmac-${timestamp}.txt`);
  fs.writeFileSync(tmpPath, secret, { mode: 0o600 }); // owner-read-only
  return tmpPath;
}

// ---------------------------------------------------------------------------
// Update a Routine's env var via Anthropic API
// The exact endpoint and body shape depends on Anthropic's management API.
// Adjust as needed when the Routines management API docs are available.
// ---------------------------------------------------------------------------

async function updateRoutineEnvVar(
  apiKey: string,
  routineId: string,
  envVarName: string,
  envVarValue: string
): Promise<{ ok: boolean; error?: string }> {
  // Anthropic Routines management API endpoint (provisional — verify against current docs)
  const url = `https://api.anthropic.com/v1/claude_code/routines/${routineId}/env`;

  try {
    const resp = await fetch(url, {
      method: "PATCH",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        env: {
          [envVarName]: envVarValue,
        },
      }),
    });

    if (resp.ok) {
      return { ok: true };
    }

    const body = await resp.text();
    return { ok: false, error: `HTTP ${resp.status}: ${body.slice(0, 200)}` };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    console.error("[rotate-bridge-hmac] Error: ANTHROPIC_API_KEY env var is required.");
    process.exit(1);
  }

  // Generate new secret value
  const newSecret = generateNewSecret();

  // R12 F14: write to temp file — NEVER print the secret value itself
  const tmpPath = writeSecretToTempFile(newSecret);

  console.log(`[rotate-bridge-hmac] Generated new BRIDGE_HMAC_SECRET (${newSecret.length} hex chars).`);
  console.log(`[rotate-bridge-hmac] Secret written to: ${tmpPath}`);
  console.log(`[rotate-bridge-hmac] Read with: cat ${tmpPath}`);
  console.log(`[rotate-bridge-hmac] Delete with: rm ${tmpPath}`);
  console.log("[rotate-bridge-hmac] Updating all 10 Routines now...\n");

  // Update all 10 Routines
  const results: Array<{ name: string; ok: boolean; error?: string }> = [];

  for (const routine of ROUTINES) {
    if (routine.routineId === "PLACEHOLDER_ROUTINE_ID") {
      results.push({
        name: routine.name,
        ok: false,
        error: "Routine ID is still a placeholder — update ROUTINES array with real IDs",
      });
      continue;
    }

    const result = await updateRoutineEnvVar(
      anthropicApiKey,
      routine.routineId,
      "BRIDGE_HMAC_SECRET",
      newSecret
    );

    results.push({ name: routine.name, ...result });

    // Brief delay between API calls to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Print results — no secret values ever logged
  console.log("--- Results ---");
  let allOk = true;
  for (const r of results) {
    if (r.ok) {
      console.log(`  ✓ ${r.name}`);
    } else {
      console.error(`  ✗ ${r.name}: ${r.error}`);
      allOk = false;
    }
  }

  console.log("\n--- Next steps ---");
  console.log(`1. Read the new secret: cat ${tmpPath}`);
  console.log("2. Deploy bridge with new secret:");
  console.log("   wrangler secret put BRIDGE_HMAC_SECRET");
  console.log("   (paste the value from the temp file above when prompted)");
  console.log(`3. Delete the temp file: rm ${tmpPath}`);
  console.log("   wrangler publish");
  console.log("4. Wait 30 seconds for Anthropic Console to propagate.");
  console.log("5. Tail bridge logs: wrangler tail");
  console.log("6. Verify HMAC verification rate returns to 100%.");
  console.log("7. See secret-rotation.md Day 0 smoke-test checklist.");

  if (!allOk) {
    console.error("\n[rotate-bridge-hmac] Some Routines failed to update. Check errors above.");
    process.exit(1);
  }

  console.log("\n[rotate-bridge-hmac] All Routines updated. Proceed with bridge deploy.");
}

main().catch((err) => {
  console.error("[rotate-bridge-hmac] Unexpected error:", err);
  process.exit(1);
});
