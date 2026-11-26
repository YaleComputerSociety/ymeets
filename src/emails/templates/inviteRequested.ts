/**
 * Invite Requested Email Template
 * Sent to the event creator when someone asks to be added to the meeting's calendar invite
 */

export interface InviteRequestedData {
  participantName: string;
  participantEmail: string;
  eventTitle: string;
  eventUrl: string;
}

/** Escapes user-entered text for HTML. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function inviteRequestedSubject(data: InviteRequestedData): string {
  return `${data.participantName} asked to be added to the invite: ${data.eventTitle}`;
}

export function inviteRequestedEmail(data: InviteRequestedData): string {
  const name = escapeHtml(data.participantName);
  const email = escapeHtml(data.participantEmail);
  const title = escapeHtml(data.eventTitle);
  const url = escapeHtml(data.eventUrl);
  const font = "font-family:'Albert Sans',BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;";

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#E0E0E0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#E0E0E0;">
<tr><td align="center" style="padding:50px 10px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:546px;">
<tr><td style="background-color:#5191F1;padding:20px 50px;border-radius:18px 18px 0 0;text-align:center;">
<p style="margin:0;${font}font-size:20px;font-weight:700;color:#FFFFFF;">ymeets</p>
</td></tr>
<tr><td style="background-color:#F8F8F8;padding:40px 50px;border-radius:0 0 18px 18px;">
<p style="margin:0 0 24px;${font}font-size:18px;line-height:26px;color:#333333;">
<strong style="color:#191919;">${name}</strong> (${email}) asked to be added to the calendar invite for <strong style="color:#191919;">${title}</strong>. Add them to the event in Google Calendar, then mark them added in ymeets.
</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
<td style="background-color:#5191F1;border-radius:40px;padding:10px 30px;text-align:center;">
<a href="${url}" target="_blank" style="display:block;${font}font-size:12px;line-height:44px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">View request</a>
</td></tr></table>
<p style="margin:24px 0 0;${font}font-size:12px;line-height:18px;color:#888888;">
You can turn these emails off under "Late response requests" in the event's settings.
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`.trim();
}
