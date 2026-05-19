/**
 * templates/daily-digest.ts — Daily inbox digest email.
 *
 * Aggregates unread inbox items from the past 24h into one email.
 */

export interface DigestItem {
  title: string;
  actionLabel: string;
  url: string;
}

export interface DailyDigestProps {
  firstName: string;
  inboxUrl: string;
  items: DigestItem[];
  date: string; // e.g. "April 18, 2026"
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function itemRows(items: DigestItem[]): string {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #E5E7EB;">
          <a href="${escapeHtml(item.url)}" style="color:#0A0A0A;text-decoration:none;font-size:14px;font-weight:500;">${escapeHtml(item.title)}</a>
          <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">${escapeHtml(item.actionLabel)}</p>
        </td>
      </tr>`
    )
    .join('');
}

export function dailyDigestHtml(props: DailyDigestProps): string {
  const { firstName, inboxUrl, items, date } = props;
  const count = items.length;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Your Beamix digest — ${escapeHtml(date)}</title>
</head>
<body style="margin:0;padding:0;background:#F7F7F7;font-family:Inter,Helvetica,Arial,sans-serif;color:#0A0A0A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #E5E7EB;padding:40px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:13px;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Beamix · ${escapeHtml(date)}</p>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:500;line-height:1.3;">
                ${count === 1 ? '1 item' : `${count} items`} ready to review
              </h1>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#6B7280;">
                Hi ${escapeHtml(firstName)}, your agents have been working. Here's what needs your approval.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemRows(items)}
              </table>

              <a href="${escapeHtml(inboxUrl)}" style="display:inline-block;margin-top:24px;background:#3370FF;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;">Review in inbox</a>

              <p style="margin:40px 0 0;font-size:13px;color:#6B7280;border-top:1px solid #E5E7EB;padding-top:24px;">
                You're receiving this daily digest because you have it enabled. <a href="${escapeHtml(inboxUrl)}/settings" style="color:#3370FF;">Manage preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function dailyDigestText(props: DailyDigestProps): string {
  const { firstName, inboxUrl, items, date } = props;
  const lines = items.map((i) => `- ${i.title} (${i.actionLabel}): ${i.url}`).join('\n');
  return `Your Beamix digest — ${date}

Hi ${firstName}, ${items.length} item(s) ready to review.

${lines}

Review in inbox: ${inboxUrl}`;
}
