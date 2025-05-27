import { createClient } from '@supabase/supabase-js'

// Now loaded from your .env.local
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
console.log('[ENV] URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('[ENV] KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables.')
}

export default createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: { 'Accept': 'application/json' }, 
  },
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
  
})
