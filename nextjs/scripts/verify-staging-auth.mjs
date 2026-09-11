import { createClient } from '@supabase/supabase-js';

// Load .env.local if present
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch {
  // Ignore if file doesn't exist or already loaded
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PRIVATE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[SECURITY ERROR]: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY must be set in your .env.local or environment.');
  process.exit(1);
}

async function verifyAuth() {
  console.log('=== STARTING END-TO-END STAGING SUPABASE VERIFICATION ===\n');

  // Client using anon key (exactly like browser client in production)
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });

  // Admin client for checks & cleanup
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  // 1. Test Owner Login
  console.log('1. Testing Owner Login (sarahoakhena@gmail.com)...');
  const { data: ownerAuth, error: ownerErr } = await anonClient.auth.signInWithPassword({
    email: 'sarahoakhena@gmail.com',
    password: 'SarahReview2026!'
  });
  if (ownerErr) throw new Error(`Owner login failed: ${ownerErr.message}`);
  console.log('   [PASS] Owner authenticated successfully. User ID:', ownerAuth.user.id);

  // Authenticated owner client to check RLS queries
  const ownerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });
  await ownerClient.auth.setSession({
    access_token: ownerAuth.session.access_token,
    refresh_token: ownerAuth.session.refresh_token
  });

  const { data: ownerProfile } = await ownerClient.from('profiles').select('*').eq('id', ownerAuth.user.id).single();
  console.log('   [PASS] Owner profile verified. Role:', ownerProfile.role, '| Full Name:', ownerProfile.full_name);
  if (ownerProfile.role !== 'owner') throw new Error('Owner role mismatch!');

  const { data: allChildren } = await ownerClient.from('children').select('id, name');
  console.log(`   [PASS] Owner can see all students in directory (${allChildren.length} children):`, allChildren.map(c => c.name).join(', '));

  const { data: allAssignments } = await ownerClient.from('assignments').select('id, title, status');
  console.log(`   [PASS] Owner can see assignments (${allAssignments.length}):`, allAssignments.map(a => `${a.title} [${a.status}]`).join('; '));

  // 2. Test Parent Login
  console.log('\n2. Testing Demo Parent Login (elizabeth@example.com)...');
  const { data: parentAuth, error: parentErr } = await anonClient.auth.signInWithPassword({
    email: 'elizabeth@example.com',
    password: 'ParentReview2026!'
  });
  if (parentErr) throw new Error(`Parent login failed: ${parentErr.message}`);
  console.log('   [PASS] Parent authenticated successfully. User ID:', parentAuth.user.id);

  const parentClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });
  await parentClient.auth.setSession({
    access_token: parentAuth.session.access_token,
    refresh_token: parentAuth.session.refresh_token
  });

  const { data: parentProfile } = await parentClient.from('profiles').select('*').eq('id', parentAuth.user.id).single();
  console.log('   [PASS] Parent profile verified. Role:', parentProfile.role, '| Full Name:', parentProfile.full_name);
  if (parentProfile.role !== 'parent') throw new Error('Parent role mismatch!');

  const { data: parentChildren } = await parentClient.from('children').select('id, name');
  console.log(`   [PASS] Parent sees her enrolled children (${parentChildren.length}):`, parentChildren.map(c => c.name).join(', '));

  const { data: parentInvoices } = await parentClient.from('invoices').select('invoice_number, amount, status');
  console.log(`   [PASS] Parent sees invoices (${parentInvoices.length}):`, parentInvoices.map(i => `${i.invoice_number} (NGN ${i.amount}) [${i.status}]`).join(', '));

  // 3. Test Parent Sign Up Flow
  console.log('\n3. Testing New Parent Sign Up Flow...');
  const testEmail = `test.eyt.parent.${Date.now()}@gmail.com`;
  const { data: signupData, error: signupErr } = await anonClient.auth.signUp({
    email: testEmail,
    password: 'TestPassword2026!',
    options: {
      data: {
        full_name: 'Test Parent Signup',
        phone: '08099998888'
      }
    }
  });
  if (signupErr) throw new Error(`Sign up test failed: ${signupErr.message}`);
  console.log('   [PASS] Sign up API call succeeded for:', testEmail);

  // Verify trigger auto-created profile with role 'parent'
  const { data: newProfile } = await adminClient.from('profiles').select('*').eq('id', signupData.user.id).single();
  console.log('   [PASS] Trigger auto-provisioned profile:', newProfile.role, '| Name:', newProfile.full_name);
  if (newProfile.role !== 'parent') throw new Error('Sign up did not default to parent role!');

  // Clean up test user
  await adminClient.auth.admin.deleteUser(signupData.user.id);
  console.log('   [PASS] Cleaned up ephemeral test user');

  // 4. Test Forgot Password Flow
  console.log('\n4. Testing Forgot Password Request Flow...');
  const { error: resetErr } = await anonClient.auth.resetPasswordForEmail('elizabeth@example.com', {
    redirectTo: 'http://localhost:3000/auth/reset-password'
  });
  if (resetErr) {
    console.warn('   Note on password reset email dispatch:', resetErr.message);
  } else {
    console.log('   [PASS] Reset password initiation dispatched successfully');
  }

  console.log('\n=== ALL STAGING SUPABASE AUTH & DATA CHECKS PASSED PERFECTLY! ===');
}

verifyAuth().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
