'use client'
import { useState } from 'react'
import { BoardContext, MoodTag } from '@/lib/types'
import { MUSICAL_KEYS } from '@/lib/store'
import { TagSelector, TagPill } from './MoodTag'
import { Edit3, Check, X, Music, Hash, Zap } from 'lucide-react'

interface BoardContextBarProps {
  context: BoardContext
  accentColor: string
  onUpdate: (ctx: Partial<BoardContext>) => void
}

export default function BoardContextBar({ context, accentColor, onUpdate }: BoardContextBarProps) {
  const [editing, setEditing] = useState(false)
  const [bpm, setBpm] = useState(context.bpm?.toString() ?? '')
  const [key, setKey] = useState(context.key ?? '')
  const [direction, setDirection] = useState(context.direction ?? '')
  const [vibes, setVibes] = useState<MoodTag[]>(context.vibes ?? [])

  const hasAny = context.bpm || context.key || context.direction || (context.vibes?.length ?? 0) > 0
  const isEmpty = !hasAny && !editing

  const save = () => {
    onUpdate({
      bpm: bpm ? parseInt(bpm) : undefined,
      key: key || undefined,
      direction: direction || undefined,
      vibes,
    })
    setEditing(false)
  }

  const cancel = () => {
    setBpm(context.bpm?.toString() ?? '')
    setKey(context.key ?? '')
    setDirection(context.direction ?? '')
    setVibes(context.vibes ?? [])
    setEditing(false)
  }

  if (isEmpty) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="w-full flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-muted hover:text-soft hover:border-muted transition-all group"
      >
        <Zap size={13} className="group-hover:text-soft transition-colors" style={{ color: `${accentColor}50` }} />
        <span className="font-mono text-[11px]">Set BPM, key, and direction for this board</span>
        <Edit3 size={11} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    )
  }

  if (editing) {
    return (
      <div
        className="rounded-lg border border-border bg-panel p-4 space-y-4"
        style={{ borderTopColor: `${accentColor}40`, borderTopWidth: 2 }}
      >
        <div className="grid grid-cols-2 gap-3">
          {/* BPM */}
          <div>
            <label className="font-mono text-[9px] text-muted uppercase tracking-widest block mb-1.5 flex items-center gap-1">
              <Hash size={9} /> BPM
            </label>
            <input
              type="number"
              value={bpm}
              onChange={e => setBpm(e.target.value)}
              placeholder="140"
              min={40} max={300}
              className="w-full bg-surface border border-border rounded px-3 py-2 font-mono text-sm text-text focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          {/* Key */}
          <div>
            <label className="font-mono text-[9px] text-muted uppercase tracking-widest block mb-1.5 flex items-center gap-1">
              <Music size={9} /> KEY
            </label>
            <select
              value={key}
              onChange={e => setKey(e.target.value)}
              className="w-full bg-surface border border-border rounded px-3 py-2 font-mono text-sm text-text focus:outline-none focus:border-accent transition-colors appearance-none"
            >
              <option value="">—</option>
              {MUSICAL_KEYS.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Direction */}
        <div>
          <label className="font-mono text-[9px] text-muted uppercase tracking-widest block mb-1.5">
            DIRECTION
          </label>
          <textarea
            value={direction}
            onChange={e => setDirection(e.target.value)}
            placeholder="The low end should feel suffocating but clean. Drums punchy, not washy. Think late-night, empty streets..."
            rows={2}
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-soft font-body resize-none focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Vibes */}
        <div>
          <label className="font-mono text-[9px] text-muted uppercase tracking-widest block mb-1.5">
            VIBES
          </label>
          <TagSelector selected={vibes} onChange={setVibes} />
        </div>

        <div className="flex gap-2">
          <button
            onClick={save}
            className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-mono font-bold transition-colors"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` }}
          >
            <Check size={11} /> SAVE
          </button>
          <button
            onClick={cancel}
            className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-mono text-dim hover:text-text transition-colors"
          >
            <X size={11} /> CANCEL
          </button>
        </div>
      </div>
    )
  }

  // Display mode
  return (
    <div
      className="group rounded-lg border border-border bg-panel px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 cursor-pointer hover:border-muted transition-all"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 2 }}
      onClick={() => setEditing(true)}
    >
      {context.bpm && (
        <div className="flex items-center gap-1.5">
          <Hash size={10} className="text-muted" />
          <span className="font-mono text-sm font-bold" style={{ color: accentColor }}>{context.bpm}</span>
          <span className="font-mono text-[10px] text-dim">BPM</span>
        </div>
      )}
      {context.key && (
        <div className="flex items-center gap-1.5">
          <Music size={10} className="text-muted" />
          <span className="font-mono text-sm font-bold text-text">{context.key}</span>
        </div>
      )}
      {(context.vibes?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1">
          {context.vibes.map(t => <TagPill key={t} tag={t} size="sm" />)}
        </div>
      )}
      {context.direction && (
        <p className="w-full font-body text-[12px] text-dim italic leading-relaxed mt-0.5">
          "{context.direction}"
        </p>
      )}
      <Edit3
        size={11}
        className="ml-auto text-transparent group-hover:text-muted transition-colors flex-shrink-0"
      />
    </div>
  )
}
