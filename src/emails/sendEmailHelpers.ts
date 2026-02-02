import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  availabilityUpdatedEmail,
  availabilityUpdatedSubject,
  type AvailabilityUpdatedData,
} from './templates/availabilityUpdated';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
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

/**
 * Send notification to event creator when someone fills out their availability
 */
export async function sendAvailabilityUpdatedEmail(
  to: string,
  data: AvailabilityUpdatedData
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: availabilityUpdatedSubject(data),
    html: availabilityUpdatedEmail(data),
  });
}
