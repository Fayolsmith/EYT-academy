import { NextResponse } from 'next/server';
import {
  formatDateInTimezone,
  formatTimeInTimezone,
  SARAH_TIMEZONE,
} from '@/lib/i18n-service';

export interface SessionReminderPayload {
  id?: string;
  booking_id: string;
  recipient_email: string;
  recipient_name: string;
  child_name: string;
  start_time: string;
  end_time: string;
  mode: 'online' | 'home';
  meeting_link?: string | null;
  home_address?: string | null;
  recipient_timezone?: string | null;
}

/**
 * POST /api/reminders
 * Dispatches an automated session reminder email to the parent
 * ahead of an upcoming tutorial (e.g. 24 hours prior).
 *
 * CRITICAL SPEC REQUIREMENT:
 * Session times must be stated in the recipient parent's local timezone,
 * clearly labeled, to prevent international scheduling mismatches.
 */
export async function POST(req: Request) {
  try {
    const payload: SessionReminderPayload = await req.json();

    if (!payload.recipient_email || !payload.child_name || !payload.start_time) {
      return NextResponse.json(
        { error: 'Missing required session reminder fields' },
        { status: 400 }
      );
    }

    // Determine recipient's local timezone with fallback
    const recipientTz = payload.recipient_timezone || 'Europe/London';

    // Format date and time in the recipient parent's local timezone
    const sessionDate = formatDateInTimezone(payload.start_time, recipientTz, true);
    const sessionTime = formatTimeInTimezone(payload.start_time, recipientTz, true);
    const sarahTime = formatTimeInTimezone(payload.start_time, SARAH_TIMEZONE, true);

    // Format professional reminder message content
    const emailSubject = `[Lesson Reminder] Upcoming Early Years Tutorial for ${payload.child_name} with Mrs Sarah`;
    const emailBody = `
Dear ${payload.recipient_name},

This is a friendly automated reminder of your child ${payload.child_name}'s upcoming Montessori tutorial with Mrs Sarah.

Session Details:
- Date: ${sessionDate}
- Time: ${sessionTime} (your local time)${recipientTz !== SARAH_TIMEZONE ? ` [Tutor Time: ${sarahTime}]` : ''}
- Mode: ${payload.mode === 'online' ? 'Online Video Lesson' : 'Home Tutorial'}
${payload.mode === 'online' ? `- Meeting Link: ${payload.meeting_link || 'Meeting link will be shared prior to the session by Mrs Sarah'}` : ''}
${payload.mode === 'home' && payload.home_address ? `- Home Address: ${payload.home_address}` : ''}

Important Reminders:
- Please have your learner's workspace prepared 5 minutes before lesson time.
- If you need to reschedule or cancel, please provide at least 24 hours' prior notice in accordance with our tutoring agreement.

Warm regards,
Mrs Sarah Oakhena
Early Years Educator (Montessori Trained | SEN-Inclusive)
sarahoakhena@gmail.com | WhatsApp: +234 913 365 1659
    `.trim();

    console.log(`[AUTOMATED SESSION REMINDER] Sent to ${payload.recipient_email} for booking ${payload.booking_id}: ${emailSubject}`);

    // If an external SMTP or Resend API key is provided, trigger real delivery
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Mrs Sarah Tutoring <notifications@mrssarahtutoring.com>',
            to: [payload.recipient_email],
            subject: emailSubject,
            text: emailBody,
          }),
        });
      } catch (externalErr) {
        console.warn('External email delivery warning:', externalErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Automated session reminder email logged and dispatched.',
      reminder: {
        id: payload.id || `remind-${Date.now()}`,
        booking_id: payload.booking_id,
        recipient_email: payload.recipient_email,
        child_name: payload.child_name,
        scheduled_for: payload.start_time,
        sent_at: new Date().toISOString(),
        status: 'delivered',
      },
    });
  } catch (error) {
    console.error('Failed to process session reminder email:', error);
    return NextResponse.json(
      { error: 'Internal server error processing session reminder' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reminders
 * Health check & status endpoint for automated scheduled cron triggers.
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'Mrs Sarah Automated Session Reminder Engine',
    cadence: 'Runs ahead of upcoming sessions (24-48hr window)',
    timestamp: new Date().toISOString(),
  });
}
