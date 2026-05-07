# Bastion bootstrap — manual pre-flight (Adam, ~15 min on the PC)

You do these 4 steps on the new Windows 10 PC manually. After step 4, Claude Code is running and you paste `BASTION-BOOTSTRAP-PROMPT.md` into it — Claude handles everything else.

---

## Step 1 — Power settings (1 min, Windows side)

`Win + R` → type `powercfg.cpl` → Enter.

- Choose your active plan → **Change plan settings**
- Set "Put the computer to sleep" = **Never**
- Click **Change advanced power settings** → expand **Sleep** → **Hibernate after** = **Never** → expand **Hard disk** → **Turn off hard disk after** = **Never**
- Save.

---

## Step 2 — Install WSL2 + Ubuntu 24.04 (~10 min including reboot)

Open **PowerShell as Administrator** (right-click Start → "Windows PowerShell (Admin)" or "Terminal (Admin)").

Run:

```powershell
wsl --install -d Ubuntu-24.04
```

This single command:
- Enables the WSL feature
- Enables the Virtual Machine Platform feature
- Downloads the WSL2 Linux kernel
- Installs Ubuntu 24.04 LTS
- Sets WSL2 as the default version

**You will be asked to reboot.** Do it.

After reboot, Ubuntu launches automatically (or open it from Start menu → "Ubuntu 24.04 LTS"). It will prompt:
- **UNIX username:** type `adam` (lowercase, no spaces)
- **New password:** pick something you'll remember (you'll type it for `sudo` later)

You're now sitting at a bash prompt that looks like `adam@<your-pc-name>:~$`. That's WSL2 Ubuntu running.

---

## Step 3 — Install Claude Code inside WSL2 (~3 min)

In that Ubuntu prompt, paste this single command:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

When it finishes, restart the shell so the `claude` command is on your PATH:

```bash
exec bash
```

Verify:

```bash
claude --version
```

If you see a version number, you're good.

---

## Step 4 — Log into Claude Code with your Max plan (~2 min)

```bash
claude
```

It opens a browser-based OAuth flow. Log in with the same Anthropic account that owns your $100/mo Max plan. The terminal will say "Authenticated" when done.

---

## You are ready

You're now sitting in a Claude Code session inside WSL2 Ubuntu on the new PC.

**Now copy the entire contents of `BASTION-BOOTSTRAP-PROMPT.md`** (next file in this folder) **and paste it as your first message to that Claude Code session.**

Claude will take over from there. It will ask you for credentials when it needs them (GitHub, Tailscale, Mem0). You don't need to type any more shell commands manually — Claude runs them.
