'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Layers } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace('/boards')
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim().toLowerCase(), password)
      router.push('/boards')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2.5 mb-12"
      >
        <div className="w-5 h-5 rounded flex items-center justify-center bg-accent">
          <Layers size={11} color="#0a0a0b" strokeWidth={2.5} />
        </div>
        <span className="font-display font-extrabold text-text tracking-tight text-xl">SOUNDBOARD</span>
      </button>

      <div className="w-full max-w-sm">
        <h1 className="font-display font-bold text-text text-2xl mb-1">Bienvenido de vuelta</h1>
        <p className="font-body text-[13px] text-dim mb-8">Iniciá sesión en tu workspace</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">EMAIL</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-panel border border-border rounded px-3 py-2.5 text-sm font-body text-text placeholder:text-muted outline-none focus:border-accent/60 transition-colors"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">CONTRASEÑA</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-panel border border-border rounded px-3 py-2.5 text-sm font-body text-text placeholder:text-muted outline-none focus:border-accent/60 transition-colors"
            />
          </div>

          {error && <p className="font-body text-[12px] text-red">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded border border-accent/40 bg-accent/10 py-2.5 font-mono text-[11px] font-bold tracking-widest text-accent transition-all hover:bg-accent/20 disabled:opacity-50"
          >
            {submitting ? 'INICIANDO...' : 'INICIAR SESIÓN'}
          </button>
        </form>

        <p className="font-body text-[12px] text-dim text-center mt-6">
          ¿No tenés cuenta?{' '}
          <button onClick={() => router.push('/register')} className="text-accent hover:underline">
            Crear cuenta gratis
          </button>
        </p>
      </div>
    </div>
  )
}
