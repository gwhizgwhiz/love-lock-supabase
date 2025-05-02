// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://crlemvoabxplrioytnuv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubGVtdm9hYnhwbHJpb3l0bnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTA0NjgsImV4cCI6MjA2MDA2NjQ2OH0.54kYfrHuzAE0mw5iT2ckc9GJxErj4vBNx6tAC6q5saQ'

// Create Supabase client with session persistence & URL-fragment detection
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,      // keep you logged in across reloads
    detectSessionInUrl: true,  // pick up access_token from magic-link/reset flows
  },
})

export default supabase
