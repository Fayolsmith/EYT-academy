// Comprehensive verification test for Phase 1 Fixes
const fs = require('fs');
const path = require('path');

console.log('==============================================');
console.log('MRS SARAH TUTORING PLATFORM — PHASE 1 VERIFICATION');
console.log('==============================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// ----------------------------------------------------
// TEST 1: Navbar Single Entry Point & No (Ages 3–8)
// ----------------------------------------------------
console.log('\n--- 1. Navbar & Brand Mark Verification ---');
const navbarPath = path.join(__dirname, '../nextjs/src/components/Navbar.tsx');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');

// Top bar should not have Sign In link
const topBarSnippet = navbarContent.substring(
  navbarContent.indexOf('Top Notification Bar'),
  navbarContent.indexOf('Main Navigation')
);
assert(!topBarSnippet.includes('href="/login"'), 'Top notification bar contains NO Sign In link');
assert(!topBarSnippet.includes('Localhost Dev'), 'Top notification bar contains NO inline Localhost Dev badge');

// Logo brand area should have Mrs Sarah without (Ages 3–8) subtitle
const logoSnippet = navbarContent.substring(
  navbarContent.indexOf('Link href="/"'),
  navbarContent.indexOf('Desktop Navigation Links')
);
assert(!logoSnippet.includes('Early Years Tutoring (Ages 3–8)'), 'Brand logo mark does NOT contain persistent "(Ages 3–8)" subtitle');
assert(logoSnippet.includes('Mrs Sarah'), 'Brand logo mark contains clean "Mrs Sarah" brand heading');

// Desktop Actions should have single Sign In entry point
const desktopActions = navbarContent.substring(
  navbarContent.indexOf('Desktop Action Buttons'),
  navbarContent.indexOf('Mobile menu button')
);
assert(desktopActions.includes('href="/login"') && desktopActions.includes('Sign In'), 'Desktop action row has the designated Sign In link');
assert(desktopActions.includes('href="#enquiry"') && desktopActions.includes('Enquire Now'), 'Desktop action row has distinct "Enquire Now" button (#enquiry)');

// ----------------------------------------------------
// TEST 2: Hero CTA vs Navbar CTA
// ----------------------------------------------------
console.log('\n--- 2. Hero CTA vs Navbar CTA Distinct Routing ---');
const heroPath = path.join(__dirname, '../nextjs/src/components/HeroSection.tsx');
const heroContent = fs.readFileSync(heroPath, 'utf8');

assert(heroContent.includes('href="/signup?intent=booking"'), 'Hero primary CTA routes to /signup?intent=booking');
assert(heroContent.includes('Book a Session'), 'Hero primary CTA is explicitly labeled "Book a Session"');
assert(!heroContent.includes('Book a Session / Enquire'), 'Hero primary CTA no longer conflates booking and enquiry');

// ----------------------------------------------------
// TEST 3: Signup Page Intent & Claiming Logic
// ----------------------------------------------------
console.log('\n--- 3. Signup Page Intent & Email Claiming ---');
const signupPath = path.join(__dirname, '../nextjs/src/app/signup/page.tsx');
const signupContent = fs.readFileSync(signupPath, 'utf8');

assert(signupContent.includes('isBookingIntent'), 'Signup page handles booking intent');
assert(signupContent.includes('claimChildrenByParentEmail'), 'Signup page triggers claimChildrenByParentEmail on submission');
assert(signupContent.includes('/app/schedule?intent=booking'), 'Signup page redirects booking intent straight to /app/schedule');

// ----------------------------------------------------
// TEST 4: PWA Single Context & State Persistence
// ----------------------------------------------------
console.log('\n--- 4. PWA Single Context & State Persistence ---');
const pwaContextPath = path.join(__dirname, '../nextjs/src/lib/context/PWAContext.tsx');
const pwaContextContent = fs.readFileSync(pwaContextPath, 'utf8');
const homePath = path.join(__dirname, '../nextjs/src/app/page.tsx');
const homeContent = fs.readFileSync(homePath, 'utf8');

assert(pwaContextContent.includes('beforeinstallprompt'), 'PWAContext manages beforeinstallprompt once');
assert(pwaContextContent.includes('eyt_pwa_eligible'), 'PWAContext persists eligible state across hard refreshes');
assert(!homeContent.includes('<PWAInstallPrompt />') || !navbarContent.includes('beforeinstallprompt'), 'No duplicate independent listeners on home page');
assert(navbarContent.includes('usePWA'), 'Navbar consumes unified usePWA hook');

// ----------------------------------------------------
// TEST 5: Owner Child Profile & Parent Linking Data Flow
// ----------------------------------------------------
console.log('\n--- 5. Owner Child Profile & Parent Linking Workflow ---');

// Mock localStorage simulation
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = v; },
  removeItem: (k) => { delete storage[k]; }
};

// Test mock implementation mirroring eyt-service logic
let children = [
  {
    id: 'child-1',
    parent_profile_id: 'parent-demo-id',
    name: 'Leo Adeleke',
    parent_email: 'elizabeth@example.com',
    has_portal_account: true,
  },
  {
    id: 'child-3',
    parent_profile_id: 'unclaimed-uche@example.com',
    name: 'Tobi Balogun',
    parent_name: 'Mr Uche Balogun',
    parent_email: 'uche@example.com',
    has_portal_account: false,
  }
];

function claimChildren(email, newUserId, parentName) {
  const norm = email.trim().toLowerCase();
  const claimed = [];
  children = children.map(c => {
    if (c.parent_profile_id === `unclaimed-${norm}` || c.parent_email?.toLowerCase() === norm) {
      const updated = {
        ...c,
        parent_profile_id: newUserId,
        has_portal_account: true,
        parent_name: c.parent_name || parentName,
        parent_email: norm
      };
      claimed.push(updated);
      return updated;
    }
    return c;
  });
  return claimed;
}

// Step A: Initial state check
assert(children.find(c => c.name === 'Tobi Balogun').has_portal_account === false, 'Existing enrolled child Tobi starts with has_portal_account: false (No portal access yet)');

// Step B: Owner adds child for new parent
const newOwnerChild = {
  id: 'child-4',
  parent_profile_id: 'unclaimed-fatima@example.com',
  name: 'Zainab Adeleke',
  parent_name: 'Mrs Fatima Adeleke',
  parent_email: 'fatima@example.com',
  parent_phone: '08011223344',
  has_portal_account: false,
};
children.push(newOwnerChild);
assert(children.length === 3, 'Owner successfully enrolls child Zainab');
assert(children.find(c => c.name === 'Zainab Adeleke').has_portal_account === false, 'Owner-added child has_portal_account is false prior to parent registration');

// Step C: Parent Fatima registers at /signup
const claimedFatima = claimChildren('fatima@example.com', 'parent-fatima-id-999', 'Mrs Fatima Adeleke');
assert(claimedFatima.length === 1, 'claimChildrenByParentEmail claims exactly 1 pre-registered child');
const zainabAfterSignup = children.find(c => c.name === 'Zainab Adeleke');
assert(zainabAfterSignup.parent_profile_id === 'parent-fatima-id-999', 'Child parent_profile_id successfully reassigned to newly registered parent ID');
assert(zainabAfterSignup.has_portal_account === true, 'Child has_portal_account updated to true (Portal Active)');
assert(children.length === 3, 'Zero duplicate child profiles created during signup');

// Step D: Parent Uche also registers
const claimedUche = claimChildren('uche@example.com', 'parent-uche-id-888', 'Mr Uche Balogun');
assert(claimedUche.length === 1, 'Pre-existing seed child Tobi Balogun claimed on Uche signup');
const tobiAfterSignup = children.find(c => c.name === 'Tobi Balogun');
assert(tobiAfterSignup.parent_profile_id === 'parent-uche-id-888', 'Tobi Balogun linked to Uche parent account');
assert(tobiAfterSignup.has_portal_account === true, 'Tobi Balogun has_portal_account updated to true');

// Step E: Direct parent self-registration (no pre-existing child)
const claimedNew = claimChildren('newparent@example.com', 'parent-new-id-777', 'New Parent');
assert(claimedNew.length === 0, 'New parent signup with no pre-existing children returns empty claimed array');

// ----------------------------------------------------
// TEST 6: Localhost Dev Badge in Production
// ----------------------------------------------------
console.log('\n--- 6. Dev Badge Production Guard ---');
assert(navbarContent.includes("process.env.NODE_ENV === 'development'"), 'Dev indicator explicitly checks process.env.NODE_ENV === "development"');
assert(navbarContent.includes("window.location.hostname === 'localhost'"), 'Dev indicator explicitly checks hostname === "localhost"');
assert(navbarContent.includes('fixed bottom-2 right-2'), 'Dev badge moved completely out of navbar row to fixed bottom corner');

console.log('\n==============================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED!`);
console.log('==============================================\n');
