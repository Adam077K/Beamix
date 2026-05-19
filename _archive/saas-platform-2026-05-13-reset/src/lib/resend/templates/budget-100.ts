/**
 * templates/budget-100.ts — 100% credit usage alert + automation paused.
 *
 * Sent once per billing period when usage reaches 100% of monthly cap.
 * Automation is automatically paused when this fires.
 */

export interface Budget100Props {
  firstName: string;
  creditsTotal: number;
  automationUrl: string;
  topupUrl: string;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function budget100Html(props: Budget100Props): string {
  const { firstName, creditsTotal, automationUrl, topupUrl } = props;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Agent credits exhausted — automation paused — Beamix</title>
</head>
<body style="margin:0;padding:0;background:#F7F7F7;font-family:Inter,Helvetica,Arial,sans-serif;color:#0A0A0A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #E5E7EB;padding:40px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:13px;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Beamix</p>
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;line-height:1.3;">Agent credits exhausted — automation paused</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#6B7280;">
                Hi ${escapeHtml(firstName)}, you've used all <strong>${creditsTotal} credits</strong> for this billing period. All scheduled automation has been automatically paused.
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#6B7280;">
                Credits reset at the start of your next billing period. You can add a top-up pack now to resume automation immediately.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="${escapeHtml(topupUrl)}" style="display:inline-block;background:#3370FF;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;">Add top-up credits</a>
                  </td>
                  <td>
                    <a href="${escapeHtml(automationUrl)}" style="display:inline-block;background:#F7F7F7;color:#0A0A0A;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;border:1px solid #E5E7EB;">View automation</a>
                  </td>
                </tr>
              </table>
              <p style="margin:40px 0 0;font-size:13px;color:#6B7280;border-top:1px solid #E5E7EB;padding-top:24px;">
                You're receiving this because you have budget alerts enabled. <a href="${escapeHtml(automationUrl)}/settings" style="color:#3370FF;">Manage preferences</a>
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

export function budget100Text(props: Budget100Props): string {
  const { firstName, creditsTotal, automationUrl, topupUrl } = props;
  return `Agent credits exhausted — Beamix

Hi ${firstName}, you've used all ${creditsTotal} credits for this billing period. All scheduled automation has been automatically paused.

Add top-up credits: ${topupUrl}
View automation: ${automationUrl}`;
}
