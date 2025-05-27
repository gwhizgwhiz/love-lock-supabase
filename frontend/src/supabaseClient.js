// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

console.log('[ENV] URL:', supabaseUrl)
console.log('[ENV] KEY:', supabaseKey)

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables.')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export default supabase
