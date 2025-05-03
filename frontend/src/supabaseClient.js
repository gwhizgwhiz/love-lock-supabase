import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://crlemvoabxplrioytnuv.supabase.co'
// ← Replace this with YOUR anon key (the one you just copied)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybGVtdm9hYnhwbHJpb3l0bnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTA0NjgsImV4cCI6MjA2MDA2NjQ2OH0.54kYfrHuzAE0mw5iT2ckc9GJxErj4vBNx6tAC6q5saQ'

console.log('Supa URL:', supabaseUrl)
console.log('Supa KEY slice:', supabaseKey.slice(0,5))

export default createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
})
