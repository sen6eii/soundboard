import { Board, Reference, BoardContext, AudioReference, LinkReference, MoodTag, Annotation } from './types'
import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

// ─── DB row types (Supabase returns snake_case) ──────────────────────────────

type BoardRow = {
  id: string
  user_id: string
  name: string
  description: string
  accent_color: string
  context: BoardContext
  created_at: string
  updated_at: string
}

type RefRow = {
  id: string
  board_id: string
  user_id: string
  type: 'audio' | 'link'
  title: string
  file_name: string | null
  audio_storage_key: string | null
  duration: number | null
  url: string | null
  platform: string | null
  thumbnail_url: string | null
  embed_id: string | null
  tags: MoodTag[]
  note: string
  color: string
  annotations: Annotation[]
  created_at: string
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function rowToBoard(row: BoardRow, refs: RefRow[]): Board {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    accentColor: row.accent_color,
    context: row.context ?? { vibes: [] },
    references: refs.map(rowToRef),
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }
}

function rowToRef(row: RefRow): Reference {
  const base = {
    id: row.id,
    title: row.title,
    tags: row.tags ?? [],
    note: row.note ?? '',
    color: row.color,
    createdAt: new Date(row.created_at).getTime(),
    annotations: row.annotations ?? [],
  }
  if (row.type === 'audio') {
    return {
      ...base,
      type: 'audio',
      fileName: row.file_name!,
      audioStorageKey: row.audio_storage_key!,
      duration: row.duration ?? undefined,
    } as AudioReference
  }
  return {
    ...base,
    type: 'link',
    url: row.url!,
    platform: (row.platform ?? 'other') as 'youtube' | 'soundcloud' | 'other',
    thumbnailUrl: row.thumbnail_url ?? undefined,
    embedId: row.embed_id ?? undefined,
  } as LinkReference
}

function refToRow(boardId: string, userId: string, ref: Reference) {
  const base = {
    id: ref.id,
    board_id: boardId,
    user_id: userId,
    type: ref.type,
    title: ref.title,
    tags: ref.tags,
    note: ref.note,
    color: ref.color,
    annotations: ref.annotations,
    created_at: new Date(ref.createdAt).toISOString(),
  }
  if (ref.type === 'audio') {
    const a = ref as AudioReference
    return { ...base, file_name: a.fileName, audio_storage_key: a.audioStorageKey, duration: a.duration ?? null }
  }
  const l = ref as LinkReference
  return { ...base, url: l.url, platform: l.platform, thumbnail_url: l.thumbnailUrl ?? null, embed_id: l.embedId ?? null }
}

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  return session.user.id
}

// ─── Boards ───────────────────────────────────────────────────────────────────

export async function getBoards(): Promise<Board[]> {
  const userId = await getUserId()
  const { data: boardRows, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error || !boardRows?.length) return []

  const boardIds = boardRows.map((b: BoardRow) => b.id)
  const { data: refRows } = await supabase
    .from('board_refs')
    .select('*')
    .in('board_id', boardIds)
    .order('created_at', { ascending: false })

  return boardRows.map((b: BoardRow) =>
    rowToBoard(b, (refRows ?? []).filter((r: RefRow) => r.board_id === b.id))
  )
}

export async function getBoardById(id: string): Promise<Board | null> {
  const { data: row, error } = await supabase
    .from('boards')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !row) return null

  const { data: refRows } = await supabase
    .from('board_refs')
    .select('*')
    .eq('board_id', id)
    .order('created_at', { ascending: false })

  return rowToBoard(row as BoardRow, (refRows ?? []) as RefRow[])
}

export async function createBoard(name: string, description: string, accentColor: string): Promise<Board> {
  const userId = await getUserId()
  const id = uuidv4()
  const now = new Date().toISOString()

  const { error } = await supabase.from('boards').insert({
    id,
    user_id: userId,
    name,
    description,
    accent_color: accentColor,
    context: { vibes: [] },
    created_at: now,
    updated_at: now,
  })

  if (error) throw error
  return { id, name, description, accentColor, context: { vibes: [] }, references: [], createdAt: Date.now(), updatedAt: Date.now() }
}

export async function updateBoardContext(id: string, context: Partial<BoardContext>): Promise<void> {
  const board = await getBoardById(id)
  if (!board) return
  const merged = { ...board.context, ...context }
  await supabase.from('boards').update({ context: merged, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function deleteBoard(id: string): Promise<void> {
  // board_refs are deleted via ON DELETE CASCADE in DB
  await supabase.from('boards').delete().eq('id', id)
}

// ─── References ───────────────────────────────────────────────────────────────

export async function addReference(boardId: string, ref: Reference): Promise<void> {
  const userId = await getUserId()
  const row = refToRow(boardId, userId, ref)
  const { error } = await supabase.from('board_refs').insert(row)
  if (error) throw error
  await supabase.from('boards').update({ updated_at: new Date().toISOString() }).eq('id', boardId)
}

export async function updateReference(boardId: string, refId: string, updates: Partial<Reference>): Promise<void> {
  const colMap: Record<string, string> = {
    title: 'title', tags: 'tags', note: 'note', color: 'color',
    annotations: 'annotations', duration: 'duration',
    thumbnailUrl: 'thumbnail_url', embedId: 'embed_id',
  }
  const row: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(updates)) {
    const col = colMap[k]
    if (col) row[col] = v
  }
  if (!Object.keys(row).length) return
  await supabase.from('board_refs').update(row).eq('id', refId)
  await supabase.from('boards').update({ updated_at: new Date().toISOString() }).eq('id', boardId)
}

export async function deleteReference(boardId: string, refId: string): Promise<void> {
  await supabase.from('board_refs').delete().eq('id', refId)
  await supabase.from('boards').update({ updated_at: new Date().toISOString() }).eq('id', boardId)
}

// ─── Utilities (unchanged) ────────────────────────────────────────────────────

export function parseLinkUrl(url: string): {
  platform: 'youtube' | 'soundcloud' | 'other'
  embedId?: string
  thumbnailUrl?: string
} {
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/
  )
  if (ytMatch) {
    return {
      platform: 'youtube',
      embedId: ytMatch[1],
      thumbnailUrl: `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`,
    }
  }
  if (url.includes('soundcloud.com')) return { platform: 'soundcloud' }
  return { platform: 'other' }
}

export function isValidUrl(url: string): boolean {
  try { new URL(url); return true } catch { return false }
}

export const ACCENT_COLORS = [
  '#c8ff57', '#ff4d6a', '#5b9cf6', '#ffb347',
  '#9b7fff', '#00e5cc', '#ff6eb4', '#ffffff',
]

export const MUSICAL_KEYS = [
  'C maj', 'C min', 'C# maj', 'C# min',
  'D maj', 'D min', 'D# maj', 'D# min',
  'E maj', 'E min',
  'F maj', 'F min', 'F# maj', 'F# min',
  'G maj', 'G min', 'G# maj', 'G# min',
  'A maj', 'A min', 'A# maj', 'A# min',
  'B maj', 'B min',
]
