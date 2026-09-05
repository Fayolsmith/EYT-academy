import fs from 'fs';
import path from 'path';

function runChecks() {
  console.log('=== PHASE 1 SECURITY & FEATURE GAPS VERIFICATION ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (detail) console.error(`       Detail: ${detail}`);
    }
  }

  // 1. Check AppLayout.tsx: No toggleRole, no dev toggle for parents, strictly owner-only preview
  const appLayoutPath = path.resolve('./src/components/AppLayout.tsx');
  const appLayoutContent = fs.readFileSync(appLayoutPath, 'utf8');

  assert(
    !appLayoutContent.includes('toggleRole'),
    'Issue 1: toggleRole completely removed from AppLayout.tsx'
  );
  assert(
    appLayoutContent.includes('previewAsParent') && appLayoutContent.includes('exitParentPreview'),
    'Issue 1: previewAsParent and exitParentPreview wired in AppLayout.tsx'
  );
  assert(
    appLayoutContent.includes('QA Mode'),
    'Issue 1: QA preview banner rendered when isParentPreview is active'
  );

  // 2. Check GlobalContext.tsx: No setRole, previewAsParent guarded by owner check
  const globalContextPath = path.resolve('./src/lib/context/GlobalContext.tsx');
  const globalContextContent = fs.readFileSync(globalContextPath, 'utf8');

  assert(
    !globalContextContent.includes('setRole:'),
    'Issue 1: setRole removed from GlobalContextType'
  );
  assert(
    globalContextContent.includes("realProfile?.role !== 'owner'") &&
    globalContextContent.includes('Unauthorized attempt to invoke previewAsParent'),
    'Issue 1: previewAsParent strictly blocks non-owners'
  );

  // 3. Check enquiries/page.tsx: Non-owner redirect to /app
  const enquiriesPath = path.resolve('./src/app/app/enquiries/page.tsx');
  const enquiriesContent = fs.readFileSync(enquiriesPath, 'utf8');

  assert(
    enquiriesContent.includes("router.replace('/app')"),
    'Issue 1: enquiries route strictly redirects non-owner parents to /app'
  );

  // 4. Check app/page.tsx: Single "Enroll Student" button and No icons in welcome banner
  const appPagePath = path.resolve('./src/app/app/page.tsx');
  const appPageContent = fs.readFileSync(appPagePath, 'utf8');

  // Count "Enroll Student" occurrences in app/page.tsx
  const enrollMatches = appPageContent.match(/Enroll Student/g) || [];
  assert(
    enrollMatches.length === 1,
    'Issue 2: Exactly ONE Enroll Student button on Owner overview',
    `Found ${enrollMatches.length} occurrences`
  );

  assert(
    !appPageContent.includes('<Sparkles'),
    'Issue 6: <Sparkles> icon removed from welcome banners'
  );
  assert(
    !appPageContent.includes('👋'),
    'Issue 6: Waving hand emoji 👋 removed from welcome greeting'
  );
  assert(
    appPageContent.includes('Welcome back, {profile?.full_name || \'Family\'}!'),
    'Issue 6: Greeting text intact without emoji'
  );

  // 5. Check invoices/page.tsx: Enrolled child dropdown & Payment proof upload/confirmation
  const invoicesPath = path.resolve('./src/app/app/invoices/page.tsx');
  const invoicesContent = fs.readFileSync(invoicesPath, 'utf8');

  assert(
    invoicesContent.includes('enrolledChildren.map') && invoicesContent.includes('selectedChildId'),
    'Issue 5: Issue Tuition Invoice modal uses dynamic dropdown from enrolled children'
  );
  assert(
    invoicesContent.includes('Upload Payment Proof') && invoicesContent.includes('uploadPaymentProof'),
    'Issue 3: Parent portal has in-portal payment proof upload'
  );
  assert(
    invoicesContent.includes('Payment Submitted – Pending Verification') ||
    invoicesContent.includes('payment_submitted'),
    'Issue 3: payment_submitted status badge rendered'
  );
  assert(
    invoicesContent.includes('confirmInvoicePayment'),
    'Issue 3: Owner has Confirm Payment action for submitted proofs'
  );
  assert(
    invoicesContent.includes('09133651659'),
    'Issue 3: WhatsApp fallback number (09133651659) preserved for parents'
  );

  // 6. Check resources/page.tsx: Real file picker/dropzone & disabled publish button
  const resourcesPath = path.resolve('./src/app/app/resources/page.tsx');
  const resourcesContent = fs.readFileSync(resourcesPath, 'utf8');

  assert(
    resourcesContent.includes('type="file"') &&
    (resourcesContent.includes('accept="application/pdf,image/*"') || resourcesContent.includes('accept="image/*,application/pdf"')),
    'Issue 4: File picker / dropzone added for PDF/images'
  );
  assert(
    resourcesContent.includes('disabled={!selectedFile || isUploading'),
    'Issue 4: Publish Resource button disabled until file is attached'
  );

  console.log(`\nResults: ${passed} / ${total} tests passed.`);
  if (passed === total) {
    console.log('ALL PHASE 1 FIXES VERIFIED SUCCESSFULLY! ✓');
  } else {
    process.exit(1);
  }
}

runChecks();
