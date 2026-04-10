import {
  onCall,
  HttpsError,
  CallableRequest,
} from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { Resend } from "resend";
import { google } from "googleapis";
import * as admin from "firebase-admin";

// Define the secret
const resendApiKey = defineSecret("RESEND_API_KEY");

// Define the type for your email data
interface EmailData {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
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
    const { to, subject, html, headers } = request.data;

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
        ...(headers && { headers }),
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

const googleClientSecret = defineSecret("GOOGLE_CLIENT_SECRET");
const googleClientId = "83459975838-fqj9tuogpa17urv03jsaos2nbjfde9ne.apps.googleusercontent.com";

if (!admin.apps.length) {
  admin.initializeApp();
}

export const connectCalendar = onCall({
  secrets: [googleClientSecret],
  cors: ["http://localhost:3000", "https://studybuddy-392c7.web.app", "https://studybuddy-392c7.firebaseapp.com"],
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const { code } = request.data;
  const uid = request.auth.uid;

  const oauth2Client = new google.auth.OAuth2(
    googleClientId,
    googleClientSecret.value(),
    "postmessage"
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      await admin.firestore().collection("users").doc(uid).set({
        calendarConnected: true,
        googleRefreshToken: tokens.refresh_token,
        updatedAt: new Date().toISOString(), // <-- added ()
      }, { merge: true });
    }

    return { success: true };
  } catch (error) {
    console.error("Google Token Exchange Error:", error);
    throw new HttpsError("internal", "Failed to connect Google Calendar");
  }
});

export const fetchCalendar = onCall({
  secrets: [googleClientSecret],
  cors: ["http://localhost:3000", "https://studybuddy-392c7.web.app", "https://studybuddy-392c7.firebaseapp.com"],
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const uid = request.auth.uid;
  const db = admin.firestore();

  try {
    const userDoc = await db.collection("users").doc(uid).get();
    const refreshToken = userDoc.data()?.googleRefreshToken;

    if (!refreshToken) {
      throw new HttpsError("not-found", "No calendar token found. Please reconnect.");
    }

    const oauth2Client = new google.auth.OAuth2(
      googleClientId,
      googleClientSecret.value(),
      "postmessage"
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.calendarList.list();

    return { success: true, calendars: response.data.items || [] };
  } catch (error: any) {
    console.error("Error fetching calendar:", error);

    if (error.message?.includes("invalid_grant")) {
      await db.collection("users").doc(uid).update({
        googleRefreshToken: admin.firestore.FieldValue.delete(),
        calendarConnected: false,
      });
      throw new HttpsError("unauthenticated", "Calendar access revoked. Please reconnect.");
    }

    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Failed to fetch calendars");
  }
});

export const fetchEvents = onCall({
  secrets: [googleClientSecret],
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const uid = request.auth.uid;
  const { calendarId, timeMin, timeMax, timezone } = request.data;
  const db = admin.firestore();

  const userDoc = await db.collection("users").doc(uid).get();
  const refreshToken = userDoc.data()?.googleRefreshToken;

  if (!refreshToken) {
    throw new HttpsError("not-found", "No calendar token found.");
  }

  const oauth2Client = new google.auth.OAuth2(
    googleClientId,
    googleClientSecret.value(),
    "postmessage"
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const response = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    timeZone: timezone,
  });

  return { success: true, events: response.data.items || [] };
});