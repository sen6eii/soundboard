'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Layers, Music2, Link2, Tag } from 'lucide-react'

const FEATURES = [
  {
    icon: Music2,
    title: 'Referencias de audio',
    desc: 'Subí MP3, WAV o FLAC. Reproducción con visualización de forma de onda y anotaciones por timestamp.',
  },
  {
    icon: Link2,
    title: 'YouTube y SoundCloud',
    desc: 'Pegá un link. El embed aparece automáticamente para escuchar sin salir de tu board.',
  },
  {
    icon: Tag,
    title: 'Tags de mood',
    desc: 'Etiquetá cada referencia: DARK, CHILL, ETHEREAL, RAW, GROOVY… filtrá por mood con un clic.',
  },
]

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) router.replace('/boards')
  }, [user, loading, router])

  if (loading) return null

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded flex items-center justify-center bg-accent">
              <Layers size={11} color="#0a0a0b" strokeWidth={2.5} />
            </div>
            <span className="font-display font-extrabold text-text tracking-tight text-xl">SOUNDBOARD</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="font-mono text-[11px] text-dim hover:text-text transition-colors tracking-widest"
            >
              INICIAR SESIÓN
            </button>
            <button
              onClick={() => router.push('/register')}
              className="rounded border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-[11px] font-bold tracking-widest text-accent transition-all hover:bg-accent/20"
            >
              COMENZAR
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-2xl w-full text-center">
          <p className="font-mono text-[10px] text-accent tracking-[0.25em] mb-5">MOODBOARDS MUSICALES PARA PRODUCTORES</p>

          <h1 className="font-display font-extrabold text-text text-4xl sm:text-5xl leading-tight tracking-tight mb-5">
            Tu biblioteca de referencias<br />sonoras, organizada.
          </h1>

          <p className="font-body text-dim text-base leading-relaxed max-w-md mx-auto mb-10">
            Reuní archivos de audio, links de YouTube y SoundCloud en boards por proyecto.
            Etiquetá por mood, anotá con timestamps y encontrá tu sonido más rápido.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 mb-16">
            <button
              onClick={() => router.push('/register')}
              className="rounded border border-accent/40 bg-accent/10 px-6 py-3 font-mono text-[11px] font-bold tracking-widest text-accent transition-all hover:bg-accent/20"
            >
              CREAR CUENTA GRATIS
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 font-mono text-[11px] text-dim hover:text-text transition-colors tracking-widest"
            >
              INICIAR SESIÓN
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-lg border border-border bg-panel p-5">
                <div className="w-7 h-7 rounded flex items-center justify-center bg-accent/10 mb-3">
                  <Icon size={14} className="text-accent" />
                </div>
                <h3 className="font-display font-bold text-text text-sm mb-1">{title}</h3>
                <p className="font-body text-[12px] text-dim leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-5">
        <p className="text-center font-mono text-[10px] text-muted tracking-widest">
          SOUNDBOARD — TUS DATOS SE GUARDAN LOCALMENTE EN TU NAVEGADOR
        </p>
      </footer>
    </div>
  )
}
