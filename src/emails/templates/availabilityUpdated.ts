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
  return `${data.participantName} responded to "${data.eventTitle}"`;
}

export function availabilityUpdatedEmail(
  data: AvailabilityUpdatedData
): string {
  const { participantName, eventTitle, eventUrl } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Response - ${eventTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #e1e8f7;">
  <div style="max-width: 440px; margin: 0 auto; padding: 48px 20px;">

    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 28px;">
      <span style="font-size: 20px; font-weight: 600; color: #1a1a1a;">ymeets</span>
    </div>

    <!-- Main Card -->
    <div style="background-color: #ffffff; border-radius: 12px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #d1d5db;">
      <p style="margin: 0 0 20px; color: #374151; font-size: 15px; line-height: 1.5;">
        <strong style="color: #1a1a1a;">${participantName}</strong> added their availability for <strong style="color: #1a1a1a;">${eventTitle}</strong>
      </p>

      <a href="${eventUrl}" style="display: block; background-color: #5191F2; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 500; font-size: 14px; text-align: center;">
        View Responses
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 24px;">
      <a href="https://ymeets.com" style="font-size: 12px; color: #6b7280; text-decoration: none;">ymeets.com</a>
    </div>

  </div>
</body>
</html>
  `.trim();
}
