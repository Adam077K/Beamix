/**
 * templates/scan-complete.ts — Sent when a scan finishes.
 */

export interface ScanCompleteProps {
  firstName: string;
  businessName: string;
  score: number;
  scoreDelta: number | null;
  enginesScanned: number;
  scanUrl: string;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function deltaLabel(delta: number | null): string {
  if (delta === null) return '';
  if (delta > 0) return ` <span style="color:#10B981;">&#8593;${delta}</span>`;
  if (delta < 0) return ` <span style="color:#EF4444;">&#8595;${Math.abs(delta)}</span>`;
  return ' <span style="color:#6B7280;">(no change)</span>';
}

export function scanCompleteHtml(props: ScanCompleteProps): string {
  const { firstName, businessName, score, scoreDelta, enginesScanned, scanUrl } = props;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Scan complete — Beamix</title>
</head>
<body style="margin:0;padding:0;background:#F7F7F7;font-family:Inter,Helvetica,Arial,sans-serif;color:#0A0A0A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #E5E7EB;padding:40px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:13px;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Beamix</p>
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;line-height:1.3;">Scan complete for ${escapeHtml(businessName)}</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#6B7280;">Hi ${escapeHtml(firstName)}, your latest AI search scan is ready.</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F7F7;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
                <tr>
                  <td style="font-size:13px;color:#6B7280;">Visibility score</td>
                  <td align="right" style="font-size:22px;font-weight:600;">${score}${deltaLabel(scoreDelta)}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#6B7280;padding-top:12px;">Engines scanned</td>
                  <td align="right" style="font-size:16px;font-weight:500;padding-top:12px;">${enginesScanned}</td>
                </tr>
              </table>

              <a href="${escapeHtml(scanUrl)}" style="display:inline-block;background:#3370FF;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;">View full results</a>

              <p style="margin:40px 0 0;font-size:13px;color:#6B7280;border-top:1px solid #E5E7EB;padding-top:24px;">
                You're receiving this because you have scan notifications enabled. <a href="${escapeHtml(scanUrl)}/settings" style="color:#3370FF;">Manage preferences</a>
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

export function scanCompleteText(props: ScanCompleteProps): string {
  const delta =
    props.scoreDelta !== null
      ? ` (${props.scoreDelta >= 0 ? '+' : ''}${props.scoreDelta} from last scan)`
      : '';
  return `Scan complete — ${props.businessName}

Hi ${props.firstName}, your latest AI search scan is ready.

Visibility score: ${props.score}${delta}
Engines scanned: ${props.enginesScanned}

View full results: ${props.scanUrl}`;
}
