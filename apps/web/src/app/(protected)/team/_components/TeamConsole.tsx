'use client'

import { useMemo, useState } from 'react'
import { Lock, MoreHorizontal, RotateCcw, Users } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { ErrorState } from '@/components/error-state'
import { cn } from '@/lib/utils'
import type { DemoTeam, TeamMember, PendingInvite } from '@/lib/demo/surfaces'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { SeatMeter } from './SeatMeter'

export type TeamState = 'loading' | 'empty' | 'error' | 'success'

type MemberRole = TeamMember['role']
type InviteRole = PendingInvite['role']

const INVITE_ROLES: InviteRole[] = ['Admin', 'Analyst', 'Viewer']

/* ──────────────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────────────── */

/** ISO-grafted timestamp: `11 Jun 2026 · 14:23` (not "3 days ago"). */
function formatStamp(iso: string): string {
  const d = new Date(iso)
  const day = d.getUTCDate()
  const month = d.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' })
  const year = d.getUTCFullYear()
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${day} ${month} ${year} · ${hh}:${mm}`
}

function initials(name: string): string {
  const parts = name
    .replace(/^(Dr|Mr|Mrs|Ms|Prof)\.?\s+/i, '')
    .trim()
    .split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

function isValidEmail(value: string): boolean {
  // Calm, pragmatic client check — server-side Zod is the real gate (Phase 2).
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/* ──────────────────────────────────────────────────────────────────────────
   Shell — every state renders inside the same Settings-family content column
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Shell — every state renders inside one centered reading column.
 *
 * UIX-F1 (foundation): the DashboardShell now owns the page frame
 * (`mx-auto max-w-[1200px] px-6 sm:px-8 py-8`), which fixed the old left-pin /
 * 40%-dead-space tell. We no longer set our own `max-w-[760px]` with no
 * centering. Instead we sit on the shared track and constrain the *reading*
 * width to a comfortable, symmetric column — a Settings-family surface reads
 * best as a centered measure, not edge-to-edge.
 */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-16">
      <div className="mx-auto max-w-[880px]">
        <PageHeader
          title="Team & Roles"
          subtitle="Invite your team and control what each person can do."
        />
        {children}
      </div>
    </div>
  )
}

/**
 * Hairline cluster divider — the M12 editorial rhythm.
 *
 * `gap` varies the air by *relationship*: `tight` for clusters that belong
 * together (seat-meter → table), `loose` for unrelated blocks (before
 * Enterprise). Not one global `my-8`. Some boundaries carry no rule at all.
 */
function ClusterDivider({
  gap = 'normal',
  rule = true,
}: {
  gap?: 'tight' | 'normal' | 'loose'
  rule?: boolean
}) {
  const space =
    gap === 'tight' ? 'my-5' : gap === 'loose' ? 'my-12' : 'my-8'
  if (!rule) {
    const h = gap === 'tight' ? 'h-6' : gap === 'loose' ? 'h-12' : 'h-8'
    return <div className={cn(h, 'w-full')} aria-hidden="true" />
  }
  return <div className={cn(space, 'h-px w-full bg-[var(--color-border)]')} />
}

/* ──────────────────────────────────────────────────────────────────────────
   Role badge — neutral, quiet. No color, no violet, no Fraunces.
   ──────────────────────────────────────────────────────────────────────── */

function RoleBadge({ role }: { role: MemberRole | InviteRole }) {
  return (
    <span className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-white px-2 py-0.5 text-xs font-medium text-[var(--color-text-secondary)]">
      {role}
    </span>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   Permission legend — TIER-3 inset, prose definition table.
   ──────────────────────────────────────────────────────────────────────── */

const ROLE_MODEL: { role: MemberRole; can: string }[] = [
  { role: 'Owner', can: 'Full access — billing, team, and the ability to delete the workspace.' },
  { role: 'Admin', can: 'Manage the team and settings. No billing or workspace deletion.' },
  { role: 'Analyst', can: 'Run scans and agents, edit reports. No team or billing controls.' },
  { role: 'Viewer', can: 'Read-only. Can view everything, change nothing.' },
]

function PermissionLegend({ id }: { id?: string }) {
  return (
    <section id={id} aria-labelledby="role-model-heading" className="card-inset p-5">
      <p className="mb-1 text-xs font-semibold uppercase leading-none tracking-[0.08em] text-[#9CA3AF]">
        Reference
      </p>
      <h2
        id="role-model-heading"
        className="mb-1 text-[14px] font-medium text-[var(--color-text-secondary)]"
      >
        What each role can do
      </h2>
      <p className="mb-4 text-[13px] leading-[1.5] text-[var(--color-text-muted)]">
        Roles control access. You can change anyone&rsquo;s role from the table above.
      </p>

      <dl className="space-y-3">
        {ROLE_MODEL.map(({ role, can }) => (
          <div key={role} className="flex flex-col gap-1.5 sm:flex-row sm:gap-4">
            <dt className="sm:w-24 sm:shrink-0">
              <RoleBadge role={role} />
            </dt>
            <dd className="text-[13px] leading-[1.5] text-[var(--color-text-secondary)]">
              {can}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   Invite composer — inline row (never a modal).
   ──────────────────────────────────────────────────────────────────────── */

function InviteComposer({
  onSend,
  emphasis = false,
}: {
  onSend: (email: string, role: InviteRole) => void
  emphasis?: boolean
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InviteRole>('Viewer')
  const [touched, setTouched] = useState(false)

  const valid = isValidEmail(email)
  const showError = touched && email.length > 0 && !valid

  function submit() {
    setTouched(true)
    if (!valid) return
    onSend(email.trim(), role)
    setEmail('')
    setRole('Viewer')
    setTouched(false)
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className={cn(
          'flex flex-col gap-2 sm:flex-row sm:items-start',
          emphasis && 'sm:items-center',
        )}
      >
        <div className="min-w-0 flex-1">
          <label htmlFor="invite-email" className="sr-only">
            Teammate email
          </label>
          <Input
            id="invite-email"
            type="email"
            inputMode="email"
            autoComplete="off"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={showError || undefined}
            aria-describedby={showError ? 'invite-email-error' : undefined}
          />
        </div>

        <div className="sm:w-[140px] sm:shrink-0">
          <label htmlFor="invite-role" className="sr-only">
            Role for the invite
          </label>
          <Select value={role} onValueChange={(v) => setRole(v as InviteRole)}>
            <SelectTrigger id="invite-role" aria-label="Invite role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INVITE_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="rounded-full sm:shrink-0"
          disabled={!valid}
        >
          Send invite
        </Button>
      </form>

      {showError && (
        <p
          id="invite-email-error"
          className="mt-1.5 text-[13px] text-[var(--color-status-critical,#DC2626)]"
        >
          Enter a valid email address.
        </p>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   Pending invites — typographic ledger (rows, not cards).
   ──────────────────────────────────────────────────────────────────────── */

function PendingInvitesList({
  invites,
  onResend,
  onRevoke,
}: {
  invites: PendingInvite[]
  onResend: (email: string) => void
  onRevoke: (email: string) => void
}) {
  return (
    <section aria-labelledby="pending-heading">
      <h2
        id="pending-heading"
        className="mb-3 text-xs font-semibold uppercase leading-none tracking-[0.08em] text-[#9CA3AF]"
      >
        Pending invites
      </h2>

      {invites.length === 0 ? (
        <p className="text-[13px] text-[var(--color-text-muted)]">
          No pending invites.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {invites.map((invite) => (
            <li
              key={invite.email}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-[var(--color-text-primary)]">
                  {invite.email}
                </p>
                <p className="mt-0.5 font-mono text-[12px] tabular-nums text-[var(--color-text-muted)]">
                  invited {formatStamp(invite.sentAt)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <RoleBadge role={invite.role} />
                <button
                  type="button"
                  onClick={() => onResend(invite.email)}
                  className="rounded-sm text-[13px] font-medium text-[var(--color-accent)] underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                >
                  Resend
                </button>
                <button
                  type="button"
                  onClick={() => onRevoke(invite.email)}
                  className="rounded-sm text-[13px] font-medium text-[var(--color-text-muted)] underline-offset-4 transition-colors hover:text-[var(--color-text-secondary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                >
                  Revoke
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   Members table
   ──────────────────────────────────────────────────────────────────────── */

const MEMBER_ROLES: MemberRole[] = ['Owner', 'Admin', 'Analyst', 'Viewer']

function MembersTable({
  members,
  onRoleChange,
  onRemove,
}: {
  members: TeamMember[]
  onRoleChange: (id: string, role: MemberRole) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-[var(--color-border)] hover:bg-transparent">
            <TableHead className="text-[var(--color-text-muted)]">Member</TableHead>
            <TableHead className="w-[140px] text-[var(--color-text-muted)]">Role</TableHead>
            <TableHead className="text-[var(--color-text-muted)]">Last active</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isOwner = member.role === 'Owner'
            return (
              <TableRow
                key={member.id}
                className="group relative border-[var(--color-border)] transition-colors hover:bg-[#F4F6FA]"
              >
                {/* Left status hairline on hover */}
                <TableCell className="relative align-middle">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-r-sm bg-[var(--color-accent)] opacity-0 transition-opacity group-hover:opacity-100"
                  />
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-[var(--color-accent-tint)] text-[12px] font-medium text-[var(--color-accent-deep)]">
                        {initials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-[var(--color-text-primary)]">
                        {member.name}
                      </p>
                      <p className="truncate text-[13px] text-[var(--color-text-muted)]">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="align-middle">
                  {isOwner ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {/* Owner is immutable — a static locked token, NOT a
                              washed-out disabled picker. Reads deliberate, not
                              broken (P2-1). */}
                          <span className="inline-flex cursor-default items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-warm)] py-1 pl-2.5 pr-2 text-[13px] font-medium text-[var(--color-text-secondary)]">
                            Owner
                            <Lock
                              className="h-3 w-3 text-[var(--color-text-muted)]"
                              aria-hidden="true"
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          The Owner role can&rsquo;t be changed.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Select
                      value={member.role}
                      onValueChange={(v) => onRoleChange(member.id, v as MemberRole)}
                    >
                      {/* Ghost trigger: quiet inline value by default, border
                          appears on hover/focus so the member NAME commands and
                          the control recedes until touched (P2-1, M7). */}
                      <SelectTrigger
                        aria-label={`Role for ${member.name}`}
                        className="h-8 w-[124px] border-transparent bg-transparent px-2 text-[13px] font-medium text-[var(--color-text-secondary)] shadow-none transition-colors hover:border-[var(--color-border)] hover:bg-white data-[state=open]:border-[var(--color-accent)] data-[state=open]:bg-white"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEMBER_ROLES.filter((r) => r !== 'Owner').map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>

                <TableCell className="align-middle font-mono text-[12px] tabular-nums text-[var(--color-text-secondary)]">
                  {formatStamp(member.lastActive)}
                </TableCell>

                <TableCell className="align-middle text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Actions for ${member.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-muted)] transition-colors hover:bg-white hover:text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem disabled={isOwner}>
                        Change role
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={isOwner}
                        onSelect={() => !isOwner && onRemove(member.id)}
                        className="text-[var(--color-status-critical,#DC2626)] focus:text-[var(--color-status-critical,#DC2626)]"
                      >
                        Remove from team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   Enterprise affordances — two quiet, hairline-separated rows.
   Gated = disabled-with-tooltip, NEVER hidden.
   ──────────────────────────────────────────────────────────────────────── */

function EnterpriseAffordanceRow({
  label,
  description,
  actionLabel,
  gated,
  gatedTooltip,
  onAction,
}: {
  label: string
  description: string
  actionLabel: string
  gated: boolean
  gatedTooltip: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{label}</p>
        <p className="mt-0.5 text-[13px] leading-[1.5] text-[var(--color-text-muted)]">
          {description}
        </p>
      </div>

      {gated ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="shrink-0 cursor-not-allowed">
                <Button variant="tier-locked" size="sm" disabled tabIndex={-1}>
                  {actionLabel}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{gatedTooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button variant="outline" size="sm" onClick={onAction} className="shrink-0">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   Loading skeleton — Settings shell + skeleton seat meter + table rows.
   ──────────────────────────────────────────────────────────────────────── */

function LoadingBody() {
  return (
    <div aria-busy="true" aria-label="Loading team">
      {/* Seat meter skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-[140px] rounded-full" />
      </div>

      <ClusterDivider />

      {/* Table skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-full" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-9 w-[120px] rounded-lg" />
          </div>
        ))}
      </div>

      <ClusterDivider />

      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   Empty state — solo account. Designed empty, invite-first, two-tier recovery.
   ──────────────────────────────────────────────────────────────────────── */

function EmptyBody({
  seats,
  onSend,
}: {
  seats: DemoTeam['seats']
  onSend: (email: string, role: InviteRole) => void
}) {
  return (
    <div>
      <div className="craft-enter craft-enter-1">
        <SeatMeter used={seats.used} total={seats.total} />
      </div>

      <ClusterDivider />

      <section className="craft-enter craft-enter-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-warm)] px-6 py-10 text-center sm:px-10">
        {/* Warm glyph — moments-only character. Not a bare Lucide in a void. */}
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-tint)]"
          aria-hidden="true"
        >
          <Users className="h-6 w-6 text-[var(--color-accent)]" strokeWidth={1.75} />
        </div>

        <h2 className="mb-1.5 text-[18px] font-semibold text-[var(--color-text-primary)]">
          It&rsquo;s just you for now
        </h2>
        <p className="mx-auto mb-6 max-w-[360px] text-[14px] leading-[1.6] text-[var(--color-text-muted)]">
          Invite a teammate to share the work.
        </p>

        <div className="mx-auto max-w-[460px] text-left">
          <InviteComposer onSend={onSend} emphasis />
        </div>

        <p className="mt-5 text-[13px] text-[var(--color-text-muted)]">
          <a
            href="#role-model"
            className="rounded-sm font-medium text-[var(--color-accent)] underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
          >
            Learn about roles
          </a>
        </p>
      </section>

      <ClusterDivider gap="loose" />

      <div className="craft-enter craft-enter-3">
        <PermissionLegend id="role-model" />
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   Populated body — the full surface.
   ──────────────────────────────────────────────────────────────────────── */

function PopulatedBody({ data }: { data: DemoTeam }) {
  const [members, setMembers] = useState<TeamMember[]>(data.members)
  const [invites, setInvites] = useState<PendingInvite[]>(data.pendingInvites)
  // Mock optimistic error surface — a failed role change / invite. Wired to a
  // dismiss + retry recovery (never "refresh"). Stays null in the happy path.
  const [actionError, setActionError] = useState<string | null>(null)

  const seats = useMemo(
    () => ({ used: members.length, total: data.seats.total }),
    [members.length, data.seats.total],
  )

  function handleSend(email: string, role: InviteRole) {
    setActionError(null)
    setInvites((prev) => [{ email, role, sentAt: new Date().toISOString() }, ...prev])
  }

  function handleRoleChange(id: string, role: MemberRole) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)))
  }

  function handleRemove(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  function handleResend(email: string) {
    setInvites((prev) =>
      prev.map((i) =>
        i.email === email ? { ...i, sentAt: new Date().toISOString() } : i,
      ),
    )
  }

  function handleRevoke(email: string) {
    setInvites((prev) => prev.filter((i) => i.email !== email))
  }

  return (
    <div>
      {actionError && (
        <div className="mb-6">
          <InlineActionError message={actionError} onRetry={() => setActionError(null)} />
        </div>
      )}

      {/* ── FOCAL CLUSTER: seats + members table ──────────────────────────
          The members table is the reason this page exists, so it is the
          surface's TIER-1 focal (M1/M2/M10). The seat-meter is its summary
          header context, sitting TIGHT above it (M12) — one cluster, not two
          equal-weight blocks. Everything below recedes. */}
      <section
        aria-labelledby="members-heading"
        className="craft-enter craft-enter-1 card-console p-5 sm:p-6"
      >
        <div className="mb-5 flex flex-col gap-4 border-b border-[var(--color-border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="members-heading"
              className="text-[15px] font-semibold text-[var(--color-text-primary)]"
            >
              Members
            </h2>
            <p className="mt-0.5 text-[13px] text-[var(--color-text-muted)]">
              Everyone with access to this workspace.
            </p>
          </div>
          <SeatMeter
            used={seats.used}
            total={seats.total}
            onAddSeats={() => {
              /* Phase 2: opens billing seats flow. Calm, intentional no-op. */
            }}
          />
        </div>

        <MembersTable
          members={members}
          onRoleChange={handleRoleChange}
          onRemove={handleRemove}
        />
      </section>

      {/* ── Invite a teammate — secondary action, related to the table ──── */}
      <ClusterDivider gap="normal" rule={false} />
      <section aria-labelledby="invite-heading" className="craft-enter craft-enter-2">
        <h2
          id="invite-heading"
          className="mb-3 text-xs font-semibold uppercase leading-none tracking-[0.08em] text-[#9CA3AF]"
        >
          Invite a teammate
        </h2>
        <InviteComposer onSend={handleSend} />

        {/* Pending invites sit tight under the composer — same cluster. */}
        {invites.length > 0 && (
          <div className="mt-6">
            <PendingInvitesList
              invites={invites}
              onResend={handleResend}
              onRevoke={handleRevoke}
            />
          </div>
        )}
      </section>

      {/* ── Role legend — TIER-3 recede, clearly secondary reference ────── */}
      <ClusterDivider gap="normal" rule={false} />
      <div className="craft-enter craft-enter-3">
        <PermissionLegend id="role-model" />
      </div>

      {/* ── Enterprise — unrelated block, pushed apart with a ruled gap ──── */}
      <ClusterDivider gap="loose" />
      <section
        aria-labelledby="enterprise-heading"
        className="craft-enter craft-enter-4"
      >
        <h2
          id="enterprise-heading"
          className="mb-1 text-xs font-semibold uppercase leading-none tracking-[0.08em] text-[#9CA3AF]"
        >
          Enterprise
        </h2>
        <div className="divide-y divide-[var(--color-border)]">
          <EnterpriseAffordanceRow
            label="Single sign-on (SSO / SAML)"
            description="Let your team sign in with your identity provider."
            actionLabel="Set up SSO"
            gated={!data.ssoEnabled}
            gatedTooltip="Single sign-on is available on Scale / enterprise."
          />
          <EnterpriseAffordanceRow
            label="Audit log"
            description="A record of every role change, invite, and sign-in."
            actionLabel="View audit log"
            gated={data.auditLogGated}
            gatedTooltip="Audit log is available on Scale / enterprise."
          />
        </div>
      </section>
    </div>
  )
}

/** Inline action error — Alert-style, real recovery copy (never "refresh"). */
function InlineActionError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-[14px] text-[#991B1B]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md text-[13px] font-medium text-[#991B1B] underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444] focus-visible:ring-offset-2 sm:self-auto"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Retry
      </button>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   Top-level switch
   ──────────────────────────────────────────────────────────────────────── */

interface TeamConsoleProps {
  state: TeamState
  data: DemoTeam
}

export function TeamConsole({ state, data }: TeamConsoleProps) {
  // Empty-state invite composer is design-only (no persistence in empty mode).
  function noopSend() {
    /* Phase 2: empty-account invite would create the first member + flip to
       the populated surface. Calm no-op in the design build. */
  }

  let body: React.ReactNode
  switch (state) {
    case 'loading':
      body = <LoadingBody />
      break
    case 'empty':
      body = <EmptyBody seats={data.seats} onSend={noopSend} />
      break
    case 'error':
      body = (
        <ErrorState
          title="Couldn't load your team"
          description="We hit a snag pulling in your team and invites. Try again — it usually clears right up."
          onRetry={() => window.location.reload()}
          retryLabel="Try again"
        />
      )
      break
    case 'success':
    default:
      body = <PopulatedBody data={data} />
      break
  }

  return <Shell>{body}</Shell>
}
