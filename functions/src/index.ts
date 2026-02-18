import {
  onCall,
  HttpsError,
  CallableRequest,
} from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { Resend } from "resend";

// Define the secret
const resendApiKey = defineSecret("RESEND_API_KEY");

// Define the type for your email data
interface EmailData {
  to: string;
  subject: string;
  html: string;
}

// Export the function
export const sendEmail = onCall<EmailData>(
  { secrets: [resendApiKey] },
  async (request: CallableRequest<EmailData>) => {
    // Optional: Check if user is authenticated
    // if (!request.auth) {
    //   throw new HttpsError(
    //     "unauthenticated",
    //     "User must be authenticated to send emails"
    //   );
    // }

    // Get data from the request
    const { to, subject, html } = request.data;

    // Validate inputs
    if (!to || !subject || !html) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: to, subject, html",
      );
    }

    // Initialize Resend with the API key
    const resend = new Resend(resendApiKey.value());

    try {
      // Send the email
      const result = await resend.emails.send({
        from: "ymeets <alerts@updates.ymeets.com>",
        to: to,
        subject: subject,
        html: html,
      });

      return {
        success: true,
        id: result.data?.id,
      };
    } catch (error) {
      console.error("Error sending email:", error);
      throw new HttpsError("internal", "Failed to send email");
    }
  },
);
