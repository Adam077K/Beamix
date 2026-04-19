/**
 * English messages — key user-facing labels for the 5 scoped screens.
 * Keep keys stable; only values are translated.
 */
const en = {
  // Shared / navigation
  nav: {
    home: 'Home',
    inbox: 'Inbox',
    scans: 'Scans',
    automation: 'Automation',
    archive: 'Archive',
    competitors: 'Competitors',
    settings: 'Settings',
  },

  // Home page
  home: {
    setupTitle: 'Setting up your workspace...',
    setupBody: 'Your first scan is running. Results will appear here within a few minutes.',
    nextSteps: 'Next steps',
    inboxLabel: 'Inbox',
    viewAll: 'View all',
    nothingWaiting: 'Nothing waiting for review.',
    automation: 'Automation',
    nextRun: 'Next run:',
    creditsThisMonth: 'Credits this month',
    highImpact: 'High impact',
    mediumImpact: 'Medium impact',
    lowImpact: 'Low impact',
    runAgent: 'Run Agent',
    aiVisibilityScore: 'AI Visibility Score',
  },

  // Scans page
  scans: {
    title: 'Scans',
    subtitle: 'Visibility checks across all AI engines',
    subtitleCount: '{count} scan — most recent first',
    subtitleCountPlural: '{count} scans — most recent first',
    runScanNow: 'Run scan now',
    running: 'Running…',
    noScansYet: 'No scans yet',
    noScansBody:
      'Run your first scan to see how visible your business is in AI search results.',
    runFirstScan: 'Run first scan',
    enginesPassed: '{succeeded} of {total} engines passed',
    viewDetails: 'View details',
    emptyStatePrimaryTitle: 'No scans yet',
    emptyStatePrimaryBody:
      'Your first scan runs automatically after setup. Results appear here with detailed engine breakdowns.',
  },

  // Inbox page
  inbox: {
    emptyTitle: 'Your inbox is empty',
    emptyBody:
      'Agent outputs appear here for review. Accept a suggestion to run your first agent.',
    viewSuggestions: 'View suggestions',
    selectItem: 'Select an item to review',
    selectItemHint: 'Use j / k to navigate',
    navigate: 'navigate',
    approve: 'approve',
    reject: 'reject',
    awaitingReview: 'Awaiting review',
    draft: 'Draft',
    approved: 'Approved',
    archived: 'Archived',
    all: 'All',
  },

  // PaywallModal
  paywall: {
    title: 'Unlock Beamix',
    saveWithAnnual: 'Save 20% with annual billing',
    twoMonthsFree: '2 months free',
    redirectingToCheckout: 'Redirecting to checkout...',
    startWith: 'Start with {name}',
    recommended: 'Recommended',
    billedAnnually: 'billed annually',
    billedMonthly: 'billed monthly',
    aiRunsPerMonth: '{runs} AI runs/mo',
    engines: '{count} engines',
    guarantee: 'All plans include a 14-day money-back guarantee. No contracts, cancel anytime.',
  },

  // Free scan result page
  scanResult: {
    queriesLabel: 'queries where AI engines mention your business',
    criticalSeverity: 'Critical — AI almost never recommends you',
    poorSeverity: 'Poor — AI rarely recommends you',
    fairSeverity: 'Fair — room to improve',
    competitorsTitle: 'Top competitors outranking you',
    mentionedIn: 'mentioned in',
    queries: 'queries',
    visibleFixesTitle: '{count} fixes visible',
    of: 'of',
    total: 'total',
    moreFixesTitle: '{count} more fixes',
    unlockWithAccount: 'Unlock with a free account',
    moreFixesWaiting: '{count} more fixes are waiting',
    signUpToSee: 'Sign up free to see every issue — then decide if you want agents to fix them.',
    fixThisNow: 'Fix this now — start for $79',
    exploreFirst: 'Explore the product first',
    highImpact: 'High impact',
    mediumImpact: 'Medium impact',
    lowImpact: 'Low impact',
    quickFix: 'Quick fix',
  },

  // Preview mode banner
  preview: {
    bannerText: "You're in preview mode.",
    upgradeLink: 'Upgrade to unlock agents',
  },
}

export type Messages = typeof en
export default en
