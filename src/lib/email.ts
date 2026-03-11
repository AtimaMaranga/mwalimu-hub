import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@swahili-tutors.com";
const FROM = "Swahili Tutors <noreply@swahili-tutors.com>";

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
    subject: "We received your message — Swahili Tutors",
    html: `
      <h2>Habari ${data.name}!</h2>
      <p>Thank you for reaching out to Swahili Tutors. We've received your message and will get back to you within 24 hours.</p>
      <p>In the meantime, feel free to browse our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/teachers">teacher directory</a>.</p>
      <p>Asante sana,<br/>The Swahili Tutors Team</p>
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
    subject: "Application received — Swahili Tutors",
    html: `
      <h2>Habari ${data.name}!</h2>
      <p>Thank you for applying to teach on Swahili Tutors. We've received your application and will review it within 48 hours.</p>
      <p>We'll contact you at this email address with the outcome. If you have any questions in the meantime, feel free to reply to this email.</p>
      <p>Asante sana,<br/>The Swahili Tutors Team</p>
    `,
  });
}

// ─── Teacher Approval ─────────────────────────────────────────────────────

export async function sendTeacherApprovedEmail(data: {
  name: string;
  email: string;
  slug: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: data.email,
    subject: "You're approved — welcome to Swahili Tutors!",
    html: `
      <h2>Habari ${data.name}!</h2>
      <p>Great news — your teacher profile has been reviewed and <strong>approved</strong>. You are now live on Swahili Tutors!</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/teachers/${data.slug}">View your public profile</a></p>
      <p>Students can now find you and send you inquiries. You'll receive an email each time a student reaches out.</p>
      <p>If you'd like to update your profile details, log in to your dashboard at <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/teacher/profile">${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/teacher/profile</a>.</p>
      <p>Asante sana,<br/>The Swahili Tutors Team</p>
    `,
  });
}

export async function sendTeacherRejectedEmail(data: {
  name: string;
  email: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: data.email,
    subject: "Update on your Swahili Tutors application",
    html: `
      <h2>Habari ${data.name},</h2>
      <p>Thank you for your interest in teaching on Swahili Tutors.</p>
      <p>After reviewing your application, we're unable to approve your profile at this time. This may be due to incomplete information or our current capacity.</p>
      <p>You're welcome to reapply at any time with updated information at <a href="${process.env.NEXT_PUBLIC_SITE_URL}/become-a-teacher">${process.env.NEXT_PUBLIC_SITE_URL}/become-a-teacher</a>.</p>
      <p>If you have any questions, feel free to reply to this email.</p>
      <p>Asante,<br/>The Swahili Tutors Team</p>
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
  const resend = getResend();
  const messageHtml = (data.message || "No message").replace(/\n/g, "<br/>");

  const promises = [
    // Direct notification to the teacher
    ...(data.teacher_email ? [
      resend.emails.send({
        from: FROM,
        to: data.teacher_email,
        subject: `New student inquiry from ${data.student_name} — Swahili Tutors`,
        html: `
          <h2>Habari ${data.teacher_name}!</h2>
          <p>A student has sent you an inquiry on Swahili Tutors.</p>
          <table style="border-collapse:collapse;width:100%;margin:16px 0">
            <tr><td style="padding:8px;font-weight:bold;width:140px">Student name</td><td style="padding:8px">${data.student_name}</td></tr>
            <tr style="background:#f8f8f8"><td style="padding:8px;font-weight:bold">Student email</td><td style="padding:8px"><a href="mailto:${data.student_email}">${data.student_email}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold">Level</td><td style="padding:8px">${data.experience_level || "Not specified"}</td></tr>
          </table>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left:3px solid #6366f1;padding-left:12px;color:#444">${messageHtml}</blockquote>
          <p>Reply directly to <a href="mailto:${data.student_email}">${data.student_email}</a> to get in touch with this student.</p>
          <p>You can also <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/teacher">view your dashboard</a> to manage messages.</p>
          <p>Asante,<br/>The Swahili Tutors Team</p>
        `,
      })
    ] : []),

    // Admin CC
    resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `[Inquiry] ${data.student_name} → ${data.teacher_name}`,
      html: `
        <h2>New Student Inquiry</h2>
        <p><strong>Teacher:</strong> ${data.teacher_name} (${data.teacher_email || "no email"})</p>
        <p><strong>Student:</strong> ${data.student_name} (${data.student_email})</p>
        <p><strong>Level:</strong> ${data.experience_level || "Not specified"}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${messageHtml}</p>
      `,
    }),

    // Student confirmation
    resend.emails.send({
      from: FROM,
      to: data.student_email,
      subject: `Your inquiry to ${data.teacher_name} — Swahili Tutors`,
      html: `
        <h2>Habari ${data.student_name}!</h2>
        <p>Your inquiry has been sent to <strong>${data.teacher_name}</strong>. They will contact you directly at this email address within 24–48 hours.</p>
        <p>While you wait, feel free to <a href="${process.env.NEXT_PUBLIC_SITE_URL}/teachers">browse other teachers</a> too.</p>
        <p>Asante,<br/>The Swahili Tutors Team</p>
      `,
    }),
  ];

  return Promise.allSettled(promises);
}
