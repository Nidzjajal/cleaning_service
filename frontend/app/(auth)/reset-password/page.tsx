'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Lock, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.newPassword.length < 8) return toast.error('New password must be at least 8 characters')
    setLoading(true)
    try {
      const res = await api.put('/auth/reset-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      localStorage.setItem('hl_token', res.data.token)
      localStorage.setItem('hl_user', JSON.stringify(res.data.user))
      setDone(true)
      toast.success('Password updated! Redirecting to dashboard...')
      setTimeout(() => router.push('/provider/dashboard'), 2000)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-display text-2xl font-bold text-dark mb-2">Password Updated!</h2>
          <p className="text-dark/50 mb-6 font-medium">Redirecting you to your dashboard in the next few seconds...</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => router.push('/provider/dashboard')} className="btn-accent px-8">
              Go to Dashboard Now
            </button>
            <p className="text-[10px] text-dark/30">If you are not redirected automatically, click the button above.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-dark mb-2">Set Your Password</h1>
          <p className="text-dark/50 text-sm max-w-sm mx-auto mb-4">
            You've been assigned a temporary password. To keep your account safe, please create a new secure password.
          </p>
          <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 text-center max-w-sm mx-auto">
             <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 italic">
                🛡️ Security Purpose Only
             </p>
             <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                "We take your data security seriously. This mandatory password update is required <b>only once</b> for your initial login to ensure only you have access."
             </p>
          </div>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Temporary / Current Password</label>
              <input id="current-password" type="password" className="input" placeholder="Enter temp password from SMS"
                value={form.currentPassword} onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))} />
            </div>
            <div>
              <label className="label">New Password</label>
              <input id="new-password" type="password" className="input" placeholder="Min. 8 characters"
                value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input id="confirm-new-password" type="password" className="input" placeholder="Re-enter new password"
                value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} />
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs text-amber-700 font-semibold mb-1">Password Requirements:</p>
              <ul className="text-xs text-amber-600 space-y-0.5">
                <li>✓ Minimum 8 characters</li>
                <li>✓ Different from your temporary password</li>
              </ul>
            </div>

            <button type="submit" id="reset-pwd-btn" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Updating...</> : 'Set New Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
