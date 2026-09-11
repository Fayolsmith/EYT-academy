import { NextResponse } from 'next/server';
import { EYTService } from '@/lib/eyt-service';

/**
 * GET /api/practice-alerts
 * Runs daily scheduled disengagement check across enrolled children.
 * Flags children with 5+ consecutive days of zero Child Mode activity.
 * Anti-alert-spam protection prevents re-alerting for the same quiet streak.
 */
export async function GET() {
  try {
    const result = EYTService.checkAndGenerateDisengagementAlerts();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      new_alerts_count: result.newAlerts.length,
      active_alerts_count: result.allActiveAlerts.length,
      new_alerts: result.newAlerts,
      active_alerts: result.allActiveAlerts,
    });
  } catch (error) {
    console.error('Error running practice alerts check:', error);
    return NextResponse.json(
      { error: 'Failed to run disengagement check' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/practice-alerts
 * Handles alert actions (e.g. acknowledge, dismiss, or manual trigger)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, alertId, alert } = body;

    if (action === 'notify_disengagement' && alert) {
      console.log(`[DISENGAGEMENT ALERT] Student ${alert.child_name} inactive for ${alert.days_inactive} days. Parent: ${alert.parent_name} (${alert.parent_email})`);
      return NextResponse.json({ success: true, message: 'Disengagement alert recorded' });
    }

    if (action === 'acknowledge' && alertId) {
      EYTService.acknowledgePracticeAlert(alertId);
      return NextResponse.json({ success: true, message: 'Alert acknowledged' });
    }

    if (action === 'dismiss' && alertId) {
      EYTService.dismissPracticeAlert(alertId);
      return NextResponse.json({ success: true, message: 'Alert dismissed' });
    }

    if (action === 'check_now') {
      const result = EYTService.checkAndGenerateDisengagementAlerts();
      return NextResponse.json({
        success: true,
        new_alerts: result.newAlerts,
        active_alerts: result.allActiveAlerts,
      });
    }

    return NextResponse.json({ success: true, message: 'Practice alerts check processed' });
  } catch (error) {
    console.error('Error handling practice alerts request:', error);
    return NextResponse.json(
      { error: 'Failed to process practice alert' },
      { status: 500 }
    );
  }
}
