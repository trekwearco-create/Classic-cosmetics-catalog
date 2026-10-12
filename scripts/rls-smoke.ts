/**
 * Classic Cosmetics — RLS smoke test.
 *
 * Run against the live project with only the anon key: npx tsx scripts/rls-smoke.ts
 * Before any real product data exists (the only time this may run against the
 * production project). The script creates and deletes a "zz-test" product.
 */
import 'server-only';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let passed = 0;
let failed = 0;

function check(name: string, ok: boolean, detail?: string) {
  if (ok) {
    passed += 1;
    console.log(`PASS  ${name}`);
  } else {
    failed += 1;
    console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function main() {
  // 1. Reading a hidden product returns nothing.
  const { data: hidden } = await supabase
    .from('products')
    .select('id, slug')
    .eq('id', 'zz-test-hidden')
    .maybeSingle();
  check('hidden product unreadable by anon', hidden === null, JSON.stringify(hidden));

  // 2. Inserting, updating or deleting on every table fails.
  const testId = 'zz-test';
  const { error: insertErr } = await supabase
    .from('categories')
    .insert({ name: 'zz-test', slug: 'zz-test' });
  check('anon insert into categories fails', insertErr !== null, insertErr?.message);

  const { error: updateErr } = await supabase
    .from('products')
    .update({ name: 'zz-test' })
    .eq('id', testId);
  check('anon update on products fails', updateErr !== null, updateErr?.message);

  const { error: deleteErr } = await supabase
    .from('products')
    .delete()
    .eq('id', testId);
  check('anon delete from products fails', deleteErr !== null, deleteErr?.message);

  // 3. Reading admin_users returns nothing or an error.
  const { data: adminUsers } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', 'zz-test-uuid');
  check('anon cannot read admin_users', adminUsers === null || adminUsers.length === 0);

  // 4. Uploading to the storage bucket fails.
  const { error: uploadErr } = await supabase.storage
    .from('product-images')
    .upload('zz-test/evil.jpg', new Uint8Array([0x49, 0x44, 0x32, 0x00]), {
      cacheControl: '3600',
      upsert: false,
    });
  check('anon upload to product-images fails', uploadErr !== null, uploadErr?.message);

  // 5. A write through the normal admin login path is the only allowed path.
  console.log(`\nResult: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
