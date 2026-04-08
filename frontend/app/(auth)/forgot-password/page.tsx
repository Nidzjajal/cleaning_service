'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email address')
    
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setDone(true)
      toast.success('Reset link sent!')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-dark flex items-center justify-center font-display font-bold text-white text-base">H</div>
            <span className="font-display font-bold text-dark text-xl">Help<span className="text-accent">Lender</span></span>
          </Link>
          
          {done ? (
            <div className="animate-fade-in">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h1 className="font-display text-2xl font-bold text-dark mb-2">Check your email</h1>
              <p className="text-dark/50 mb-8 text-sm leading-relaxed">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
              </p>
              <Link href="/login" className="btn-primary w-full py-3.5">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <div className="animate-fade-in">
              <h1 className="font-display text-2xl font-bold text-dark mb-2">Forgot password?</h1>
              <p className="text-dark/50 mb-8 text-sm leading-relaxed">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div>
                  <label className="label">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
                    <input 
                      type="email" 
                      placeholder="you@example.com" 
                      className="input pl-10"
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 group">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending Link...</>
                  ) : (
                    <>Send Reset Link</>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-dark/60 hover:text-accent transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
