/**
 * Automated Verification Script for Legal Compliance & Professional Baseline Additions
 * Mrs Sarah Early Years Tutoring Platform
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const baseDir = path.resolve(__dirname, '..');
console.log('Running automated verification in:', baseDir);

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

console.log('\n--- 1. Privacy Policy & Terms of Service Pages ---');
test('/privacy-policy page exists and contains NDPA 2023 specifics', () => {
  const file = path.join(baseDir, 'src/app/privacy-policy/page.tsx');
  assert(fs.existsSync(file), 'privacy-policy/page.tsx does not exist');
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('Nigeria Data Protection Act (NDPA) 2023') || content.includes('Nigeria Data Protection Act 2023'), 'Missing NDPA 2023 reference');
  assert(content.includes('Data Controller'), 'Missing Data Controller reference');
  assert(content.includes('sarahoakhena@gmail.com'), 'Missing Sarah email');
  assert(content.includes('Child / Minor Learner Information') || content.includes("Child Data Privacy"), 'Missing Child personal data section');
  assert(content.includes('30 calendar days') || content.includes('30 days'), 'Missing 30-day response window');
});

test('/terms page exists and contains tutoring agreement & governing law', () => {
  const file = path.join(baseDir, 'src/app/terms/page.tsx');
  assert(fs.existsSync(file), 'terms/page.tsx does not exist');
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('Terms of Service & Tutoring Agreement'), 'Missing agreement title');
  assert(content.includes('24-Hour Notice') || content.includes('24-Hour Cancellation') || content.includes('24-Hour Reschedule'), 'Missing cancellation notice policy');
  assert(content.includes('Federal Republic of Nigeria'), 'Missing Nigerian governing law');
  assert(content.includes('sarahoakhena@gmail.com'), 'Missing Sarah contact email');
});

test('Public footer links to /privacy-policy and /terms', () => {
  const file = path.join(baseDir, 'src/components/Footer.tsx');
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('href="/privacy-policy"'), 'Footer missing /privacy-policy link');
  assert(content.includes('href="/terms"'), 'Footer missing /terms link');
});

test('Dashboard AppLayout footer links to /privacy-policy and /terms', () => {
  const file = path.join(baseDir, 'src/components/AppLayout.tsx');
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('href="/privacy-policy"'), 'AppLayout missing /privacy-policy link');
  assert(content.includes('href="/terms"'), 'AppLayout missing /terms link');
  assert(content.includes('NDPA 2023 Compliant'), 'AppLayout missing NDPA 2023 badge');
});

console.log('\n--- 2. Mandatory Parental Consent on /signup ---');
test('/signup requires parental consent checkbox and records version & timestamp', () => {
  const file = path.join(baseDir, 'src/app/signup/page.tsx');
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('consentGiven'), 'Missing consentGiven state');
  assert(content.includes('parental_consent_given: true'), 'Missing parental_consent_given assignment');
  assert(content.includes('parental_consent_version'), 'Missing parental_consent_version assignment');
  assert(content.includes('parental_consent_at'), 'Missing parental_consent_at assignment');
  assert(content.includes('disabled={loading || !consentGiven}'), 'Submit button does not disable on consentGiven=false');
  assert(content.includes('/privacy-policy'), 'Consent checkbox does not link to privacy policy');
});

test('EYTService supports parental consent fields', () => {
  const file = path.join(baseDir, 'src/lib/eyt-service.ts');
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('parental_consent_given?: boolean'), 'UserProfile missing parental_consent_given');
  assert(content.includes('parental_consent_at?: string | null'), 'UserProfile missing parental_consent_at');
  assert(content.includes('parental_consent_version?: string | null'), 'UserProfile missing parental_consent_version');
});

console.log('\n--- 3. Data Access & Deletion Request in /app/settings ---');
test('/app/settings includes NDPA Privacy tab with export and deletion mailto', () => {
  const file = path.join(baseDir, 'src/app/app/settings/page.tsx');
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes("'privacy'"), 'ActiveTab missing privacy tab');
  assert(content.includes('handleExportData'), 'Missing handleExportData function');
  assert(content.includes('mrs_sarah_tutoring_ndpa_export_'), 'Missing JSON export filename');
  assert(content.includes('deletionMailto') || content.includes('NDPA 2023 Data Erasure Request'), 'Missing erasure mailto');
  assert(content.includes('sarahoakhena@gmail.com'), 'Erasure request not addressed to Sarah');
  assert(content.includes('30-day') || content.includes('30-Day'), 'Missing 30-day window guidance');
  assert(content.includes('parental_consent_given'), 'Missing parental consent status display');
});

console.log('\n--- 4. Automated Email Notification for Enquiries ---');
test('EYTService dispatches email notifications for new public enquiries', () => {
  const file = path.join(baseDir, 'src/lib/eyt-service.ts');
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('dispatchEnquiryNotification'), 'Missing dispatchEnquiryNotification method');
  assert(content.includes('sarahoakhena@gmail.com'), 'Missing default email destination for enquiries');
  assert(content.includes('getEnquiryEmailNotifications'), 'Missing getEnquiryEmailNotifications method');
  assert(content.includes('fetch(\'/api/enquiries\''), 'Missing API dispatch call');
});

test('/api/enquiries route exists and handles enquiry notifications', () => {
  const file = path.join(baseDir, 'src/app/api/enquiries/route.ts');
  assert(fs.existsSync(file), '/api/enquiries/route.ts does not exist');
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('export async function POST'), 'Missing POST handler');
  assert(content.includes('sarahoakhena@gmail.com'), 'Missing recipient email in API route');
});

console.log('\n--- 5. Custom Branded 404 Page ---');
test('Custom 404 page exists and matches brand palette & navigation', () => {
  const file = path.join(baseDir, 'src/app/not-found.tsx');
  assert(fs.existsSync(file), 'not-found.tsx does not exist');
  const content = fs.readFileSync(file, 'utf8');
  assert(content.includes('This learning trail wandered off the map'), 'Missing warm Montessori 404 headline');
  assert(content.includes('href="/"'), 'Missing link to Home');
  assert(content.includes('href="/app"'), 'Missing link to Portal');
  assert(content.includes('href="/#enquire"'), 'Missing link to Enquiry');
  assert(content.includes('href="/privacy-policy"'), 'Missing link to Privacy Policy');
  assert(content.includes('href="/terms"'), 'Missing link to Terms');
});

console.log('\n--- 6. Baseline Empty and Loading States across Dashboard Views ---');
const dashboardPages = [
  { name: 'Schedule', path: 'src/app/app/schedule/page.tsx', emptyCheck: 'bookings.length === 0', loadingCheck: 'isLoading' },
  { name: 'Messages', path: 'src/app/app/messages/page.tsx', emptyCheck: 'messages.length === 0', loadingCheck: 'isLoading' },
  { name: 'Enquiries', path: 'src/app/app/enquiries/page.tsx', emptyCheck: 'enquiries.length === 0', loadingCheck: null },
  { name: 'Invoices', path: 'src/app/app/invoices/page.tsx', emptyCheck: 'invoices.length === 0', loadingCheck: 'isLoading' },
  { name: 'Milestones', path: 'src/app/app/milestones/page.tsx', emptyCheck: 'children.length === 0', loadingCheck: 'isLoading' },
  { name: 'Children', path: 'src/app/app/children/page.tsx', emptyCheck: 'children.length === 0', loadingCheck: 'isLoading' },
  { name: 'Resources', path: 'src/app/app/resources/page.tsx', emptyCheck: 'filteredResources.length === 0', loadingCheck: 'isLoading' },
];

for (const p of dashboardPages) {
  test(`${p.name} page has designed empty state and loading skeleton`, () => {
    const file = path.join(baseDir, p.path);
    assert(fs.existsSync(file), `${p.name} file does not exist`);
    const content = fs.readFileSync(file, 'utf8');
    assert(content.includes(p.emptyCheck), `${p.name} missing empty check: ${p.emptyCheck}`);
    if (p.loadingCheck) {
      assert(content.includes(p.loadingCheck), `${p.name} missing loading check: ${p.loadingCheck}`);
      assert(content.includes('animate-pulse'), `${p.name} missing skeleton animate-pulse`);
    }
  });
}

console.log(`\nVerification complete: ${passedTests}/${totalTests} tests passed.`);
if (passedTests === totalTests) {
  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY! Ready for production deployment.');
  process.exit(0);
} else {
  console.error(`Verification failed with ${totalTests - passedTests} failures.`);
  process.exit(1);
}
