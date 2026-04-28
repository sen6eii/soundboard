// Audio storage via Supabase Storage (replaces IndexedDB).
// Files are stored at {userId}/{key} in the 'audio' bucket.
import { supabase } from './supabase'

async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  return session.user.id
}

// Uploads audio blob and returns the full storage path to use as audioStorageKey.
export async function saveAudioBlob(key: string, blob: Blob): Promise<string> {
  const userId = await getUserId()
  const path = `${userId}/${key}`
  const { error } = await supabase.storage.from('audio').upload(path, blob, { upsert: true })
  if (error) throw error
  return path
}

// Downloads audio blob and returns a local object URL.
export async function getAudioBlob(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from('audio').download(path)
  if (error || !data) return null
  return URL.createObjectURL(data)
}

export async function deleteAudioBlob(path: string): Promise<void> {
  await supabase.storage.from('audio').remove([path])
}
