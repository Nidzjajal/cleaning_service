'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import CustomerDashboardLayout from '@/components/layout/CustomerDashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { 
  User, Mail, Phone, Shield, Lock, Bell, 
  CreditCard, Smartphone, CheckCircle, ChevronRight,
  Eye, EyeOff, Save, Trash2, Key
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CustomerSettingsPage() {
  const { user, updateUser, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    email: ''
  })
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      })
      setTwoFactorEnabled(user.twoFactorEnabled || false)
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.put('/auth/me/profile', profileData)
      updateUser(res.data.user)
      toast.success('Profile updated successfully')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle2FA = async () => {
    const newState = !twoFactorEnabled
    try {
      await api.put('/auth/2fa/toggle', { enabled: newState })
      setTwoFactorEnabled(newState)
      if (user) {
        updateUser({ ...user, twoFactorEnabled: newState } as any)
      }
      toast.success(`Two-factor authentication ${newState ? 'enabled' : 'disabled'}`)
    } catch (err) {
      toast.error('Failed to update security settings')
    }
  }

  if (authLoading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display font-black text-3xl text-dark mb-2">Account Settings</h1>
        <p className="text-dark/40">Manage your personal information and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Tabs */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-dark text-white font-bold shadow-button transition-all">
            <User className="w-5 h-5 text-accent" />
            Profile Details
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-dark/50 font-bold hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
            <Shield className="w-5 h-5" />
            Security & Login
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-dark/50 font-bold hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
            <Bell className="w-5 h-5" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-dark/50 font-bold hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
            <CreditCard className="w-5 h-5" />
            Saved Payments
          </button>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <div className="card p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center font-display font-black text-2xl shadow-xl">
                {user?.name?.[0]}
              </div>
              <div>
                <h3 className="font-bold text-dark text-lg">Public Profile</h3>
                <p className="text-sm text-dark/40">This information will be shown on your bookings.</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/20" />
                    <input 
                      type="text" 
                      value={profileData.name}
                      onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))}
                      className="input pl-12" 
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/20" />
                    <input 
                      type="tel" 
                      value={profileData.phone}
                      onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))}
                      className="input pl-12" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Email Address</label>
                <div className="relative opacity-60">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/20" />
                  <input 
                    type="email" 
                    value={profileData.email} 
                    disabled
                    className="input pl-12 bg-surface cursor-not-allowed" 
                  />
                </div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-dark/30 mt-2">Email cannot be changed manually</p>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={loading} className="btn-accent px-10 shadow-xl group">
                  {loading ? 'Saving...' : (
                    <>
                      <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security Section */}
          <div className="card p-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-dark">Security & 2FA</h3>
                  <p className="text-xs text-dark/40">Protect your account from unauthorized access.</p>
                </div>
              </div>
              <div 
                onClick={handleToggle2FA}
                className={`w-14 h-7 rounded-full cursor-pointer transition-all relative ${twoFactorEnabled ? 'bg-accent shadow-glow' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${twoFactorEnabled ? 'right-1' : 'left-1'}`} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-surface/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-accent shadow-sm border border-gray-50 shrink-0">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-bold text-dark mb-1">Two-Factor Authentication</h4>
                  <p className="text-xs text-dark/50 leading-relaxed">
                    Secure your account by requiring a code sent to your mobile phone via SMS whenever you sign in from a new device.
                  </p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                  ${twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {twoFactorEnabled ? 'Recommended' : 'Disabled'}
                </div>
              </div>

              <div className="pt-6">
                <h4 className="font-bold text-dark mb-4 flex items-center gap-2">
                  <Key className="w-4 h-4 text-accent" />
                  Change Password
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <input type="password" placeholder="Current Password" className="input" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="password" placeholder="New Password" className="input" />
                    <input type="password" placeholder="Confirm New Password" className="input" />
                  </div>
                  <div className="flex justify-start">
                    <button className="btn-ghost btn-sm text-accent">Update Password</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="bg-red-50 rounded-3xl p-8 border border-red-100">
             <h3 className="font-bold text-red-700 mb-2">Danger Zone</h3>
             <p className="text-sm text-red-600/70 mb-6">Permanently delete your account and all associated data. This action cannot be undone.</p>
             <button className="bg-white text-red-600 font-bold text-sm px-6 py-3 rounded-xl border border-red-200 hover:bg-red-600 hover:text-white transition-all flex items-center gap-2">
               <Trash2 className="w-4 h-4" />
               Delete Account
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}
