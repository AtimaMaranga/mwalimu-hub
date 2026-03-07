import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@mwalimuwangu.com";
const FROM = "Mwalimu Wangu <noreply@mwalimuwangu.com>";

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

// ─── Contact Form ──────────────────────────────────────────────────────────

export async function sendContactNotification(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `[Contact] ${data.subject} — ${data.name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
      <p><strong>Subject:</strong> ${data.subject}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <p>${data.message.replace(/\n/g, "<br/>")}</p>
    `,
  });
}

export async function sendContactConfirmation(data: {
  name: string;
  email: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: data.email,
    subject: "We received your message — Mwalimu Wangu",
    html: `
      <h2>Habari ${data.name}!</h2>
      <p>Thank you for reaching out to Mwalimu Wangu. We've received your message and will get back to you within 24 hours.</p>
      <p>In the meantime, feel free to browse our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/teachers">teacher directory</a>.</p>
      <p>Asante sana,<br/>The Mwalimu Wangu Team</p>
    `,
  });
}

// ─── Teacher Application ───────────────────────────────────────────────────

export async function sendApplicationNotification(data: {
  name: string;
  email: string;
  rate_expectation?: number;
  available_hours?: number;
}) {
  return getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `[Application] New teacher application — ${data.name}`,
    html: `
      <h2>New Teacher Application</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Expected Rate:</strong> $${data.rate_expectation}/hr</p>
      <p><strong>Available Hours:</strong> ${data.available_hours} hrs/week</p>
      <p>Review the full application in the <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/submissions">admin dashboard</a>.</p>
    `,
  });
}

export async function sendApplicationConfirmation(data: {
  name: string;
  email: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: data.email,
    subject: "Application received — Mwalimu Wangu",
    html: `
      <h2>Habari ${data.name}!</h2>
      <p>Thank you for applying to teach on Mwalimu Wangu. We've received your application and will review it within 48 hours.</p>
      <p>We'll contact you at this email address with the outcome. If you have any questions in the meantime, feel free to reply to this email.</p>
      <p>Asante sana,<br/>The Mwalimu Wangu Team</p>
    `,
  });
}

// ─── Student Inquiry ──────────────────────────────────────────────────────

export async function sendInquiryNotification(data: {
  teacher_name: string;
  teacher_email?: string;
  student_name: string;
  student_email: string;
  message?: string;
  experience_level?: string;
}) {
  const promises = [
    // Admin notification
    getResend().emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `[Inquiry] ${data.student_name} → ${data.teacher_name}`,
      html: `
        <h2>New Student Inquiry</h2>
        <p><strong>Teacher:</strong> ${data.teacher_name}</p>
        <p><strong>Student:</strong> ${data.student_name} (${data.student_email})</p>
        <p><strong>Level:</strong> ${data.experience_level || "Not specified"}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${(data.message || "No message").replace(/\n/g, "<br/>")}</p>
      `,
    }),
    // Student confirmation
    getResend().emails.send({
      from: FROM,
      to: data.student_email,
      subject: `Your inquiry to ${data.teacher_name} — Mwalimu Wangu`,
      html: `
        <h2>Habari ${data.student_name}!</h2>
        <p>Your inquiry has been sent to <strong>${data.teacher_name}</strong>. They will contact you directly at this email address within 24–48 hours.</p>
        <p>While you wait, feel free to <a href="${process.env.NEXT_PUBLIC_SITE_URL}/teachers">browse other teachers</a> too.</p>
        <p>Asante,<br/>The Mwalimu Wangu Team</p>
      `,
    }),
  ];

  return Promise.allSettled(promises);
}
