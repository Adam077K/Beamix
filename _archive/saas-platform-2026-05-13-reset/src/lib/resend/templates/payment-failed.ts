/**
 * templates/payment-failed.ts — Sent when a payment fails.
 */

export interface PaymentFailedProps {
  firstName: string;
  billingUrl: string;
  amount: string; // e.g. "$189.00"
  nextRetryDate: string | null; // ISO date string or null
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function paymentFailedHtml(props: PaymentFailedProps): string {
  const { firstName, billingUrl, amount, nextRetryDate } = props;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Payment failed — Beamix</title>
</head>
<body style="margin:0;padding:0;background:#F7F7F7;font-family:Inter,Helvetica,Arial,sans-serif;color:#0A0A0A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #E5E7EB;padding:40px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:13px;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Beamix</p>
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;line-height:1.3;color:#EF4444;">Payment failed</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#6B7280;">
                Hi ${escapeHtml(firstName)}, we couldn't process your payment of <strong>${escapeHtml(amount)}</strong>.
              </p>
              ${
                nextRetryDate
                  ? `<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#6B7280;">We'll retry automatically on <strong>${escapeHtml(nextRetryDate)}</strong>. To avoid service interruption, update your payment method before then.</p>`
                  : `<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#6B7280;">Please update your payment method to restore access.</p>`
              }
              <a href="${escapeHtml(billingUrl)}" style="display:inline-block;background:#EF4444;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;">Update payment method</a>

              <p style="margin:40px 0 0;font-size:13px;color:#6B7280;border-top:1px solid #E5E7EB;padding-top:24px;">
                Questions? Reply to this email and we'll help.
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

export function paymentFailedText(props: PaymentFailedProps): string {
  const { firstName, billingUrl, amount, nextRetryDate } = props;
  const retryLine = nextRetryDate
    ? `We'll retry automatically on ${nextRetryDate}.`
    : 'Please update your payment method to restore access.';
  return `Payment failed — Beamix

Hi ${firstName}, we couldn't process your payment of ${amount}. ${retryLine}

Update your payment method: ${billingUrl}`;
}
