'use client'
import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Check, X, Maximize2, Minimize2 } from 'lucide-react'
import { Annotation } from '@/lib/types'
import { getAudioBlob } from '@/lib/idb'
import { v4 as uuidv4 } from 'uuid'

interface WaveformPlayerProps {
  audioStorageKey: string
  accentColor?: string
  annotations?: Annotation[]
  onAnnotationsChange?: (annotations: Annotation[]) => void
  expanded?: boolean
  onToggleExpand?: () => void
}

export default function WaveformPlayer({
  audioStorageKey,
  accentColor = '#c8ff57',
  annotations = [],
  onAnnotationsChange,
  expanded = false,
  onToggleExpand,
}: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)

  const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null)
  const [pendingText, setPendingText] = useState('')
  const [pendingLeft, setPendingLeft] = useState(0)
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null)

  const canAnnotate = !!onAnnotationsChange
  const waveHeight = expanded ? 80 : 48

  // Load blob URL from IndexedDB
  useEffect(() => {
    let objectUrl: string | null = null
    getAudioBlob(audioStorageKey).then(url => {
      if (url) { objectUrl = url; setAudioUrl(url) }
      else setLoadError(true)
    }).catch(() => setLoadError(true))
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [audioStorageKey])

  // Init WaveSurfer when audioUrl is ready
  useEffect(() => {
    if (!audioUrl || !containerRef.current) return
    let ws: any = null
    const init = async () => {
      const WaveSurfer = (await import('wavesurfer.js')).default
      ws = WaveSurfer.create({
        container: containerRef.current!,
        waveColor: '#3a3a45',
        progressColor: accentColor,
        cursorColor: accentColor,
        cursorWidth: 2,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        height: waveHeight,
        normalize: true,
        backend: 'WebAudio',
        interact: true,
      })
      ws.load(audioUrl)
      wavesurferRef.current = ws
      ws.on('ready', () => { setIsReady(true); setDuration(ws.getDuration()) })
      ws.on('audioprocess', () => setCurrentTime(ws.getCurrentTime()))
      ws.on('play', () => setIsPlaying(true))
      ws.on('pause', () => setIsPlaying(false))
      ws.on('finish', () => setIsPlaying(false))
    }
    init()
    return () => { ws?.destroy(); wavesurferRef.current = null; setIsReady(false) }
  }, [audioUrl, accentColor, waveHeight])

  const togglePlay = () => wavesurferRef.current?.playPause()

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isReady || !canAnnotate || !wrapperRef.current) return
    const rect = wrapperRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const ts = pct * duration
    setPendingTimestamp(ts)
    setPendingLeft(pct * 100)
    setPendingText('')
    wavesurferRef.current?.seekTo(pct)
  }

  const commitAnnotation = () => {
    if (pendingTimestamp === null || !pendingText.trim()) { setPendingTimestamp(null); return }
    const ann: Annotation = {
      id: uuidv4(),
      timestamp: pendingTimestamp,
      timestampLabel: fmt(pendingTimestamp),
      text: pendingText.trim(),
      createdAt: Date.now(),
    }
    onAnnotationsChange?.([...annotations, ann])
    setPendingTimestamp(null)
    setPendingText('')
  }

  const deleteAnnotation = (id: string) =>
    onAnnotationsChange?.(annotations.filter(a => a.id !== id))

  const seekTo = (ts: number) => {
    if (!wavesurferRef.current || !isReady || duration === 0) return
    wavesurferRef.current.seekTo(ts / duration)
  }

  const sorted = [...annotations].sort((a, b) => a.timestamp - b.timestamp)
  const activeByTime = sorted.find((a, i) => {
    const next = sorted[i + 1]
    return currentTime >= a.timestamp && (!next || currentTime < next.timestamp)
  })

  if (loadError) {
    return (
      <div className="flex items-center gap-2 rounded border border-border bg-surface px-3 py-2">
        <span className="font-mono text-[11px] text-muted">audio file not found</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          disabled={!isReady}
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 disabled:opacity-30"
          style={{
            backgroundColor: isReady ? `${accentColor}18` : 'transparent',
            border: `1px solid ${accentColor}40`,
            color: accentColor,
          }}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
        </button>

        <div className="flex-1 relative">
          {/* Click capture overlay */}
          <div
            ref={wrapperRef}
            className="absolute inset-0 z-10"
            style={{ cursor: canAnnotate && isReady ? 'crosshair' : 'default' }}
            onClick={handleWaveformClick}
          />

          {/* Annotation dots */}
          {isReady && annotations.map(ann => {
            const pct = duration > 0 ? (ann.timestamp / duration) * 100 : 0
            const isActive = activeByTime?.id === ann.id || activeAnnotation === ann.id
            return (
              <div
                key={ann.id}
                className="absolute z-20 group/dot"
                style={{ left: `${pct}%`, top: 0, bottom: 0, transform: 'translateX(-50%)' }}
              >
                {/* Vertical line */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-px transition-all"
                  style={{
                    top: 0,
                    height: '100%',
                    backgroundColor: isActive ? accentColor : `${accentColor}30`,
                  }}
                />
                {/* Dot */}
                <button
                  onClick={e => {
                    e.stopPropagation()
                    seekTo(ann.timestamp)
                    setActiveAnnotation(prev => prev === ann.id ? null : ann.id)
                  }}
                  className="absolute left-1/2 -translate-x-1/2 rounded-full border-2 z-10 transition-all"
                  style={{
                    width: 10, height: 10,
                    top: waveHeight / 2 - 5,
                    backgroundColor: isActive ? accentColor : '#111114',
                    borderColor: accentColor,
                    boxShadow: isActive ? `0 0 8px ${accentColor}80` : 'none',
                  }}
                />
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover/dot:opacity-100 transition-opacity z-30">
                  <div
                    className="rounded px-2 py-1 text-[10px] font-mono whitespace-nowrap shadow-lg"
                    style={{ backgroundColor: '#18181d', border: `1px solid ${accentColor}40`, color: accentColor }}
                  >
                    {ann.timestampLabel} — {ann.text}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Pending line */}
          {pendingTimestamp !== null && (
            <div
              className="absolute z-20 w-0.5 pointer-events-none animate-pulse"
              style={{ left: `${pendingLeft}%`, top: 0, height: waveHeight, backgroundColor: accentColor }}
            />
          )}

          <div
            ref={containerRef}
            className="waveform-container"
            style={{ opacity: isReady ? 1 : 0.4, transition: 'opacity 0.3s' }}
          />
        </div>

        {/* Expand toggle */}
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="flex-shrink-0 text-muted hover:text-soft transition-colors p-1"
          >
            {expanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        )}
      </div>

      {/* Time row */}
      {isReady ? (
        <div className="flex justify-between px-11">
          <span className="font-mono text-[10px] text-dim">{fmt(currentTime)}</span>
          {canAnnotate && <span className="font-mono text-[9px] text-muted">click to annotate</span>}
          <span className="font-mono text-[10px] text-dim">{fmt(duration)}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-11">
          <div className="h-px flex-1 bg-border animate-pulse" />
          <span className="font-mono text-[9px] text-muted">loading...</span>
        </div>
      )}

      {/* Annotation input */}
      {pendingTimestamp !== null && (
        <div
          className="mx-11 rounded border border-border bg-surface px-3 py-2 flex items-center gap-2 animate-slide-up"
          style={{ borderLeftColor: accentColor, borderLeftWidth: 2 }}
        >
          <span className="font-mono text-[10px] flex-shrink-0" style={{ color: accentColor }}>
            {fmt(pendingTimestamp)}
          </span>
          <input
            autoFocus
            value={pendingText}
            onChange={e => setPendingText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') commitAnnotation()
              if (e.key === 'Escape') setPendingTimestamp(null)
            }}
            placeholder="What happens here?"
            className="flex-1 bg-transparent text-[12px] text-text font-body focus:outline-none placeholder:text-muted"
          />
          <button onClick={commitAnnotation} disabled={!pendingText.trim()} style={{ color: accentColor }} className="p-1 disabled:opacity-30">
            <Check size={12} />
          </button>
          <button onClick={() => setPendingTimestamp(null)} className="p-1 text-dim hover:text-text">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Annotation list */}
      {annotations.length > 0 && (
        <div className="mx-11 space-y-0.5 mt-0.5">
          {sorted.map(ann => {
            const isActive = activeByTime?.id === ann.id || activeAnnotation === ann.id
            return (
              <div
                key={ann.id}
                className="group/ann flex items-start gap-2 rounded px-2 py-1.5 cursor-pointer transition-all"
                style={{
                  backgroundColor: isActive ? `${accentColor}10` : 'transparent',
                  borderLeft: `1.5px solid ${isActive ? accentColor : '#2a2a32'}`,
                }}
                onClick={() => { seekTo(ann.timestamp); setActiveAnnotation(ann.id) }}
              >
                <span
                  className="font-mono text-[10px] flex-shrink-0 mt-0.5 transition-colors"
                  style={{ color: isActive ? accentColor : '#6b6b7e' }}
                >
                  {ann.timestampLabel}
                </span>
                <span className="text-[12px] text-soft font-body flex-1 leading-relaxed">{ann.text}</span>
                <button
                  onClick={e => { e.stopPropagation(); deleteAnnotation(ann.id) }}
                  className="opacity-0 group-hover/ann:opacity-100 text-muted hover:text-red transition-all p-0.5 flex-shrink-0"
                >
                  <X size={10} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
