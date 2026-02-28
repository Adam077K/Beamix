# GSA — הגדרה גלובלית (Global Setup)

מדריך להעברת Skills, Agents ו-Rules לגלובליים — זמינים בכל פרויקט במחשב.

---

## סיכום המבנה הנוכחי

| רכיב | מיקום נוכחי (פרויקט) | מיקום גלובלי מומלץ |
|------|---------------------|---------------------|
| Skills (938+) | `.agent/skills/` | `~/.agent/skills/` |
| Agents (12 + GSA) | `.claude/agents/` | `~/.claude/agents/` |
| Get-Shit-Done | `.claude/get-shit-done/` | `~/.claude/get-shit-done/` |
| Commands | `.claude/commands/` | `~/.claude/commands/` |
| Rules | `.cursor/rules/` | Cursor Settings / `~/.cursor/rules/` |
| Cursor Agent Skills | — | `~/.cursor/skills/` (כבר גלובלי) |

---

## שלב 1: העתקת Skills ו-Agents לגלובלי

הרץ מהתיקיית GSA:

```bash
# צור תיקיות גלובליות
mkdir -p ~/.agent
mkdir -p ~/.claude

# Skills — העתק או symlink (העדף symlink לעדכונים קלים)
# אם תרצה עותק עצמאי:
# cp -r /Users/adamks/VibeCoding/GSA/GSA_startup_kit/.agent/skills ~/.agent/
# עדיף symlink:
ln -sf /Users/adamks/VibeCoding/GSA/GSA_startup_kit/.agent/skills ~/.agent/skills

# Agents — החלף את ה-gsd-* ב-gsa-* (וגם ה-12 startup agents)
cp -r /Users/adamks/VibeCoding/GSA/GSA_startup_kit/.claude/agents/* ~/.claude/agents/
# (מחליף/מעדכן את הקיימים)

# Get-Shit-Done ו-Commands
cp -r /Users/adamks/VibeCoding/GSA/GSA_startup_kit/.claude/get-shit-done ~/.claude/
cp -r /Users/adamks/VibeCoding/GSA/GSA_startup_kit/.claude/commands ~/.claude/
```

---

## שלב 2: Cursor Agent Skills (אופציונלי — כבר יש הרבה)

אם תרצה את ה-skills של GSA גם כ-Cursor Agent Skills (לשימוש ב-`@skill-name`):

```bash
npx antigravity-awesome-skills --cursor --path ~/.cursor/skills
```

או symlink תת-תיקיות ספציפיות מ-`.agent/skills/` ל-`~/.cursor/skills/`.

---

## שלב 3: Rules גלובליים ב-Cursor

**אפשרות א' — Cursor Settings (פשוט)**  
1. פתח **Cursor → Settings → Cursor Settings → General**  
2. בקטגוריה **Rules for AI** הדבק את תוכן ה-rules של GSA (מ-`gsa-startup-kit.mdc`, `AGENTS.md`)  
3. Rules אלה יחולו על כל הפרויקטים שלך  

**אפשרות ב' — קובץ Rules גלובלי**  
אם Cursor תומך ב-`~/.cursor/rules/` (תלוי בגרסה):

```bash
mkdir -p ~/.cursor/rules
cp /Users/adamks/VibeCoding/GSA/GSA_startup_kit/.cursor/rules/*.mdc ~/.cursor/rules/
```

---

## שלב 4: פרויקט חדש — שימוש ב-GSA הגלובלי

בכל פרויקט חדש שבו תרצה GSA:

```bash
# בתוך שורש הפרויקט
mkdir -p .claude

# Symlinks למרכיבים הגלובליים
ln -sf ~/.agent .agent
ln -sf ~/.claude/get-shit-done .claude/get-shit-done
ln -sf ~/.claude/agents .claude/agents
ln -sf ~/.claude/commands .claude/commands

# תיקיית .planning — ספציפית לפרויקט
mkdir -p .planning
```

והעתק (או התאם) `CLAUDE.md` ו-`AGENTS.md` מהפרויקט הנוכחי — או השתמש בגרסאות מינימליות שמפנות ל-GSA.

---

## עדכון Workflows לשימוש ב-Agents גלובליים

ה-workflows ב-GSA כרגע משתמשים ב-`./.claude/agents/`. אם יצרת symlink ` .claude/agents` → `~/.claude/agents`, זה יעבוד אוטומטית — אין צורך בשינוי.

אם לא תשתמש ב-symlink ותרצה path אבסולוטי, יש לעדכן את קבצי ה-workflow מ-`./.claude/agents/` ל-`~/.claude/agents/` (במקומות הרלוונטיים).

---

## ~/.gsa — הגדרות ברירת מחדל

GSA שומר defaults ב-`~/.gsa/defaults.json` (מ-`settings` workflow). אין צורך בהתקנה — התיקייה נוצרת אוטומטית כשתשמור defaults.

---

## סיכום מהיר

| פעולה | פקודה |
|-------|------|
| התקנה ראשונית | הרץ את הפקודות בשלבים 1–3 למעלה |
| פרויקט חדש | הרץ את הפקודות בשלב 4 בתוך הפרויקט |
| עדכון skills | `cd ~/.agent/skills && git pull` (אם symlink ל-repo) |
