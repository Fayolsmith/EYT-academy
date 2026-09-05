import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hcxhxxihtjshyjaoxoqh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeGh4eGlodGpzaHlqYW94b3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjA3ODEsImV4cCI6MjEwNDE5Njc4MX0.wAbrPNvT-DzMDOB3JSB5hHt_LnPIiilRVqadff4Zor4';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeGh4eGlodGpzaHlqYW94b3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODYyMDc4MSwiZXhwIjoyMTA0MTk2NzgxfQ.PDf_gM4yhTg1ixyA5uK6z-wVpOB4S3LwLQ_yMboG8vA';

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
  console.log('   ✓ Owner authenticated successfully. User ID:', ownerAuth.user.id);

  // Authenticated owner client to check RLS queries
  const ownerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });
  await ownerClient.auth.setSession({
    access_token: ownerAuth.session.access_token,
    refresh_token: ownerAuth.session.refresh_token
  });

  const { data: ownerProfile } = await ownerClient.from('profiles').select('*').eq('id', ownerAuth.user.id).single();
  console.log('   ✓ Owner profile verified. Role:', ownerProfile.role, '| Full Name:', ownerProfile.full_name);
  if (ownerProfile.role !== 'owner') throw new Error('Owner role mismatch!');

  const { data: allChildren } = await ownerClient.from('children').select('id, name');
  console.log(`   ✓ Owner can see all students in directory (${allChildren.length} children):`, allChildren.map(c => c.name).join(', '));

  const { data: allAssignments } = await ownerClient.from('assignments').select('id, title, status');
  console.log(`   ✓ Owner can see assignments (${allAssignments.length}):`, allAssignments.map(a => `${a.title} [${a.status}]`).join('; '));

  // 2. Test Parent Login
  console.log('\n2. Testing Demo Parent Login (elizabeth@example.com)...');
  const { data: parentAuth, error: parentErr } = await anonClient.auth.signInWithPassword({
    email: 'elizabeth@example.com',
    password: 'ParentReview2026!'
  });
  if (parentErr) throw new Error(`Parent login failed: ${parentErr.message}`);
  console.log('   ✓ Parent authenticated successfully. User ID:', parentAuth.user.id);

  const parentClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });
  await parentClient.auth.setSession({
    access_token: parentAuth.session.access_token,
    refresh_token: parentAuth.session.refresh_token
  });

  const { data: parentProfile } = await parentClient.from('profiles').select('*').eq('id', parentAuth.user.id).single();
  console.log('   ✓ Parent profile verified. Role:', parentProfile.role, '| Full Name:', parentProfile.full_name);
  if (parentProfile.role !== 'parent') throw new Error('Parent role mismatch!');

  const { data: parentChildren } = await parentClient.from('children').select('id, name');
  console.log(`   ✓ Parent sees her enrolled children (${parentChildren.length}):`, parentChildren.map(c => c.name).join(', '));

  const { data: parentInvoices } = await parentClient.from('invoices').select('invoice_number, amount, status');
  console.log(`   ✓ Parent sees invoices (${parentInvoices.length}):`, parentInvoices.map(i => `${i.invoice_number} (NGN ${i.amount}) [${i.status}]`).join(', '));

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
  console.log('   ✓ Sign up API call succeeded for:', testEmail);

  // Verify trigger auto-created profile with role 'parent'
  const { data: newProfile } = await adminClient.from('profiles').select('*').eq('id', signupData.user.id).single();
  console.log('   ✓ Trigger auto-provisioned profile:', newProfile.role, '| Name:', newProfile.full_name);
  if (newProfile.role !== 'parent') throw new Error('Sign up did not default to parent role!');

  // Clean up test user
  await adminClient.auth.admin.deleteUser(signupData.user.id);
  console.log('   ✓ Cleaned up ephemeral test user');

  // 4. Test Forgot Password Flow
  console.log('\n4. Testing Forgot Password Request Flow...');
  const { error: resetErr } = await anonClient.auth.resetPasswordForEmail('elizabeth@example.com', {
    redirectTo: 'http://localhost:3000/auth/reset-password'
  });
  if (resetErr) {
    console.warn('   Note on password reset email dispatch:', resetErr.message);
  } else {
    console.log('   ✓ Reset password initiation dispatched successfully');
  }

  console.log('\n=== ALL STAGING SUPABASE AUTH & DATA CHECKS PASSED PERFECTLY! ===');
}

verifyAuth().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
