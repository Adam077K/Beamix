/**
 * templates/welcome.ts — Welcome email sent on signup.
 */

export interface WelcomeProps {
  firstName: string;
  dashboardUrl: string;
}

export function welcomeHtml(props: WelcomeProps): string {
  const { firstName, dashboardUrl } = props;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Welcome to Beamix</title>
</head>
<body style="margin:0;padding:0;background:#F7F7F7;font-family:Inter,Helvetica,Arial,sans-serif;color:#0A0A0A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #E5E7EB;padding:40px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:13px;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Beamix</p>
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;line-height:1.3;">Welcome, ${escapeHtml(firstName)}</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#6B7280;">
                Your workspace is ready. Beamix will scan your AI search visibility and use agents to fix what it finds — no manual effort required.
              </p>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#6B7280;">
                Start by running your first visibility scan. It takes about 2 minutes.
              </p>
              <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#3370FF;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;">Open your workspace</a>
              <p style="margin:40px 0 0;font-size:13px;color:#6B7280;border-top:1px solid #E5E7EB;padding-top:24px;">
                You're receiving this because you signed up for Beamix. Questions? Reply to this email.
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

export function welcomeText(props: WelcomeProps): string {
  return `Welcome to Beamix, ${props.firstName}!

Your workspace is ready. Beamix will scan your AI search visibility and use agents to fix what it finds.

Open your workspace: ${props.dashboardUrl}

Questions? Reply to this email.`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
