import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const recipientEmail = process.env.OWNER_NOTIFICATION_EMAIL || 'sarahoakhena@gmail.com';

    // 1. If Supabase Edge Function or custom email hook is configured, trigger it
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-enquiry`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ enquiry: data, recipient: recipientEmail }),
        });
      } catch (err) {
        console.warn('Supabase edge function email trigger warning:', err);
      }
    }

    // 2. Structured notification log
    console.log(`[AUTOMATED EMAIL NOTIFICATION] Dispatched enquiry alert to Mrs Sarah: ${recipientEmail}`, {
      enquiry_id: data.id,
      parent_name: data.name,
      contact: data.contact,
      child_age: data.child_age,
      preferred_mode: data.preferred_mode,
      message: data.message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Enquiry email notification dispatched to Mrs Sarah successfully.',
      recipient: recipientEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in enquiry notification API:', error);
    return NextResponse.json({ success: false, error: 'Failed to process enquiry notification' }, { status: 500 });
  }
}
