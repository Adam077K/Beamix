/**
 * templates/budget-75.ts — 75% credit usage alert.
 *
 * Sent once per billing period when usage crosses 75% of monthly cap.
 */

export interface Budget75Props {
  firstName: string;
  creditsUsed: number;
  creditsTotal: number;
  automationUrl: string;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function budget75Html(props: Budget75Props): string {
  const { firstName, creditsUsed, creditsTotal, automationUrl } = props;
  const remaining = creditsTotal - creditsUsed;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>75% of your agent credits used — Beamix</title>
</head>
<body style="margin:0;padding:0;background:#F7F7F7;font-family:Inter,Helvetica,Arial,sans-serif;color:#0A0A0A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #E5E7EB;padding:40px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:13px;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Beamix</p>
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;line-height:1.3;">75% of your agent credits used</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#6B7280;">
                Hi ${escapeHtml(firstName)}, you've used <strong>${creditsUsed} of ${creditsTotal} credits</strong> this month. ${remaining} credits remain.
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#6B7280;">
                Review your automation schedule to make sure high-priority agents run before your cap is reached. Unused credits don't roll over beyond 20%.
              </p>
              <a href="${escapeHtml(automationUrl)}" style="display:inline-block;background:#3370FF;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;">Review automation schedule</a>
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

export function budget75Text(props: Budget75Props): string {
  const { firstName, creditsUsed, creditsTotal, automationUrl } = props;
  const remaining = creditsTotal - creditsUsed;
  return `75% of your agent credits used — Beamix

Hi ${firstName}, you've used ${creditsUsed} of ${creditsTotal} credits this month. ${remaining} credits remain.

Review your automation schedule: ${automationUrl}`;
}
