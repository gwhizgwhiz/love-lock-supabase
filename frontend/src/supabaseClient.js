// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
let supabaseKey = process.env.REACT_APP_SUPABASE_KEY || '';

// Trim whitespace/newlines and strip any BOM or other non‑ASCII
supabaseUrl = supabaseUrl.trim().replace(/[\uFEFF]/g, '');
supabaseKey = supabaseKey.trim().replace(/[\uFEFF]/g, '');

console.log('🔑 URL chars:', [...supabaseUrl].map(c => c.charCodeAt(0)));
console.log('🔑 KEY chars sample:', [...supabaseKey].slice(0,5).map(c => c.charCodeAt(0)));

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_KEY in .env');
}

// Now both strings are guaranteed pure ASCII (code points 32–126)
export default createClient(supabaseUrl, supabaseKey);
