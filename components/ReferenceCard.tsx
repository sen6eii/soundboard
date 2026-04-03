'use client'
import { useState } from 'react'
import { Reference, AudioReference, LinkReference, MoodTag, Annotation } from '@/lib/types'
import { TagPill, TagSelector } from './MoodTag'
import WaveformPlayer from './WaveformPlayer'
import { Trash2, ExternalLink, Edit3, Check, X, Music2, Link2, Youtube, Plus } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface ReferenceCardProps {
  reference: Reference
  accentColor: string
  onDelete: () => void
  onUpdate: (updates: Partial<Reference>) => void
}

export default function ReferenceCard({ reference, accentColor, onDelete, onUpdate }: ReferenceCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [editTitle, setEditTitle] = useState(reference.title)
  const [editNote, setEditNote] = useState(reference.note)
  const [editTags, setEditTags] = useState<MoodTag[]>(reference.tags)

  // Link annotation state
  const [newAnnTs, setNewAnnTs] = useState('')
  const [newAnnText, setNewAnnText] = useState('')
  const [showAnnInput, setShowAnnInput] = useState(false)

  const annotations: Annotation[] = reference.annotations || []

  const saveEdit = () => {
    onUpdate({ title: editTitle, note: editNote, tags: editTags })
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setEditTitle(reference.title)
    setEditNote(reference.note)
    setEditTags(reference.tags)
    setIsEditing(false)
  }

  const handleAnnotationsChange = (anns: Annotation[]) => {
    onUpdate({ annotations: anns } as Partial<Reference>)
  }

  const addLinkAnnotation = () => {
    if (!newAnnTs.trim() || !newAnnText.trim()) return
    const parts = newAnnTs.split(':').map(Number)
    const seconds = parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0]
    const ann: Annotation = {
      id: uuidv4(),
      timestamp: isNaN(seconds) ? 0 : seconds,
      timestampLabel: newAnnTs.trim(),
      text: newAnnText.trim(),
      createdAt: Date.now(),
    }
    onUpdate({ annotations: [...annotations, ann] } as Partial<Reference>)
    setNewAnnTs('')
    setNewAnnText('')
    setShowAnnInput(false)
  }

  const deleteLinkAnnotation = (id: string) => {
    onUpdate({ annotations: annotations.filter(a => a.id !== id) } as Partial<Reference>)
  }

  const getPlatformIcon = () => {
    if (reference.type === 'audio') return <Music2 size={11} />
    const link = reference as LinkReference
    if (link.platform === 'youtube') return <Youtube size={11} />
    return <Link2 size={11} />
  }

  const getPlatformLabel = () => {
    if (reference.type === 'audio') return 'AUDIO'
    const link = reference as LinkReference
    if (link.platform === 'youtube') return 'YOUTUBE'
    if (link.platform === 'soundcloud') return 'SOUNDCLOUD'
    return 'LINK'
  }

  const sortedAnnotations = [...annotations].sort((a, b) => a.timestamp - b.timestamp)

  return (
    <div
      className="card-glow group relative flex flex-col rounded-md border border-border bg-panel transition-all duration-200 overflow-hidden"
      style={{ borderTopColor: `${accentColor}30` }}
    >
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, ${accentColor}60, transparent)` }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2">
        <span
          className="tag-pill inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[9px] flex-shrink-0"
          style={{ color: accentColor, borderColor: `${accentColor}30` }}
        >
          {getPlatformIcon()}
          {getPlatformLabel()}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setIsEditing(!isEditing)} className="p-1 rounded text-dim hover:text-text transition-colors">
            <Edit3 size={12} />
          </button>
          <button onClick={onDelete} className="p-1 rounded text-dim hover:text-red transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pb-2">
        {isEditing ? (
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="w-full bg-surface border border-border rounded px-2 py-1 text-sm font-display font-semibold text-text focus:outline-none focus:border-accent"
          />
        ) : (
          <h3 className="font-display font-semibold text-text leading-snug text-sm">
            {reference.title || 'Untitled'}
          </h3>
        )}
      </div>

      {/* Audio waveform */}
      {reference.type === 'audio' && (
        <div className="px-4 pb-3">
          <WaveformPlayer
            audioStorageKey={(reference as AudioReference).audioStorageKey}
            accentColor={accentColor}
            annotations={annotations}
            onAnnotationsChange={handleAnnotationsChange}
            expanded={expanded}
            onToggleExpand={() => setExpanded(e => !e)}
          />
        </div>
      )}

      {/* YouTube thumbnail */}
      {reference.type === 'link' && (reference as LinkReference).platform === 'youtube' && (reference as LinkReference).thumbnailUrl && (
        <div className="px-4 pb-3">
          <div className="relative rounded overflow-hidden border border-border">
            <img src={(reference as LinkReference).thumbnailUrl} alt="" className="w-full h-28 object-cover" />
            <div className="absolute inset-0 bg-ink/40" />
            <a
              href={(reference as LinkReference).url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border"
                style={{ backgroundColor: `${accentColor}20`, borderColor: `${accentColor}60`, color: accentColor }}
              >
                <Youtube size={16} className="ml-0.5" />
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Other link */}
      {reference.type === 'link' && (reference as LinkReference).platform !== 'youtube' && (
        <div className="px-4 pb-3">
          <a
            href={(reference as LinkReference).url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded border border-border bg-surface px-3 py-2 text-dim hover:text-text hover:border-muted transition-all text-xs font-mono"
          >
            <ExternalLink size={11} />
            <span className="truncate">{(reference as LinkReference).url}</span>
          </a>
        </div>
      )}

      {/* Link annotations — prominent */}
      {reference.type === 'link' && (
        <div className="px-4 pb-3 space-y-1">
          {sortedAnnotations.map(ann => (
            <div
              key={ann.id}
              className="group/ann flex items-start gap-2 rounded px-2 py-1.5 border border-transparent hover:border-border hover:bg-surface/50 transition-all"
            >
              <span
                className="font-mono text-[11px] font-bold flex-shrink-0 mt-0.5"
                style={{ color: accentColor }}
              >
                {ann.timestampLabel}
              </span>
              <span className="text-[12px] text-soft font-body flex-1 leading-relaxed">{ann.text}</span>
              <button
                onClick={() => deleteLinkAnnotation(ann.id)}
                className="opacity-0 group-hover/ann:opacity-100 text-muted hover:text-red transition-all p-0.5 flex-shrink-0"
              >
                <X size={10} />
              </button>
            </div>
          ))}

          {showAnnInput ? (
            <div
              className="flex items-center gap-2 rounded border border-border bg-surface px-2 py-1.5 animate-slide-up"
              style={{ borderLeftColor: accentColor, borderLeftWidth: 2 }}
            >
              <input
                value={newAnnTs}
                onChange={e => setNewAnnTs(e.target.value)}
                placeholder="0:00"
                className="w-10 bg-transparent font-mono text-[11px] focus:outline-none placeholder:text-muted"
                style={{ color: accentColor }}
              />
              <input
                autoFocus
                value={newAnnText}
                onChange={e => setNewAnnText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') addLinkAnnotation()
                  if (e.key === 'Escape') setShowAnnInput(false)
                }}
                placeholder="What happens here?"
                className="flex-1 bg-transparent text-[12px] text-text font-body focus:outline-none placeholder:text-muted"
              />
              <button onClick={addLinkAnnotation} disabled={!newAnnTs || !newAnnText} style={{ color: accentColor }} className="p-1 disabled:opacity-30">
                <Check size={11} />
              </button>
              <button onClick={() => setShowAnnInput(false)} className="p-1 text-dim hover:text-text">
                <X size={11} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAnnInput(true)}
              className="flex items-center gap-1.5 text-[10px] font-mono text-muted hover:text-soft transition-colors mt-1"
            >
              <Plus size={10} /> ADD TIMESTAMP NOTE
            </button>
          )}
        </div>
      )}

      {/* Tags */}
      <div className="px-4 pb-2">
        {isEditing ? (
          <TagSelector selected={editTags} onChange={setEditTags} />
        ) : (
          <div className="flex flex-wrap gap-1">
            {reference.tags.map(tag => <TagPill key={tag} tag={tag} size="sm" />)}
          </div>
        )}
      </div>

      {/* Note */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <textarea
            value={editNote}
            onChange={e => setEditNote(e.target.value)}
            placeholder="What do you like about this? What feeling does it give?"
            rows={2}
            className="w-full bg-surface border border-border rounded px-2 py-1.5 text-[12px] text-soft font-body resize-none focus:outline-none focus:border-accent"
          />
        ) : reference.note ? (
          <p className="text-[12px] text-dim italic leading-relaxed">"{reference.note}"</p>
        ) : null}
      </div>

      {/* Edit actions */}
      {isEditing && (
        <div className="flex gap-2 px-4 pb-3">
          <button
            onClick={saveEdit}
            className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-mono font-bold"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` }}
          >
            <Check size={11} /> SAVE
          </button>
          <button onClick={cancelEdit} className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-mono text-dim hover:text-text">
            <X size={11} /> CANCEL
          </button>
        </div>
      )}

      <div className="border-t border-border/50 px-4 py-1.5">
        <span className="font-mono text-[9px] text-muted">
          {new Date(reference.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </div>
  )
}
