import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface LeaseAlertPayload {
  tenantName: string;
  propertyAddress: string;
  endDate: Date;
  daysUntilEnd: number;
}

export async function sendEmailAlert(to: string, payload: LeaseAlertPayload) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return;
  }
  const { tenantName, propertyAddress, endDate, daysUntilEnd } = payload;
  const formattedDate = endDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "PropertyPro <notifications@resend.dev>",
    to,
    subject: `Lease expiring in ${daysUntilEnd} days — ${propertyAddress}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;">
        <h2 style="color:#1e293b;">Lease Expiration Notice</h2>
        <p>The lease for <strong>${tenantName}</strong> at <strong>${propertyAddress}</strong>
        expires on <strong>${formattedDate}</strong> (${daysUntilEnd} days from now).</p>
        <p style="color:#64748b;font-size:14px;">
          Log in to PropertyPro to renew, terminate, or update this lease.
        </p>
      </div>
    `,
  });
}

export async function sendSmsAlert(to: string, payload: LeaseAlertPayload) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    console.warn("Twilio credentials not set — skipping SMS");
    return;
  }

  const { tenantName, propertyAddress, daysUntilEnd } = payload;
  const body = `PropertyPro: Lease for ${tenantName} at ${propertyAddress} expires in ${daysUntilEnd} days. Log in to take action.`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: fromPhone, Body: body }),
  });
}

export async function sendAlert(
  method: "EMAIL" | "SMS" | "BOTH",
  email: string | null,
  phone: string | null,
  payload: LeaseAlertPayload
) {
  const tasks: Promise<void>[] = [];
  if ((method === "EMAIL" || method === "BOTH") && email) {
    tasks.push(sendEmailAlert(email, payload));
  }
  if ((method === "SMS" || method === "BOTH") && phone) {
    tasks.push(sendSmsAlert(phone, payload));
  }
  await Promise.all(tasks);
}
