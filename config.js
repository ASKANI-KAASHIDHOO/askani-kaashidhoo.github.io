// Supabase project settings (Project Settings → API).
// The anon/publishable key is meant to be public; access is controlled by the rules in supabase/setup.sql.
window.SUPABASE_URL = 'YOUR_SUPABASE_URL';
window.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

window.supabaseReady = () =>
  !!window.supabase && !String(window.SUPABASE_URL).startsWith('YOUR_') && !String(window.SUPABASE_ANON_KEY).startsWith('YOUR_');
