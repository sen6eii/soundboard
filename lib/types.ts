export type MoodTag =
  | 'dark'
  | 'energetic'
  | 'chill'
  | 'ethereal'
  | 'aggressive'
  | 'melancholic'
  | 'hypnotic'
  | 'raw'
  | 'cinematic'
  | 'groovy'
  | 'minimal'
  | 'chaotic'

export type ReferenceType = 'audio' | 'link'

export interface Annotation {
  id: string
  timestamp: number
  timestampLabel: string
  text: string
  createdAt: number
}

export interface AudioReference {
  id: string
  type: 'audio'
  title: string
  fileName: string
  audioStorageKey: string // key in IndexedDB (replaces base64)
  duration?: number
  tags: MoodTag[]
  note: string
  color: string
  createdAt: number
  annotations: Annotation[]
}

export interface LinkReference {
  id: string
  type: 'link'
  title: string
  url: string
  platform: 'youtube' | 'soundcloud' | 'other'
  thumbnailUrl?: string
  embedId?: string
  tags: MoodTag[]
  note: string
  color: string
  createdAt: number
  annotations: Annotation[]
}

export type Reference = AudioReference | LinkReference

export interface BoardContext {
  bpm?: number
  key?: string
  direction?: string // free text "the low end should feel suffocating..."
  vibes: MoodTag[]
}

export interface Board {
  id: string
  name: string
  description: string
  accentColor: string
  context: BoardContext
  references: Reference[]
  createdAt: number
  updatedAt: number
}
