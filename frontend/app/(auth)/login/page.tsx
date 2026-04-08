'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const userStr = localStorage.getItem('hl_user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.role === 'admin') router.push('/admin/dashboard')
        else if (user.role === 'provider') router.push('/provider/dashboard')
        else router.push('/customer/dashboard')
      }
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      await login(form.email, form.password)
      const user = JSON.parse(localStorage.getItem('hl_user') || '{}')
      toast.success(`Welcome back, ${user.name?.split(' ')[0]}!`)
      // Check for redirect from booking flow
      const redirect = typeof window !== 'undefined' ? sessionStorage.getItem('hl_redirect') : null
      if (redirect) {
        sessionStorage.removeItem('hl_redirect')
        router.push(redirect)
      } else if (user.role === 'admin') router.push('/admin/dashboard')
      else if (user.role === 'provider') router.push('/provider/dashboard')
      else router.push('/customer/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-display font-bold text-white text-lg">H</div>
          <span className="font-display font-bold text-white text-2xl">Help<span className="text-accent">Lender</span></span>
        </Link>
        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
            Professional Cleaning,<br /><span className="text-accent">Delivered to Your Door</span>
          </h2>
          <p className="text-white/50 text-lg leading-relaxed mb-10">
            Book vetted professionals in minutes. Live tracking, transparent pricing, and 100% satisfaction guaranteed.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { v: '10,000+', l: 'Happy Customers' },
              { v: '500+', l: 'Vetted Helpers' },
              { v: '4.9★', l: 'Avg Rating' },
              { v: '₹499+', l: 'Starting Price' },
            ].map(s => (
              <div key={s.l} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="font-display text-2xl font-bold text-white">{s.v}</div>
                <div className="text-white/40 text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/20 text-sm relative z-10">© 2024 HelpLender. All Rights Reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-dark flex items-center justify-center font-display font-bold text-white text-base">H</div>
              <span className="font-display font-bold text-dark text-xl">Help<span className="text-accent">Lender</span></span>
            </Link>
          </div>

          <h1 className="font-display text-3xl font-bold text-dark mb-2">Welcome back</h1>
          <p className="text-dark/50 mb-8">Sign in to your HelpLender account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
                <input type="email" id="email" placeholder="you@example.com" className="input pl-10"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link href="/forgot-password" id="forgot-password" className="text-xs text-accent font-medium hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
                <input type={showPass ? 'text' : 'password'} id="password" placeholder="••••••••" className="input pl-10 pr-10"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark/30 hover:text-dark">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" id="login-btn" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-dark/50">
              Don't have an account?{' '}
              <Link href="/signup" className="text-accent font-semibold hover:underline">Create one free</Link>
            </p>
            <p className="text-center text-sm text-dark/50 mt-2">
              Want to earn as a helper?{' '}
              <Link href="/become-a-helper" className="text-accent font-semibold hover:underline">Apply here</Link>
            </p>
          </div>


        </div>
      </div>
    </div>
  )
}
