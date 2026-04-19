/**
 * Hebrew messages — key user-facing labels for the 5 scoped screens.
 * Translation covers scores, suggestion labels, CTA buttons, empty states, nav labels.
 */
import type { Messages } from './en'

const he: Messages = {
  // Shared / navigation
  nav: {
    home: 'בית',
    inbox: 'תיבת דואר',
    scans: 'סריקות',
    automation: 'אוטומציה',
    archive: 'ארכיון',
    competitors: 'מתחרים',
    settings: 'הגדרות',
  },

  // Home page
  home: {
    setupTitle: 'מכינים את הסביבה שלך...',
    setupBody: 'הסריקה הראשונה שלך רצה. התוצאות יופיעו כאן תוך מספר דקות.',
    nextSteps: 'הצעדים הבאים',
    inboxLabel: 'תיבת דואר',
    viewAll: 'צפה בהכל',
    nothingWaiting: 'אין פריטים לבדיקה.',
    automation: 'אוטומציה',
    nextRun: 'הרצה הבאה:',
    creditsThisMonth: 'קרדיטים החודש',
    highImpact: 'השפעה גבוהה',
    mediumImpact: 'השפעה בינונית',
    lowImpact: 'השפעה נמוכה',
    runAgent: 'הפעל סוכן',
    aiVisibilityScore: 'ציון נוכחות AI',
  },

  // Scans page
  scans: {
    title: 'סריקות',
    subtitle: 'בדיקות נראות בכל מנועי ה-AI',
    subtitleCount: 'סריקה {count} — האחרונה ראשונה',
    subtitleCountPlural: '{count} סריקות — האחרונה ראשונה',
    runScanNow: 'הפעל סריקה עכשיו',
    running: 'רץ…',
    noScansYet: 'אין סריקות עדיין',
    noScansBody: 'הפעל את הסריקה הראשונה שלך כדי לראות כמה העסק שלך נראה בחיפוש AI.',
    runFirstScan: 'הפעל סריקה ראשונה',
    enginesPassed: '{succeeded} מתוך {total} מנועים עברו',
    viewDetails: 'צפה בפרטים',
    emptyStatePrimaryTitle: 'אין סריקות עדיין',
    emptyStatePrimaryBody:
      'הסריקה הראשונה מופעלת אוטומטית לאחר ההגדרה. התוצאות יופיעו כאן עם פירוט לפי מנוע.',
  },

  // Inbox page
  inbox: {
    emptyTitle: 'תיבת הדואר שלך ריקה',
    emptyBody: 'פלטי הסוכנים יופיעו כאן לבדיקה. קבל הצעה כדי להפעיל את הסוכן הראשון שלך.',
    viewSuggestions: 'צפה בהצעות',
    selectItem: 'בחר פריט לבדיקה',
    selectItemHint: 'השתמש ב-j / k לניווט',
    navigate: 'ניווט',
    approve: 'אישור',
    reject: 'דחייה',
    awaitingReview: 'ממתין לבדיקה',
    draft: 'טיוטה',
    approved: 'מאושר',
    archived: 'בארכיון',
    all: 'הכל',
  },

  // PaywallModal
  paywall: {
    title: 'פתח את Beamix',
    saveWithAnnual: 'חסוך 20% עם חיוב שנתי',
    twoMonthsFree: '2 חודשים חינם',
    redirectingToCheckout: 'מועבר לתשלום...',
    startWith: 'התחל עם {name}',
    recommended: 'מומלץ',
    billedAnnually: 'חיוב שנתי',
    billedMonthly: 'חיוב חודשי',
    aiRunsPerMonth: '{runs} הרצות AI לחודש',
    engines: '{count} מנועים',
    guarantee: 'כל התוכניות כוללות ערבות להחזר כסף של 14 יום. ללא חוזים, ביטול בכל עת.',
  },

  // Free scan result page
  scanResult: {
    queriesLabel: 'שאילתות שבהן מנועי AI מזכירים את העסק שלך',
    criticalSeverity: 'קריטי — AI כמעט אף פעם לא ממליץ עליך',
    poorSeverity: 'גרוע — AI ממליץ עליך לעתים נדירות',
    fairSeverity: 'סביר — יש מקום לשיפור',
    competitorsTitle: 'המתחרים המובילים שמקדימים אותך',
    mentionedIn: 'מוזכר ב-',
    queries: 'שאילתות',
    visibleFixesTitle: '{count} תיקונים גלויים',
    of: 'מתוך',
    total: 'סה"כ',
    moreFixesTitle: 'עוד {count} תיקונים',
    unlockWithAccount: 'פתח עם חשבון חינם',
    moreFixesWaiting: 'עוד {count} תיקונים ממתינים',
    signUpToSee: 'הירשם בחינם כדי לראות כל בעיה — ואז תחליט אם אתה רוצה שסוכנים יתקנו אותן.',
    fixThisNow: 'תקן עכשיו — התחל ב-$79',
    exploreFirst: 'חקור את המוצר קודם',
    highImpact: 'השפעה גבוהה',
    mediumImpact: 'השפעה בינונית',
    lowImpact: 'השפעה נמוכה',
    quickFix: 'תיקון מהיר',
  },

  // Preview mode banner
  preview: {
    bannerText: 'אתה במצב תצוגה מקדימה.',
    upgradeLink: 'שדרג כדי לפתח סוכנים',
  },
}

export default he
