'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  User, Shield, Bell, Settings, Layers, IndianRupee, 
  MapPin, Clock, FileText, Users, Globe, Lock, Info, 
  LogOut, Trash2, Search, CheckCircle, ChevronRight, Save, Loader2, AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import AdminSidebar from '@/components/layout/AdminSidebar'

type SettingsTab = 'PERSONAL' | 'BUSINESS' | 'TEAM' | 'APP'

export default function AdminSettingsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SettingsTab>('PERSONAL')
  const [loading, setLoading] = useState(false)

  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  })

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/')
  }, [user])

  const handleUpdatePersonal = async () => {
    setLoading(true)
    try {
      await api.put('/admin/profile', personalInfo)
      toast.success('Admin profile updated')
    } catch { toast.error('Failed to update profile') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-10 gap-8">
          <div className="flex-1 max-w-lg relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30 focus-within:text-accent" />
            <input 
              type="text" 
              placeholder="System settings search..." 
              className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent shadow-sm"
            />
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
                <div className="text-right">
                   <p className="text-xs font-bold text-dark leading-none mb-1">{user?.name}</p>
                   <p className="text-[10px] font-bold text-accent uppercase tracking-widest leading-none">Super Admin Hub ✅</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-dark text-white flex items-center justify-center font-bold font-display shadow-lg shadow-dark/20">
                   {user?.name?.[0]}
                </div>
             </div>
             <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-dark/40 hover:text-accent relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full border-2 border-white" />
             </button>
          </div>
        </header>

        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold text-dark mb-1">Configuration Hub</h1>
          <p className="text-dark/40 text-sm">Fine-tune platform protocols, business rules, and administrative security.</p>
        </div>

        {/* Setting Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-surface rounded-[2rem] border border-gray-100 mb-10 w-fit">
           <button onClick={() => setActiveTab('PERSONAL')} className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'PERSONAL' ? 'bg-white text-dark shadow-xl' : 'text-dark/30 hover:text-dark'}`}>
              <User size={14} /> Personal
           </button>
           <button onClick={() => setActiveTab('BUSINESS')} className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'BUSINESS' ? 'bg-white text-dark shadow-xl' : 'text-dark/30 hover:text-dark'}`}>
              <Layers size={14} /> Business Core
           </button>
           <button onClick={() => setActiveTab('TEAM')} className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'TEAM' ? 'bg-white text-dark shadow-xl' : 'text-dark/30 hover:text-dark'}`}>
              <Users size={14} /> Management
           </button>
           <button onClick={() => setActiveTab('APP')} className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'APP' ? 'bg-white text-dark shadow-xl' : 'text-dark/30 hover:text-dark'}`}>
              <Globe size={14} /> Global
           </button>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2">
              {activeTab === 'PERSONAL' && (
                 <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 space-y-10 animate-fade-in">
                    <div>
                       <h3 className="font-display font-bold text-xl text-dark mb-6">Account Settings</h3>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Display Name</label>
                             <input value={personalInfo.name} onChange={e => setPersonalInfo({...personalInfo, name: e.target.value})} className="w-full bg-surface border-none rounded-2xl p-4 text-sm font-bold text-dark focus:ring-accent/10" />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Official Email</label>
                             <input value={personalInfo.email} disabled className="w-full bg-surface/50 border-none rounded-2xl p-4 text-sm font-bold text-dark/30 cursor-not-allowed" />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Phone Line</label>
                             <input value={personalInfo.phone} onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} className="w-full bg-surface border-none rounded-2xl p-4 text-sm font-bold text-dark focus:ring-accent/10" />
                          </div>
                       </div>
                    </div>

                    <div className="pt-10 border-t border-gray-100">
                       <h3 className="font-display font-bold text-xl text-dark mb-6 flex items-center gap-2"><Lock size={20} className="text-accent" /> System Security</h3>
                       <p className="text-xs text-dark/40 italic">Two-Factor Authentication is currently managed at the individual provider and customer levels for maximum platform security.</p>
                       <button className="mt-4 px-8 py-4 bg-dark/5 text-dark/40 rounded-2xl font-bold uppercase tracking-widest text-[10px] cursor-not-allowed">Reset Password via Super-Email</button>
                    </div>


                    <div className="pt-10 border-t border-gray-100">
                        <button onClick={handleUpdatePersonal} disabled={loading} className="px-10 py-5 bg-accent text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl shadow-accent/20">
                           {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save Administrative Changes
                        </button>
                    </div>
                 </div>
              )}

              {activeTab === 'BUSINESS' && (
                 <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 space-y-10 animate-fade-in">
                    <div>
                        <h3 className="font-display font-bold text-xl text-dark mb-4">Pricing & Revenue Model</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-6 bg-surface rounded-3xl border border-gray-100">
                              <p className="text-[10px] font-bold text-dark/30 uppercase tracking-widest mb-1">Commission Rate (%)</p>
                              <div className="flex items-center gap-2">
                                 <input type="number" defaultValue={20} className="bg-transparent border-none p-0 text-3xl font-display font-bold text-dark focus:ring-0 w-20" />
                                 <span className="text-xl font-bold text-dark/30">%</span>
                              </div>
                           </div>
                           <div className="p-6 bg-surface rounded-3xl border border-gray-100">
                              <p className="text-[10px] font-bold text-dark/30 uppercase tracking-widest mb-1">Currency Code</p>
                              <p className="text-3xl font-display font-bold text-dark">INR (₹)</p>
                           </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-gray-100">
                       <h3 className="font-display font-bold text-xl text-dark mb-6 flex items-center gap-2"><FileText size={20} className="text-accent" /> Invoicing & Tax</h3>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Local Tax (GST/VAT)</label>
                             <input type="number" defaultValue={18} className="w-full bg-surface border-none rounded-2xl p-4 text-sm font-bold text-dark" />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Receipt Logo URL</label>
                             <input placeholder="https://..." className="w-full bg-surface border-none rounded-2xl p-4 text-sm font-bold text-dark" />
                          </div>
                       </div>
                    </div>
                 </div>
              )}

              {activeTab === 'TEAM' && (
                 <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 animate-fade-in">
                    <h3 className="font-display font-bold text-xl text-dark mb-8">Admin Role Permissions</h3>
                    <div className="space-y-3">
                       {[
                          { r: 'Super Admin', d: 'Full control over finance, users, and platform settings.', a: true },
                          { r: 'Finance Lead', d: 'Access to revenue reports, transactions, and payouts.', a: false },
                          { r: 'Operations Mgr', d: 'Manage providers, bookings, and customer support.', a: false },
                       ].map(perm => (
                          <div key={perm.r} className="flex items-center justify-between p-5 bg-surface rounded-2xl border border-gray-100">
                             <div>
                                <p className="font-bold text-dark text-sm">{perm.r}</p>
                                <p className="text-xs text-dark/30">{perm.d}</p>
                             </div>
                             <div className={`p-1.5 rounded-full ${perm.a ? 'bg-success text-white' : 'bg-dark/10 text-dark/20'}`}><CheckCircle size={14} /></div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}

              {activeTab === 'APP' && (
                 <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 space-y-10 animate-fade-in">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">System Language</label>
                          <select className="w-full bg-surface border-none rounded-2xl p-4 text-sm font-bold text-dark"><option>English (US)</option><option>Hindi</option></select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Timezone Sync</label>
                          <select className="w-full bg-surface border-none rounded-2xl p-4 text-sm font-bold text-dark"><option>(GMT+05:30) Mumbai, Kolkata</option></select>
                       </div>
                    </div>
                    <div className="pt-10 border-t border-gray-100 flex gap-4">
                       <button className="flex-1 py-10 bg-surface rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center gap-3 hover:border-accent group transition-all">
                          <FileText className="text-dark/20 group-hover:text-accent" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Privacy Policy</span>
                       </button>
                       <button className="flex-1 py-10 bg-surface rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center gap-3 hover:border-accent group transition-all">
                          <Shield className="text-dark/20 group-hover:text-accent" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Terms of Service</span>
                       </button>
                    </div>
                 </div>
              )}
           </div>

           {/* Sidebar Actions */}
           <div className="space-y-8">
              <div className="bg-dark rounded-[3rem] p-10 text-white relative overflow-hidden group">
                 <div className="absolute right-0 top-0 w-24 h-24 bg-accent/20 blur-3xl group-hover:scale-150 transition-all duration-700" />
                 <h3 className="font-display font-bold text-xl mb-4 relative z-10">Quick Support</h3>
                 <p className="text-white/40 text-xs mb-8 relative z-10">Need a specialized architectural change? Contact our core development team.</p>
                 <button className="w-full py-4 bg-white/10 hover:bg-white hover:text-dark rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">Contact Developer</button>
              </div>

              <div className="bg-red-50/50 rounded-[3rem] p-10 border border-red-100">
                 <h3 className="font-display font-bold text-xl text-red-900 mb-6 flex items-center gap-2"><AlertTriangle size={20} /> Danger Zone</h3>
                 <div className="space-y-3">
                    <button onClick={() => logout()} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all font-bold text-xs uppercase tracking-widest group">
                       Logout System <LogOut size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all font-bold text-xs uppercase tracking-widest group">
                       Delete Admin Account <Trash2 size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  )
}
