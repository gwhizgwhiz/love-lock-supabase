// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Your Supabase URL & anon key
const supabaseUrl = 'https://crlemvoabxplrioytnuv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubGVtdm9hYnhwbHJpb3l0bnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTA0NjgsImV4cCI6MjA2MDA2NjQ2OH0.54kYfrHuzAE0mw5iT2ckc9GJxErj4vBNx6q5saQ'

// Enable session persistence and URL fragment detection
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export default supabase
