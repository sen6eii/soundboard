'use client'
import { useState } from 'react'
import { ACCENT_COLORS } from '@/lib/store'
import { X, Check } from 'lucide-react'

interface CreateBoardModalProps {
  onCreate: (name: string, description: string, accentColor: string) => void
  onClose: () => void
}

export default function CreateBoardModal({ onCreate, onClose }: CreateBoardModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(ACCENT_COLORS[0])

  const handleCreate = () => {
    if (!name.trim()) return
    onCreate(name.trim(), description.trim(), color)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-panel shadow-2xl animate-slide-up overflow-hidden">
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display font-bold text-text text-base">NEW BOARD</h2>
          <button onClick={onClose} className="text-dim hover:text-text transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="font-mono text-[10px] text-dim uppercase tracking-widest block mb-1.5">Board name *</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
              placeholder="e.g. Beat trap oscuro, Canción pop verano…"
              className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm text-text font-display font-semibold focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] text-dim uppercase tracking-widest block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={2}
              className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-soft font-body resize-none focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] text-dim uppercase tracking-widest block mb-2">Accent color</label>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? c : 'transparent',
                    boxShadow: color === c ? `0 0 0 2px #111114, 0 0 0 3.5px ${c}` : 'none',
                  }}
                >
                  {color === c && <Check size={12} color="#0a0a0b" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="w-full rounded py-3 font-mono font-bold text-sm tracking-widest transition-all mt-2 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              backgroundColor: name.trim() ? `${color}20` : 'transparent',
              color: color,
              border: `1px solid ${color}40`,
            }}
          >
            CREATE BOARD
          </button>
        </div>
      </div>
    </div>
  )
}
