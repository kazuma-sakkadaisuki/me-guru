import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'avatars'

export function avatarStoragePath(userId: string): string {
  return `${userId}/avatar.jpg`
}

/** avatars バケットに {userId}/avatar.jpg としてアップロードし、公開 URL を返す */
export async function uploadUserAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<{ publicUrl: string } | { error: string }> {
  const path = avatarStoragePath(userId)
  const contentType =
    file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg'
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType,
  })
  if (upErr) return { error: upErr.message }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { publicUrl: data.publicUrl }
}
