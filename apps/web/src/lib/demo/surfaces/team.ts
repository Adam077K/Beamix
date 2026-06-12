import type { DemoTeam, TeamMember, PendingInvite } from './types'

/**
 * DEMO_TEAM — Team & Roles surface fixture
 * Business: Bright Smile Dental, Ramat Gan
 *
 * Story arc: the practice owner (Dr. Oren Avraham) is the Owner.
 * Two staff members (clinic manager + marketing assistant) have Analyst
 * and Viewer roles. One external agency contact has Admin access.
 * One pending invite for a second analyst. 4/5 seats used.
 * SSO is not enabled. Audit log is gated (Build/Scale tier).
 */

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

const members: TeamMember[] = [
  {
    id: 'mem-1',
    name: 'Dr. Oren Avraham',
    email: 'oren@brightsmile-dental.co.il',
    role: 'Owner',
    lastActive: '2026-06-12T08:41:00Z',
    avatarUrl: null,
  },
  {
    id: 'mem-2',
    name: 'Noa Shapiro',
    email: 'noa@brightsmile-dental.co.il',
    role: 'Admin',
    lastActive: '2026-06-11T17:03:00Z',
    avatarUrl: null,
  },
  {
    id: 'mem-3',
    name: 'Tamar Cohen',
    email: 'tamar@brightsmile-dental.co.il',
    role: 'Analyst',
    lastActive: '2026-06-10T12:22:00Z',
    avatarUrl: null,
  },
  {
    id: 'mem-4',
    name: 'Gal Mizrahi',
    email: 'gal@digitalhype.co.il',
    role: 'Viewer',
    lastActive: '2026-06-09T09:55:00Z',
    avatarUrl: null,
  },
]

// ---------------------------------------------------------------------------
// Pending invites
// ---------------------------------------------------------------------------

const pendingInvites: PendingInvite[] = [
  {
    email: 'liron@brightsmile-dental.co.il',
    role: 'Analyst',
    sentAt: '2026-06-11T10:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Top-level export
// ---------------------------------------------------------------------------

export const DEMO_TEAM: DemoTeam = {
  members,
  pendingInvites,
  seats: { used: 4, total: 5 },
  ssoEnabled: false,
  auditLogGated: true,
}
