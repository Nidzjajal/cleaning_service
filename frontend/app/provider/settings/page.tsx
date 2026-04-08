'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  User, Shield, Lock, Bell, Smartphone, Key, RefreshCcw, 
  ChevronRight, Save, Loader2, Search, CheckCircle, Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import ProviderSidebar from '@/components/layout/ProviderSidebar'

export default function ProviderSettingsPage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeSubMenu, setActiveSubMenu] = useState<'PROFILE' | 'SECURITY' | 'NOTIFS'>('PROFILE')

  // Personal Info State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.providerProfile?.bio || '',
    hourlyRate: user?.providerProfile?.hourlyRate || 0
  })

  // 2FA State
  const [tfaEnabled, setTfaEnabled] = useState(user?.twoFactorEnabled || false)
  const [tfaMethod, setTfaMethod] = useState<'SMS' | 'APP'>(user?.twoFactorMethod as 'SMS' | 'APP' || 'SMS')

  useEffect(() => {
    if (user && user.role !== 'provider') router.push('/admin/dashboard')
  }, [user])

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const res = await api.put('/providers/profile', formData)
      updateUser(res.data.user)
      toast.success('Professional profile updated')
    } catch { toast.error('Update failed') }
    finally { setLoading(false) }
  }

  const handleToggleTFA = async () => {
    setLoading(true)
    try {
      const nextValue = !tfaEnabled
      const res = await api.put('/providers/2fa/toggle', { enabled: nextValue, method: tfaMethod })
      
      // Update global context so it persists on refresh
      updateUser(res.data.user)
      setTfaEnabled(nextValue)
      
      toast.success(`2FA ${nextValue ? 'Enabled 🟢' : 'Disabled 🔴'}`)
    } catch { toast.error('Failed to update 2FA status') }

    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      <ProviderSidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="flex items-center justify-between mb-12">
            <div>
               <h1 className="text-4xl font-display font-bold text-dark mb-1">Provider Preferences</h1>
               <p className="text-dark/40 text-sm italic">Manage your professional identity, security protocols, and reach.</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right">
                  <p className="text-xs font-bold text-dark">{user?.name}</p>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest leading-none mt-0.5">Professional Grade ✅</p>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-accent/20">
                  {user?.name?.[0]}
               </div>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Setting Navigation */}
           <div className="lg:col-span-1 space-y-2">
              <button onClick={() => setActiveSubMenu('PROFILE')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeSubMenu === 'PROFILE' ? 'bg-dark text-white shadow-xl' : 'text-dark/40 hover:bg-surface'}`}>
                 <User size={16} /> My Profile
              </button>
              <button onClick={() => setActiveSubMenu('SECURITY')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeSubMenu === 'SECURITY' ? 'bg-dark text-white shadow-xl' : 'text-dark/40 hover:bg-surface'}`}>
                 <Shield size={16} /> Security & Login
              </button>
              <button onClick={() => setActiveSubMenu('NOTIFS')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeSubMenu === 'NOTIFS' ? 'bg-dark text-white shadow-xl' : 'text-dark/40 hover:bg-surface'}`}>
                 <Bell size={16} /> Notifications
              </button>
           </div>

           {/* Content Area */}
           <div className="lg:col-span-3">
              {activeSubMenu === 'PROFILE' && (
                 <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 space-y-10 shadow-sm animate-fade-in">
                    <div className="space-y-6">
                       <h3 className="font-display font-bold text-xl text-dark">Identity Details</h3>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-bold uppercase tracking-widest text-dark/30 ml-2">Public Name</label>
                             <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface border-none rounded-2xl p-4 text-sm font-semibold text-dark focus:ring-accent/10" />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-bold uppercase tracking-widest text-dark/30 ml-2">Contact Link</label>
                             <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-surface border-none rounded-2xl p-4 text-sm font-semibold text-dark focus:ring-accent/10" />
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-dark/30 ml-2">Short Bio / Pitch</label>
                          <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-surface border-none rounded-2xl p-6 text-sm italic text-dark/60 focus:ring-accent/10 min-h-[120px]" placeholder="Tell clients why you're the best..." />
                       </div>
                    </div>
                    <button onClick={handleUpdateProfile} disabled={loading} className="px-10 py-5 bg-accent text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl shadow-accent/20">
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Update Professional Identity
                    </button>
                 </div>
              )}

              {activeSubMenu === 'SECURITY' && (
                 <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 space-y-12 shadow-sm animate-fade-in">
                    {/* Header */}
                    <div>
                       <h3 className="font-display font-bold text-xl text-dark mb-2">Two-Factor Authentication</h3>
                       <p className="text-dark/40 text-sm italic">Add an extra layer of security to your professional account.</p>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between p-8 bg-surface rounded-[2rem] border border-gray-100 group hover:border-accent transition-all">
                       <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${tfaEnabled ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-dark/10 text-dark/30'}`}>
                             <Lock size={24} />
                          </div>
                          <div>
                             <p className="font-display font-bold text-lg text-dark">Status: {tfaEnabled ? 'Enabled' : 'Disabled'}</p>
                             <p className="text-xs text-dark/40 mt-1 font-semibold uppercase tracking-widest">Secure access protocol</p>
                          </div>
                       </div>
                       <button 
                          onClick={handleToggleTFA}
                          className={`w-16 h-8 rounded-full p-1 transition-all duration-300 relative ${tfaEnabled ? 'bg-green-600' : 'bg-dark/20'}`}
                       >
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${tfaEnabled ? 'translate-x-8' : 'translate-x-0'}`} />
                       </button>
                    </div>

                    {/* Authentication Methods */}
                    {tfaEnabled && (
                       <div className="space-y-6 animate-fade-in">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Authentication Method</p>
                          <div className="grid grid-cols-2 gap-4">
                             <button onClick={() => setTfaMethod('SMS')} className={`p-6 rounded-3xl border text-left transition-all relative group ${tfaMethod === 'SMS' ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-gray-100 hover:border-dark/20'}`}>
                                <div className={`p-2 rounded-lg items-center justify-center w-fit mb-4 ${tfaMethod === 'SMS' ? 'bg-accent text-white' : 'bg-surface text-dark/30'}`}><Smartphone size={20} /></div>
                                <h4 className="font-bold text-dark mb-1">SMS Verification</h4>
                                <p className="text-[10px] text-dark/40 leading-relaxed font-semibold uppercase tracking-widest">Code via text message</p>
                                {tfaMethod === 'SMS' && <CheckCircle className="absolute top-6 right-6 text-accent" size={16} />}
                             </button>
                             <button onClick={() => setTfaMethod('APP')} className={`p-6 rounded-3xl border text-left transition-all relative group ${tfaMethod === 'APP' ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-gray-100 hover:border-dark/20'}`}>
                                <div className={`p-2 rounded-lg items-center justify-center w-fit mb-4 ${tfaMethod === 'APP' ? 'bg-accent text-white' : 'bg-surface text-dark/30'}`}><Key size={20} /></div>
                                <h4 className="font-bold text-dark mb-1">Authenticator App</h4>
                                <p className="text-[10px] text-dark/40 leading-relaxed font-semibold uppercase tracking-widest">Google / Authy Security</p>
                                {tfaMethod === 'APP' && <CheckCircle className="absolute top-6 right-6 text-accent" size={16} />}
                             </button>
                          </div>
                          
                          {/* Backup Codes */}
                          <div className="pt-8 border-t border-gray-100">
                             <h4 className="font-display font-bold text-lg text-dark mb-2">Emergency Access</h4>
                             <p className="text-xs text-dark/40 mb-6">If you lose your phone, you can use backup codes to access your account.</p>
                             <button className="flex items-center gap-2 px-8 py-4 bg-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-dark/20">
                                <RefreshCcw size={16} /> Generate Backup Codes
                             </button>
                          </div>
                       </div>
                    )}
                    
                    <p className="text-xs text-dark/30 flex items-center gap-2"><Info size={14} className="text-accent" /> Security changes take effect on your next session.</p>
                 </div>
              )}

              {activeSubMenu === 'NOTIFS' && (
                 <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm animate-fade-in">
                    <h3 className="font-display font-bold text-xl text-dark mb-8">Reach Protocols</h3>
                    <div className="space-y-4">
                       {[
                          { l: 'SMS Booking Alerts', d: 'Get a text message when a new job is live.', v: true },
                          { l: 'Marketing Emails', d: 'Updates on platform promotions and growth hacks.', v: false },
                          { l: 'In-app Chat Sounds', d: 'Play sound for new client messages.', v: true },
                       ].map(notif => (
                          <div key={notif.l} className="flex items-center justify-between p-6 bg-surface rounded-2xl border border-gray-100">
                             <div>
                                <p className="font-bold text-dark text-sm">{notif.l}</p>
                                <p className="text-xs text-dark/30 mt-0.5">{notif.d}</p>
                             </div>
                             <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${notif.v ? 'bg-accent' : 'bg-dark/10'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full transition-all ${notif.v ? 'translate-x-6' : 'translate-x-0'}`} />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
           </div>
        </div>
      </main>
    </div>
  )
}
