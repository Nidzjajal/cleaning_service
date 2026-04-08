'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Bell, Send, Users, Smartphone, Globe, Search,
  CheckCircle, Plus, Info, MessageSquare, Trash2, Clock,
  ChevronRight, Save, Loader2, AlertTriangle, Layers, User
} from 'lucide-react'

import toast from 'react-hot-toast'
import AdminSidebar from '@/components/layout/AdminSidebar'

type TargetGroup = 'ALL' | 'CUSTOMERS' | 'PROVIDERS'

export default function AdminNotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [target, setTarget] = useState<TargetGroup>('ALL')
  const [message, setMessage] = useState({ title: '', body: '', link: '' })
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/')
    fetchHistory()
  }, [user])

  const fetchHistory = async () => {
    try {
      // Mock history fetch or actual if backend exists
      // const res = await api.get('/admin/notifications/history')
      // setHistory(res.data.history)
    } catch { toast.error('Failed to load notification history') }
  }

  const handleSendNotification = async () => {
    if (!message.title || !message.body) return toast.error('Title and body are required')
    setLoading(true)
    try {
      await api.post('/admin/notifications/send', { ...message, target })
      toast.success('Broadcast sent successfully')
      setMessage({ title: '', body: '', link: '' })
      fetchHistory()
    } catch { toast.error('Broadcast failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12 gap-8">
          <div className="flex-1 max-w-lg relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30 focus-within:text-accent" />
            <input 
              type="text" 
              placeholder="Search past broadcasts..." 
              className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent shadow-sm transition-all"
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
             <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-dark/40 hover:text-accent transition-colors">
                <Bell className="w-5 h-5" />
             </button>
          </div>
        </header>

        <div className="mb-12">
          <h1 className="font-display text-4xl font-bold text-dark mb-1">Global Notification Engine</h1>
          <p className="text-dark/40 text-sm italic">Direct-to-screen communication layer for the entire HelpLender ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Composer */}
           <div className="lg:col-span-2">
              <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 space-y-10 animate-fade-in relative overflow-hidden group">
                 <div className="absolute right-0 top-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none"><Send size={150} /></div>
                 
                 <div className="relative z-10 space-y-8">
                    <div>
                       <h3 className="text-xl font-display font-bold text-dark mb-6">Target Audience</h3>
                       <div className="grid grid-cols-3 gap-4">
                          {[
                             { id: 'ALL', label: 'All Users', icon: <Globe size={18} /> },
                             { id: 'PROVIDERS', label: 'Providers', icon: <Smartphone size={18} /> },
                             { id: 'CUSTOMERS', label: 'Customers', icon: <User size={18} /> },
                          ].map(t => (
                             <button 
                                key={t.id} 
                                onClick={() => setTarget(t.id as TargetGroup)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${target === t.id ? 'bg-dark text-white shadow-xl translate-y-[-2px]' : 'bg-surface text-dark/30 hover:text-dark hover:bg-white border border-gray-50'}`}
                             >
                                <span className={target === t.id ? 'text-accent' : 'text-dark/20'}>{t.icon}</span>
                                {t.label}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-xl font-display font-bold text-dark">Message Protocol</h3>
                       <div className="space-y-4">
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Broadcast Headline</label>
                             <input 
                                value={message.title}
                                onChange={e => setMessage({...message, title: e.target.value})}
                                placeholder="E.g., Platform Maintenance Update"
                                className="w-full bg-surface border-none rounded-2xl p-4 text-sm font-bold text-dark focus:ring-accent/10 focus:bg-white focus:ring-1 transition-all"
                             />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Message Body</label>
                             <textarea 
                                value={message.body}
                                onChange={e => setMessage({...message, body: e.target.value})}
                                placeholder="Details about the broadcast message..."
                                className="w-full bg-surface border-none rounded-2xl p-6 text-sm italic text-dark/60 focus:ring-accent/10 focus:bg-white focus:ring-1 transition-all min-h-[160px]"
                             />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Actionable Link (Optional)</label>
                             <input 
                                value={message.link}
                                onChange={e => setMessage({...message, link: e.target.value})}
                                placeholder="https://helplender.com/updates/..."
                                className="w-full bg-surface border-none rounded-2xl p-4 text-sm font-bold text-dark focus:ring-accent/10 focus:bg-white focus:ring-1 transition-all"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="pt-6">
                       <button onClick={handleSendNotification} disabled={loading} className="w-full py-6 bg-accent text-white rounded-[2rem] font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all hover:bg-dark group shadow-2xl shadow-accent/20">
                          {loading ? <Loader2 className="animate-spin" /> : <Send size={20} className="group-hover:translate-x-2' transition-transform duration-300" />}
                          Initialize Global Broadcast
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           {/* History Sidebar */}
           <div className="space-y-8">
              <h3 className="text-xl font-display font-bold text-dark flex items-center gap-3"><Clock size={20} className="text-accent" /> Transmission Log</h3>
              <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm min-h-[500px]">
                 {history.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                       <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center text-dark/10 mb-6 group-hover:scale-110 transition-transform"><MessageSquare size={40} /></div>
                       <p className="text-[10px] font-bold text-dark/30 uppercase tracking-widest">Archive Empty</p>
                       <p className="text-[10px] italic text-dark/20 mt-2">Historical broadcasts will appear here.</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       {history.map((h, i) => (
                          <div key={i} className="p-6 bg-surface rounded-2xl border border-gray-100 hover:border-accent transition-all group">
                             <div className="flex items-center justify-between mb-2">
                                <span className={`text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest ${h.target === 'ALL' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{h.target}</span>
                                <span className="text-[9px] font-bold text-dark/20 uppercase tracking-widest">{new Date(h.sentAt).toLocaleDateString()}</span>
                             </div>
                             <p className="font-bold text-dark text-xs">{h.title}</p>
                             <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-[9px] font-bold text-accent uppercase tracking-widest leading-none">View Report</button>
                                <button className="text-red-500/30 hover:text-red-600"><Trash2 size={14} /></button>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              <div className="p-8 bg-dark rounded-[3rem] text-white overflow-hidden relative group">
                 <div className="absolute right-0 top-0 p-8 text-white/5 skew-y-12 group-hover:scale-125 transition-transform duration-700 pointer-events-none"><Info size={100} /></div>
                 <div className="relative z-10">
                    <h4 className="font-display font-bold text-lg mb-4">Pro-tip ⚡️</h4>
                    <p className="text-xs text-white/40 leading-relaxed mb-6 font-semibold uppercase tracking-widest italic">Use the targeting protocol to send specialized invoices or policy updates specifically to helpers.</p>
                    <button className="w-full py-4 bg-white/10 hover:bg-white hover:text-dark rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all">Knowledge Base</button>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  )
}
