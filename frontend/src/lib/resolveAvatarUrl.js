// src/lib/resolveAvatarUrl.js

import supabase from '../supabaseClient';
import defaultAvatar from '../assets/default-avatar.png';

export default function resolveAvatarUrl(raw) {
  if (!raw) return defaultAvatar;
  if (raw.startsWith('http')) return raw;

  // Normalize key: remove any leading slashes and the 'avatars/' prefix if it exists
  let key = raw.replace(/^avatars\//, '').replace(/^\/+/, '');

  // Final public URL
  const { data, error } = supabase
    .storage
    .from('avatars')
    .getPublicUrl(key);

  if (error || !data?.publicUrl) {
    console.warn('⚠️ Avatar fetch failed:', error?.message, '| Raw:', raw, '| Key:', key);
    return defaultAvatar;
  }

  return data.publicUrl;
}
