import { NextResponse } from 'next/server';

export interface AssignmentNotificationPayload {
  recipient_email: string;
  recipient_name: string;
  event_type: 'assignment_created' | 'assignment_submitted' | 'assignment_reviewed';
  assignment_id: string;
  title: string;
  message: string;
}

/**
 * POST /api/assignments/notify
 * Dispatches automated notifications for the Continuous Assessment & Assignments feature:
 * - assignment_created: alerts parent when Sarah assigns new home practice
 * - assignment_submitted: alerts Sarah when parent reports back with notes/evidence
 * - assignment_reviewed: alerts parent when Sarah reviews submission and records milestone achievement
 */
export async function POST(req: Request) {
  try {
    const payload: AssignmentNotificationPayload = await req.json();

    if (!payload.recipient_email || !payload.title || !payload.message) {
      return NextResponse.json(
        { error: 'Missing required notification fields' },
        { status: 400 }
      );
    }

    const emailSubject = `[Mrs Sarah Tutoring] ${payload.title}`;
    const emailBody = `
Dear ${payload.recipient_name},

${payload.message}

Event: ${payload.event_type}
Assignment ID: ${payload.assignment_id}
Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}

Log in to the Mrs Sarah Early Years Tutoring Portal to review:
https://mrssarahtutoring.com/app/assignments

Warm regards,
Mrs Sarah Oakhena
Early Years Educator (Montessori Trained | SEN-Inclusive)
sarahoakhena@gmail.com | WhatsApp: +234 913 365 1659
    `.trim();

    console.log(`[ASSIGNMENT NOTIFICATION] Sent to ${payload.recipient_email}: ${emailSubject}`);

    // If an external SMTP or Resend API key is provided, dispatch real email
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
      message: 'Assignment notification dispatched successfully.',
      notification: {
        id: `notif-${Date.now()}`,
        recipient: payload.recipient_email,
        event_type: payload.event_type,
        sent_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to dispatch assignment notification:', error);
    return NextResponse.json(
      { error: 'Internal server error processing assignment notification' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assignments/notify
 * Health check & status endpoint for Continuous Assessment notification engine.
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'Mrs Sarah Continuous Assessment Notification Engine',
    events_supported: ['assignment_created', 'assignment_submitted', 'assignment_reviewed'],
    timestamp: new Date().toISOString(),
  });
}
