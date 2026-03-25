/**
 * Invitation Email Template
 * Sent when inviting someone to join an event
 */

export interface InvitationEmailData {
  eventCode: string;
  eventTitle: string;
  senderName: string;
}

export function invitationEmailSubject(data: InvitationEmailData): string {
  return `You've been invited to ${data.eventTitle}`;
}

export function invitationEmailHtml(data: InvitationEmailData): string {
  const { eventCode, eventTitle, senderName } = data;
  const eventUrl = `https://ymeets.com/dashboard/${eventCode}`;

  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:24px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:24px;">

            <h2 style="margin-top:0;">You've been invited to an event</h2>

            <p>
              <strong>${senderName}</strong> invited you to join:
            </p>

            <h3 style="margin-top:8px;">${eventTitle}</h3>

            <p>
              Click below to view details and respond:
            </p>

            <p>
              <a
                href="${eventUrl}"
                style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:bold;">
                View Invitation
              </a>
            </p>

            <p style="font-size:14px;color:#666;">
              Or paste this link into your browser:
              <br />
              ${eventUrl}
            </p>

            <p style="font-size:12px;color:#999;">
              Event code: ${eventCode}
            </p>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();
}
