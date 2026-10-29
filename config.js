// Supabase project settings (Project Settings → API).
// The anon/publishable key is meant to be public; access is controlled by the rules in supabase/setup.sql.
window.SUPABASE_URL = 'https://ldmrfvsdmcmeexbsqjrb.supabase.co';
window.SUPABASE_ANON_KEY = 'sb_publishable_-Gj1nC38XvDT2Qauw-CIOw__qTFg5-I';

window.supabaseReady = () =>
  !!window.supabase && !String(window.SUPABASE_URL).startsWith('YOUR_') && !String(window.SUPABASE_ANON_KEY).startsWith('YOUR_');
