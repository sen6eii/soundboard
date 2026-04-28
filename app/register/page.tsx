'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Layers } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { user, loading, register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace('/boards')
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(email.trim().toLowerCase(), name.trim(), password)
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  if (done) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 text-center">
        <div className="w-10 h-10 rounded-full border border-accent/40 bg-accent/10 flex items-center justify-center mb-6">
          <span className="text-accent text-lg">✓</span>
        </div>
        <h2 className="font-display font-bold text-text text-xl mb-2">Revisá tu email</h2>
        <p className="font-body text-[13px] text-dim max-w-xs">
          Te enviamos un link de confirmación a <strong className="text-text">{email}</strong>.
          Confirmá tu cuenta y luego iniciá sesión.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-8 font-mono text-[11px] text-accent hover:underline tracking-widest"
        >
          IR AL LOGIN
        </button>
      </div>
    )
  }

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
        <h1 className="font-display font-bold text-text text-2xl mb-1">Creá tu workspace</h1>
        <p className="font-body text-[13px] text-dim mb-8">Gratis, sin tarjeta de crédito</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">TU NOMBRE</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre"
              className="w-full bg-panel border border-border rounded px-3 py-2.5 text-sm font-body text-text placeholder:text-muted outline-none focus:border-accent/60 transition-colors"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">EMAIL</label>
            <input
              type="email"
              required
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
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-panel border border-border rounded px-3 py-2.5 text-sm font-body text-text placeholder:text-muted outline-none focus:border-accent/60 transition-colors"
            />
          </div>

          {error && <p className="font-body text-[12px] text-red">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded border border-accent/40 bg-accent/10 py-2.5 font-mono text-[11px] font-bold tracking-widest text-accent transition-all hover:bg-accent/20 disabled:opacity-50"
          >
            {submitting ? 'CREANDO...' : 'CREAR CUENTA'}
          </button>
        </form>

        <p className="font-body text-[12px] text-dim text-center mt-6">
          ¿Ya tenés cuenta?{' '}
          <button onClick={() => router.push('/login')} className="text-accent hover:underline">
            Iniciá sesión
          </button>
        </p>
      </div>
    </div>
  )
}
