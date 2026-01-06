import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Prefer environment variables; fall back to legacy credential file if present
async function run() {
  const envUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const envAnon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  let url = envUrl && envUrl.trim();
  let anon = envAnon && envAnon.trim();

  if (!url || !anon) {
    // Try legacy credentials file for backward compatibility
    const CRED_PATH = path.resolve('src/sql/credentials.txt');
    if (fs.existsSync(CRED_PATH)) {
      const txt = fs.readFileSync(CRED_PATH, 'utf8');
      const lines = txt.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
      const creds = {};
      for (const line of lines) {
        const m = line.match(/^([^:]+):\s*(.+)$/);
        if (m) creds[m[1].trim()] = m[2].trim();
      }
      const fileUrl = creds.url || creds.supabase_url || creds.SUPABASE_URL;
      const fileAnon = creds.anon || creds.SUPABASE_ANON_KEY || creds.anon_key;
      if (fileUrl && fileAnon) {
        url = url || fileUrl;
        anon = anon || fileAnon;
      }
    }
  }

  if (!url || !anon) {
    console.error('Could not find SUPABASE credentials. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables or add src/sql/credentials.txt');
    process.exit(1);
  }

  const supabase = createClient(url, anon);

  console.log('Connected to Supabase project:', url);

  // Insert a test row into newsletter_subscriptions (safe upsert by email)
  const testEmail = `test+integration+${Date.now()}@example.com`;
  const payload = { email: testEmail, marketing_consent: true };

  console.log('Attempting insert into newsletter_subscriptions:', payload);

  const { data, error } = await supabase
    .from('newsletter_subscriptions')
    .insert(payload)
    .select();

  if (error) {
    console.error('Insert error:', error.message || error);
    process.exit(2);
  }

  console.log('Insert successful:', data);
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(3); });
