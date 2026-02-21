import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../backend/firebase';
import {
  availabilityUpdatedEmail,
  availabilityUpdatedSubject,
  type AvailabilityUpdatedData,
} from './templates/availabilityUpdated';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  headers?: Record<string, string>;
}

interface SendEmailResult {
  success: boolean;
  data: {
    id: string;
  };
}

export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const functions = getFunctions();
  const sendEmailFn = httpsCallable<SendEmailOptions, SendEmailResult>(
    functions,
    'sendEmail'
  );

  const result = await sendEmailFn(options);
  return result.data;
}

// Event-specifc thread ID for emails appear in same thread
function getEventThreadMessageId(eventId: string): string {
  return `<event-${eventId}-avail-updated-id>`;
}

/**
 * Send notification to event creator when someone fills out their availability
 * Exported for testing purposes
 */
export async function sendAvailabilityUpdatedEmail(
  to: string,
  data: AvailabilityUpdatedData,
  eventId: string
): Promise<SendEmailResult> {
  const threadMessageId = getEventThreadMessageId(eventId);

  return sendEmail({
    to,
    subject: availabilityUpdatedSubject(data),
    html: availabilityUpdatedEmail(data),
    headers: {
      'In-Reply-To': threadMessageId,
      References: threadMessageId,
    },
  });
}

// Notify the event admin when a participant saves their availability
export async function notifyAdminOfNewResponse(
  adminAccountId: string,
  currentUserAccountId: string,
  participantName: string,
  eventTitle: string,
  eventId: string
): Promise<void> {
  // Don't email the admin when they save their own availability
  if (adminAccountId === currentUserAccountId) {
    return;
  }

  try {
    // Fetch admin email from users collection
    const userDoc = await getDoc(doc(db, 'users', adminAccountId));
    if (!userDoc.exists()) {
      console.error('Admin user document not found');
      return;
    }

    const adminEmail = userDoc.data().email;
    if (!adminEmail) {
      console.error('Admin email not found');
      return;
    }

    await sendAvailabilityUpdatedEmail(
      adminEmail,
      {
        participantName: participantName || 'Someone',
        eventTitle,
        eventUrl: `https://ymeets.com/dashboard/${eventId}`,
      },
      eventId
    );
  } catch (error) {
    console.error('Failed to send availability notification email:', error);
  }
}
