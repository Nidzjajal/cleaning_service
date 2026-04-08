'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
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
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      // Basic Indian phone sanitization (strip symbols, leading 0 or +91)
      const cleanPhone = form.phone.replace(/\D/g, '').slice(-10)
      
      const res = await api.post('/auth/signup', {
        name: form.name, email: form.email, phone: cleanPhone,
        password: form.password, role: 'customer',
      })
      localStorage.setItem('hl_token', res.data.token)
      localStorage.setItem('hl_user', JSON.stringify(res.data.user))
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      toast.success('Account created! Welcome to HelpLender 🎉')
      router.push('/customer/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { id: 'name', label: 'Full Name', type: 'text', icon: <User className="w-4 h-4" />, placeholder: 'Priya Sharma', key: 'name' },
    { id: 'email', label: 'Email Address', type: 'email', icon: <Mail className="w-4 h-4" />, placeholder: 'you@example.com', key: 'email' },
    { id: 'phone', label: 'Phone Number', type: 'tel', icon: <Phone className="w-4 h-4" />, placeholder: '9876543210', key: 'phone' },
  ]

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-dark flex items-center justify-center font-display font-bold text-white text-base">H</div>
            <span className="font-display font-bold text-dark text-xl">Help<span className="text-accent">Lender</span></span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-dark mb-2">Create your account</h1>
          <p className="text-dark/50">Join thousands of happy customers</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map(f => (
              <div key={f.id}>
                <label htmlFor={f.id} className="label">{f.label}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark/30">{f.icon}</span>
                  <input id={f.id} type={f.type} placeholder={f.placeholder} className="input pl-10"
                    value={(form as any)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              </div>
            ))}

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
                <input id="password" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" className="input pl-10 pr-10"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark/30 hover:text-dark">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
                <input id="confirm-password" type="password" placeholder="Re-enter password" className="input pl-10"
                  value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} />
              </div>
            </div>

            <p className="text-xs text-dark/40">
              By signing up, you agree to our <Link href="#" className="text-accent hover:underline">Terms of Service</Link> and{' '}
              <Link href="#" className="text-accent hover:underline">Privacy Policy</Link>.
            </p>

            <button type="submit" id="signup-btn" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating Account...</> : 'Create Free Account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm text-dark/50">
          Already have an account?{' '}
          <Link href="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
        </p>
        <p className="text-center mt-2 text-sm text-dark/50">
          Want to join as a helper?{' '}
          <Link href="/become-a-helper" className="text-accent font-semibold hover:underline">Apply here →</Link>
        </p>
      </div>
    </div>
  )
}
