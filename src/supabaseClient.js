// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// Replace with your actual URL and Key
const supabaseUrl = 'https://crlemvoabxplrioytnuv.supabase.co'; // Example: 'https://xyzcompany.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybGVtdm9hYnhwbHJpb3l0bnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTA0NjgsImV4cCI6MjA2MDA2NjQ2OH0.54kYfrHuzAE0mw5iT2ckc9GJxErj4vBNx6tAC6q5saQ';

// Create and export the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

