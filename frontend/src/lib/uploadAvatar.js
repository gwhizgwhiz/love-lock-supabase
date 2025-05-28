// src/lib/uploadAvatar.js
import supabase from '../supabaseClient';

export default async function uploadAvatar(file, userId) {
  if (!file || !userId) {
    throw new Error('Missing file or user ID');
  }

  const ext = file.name.split('.').pop();
  const uniqueName = `avatar-${userId}-${Date.now()}.${ext}`;
  const path = `${uniqueName}`; // No folder prefix in DB

  // Upload the file
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });

  if (error) {
    throw new Error(error.message);
  }

  return path; // Save this in avatar_url in the DB
}
