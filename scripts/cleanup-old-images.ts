/**
 * Classic Cosmetics — delete storage files older than 24 hours that have no
 * product_images row. Used by the upload route cleanup policy (audit check 4.4).
 *
 * Run after a migration or as a one-off job:
 *   npx tsx scripts/cleanup-old-images.ts
 */
import 'server-only';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Storage paths of product images rows older than the cutoff.
  const { data: rows, error: rowsErr } = await supabase
    .from('product_images')
    .select('storage_path')
    .gte('created_at', cutoff);
  if (rowsErr) throw rowsErr;

  const existing = new Set((rows ?? []).map((r) => r.storage_path));

  // Any storage prefix under product-images that is not in existing paths.
  const { data: prefixList, error: prefixErr } = await supabase.storage
    .from('product-images')
    .list('products', false);
  if (prefixErr) throw prefixErr;

  const toDelete: string[] = [];
  for (const prefix of prefixList ?? []) {
    const entries = await supabase.storage
      .from('product-images')
      .list(prefix.name, true);
    for (const entry of entries.data ?? []) {
      if (!existing.has(entry.name)) toDelete.push(entry.name);
    }
  }

  for (const path of toDelete) {
    const { error: rmErr } = await supabase.storage
      .from('product-images')
      .remove([path]);
    if (rmErr) console.error(`Failed to delete ${path}:`, rmErr.message);
    else console.log(`Deleted ${path}`);
  }

  if (toDelete.length === 0) console.log('No orphaned images found.');
}

main();
