'use client'
import { useRef, useState, useCallback } from 'react'
import { AudioReference, LinkReference, MoodTag } from '@/lib/types'
import { parseLinkUrl, isValidUrl } from '@/lib/store'
import { saveAudioBlob } from '@/lib/idb'
import { v4 as uuidv4 } from 'uuid'
import { Loader2, Music2, Youtube, Link2, X } from 'lucide-react'

interface FastCaptureProps {
  accentColor: string
  onAdd: (ref: AudioReference | LinkReference) => void
}

type DetectedType = 'youtube' | 'soundcloud' | 'link' | 'audio' | null

export default function FastCapture({ accentColor, onAdd }: FastCaptureProps) {
  const [value, setValue] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [detected, setDetected] = useState<DetectedType>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const detect = (val: string): DetectedType => {
    if (!val) return null
    if (/youtube\.com|youtu\.be/.test(val)) return 'youtube'
    if (/soundcloud\.com/.test(val)) return 'soundcloud'
    if (isValidUrl(val)) return 'link'
    return null
  }

  const handleChange = (val: string) => {
    setValue(val)
    setDetected(detect(val))
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text')
    const d = detect(pasted)
    if (d) {
      // slight delay to let input update
      setTimeout(() => setDetected(d), 10)
    }
  }

  const submitLink = useCallback(async (url: string) => {
    if (!isValidUrl(url)) return
    setLoading(true)
    const parsed = parseLinkUrl(url)
    const ref: LinkReference = {
      id: uuidv4(),
      type: 'link',
      title: url,
      url,
      platform: parsed.platform,
      thumbnailUrl: parsed.thumbnailUrl,
      embedId: parsed.embedId,
      tags: [],
      note: '',
      color: accentColor,
      createdAt: Date.now(),
      annotations: [],
    }
    onAdd(ref)
    setValue('')
    setDetected(null)
    setLoading(false)
  }, [accentColor, onAdd])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && detected && value) {
      e.preventDefault()
      submitLink(value)
    }
    if (e.key === 'Escape') {
      setValue('')
      setDetected(null)
    }
  }

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('audio/')) return
    setLoading(true)
    try {
      const key = `audio_${uuidv4()}`
      await saveAudioBlob(key, file)
      const ref: AudioReference = {
        id: uuidv4(),
        type: 'audio',
        title: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        audioStorageKey: key,
        tags: [],
        note: '',
        color: accentColor,
        createdAt: Date.now(),
        annotations: [],
      }
      onAdd(ref)
    } finally {
      setLoading(false)
    }
  }, [accentColor, onAdd])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
    // also check if it's a URL being dragged
    const url = e.dataTransfer.getData('text/plain')
    if (!file && url) {
      setValue(url)
      setDetected(detect(url))
      submitLink(url)
    }
  }

  const TypeIcon = () => {
    if (loading) return <Loader2 size={14} className="animate-spin" style={{ color: accentColor }} />
    if (detected === 'youtube') return <Youtube size={14} style={{ color: accentColor }} />
    if (detected === 'soundcloud') return <Music2 size={14} style={{ color: accentColor }} />
    if (detected === 'link') return <Link2 size={14} style={{ color: accentColor }} />
    return null
  }

  return (
    <div
      className="relative"
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input ref={fileRef} type="file" accept="audio/*" className="hidden"
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />

      <div
        className="relative flex items-center rounded-lg border transition-all duration-200"
        style={{
          borderColor: dragging ? accentColor : detected ? `${accentColor}60` : '#2a2a32',
          backgroundColor: dragging ? `${accentColor}08` : '#111114',
          boxShadow: dragging ? `0 0 0 1px ${accentColor}40` : detected ? `0 0 0 1px ${accentColor}20` : 'none',
        }}
      >
        {/* Left icon area */}
        <div className="pl-4 pr-2 flex items-center flex-shrink-0">
          <TypeIcon />
          {!detected && !loading && (
            <button
              onClick={() => fileRef.current?.click()}
              className="text-muted hover:text-soft transition-colors"
              title="Upload audio file"
            >
              <Music2 size={14} />
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          value={value}
          onChange={e => handleChange(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={dragging ? 'Drop audio file here...' : 'Paste YouTube, SoundCloud, or drop audio...'}
          className="flex-1 bg-transparent py-3 pr-4 text-sm text-text font-mono placeholder:text-muted focus:outline-none"
          style={{ fontSize: '13px' }}
          disabled={loading}
        />

        {/* Right: detected label + enter hint */}
        {detected && !loading && (
          <div className="flex items-center gap-2 pr-3 flex-shrink-0">
            <span
              className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{ color: accentColor, backgroundColor: `${accentColor}15` }}
            >
              {detected}
            </span>
            <span className="font-mono text-[10px] text-muted border border-border rounded px-1.5 py-0.5">
              ↵
            </span>
            <button onClick={() => { setValue(''); setDetected(null) }} className="text-muted hover:text-text">
              <X size={12} />
            </button>
          </div>
        )}

        {/* Drag overlay */}
        {dragging && (
          <div
            className="absolute inset-0 rounded-lg flex items-center justify-center pointer-events-none"
            style={{ backgroundColor: `${accentColor}08` }}
          >
            <span className="font-mono text-sm font-bold" style={{ color: accentColor }}>
              DROP AUDIO
            </span>
          </div>
        )}
      </div>

      {/* Hint row */}
      <div className="flex items-center gap-3 mt-1.5 px-1">
        <span className="font-mono text-[9px] text-muted">PASTE LINK → ENTER</span>
        <span className="font-mono text-[9px] text-muted">·</span>
        <button
          onClick={() => fileRef.current?.click()}
          className="font-mono text-[9px] text-muted hover:text-soft transition-colors"
        >
          OR CLICK TO UPLOAD AUDIO
        </button>
      </div>
    </div>
  )
}
