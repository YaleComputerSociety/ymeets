/**
 * Availability Updated Email Template
 * Sent to the event creator when someone fills out their availability
 */

export interface AvailabilityUpdatedData {
  participantName: string;
  eventTitle: string;
  eventUrl: string;
}

export function availabilityUpdatedSubject(
  data: AvailabilityUpdatedData
): string {
  return `New availability submitted · ${data.eventTitle}`;
}

export function availabilityUpdatedEmail(
  data: AvailabilityUpdatedData
): string {
  const { participantName, eventTitle, eventUrl } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Availability – ${eventTitle}</title>
</head>

<body style="margin:0; padding:0; background-color:#e1e8f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width:440px; margin:0 auto; padding:48px 20px;">

    <!-- Brand -->
    <div style="text-align:center; margin-bottom:28px;">
      <span style="font-size:20px; font-weight:600; color:#111827;">ymeets</span>
    </div>

    <!-- Card -->
    <div style="background-color:#ffffff; border-radius:12px; padding:28px; border:1px solid #d1d5db; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

      <!-- Message -->
      <p style="margin:0 0 20px; font-size:15px; color:#374151; line-height:1.5;">
        <strong style="color:#111827;">${participantName}</strong> submitted availability for
        <strong style="color:#111827;">${eventTitle}</strong>.
      </p>

      <!-- Primary CTA -->
      <a
        href="${eventUrl}"
        style="display:block; text-align:center; background-color:#5191F2; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:8px; font-size:14px; font-weight:500;"
      >
        View responses
      </a>

      <!-- Context -->
      <p style="margin:20px 0 0; font-size:12px; color:#6b7280; line-height:1.4;">
        You're receiving this email because you're the organizer of this event. You can toggle off these emails in the event settings.
      </p>

    </div>

  </div>
</body>
</html>
  `.trim();
}
