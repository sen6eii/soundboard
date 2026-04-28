'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Board, Reference, MoodTag } from '@/lib/types'
import { getBoardById, addReference, updateReference, deleteReference, updateBoardContext } from '@/lib/store'
import { deleteAudioBlob } from '@/lib/idb'
import ReferenceCard from '@/components/ReferenceCard'
import FastCapture from '@/components/FastCapture'
import BoardContextBar from '@/components/BoardContextBar'
import { AudioReference, LinkReference, BoardContext } from '@/lib/types'
import { ArrowLeft, Filter } from 'lucide-react'
import { TagPill } from '@/components/MoodTag'

const ALL_TAGS: MoodTag[] = [
  'dark', 'energetic', 'chill', 'ethereal', 'aggressive',
  'melancholic', 'hypnotic', 'raw', 'cinematic', 'groovy', 'minimal', 'chaotic'
]

export default function BoardPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [board, setBoard] = useState<Board | null>(null)
  const [filterTags, setFilterTags] = useState<MoodTag[]>([])
  const [showFilter, setShowFilter] = useState(false)

  const refresh = () => {
    getBoardById(params.id).then(b => { if (b) setBoard(b) })
  }

  useEffect(() => {
    getBoardById(params.id).then(b => {
      if (!b) router.push('/boards')
      else setBoard(b)
    })
  }, [params.id, router])

  const handleAdd = async (ref: AudioReference | LinkReference) => {
    await addReference(params.id, ref)
    refresh()
  }

  const handleUpdate = async (refId: string, updates: Partial<Reference>) => {
    await updateReference(params.id, refId, updates)
    refresh()
  }

  const handleDelete = async (refId: string) => {
    const ref = board?.references.find(r => r.id === refId)
    if (ref?.type === 'audio') {
      await deleteAudioBlob((ref as AudioReference).audioStorageKey).catch(() => {})
    }
    await deleteReference(params.id, refId)
    refresh()
  }

  const handleContextUpdate = async (ctx: Partial<BoardContext>) => {
    await updateBoardContext(params.id, ctx)
    refresh()
  }

  const toggleFilterTag = (tag: MoodTag) => {
    setFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  if (!board) return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="w-4 h-4 border border-border border-t-accent rounded-full animate-spin" />
    </div>
  )

  const filtered = filterTags.length === 0
    ? board.references
    : board.references.filter(r => filterTags.some(t => r.tags.includes(t)))

  const ac = board.accentColor

  return (
    <div className="min-h-screen bg-ink">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-ink/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.push('/boards')} className="text-dim hover:text-text transition-colors p-1">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ac }} />
              <h1 className="font-display font-bold text-text truncate text-lg">{board.name}</h1>
            </div>
            {board.description && (
              <p className="text-[11px] text-dim font-body truncate ml-4">{board.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-mono text-[10px] text-dim hidden sm:block">
              {board.references.length} ref{board.references.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`p-2 rounded border transition-colors ${
                filterTags.length > 0 ? 'border-accent text-accent bg-accent/10' : 'border-border text-dim hover:text-text'
              }`}
            >
              <Filter size={13} />
            </button>
          </div>
        </div>

        {showFilter && (
          <div className="border-t border-border/50 px-4 py-2 max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="font-mono text-[9px] text-muted uppercase tracking-widest mr-1">Filter:</span>
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleFilterTag(tag)}
                  style={{ opacity: filterTags.length === 0 || filterTags.includes(tag) ? 1 : 0.4 }}
                >
                  <TagPill tag={tag} size="sm" />
                </button>
              ))}
              {filterTags.length > 0 && (
                <button onClick={() => setFilterTags([])} className="font-mono text-[9px] text-dim hover:text-text ml-1">
                  CLEAR
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <BoardContextBar context={board.context} accentColor={ac} onUpdate={handleContextUpdate} />
        <FastCapture accentColor={ac} onAdd={handleAdd} />

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            {board.references.length === 0 ? (
              <>
                <div
                  className="w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center text-2xl"
                  style={{ borderColor: `${ac}30` }}
                >
                  🎛
                </div>
                <div className="text-center">
                  <p className="font-display font-bold text-soft text-sm">Drop audio or paste a link above</p>
                  <p className="text-[12px] text-dim mt-1">This is your sound moodboard</p>
                </div>
              </>
            ) : (
              <p className="text-dim font-mono text-xs">No references match the selected filters</p>
            )}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {filtered.map(ref => (
              <div key={ref.id} className="break-inside-avoid mb-4 animate-slide-up">
                <ReferenceCard
                  reference={ref}
                  accentColor={ac}
                  onDelete={() => handleDelete(ref.id)}
                  onUpdate={updates => handleUpdate(ref.id, updates)}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
