import { Board, Reference, BoardContext } from './types'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'soundboard_v2'

export function getBoards(): Board[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const boards: Board[] = JSON.parse(raw)
    // migrate boards missing context
    return boards.map(b => ({
      ...b,
      context: b.context ?? { vibes: [] },
    }))
  } catch {
    return []
  }
}

export function saveBoards(boards: Board[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards))
}

export function createBoard(name: string, description: string, accentColor: string): Board {
  const boards = getBoards()
  const board: Board = {
    id: uuidv4(),
    name,
    description,
    accentColor,
    context: { vibes: [] },
    references: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  saveBoards([...boards, board])
  return board
}

export function updateBoard(id: string, updates: Partial<Board>): Board | null {
  const boards = getBoards()
  const idx = boards.findIndex(b => b.id === id)
  if (idx === -1) return null
  boards[idx] = { ...boards[idx], ...updates, updatedAt: Date.now() }
  saveBoards(boards)
  return boards[idx]
}

export function updateBoardContext(id: string, context: Partial<BoardContext>): Board | null {
  const boards = getBoards()
  const idx = boards.findIndex(b => b.id === id)
  if (idx === -1) return null
  boards[idx].context = { ...boards[idx].context, ...context }
  boards[idx].updatedAt = Date.now()
  saveBoards(boards)
  return boards[idx]
}

export function deleteBoard(id: string): void {
  const boards = getBoards()
  saveBoards(boards.filter(b => b.id !== id))
}

export function addReference(boardId: string, ref: Reference): Board | null {
  const boards = getBoards()
  const idx = boards.findIndex(b => b.id === boardId)
  if (idx === -1) return null
  boards[idx].references = [ref, ...boards[idx].references] // newest first
  boards[idx].updatedAt = Date.now()
  saveBoards(boards)
  return boards[idx]
}

export function updateReference(boardId: string, refId: string, updates: Partial<Reference>): Board | null {
  const boards = getBoards()
  const idx = boards.findIndex(b => b.id === boardId)
  if (idx === -1) return null
  boards[idx].references = boards[idx].references.map(r =>
    r.id === refId ? { ...r, ...updates } as Reference : r
  )
  boards[idx].updatedAt = Date.now()
  saveBoards(boards)
  return boards[idx]
}

export function deleteReference(boardId: string, refId: string): Board | null {
  const boards = getBoards()
  const idx = boards.findIndex(b => b.id === boardId)
  if (idx === -1) return null
  boards[idx].references = boards[idx].references.filter(r => r.id !== refId)
  boards[idx].updatedAt = Date.now()
  saveBoards(boards)
  return boards[idx]
}

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
  if (url.includes('soundcloud.com')) {
    return { platform: 'soundcloud' }
  }
  return { platform: 'other' }
}

export function isValidUrl(url: string): boolean {
  try { new URL(url); return true } catch { return false }
}

export const ACCENT_COLORS = [
  '#c8ff57',
  '#ff4d6a',
  '#5b9cf6',
  '#ffb347',
  '#9b7fff',
  '#00e5cc',
  '#ff6eb4',
  '#ffffff',
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
