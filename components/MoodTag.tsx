'use client'
import { MoodTag } from '@/lib/types'
import { X } from 'lucide-react'

const TAG_META: Record<MoodTag, { label: string; dot: string }> = {
  dark:       { label: 'DARK',       dot: '#9b7fff' },
  energetic:  { label: 'ENERGETIC',  dot: '#ff4d6a' },
  chill:      { label: 'CHILL',      dot: '#5b9cf6' },
  ethereal:   { label: 'ETHEREAL',   dot: '#00e5cc' },
  aggressive: { label: 'AGGRESSIVE', dot: '#ff4d6a' },
  melancholic:{ label: 'MELANCHOLIC',dot: '#9b7fff' },
  hypnotic:   { label: 'HYPNOTIC',   dot: '#00e5cc' },
  raw:        { label: 'RAW',        dot: '#ffb347' },
  cinematic:  { label: 'CINEMATIC',  dot: '#5b9cf6' },
  groovy:     { label: 'GROOVY',     dot: '#c8ff57' },
  minimal:    { label: 'MINIMAL',    dot: '#9d9db0' },
  chaotic:    { label: 'CHAOTIC',    dot: '#ff6eb4' },
}

interface TagPillProps {
  tag: MoodTag
  onRemove?: () => void
  size?: 'sm' | 'md'
}

export function TagPill({ tag, onRemove, size = 'md' }: TagPillProps) {
  const meta = TAG_META[tag]
  return (
    <span
      className={`tag-pill inline-flex items-center gap-1 rounded-sm border border-border bg-panel text-soft ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]'
      }`}
    >
      <span
        className="inline-block rounded-full flex-shrink-0"
        style={{
          width: size === 'sm' ? 4 : 5,
          height: size === 'sm' ? 4 : 5,
          backgroundColor: meta.dot,
        }}
      />
      {meta.label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 text-muted hover:text-text transition-colors"
        >
          <X size={8} />
        </button>
      )}
    </span>
  )
}

interface TagSelectorProps {
  selected: MoodTag[]
  onChange: (tags: MoodTag[]) => void
}

export function TagSelector({ selected, onChange }: TagSelectorProps) {
  const allTags = Object.keys(TAG_META) as MoodTag[]

  const toggle = (tag: MoodTag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {allTags.map(tag => {
        const isSelected = selected.includes(tag)
        const meta = TAG_META[tag]
        return (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className={`tag-pill inline-flex items-center gap-1 rounded-sm border px-2 py-1 transition-all duration-150 ${
              isSelected
                ? 'border-border bg-panel text-text'
                : 'border-transparent bg-transparent text-dim hover:text-soft hover:border-border'
            }`}
          >
            <span
              className="inline-block rounded-full"
              style={{
                width: 5,
                height: 5,
                backgroundColor: isSelected ? meta.dot : '#3a3a45',
              }}
            />
            {meta.label}
          </button>
        )
      })}
    </div>
  )
}
