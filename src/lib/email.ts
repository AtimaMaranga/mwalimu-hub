import { Resend } from "resend";
import { escapeHtml, escapeHtmlWithBreaks } from "@/lib/sanitize";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@swahili-tutors.com";
const FROM = "Swahili Tutors <noreply@swahili-tutors.com>";
const SITE = () => process.env.NEXT_PUBLIC_SITE_URL || "https://swahili-tutors.com";

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
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const phone = data.phone ? escapeHtml(data.phone) : "";
  const subject = escapeHtml(data.subject);
  const message = escapeHtmlWithBreaks(data.message);

  return getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `[Contact] ${data.subject} — ${data.name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
      <p><strong>Subject:</strong> ${subject}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  });
}

export async function sendContactConfirmation(data: {
  name: string;
  email: string;
}) {
  const name = escapeHtml(data.name);

  return getResend().emails.send({
    from: FROM,
    to: data.email,
    subject: "We received your message — Swahili Tutors",
    html: `
      <h2>Habari ${name}!</h2>
      <p>Thank you for reaching out to Swahili Tutors. We've received your message and will get back to you within 24 hours.</p>
      <p>In the meantime, feel free to browse our <a href="${SITE()}/teachers">teacher directory</a>.</p>
      <p>Asante sana,<br/>The Swahili Tutors Team</p>
    `,
  });
}

// ─── Teacher Application ───────────────────────────────────────────────────

export async function sendApplicationNotification(data: {
  name: string;
  email: string;
  available_hours?: number;
}) {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);

  return getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `[Application] New teacher application — ${data.name}`,
    html: `
      <h2>New Teacher Application</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Available Hours:</strong> ${data.available_hours ?? 0} hrs/week</p>
      <p>All new teachers start at <strong>$7/hr</strong> (platform standard rate).</p>
      <p>Review the full application in the <a href="${SITE()}/admin/submissions">admin dashboard</a>.</p>
    `,
  });
}

export async function sendApplicationConfirmation(data: {
  name: string;
  email: string;
}) {
  const name = escapeHtml(data.name);

  return getResend().emails.send({
    from: FROM,
    to: data.email,
    subject: "Application received — Swahili Tutors",
    html: `
      <h2>Habari ${name}!</h2>
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
  const name = escapeHtml(data.name);
  const slug = encodeURIComponent(data.slug);

  return getResend().emails.send({
    from: FROM,
    to: data.email,
    subject: "You're approved — welcome to Swahili Tutors!",
    html: `
      <h2>Habari ${name}!</h2>
      <p>Great news — your teacher profile has been reviewed and <strong>approved</strong>. You are now live on Swahili Tutors!</p>
      <p><a href="${SITE()}/teachers/${slug}">View your public profile</a></p>
      <p>Students can now find you and send you inquiries. You'll receive an email each time a student reaches out.</p>
      <p>If you'd like to update your profile details, log in to your dashboard at <a href="${SITE()}/dashboard/teacher/profile">${SITE()}/dashboard/teacher/profile</a>.</p>
      <p>Asante sana,<br/>The Swahili Tutors Team</p>
    `,
  });
}

export async function sendTeacherRejectedEmail(data: {
  name: string;
  email: string;
}) {
  const name = escapeHtml(data.name);

  return getResend().emails.send({
    from: FROM,
    to: data.email,
    subject: "Update on your Swahili Tutors application",
    html: `
      <h2>Habari ${name},</h2>
      <p>Thank you for your interest in teaching on Swahili Tutors.</p>
      <p>After reviewing your application, we're unable to approve your profile at this time. This may be due to incomplete information or our current capacity.</p>
      <p>You're welcome to reapply at any time with updated information at <a href="${SITE()}/become-a-teacher">${SITE()}/become-a-teacher</a>.</p>
      <p>If you have any questions, feel free to reply to this email.</p>
      <p>Asante,<br/>The Swahili Tutors Team</p>
    `,
  });
}

// ─── Booking Notifications ────────────────────────────────────────────────

export async function sendBookingCreatedToTeacher(data: {
  teacher_name: string;
  teacher_email: string;
  student_name: string;
  student_email: string;
  proposed_date: string;
  proposed_time: string;
  duration_minutes: number;
  message?: string | null;
}) {
  const teacherName = escapeHtml(data.teacher_name);
  const studentName = escapeHtml(data.student_name);
  const studentEmail = escapeHtml(data.student_email);
  const messageHtml = data.message ? escapeHtmlWithBreaks(data.message) : null;

  return getResend().emails.send({
    from: FROM,
    to: data.teacher_email,
    subject: `New lesson booking from ${data.student_name} — Swahili Tutors`,
    html: `
      <h2>Habari ${teacherName}!</h2>
      <p>A student has requested to book a lesson with you.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        <tr><td style="padding:8px;font-weight:bold;width:140px">Student</td><td style="padding:8px">${studentName} (${studentEmail})</td></tr>
        <tr style="background:#f8f8f8"><td style="padding:8px;font-weight:bold">Date</td><td style="padding:8px">${escapeHtml(data.proposed_date)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Time</td><td style="padding:8px">${escapeHtml(data.proposed_time)}</td></tr>
        <tr style="background:#f8f8f8"><td style="padding:8px;font-weight:bold">Duration</td><td style="padding:8px">${data.duration_minutes} minutes</td></tr>
      </table>
      ${messageHtml ? `<p><strong>Student's message:</strong></p><blockquote style="border-left:3px solid #6366f1;padding-left:12px;color:#444">${messageHtml}</blockquote>` : ""}
      <p><a href="${SITE()}/dashboard/teacher" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">View &amp; Respond in Dashboard</a></p>
      <p style="color:#888;font-size:13px">Please confirm or decline this booking from your dashboard. The student will be notified of your response.</p>
      <p>Asante,<br/>The Swahili Tutors Team</p>
    `,
  });
}

export async function sendBookingCreatedToStudent(data: {
  student_name: string;
  student_email: string;
  teacher_name: string;
  proposed_date: string;
  proposed_time: string;
  duration_minutes: number;
}) {
  const studentName = escapeHtml(data.student_name);
  const teacherName = escapeHtml(data.teacher_name);

  return getResend().emails.send({
    from: FROM,
    to: data.student_email,
    subject: `Booking request sent to ${data.teacher_name} — Swahili Tutors`,
    html: `
      <h2>Habari ${studentName}!</h2>
      <p>Your lesson booking request has been sent to <strong>${teacherName}</strong>.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        <tr><td style="padding:8px;font-weight:bold;width:140px">Date</td><td style="padding:8px">${escapeHtml(data.proposed_date)}</td></tr>
        <tr style="background:#f8f8f8"><td style="padding:8px;font-weight:bold">Time</td><td style="padding:8px">${escapeHtml(data.proposed_time)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Duration</td><td style="padding:8px">${data.duration_minutes} minutes</td></tr>
      </table>
      <p>The teacher will confirm or decline your request. You'll receive an email when they respond.</p>
      <p><a href="${SITE()}/dashboard/student">View your bookings</a></p>
      <p>Asante,<br/>The Swahili Tutors Team</p>
    `,
  });
}

export async function sendBookingConfirmedToStudent(data: {
  student_name: string;
  student_email: string;
  teacher_name: string;
  proposed_date: string;
  proposed_time: string;
  duration_minutes: number;
  teacher_note?: string | null;
}) {
  const studentName = escapeHtml(data.student_name);
  const teacherName = escapeHtml(data.teacher_name);
  const noteHtml = data.teacher_note ? escapeHtmlWithBreaks(data.teacher_note) : null;

  return getResend().emails.send({
    from: FROM,
    to: data.student_email,
    subject: `Lesson confirmed with ${data.teacher_name}! — Swahili Tutors`,
    html: `
      <h2>Great news, ${studentName}!</h2>
      <p><strong>${teacherName}</strong> has confirmed your lesson booking.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        <tr><td style="padding:8px;font-weight:bold;width:140px">Date</td><td style="padding:8px">${escapeHtml(data.proposed_date)}</td></tr>
        <tr style="background:#f8f8f8"><td style="padding:8px;font-weight:bold">Time</td><td style="padding:8px">${escapeHtml(data.proposed_time)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Duration</td><td style="padding:8px">${data.duration_minutes} minutes</td></tr>
      </table>
      ${noteHtml ? `<p><strong>Note from teacher:</strong></p><blockquote style="border-left:3px solid #22c55e;padding-left:12px;color:#444">${noteHtml}</blockquote>` : ""}
      <p><a href="${SITE()}/dashboard/student" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">View in Dashboard</a></p>
      <p>On the day of the lesson, log in to your dashboard and click "Join Lesson" to start.</p>
      <p>Asante,<br/>The Swahili Tutors Team</p>
    `,
  });
}

export async function sendBookingDeclinedToStudent(data: {
  student_name: string;
  student_email: string;
  teacher_name: string;
  proposed_date: string;
  proposed_time: string;
  teacher_note?: string | null;
}) {
  const studentName = escapeHtml(data.student_name);
  const teacherName = escapeHtml(data.teacher_name);
  const noteHtml = data.teacher_note ? escapeHtmlWithBreaks(data.teacher_note) : null;

  return getResend().emails.send({
    from: FROM,
    to: data.student_email,
    subject: `Booking update from ${data.teacher_name} — Swahili Tutors`,
    html: `
      <h2>Habari ${studentName},</h2>
      <p>Unfortunately, <strong>${teacherName}</strong> was unable to accept your booking for ${escapeHtml(data.proposed_date)} at ${escapeHtml(data.proposed_time)}.</p>
      ${noteHtml ? `<p><strong>Teacher's note:</strong></p><blockquote style="border-left:3px solid #ef4444;padding-left:12px;color:#444">${noteHtml}</blockquote>` : ""}
      <p>Don't worry — you can try a different time or <a href="${SITE()}/teachers">browse other teachers</a>.</p>
      <p>Asante,<br/>The Swahili Tutors Team</p>
    `,
  });
}

export async function sendBookingCancelledToTeacher(data: {
  teacher_name: string;
  teacher_email: string;
  student_name: string;
  proposed_date: string;
  proposed_time: string;
}) {
  const teacherName = escapeHtml(data.teacher_name);
  const studentName = escapeHtml(data.student_name);

  return getResend().emails.send({
    from: FROM,
    to: data.teacher_email,
    subject: `Booking cancelled by ${data.student_name} — Swahili Tutors`,
    html: `
      <h2>Habari ${teacherName},</h2>
      <p><strong>${studentName}</strong> has cancelled their booking for ${escapeHtml(data.proposed_date)} at ${escapeHtml(data.proposed_time)}.</p>
      <p><a href="${SITE()}/dashboard/teacher">View your dashboard</a></p>
      <p>Asante,<br/>The Swahili Tutors Team</p>
    `,
  });
}

// ─── Lesson Reminders ─────────────────────────────────────────────────────

export async function sendLessonReminder(data: {
  recipient_name: string;
  recipient_email: string;
  other_person_name: string;
  role: "student" | "teacher";
  proposed_date: string;
  proposed_time: string;
  duration_minutes: number;
  minutes_until: number;
}) {
  const recipientName = escapeHtml(data.recipient_name);
  const otherName = escapeHtml(data.other_person_name);
  const timeLabel = data.minutes_until <= 30 ? "30 minutes" : "1 hour";
  const roleLabel = data.role === "student" ? "teacher" : "student";
  const dashboardUrl = data.role === "student" ? "/dashboard/student" : "/dashboard/teacher";

  return getResend().emails.send({
    from: FROM,
    to: data.recipient_email,
    subject: `Lesson reminder: Your session starts in ${timeLabel} — Swahili Tutors`,
    html: `
      <h2>Habari ${recipientName}!</h2>
      <p>Your Swahili lesson starts <strong>in ${timeLabel}</strong>.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <tr style="background:#f8fafc"><td style="padding:12px;font-weight:bold;width:140px">With</td><td style="padding:12px">${otherName} (${roleLabel})</td></tr>
        <tr><td style="padding:12px;font-weight:bold">Date</td><td style="padding:12px">${escapeHtml(data.proposed_date)}</td></tr>
        <tr style="background:#f8fafc"><td style="padding:12px;font-weight:bold">Time</td><td style="padding:12px">${escapeHtml(data.proposed_time)}</td></tr>
        <tr><td style="padding:12px;font-weight:bold">Duration</td><td style="padding:12px">${data.duration_minutes} minutes</td></tr>
      </table>
      <p><a href="${SITE()}${dashboardUrl}" style="display:inline-block;padding:14px 28px;background:#6366f1;color:#fff;text-decoration:none;border-radius:10px;font-weight:bold;font-size:15px">Go to Dashboard</a></p>
      <p style="color:#64748b;font-size:13px">When it's time, click "Join Classroom" from your dashboard to start the session.</p>
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
  const teacherName = escapeHtml(data.teacher_name);
  const studentName = escapeHtml(data.student_name);
  const studentEmail = escapeHtml(data.student_email);
  const level = escapeHtml(data.experience_level || "Not specified");
  const messageHtml = escapeHtmlWithBreaks(data.message || "No message");

  const promises = [
    // Direct notification to the teacher
    ...(data.teacher_email ? [
      resend.emails.send({
        from: FROM,
        to: data.teacher_email,
        subject: `New student inquiry from ${data.student_name} — Swahili Tutors`,
        html: `
          <h2>Habari ${teacherName}!</h2>
          <p>A student has sent you an inquiry on Swahili Tutors.</p>
          <table style="border-collapse:collapse;width:100%;margin:16px 0">
            <tr><td style="padding:8px;font-weight:bold;width:140px">Student name</td><td style="padding:8px">${studentName}</td></tr>
            <tr style="background:#f8f8f8"><td style="padding:8px;font-weight:bold">Student email</td><td style="padding:8px"><a href="mailto:${encodeURIComponent(data.student_email)}">${studentEmail}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold">Level</td><td style="padding:8px">${level}</td></tr>
          </table>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left:3px solid #6366f1;padding-left:12px;color:#444">${messageHtml}</blockquote>
          <p>Reply directly to <a href="mailto:${encodeURIComponent(data.student_email)}">${studentEmail}</a> to get in touch with this student.</p>
          <p>You can also <a href="${SITE()}/dashboard/teacher">view your dashboard</a> to manage messages.</p>
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
        <p><strong>Teacher:</strong> ${teacherName} (${data.teacher_email ? escapeHtml(data.teacher_email) : "no email"})</p>
        <p><strong>Student:</strong> ${studentName} (${studentEmail})</p>
        <p><strong>Level:</strong> ${level}</p>
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
        <h2>Habari ${studentName}!</h2>
        <p>Your inquiry has been sent to <strong>${teacherName}</strong>. They will contact you directly at this email address within 24–48 hours.</p>
        <p>While you wait, feel free to <a href="${SITE()}/teachers">browse other teachers</a> too.</p>
        <p>Asante,<br/>The Swahili Tutors Team</p>
      `,
    }),
  ];

  return Promise.allSettled(promises);
}
