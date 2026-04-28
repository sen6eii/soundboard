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

  useEffect(() => {
    if (!loading && user) router.replace('/boards')
  }, [user, loading, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register(email.trim().toLowerCase(), name.trim())
    router.push('/boards')
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
        <h1 className="font-display font-bold text-text text-2xl mb-1">Create your workspace</h1>
        <p className="font-body text-[13px] text-dim mb-8">Free, no credit card needed</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
              YOUR NAME
            </label>
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
            <label className="font-mono text-[10px] text-muted tracking-widest block mb-1.5">
              EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-panel border border-border rounded px-3 py-2.5 text-sm font-body text-text placeholder:text-muted outline-none focus:border-accent/60 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded border border-accent/40 bg-accent/10 py-2.5 font-mono text-[11px] font-bold tracking-widest text-accent transition-all hover:bg-accent/20"
          >
            CREATE ACCOUNT
          </button>
        </form>

        <p className="font-body text-[12px] text-dim text-center mt-6">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-accent hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
