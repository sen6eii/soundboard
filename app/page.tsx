'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Board } from '@/lib/types'
import { getBoards, createBoard, deleteBoard } from '@/lib/store'
import CreateBoardModal from '@/components/CreateBoardModal'
import { Plus, Trash2, ChevronRight, Layers, Music2, Link2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [boards, setBoards] = useState<Board[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setBoards(getBoards())
  }, [])

  const handleCreate = (name: string, description: string, color: string) => {
    const board = createBoard(name, description, color)
    setBoards(getBoards())
    setShowCreate(false)
    router.push(`/board/${board.id}`)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Delete this board and all its references?')) {
      deleteBoard(id)
      setBoards(getBoards())
    }
  }

  const getBoardStats = (board: Board) => {
    const audio = board.references.filter(r => r.type === 'audio').length
    const links = board.references.filter(r => r.type === 'link').length
    return { audio, links, total: board.references.length }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-ink">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded flex items-center justify-center bg-accent">
                <Layers size={11} color="#0a0a0b" strokeWidth={2.5} />
              </div>
              <span className="font-display font-extrabold text-text tracking-tight text-xl">SOUNDBOARD</span>
            </div>
            <p className="text-[11px] text-dim font-mono mt-0.5 ml-7">music moodboards for producers</p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-[11px] font-bold tracking-widest text-accent transition-all hover:bg-accent/20"
          >
            <Plus size={12} strokeWidth={2.5} />
            NEW BOARD
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        {boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-36 gap-5">
            {/* Decorative grid */}
            <div className="grid grid-cols-3 gap-2 mb-2 opacity-20">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded border border-border bg-panel"
                  style={{ opacity: Math.random() * 0.8 + 0.2 }}
                />
              ))}
            </div>
            <div className="text-center max-w-sm">
              <h2 className="font-display font-bold text-text text-lg">Your sonic workspace</h2>
              <p className="text-[13px] text-dim mt-2 font-body leading-relaxed">
                Create boards to collect audio references, YouTube links, and sonic inspirations for your projects.
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded border border-accent/40 bg-accent/10 px-5 py-2.5 font-mono text-xs font-bold tracking-widest text-accent transition-all hover:bg-accent/20"
            >
              <Plus size={13} strokeWidth={2.5} />
              CREATE YOUR FIRST BOARD
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-4">
              {boards.length} board{boards.length !== 1 ? 's' : ''}
            </p>
            {boards.map(board => {
              const stats = getBoardStats(board)
              return (
                <div
                  key={board.id}
                  onClick={() => router.push(`/board/${board.id}`)}
                  className="group relative flex items-center gap-4 rounded-lg border border-border bg-panel px-4 py-4 cursor-pointer transition-all hover:border-muted hover:bg-surface"
                  style={{ borderLeftColor: `${board.accentColor}50`, borderLeftWidth: 2 }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-px opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: board.accentColor }}
                  />

                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${board.accentColor}15` }}
                  >
                    <Layers size={15} style={{ color: board.accentColor }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-display font-bold text-text text-sm truncate">{board.name}</h3>
                    </div>
                    {board.description && (
                      <p className="text-[11px] text-dim truncate font-body mt-0.5">{board.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      {stats.audio > 0 && (
                        <span className="font-mono text-[9px] text-muted flex items-center gap-1">
                          <Music2 size={9} /> {stats.audio}
                        </span>
                      )}
                      {stats.links > 0 && (
                        <span className="font-mono text-[9px] text-muted flex items-center gap-1">
                          <Link2 size={9} /> {stats.links}
                        </span>
                      )}
                      {stats.total === 0 && (
                        <span className="font-mono text-[9px] text-muted">empty</span>
                      )}
                      <span className="font-mono text-[9px] text-muted ml-auto">
                        {new Date(board.updatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => handleDelete(e, board.id)}
                      className="p-1.5 rounded text-transparent group-hover:text-muted hover:!text-red transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight size={14} className="text-muted group-hover:text-soft transition-colors" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateBoardModal
          onCreate={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}
