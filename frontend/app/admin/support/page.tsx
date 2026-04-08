'use client'
import { useState } from 'react'
import { 
  Search, Bell, HelpCircle, Book, Video, ClipboardList, 
  MessageSquare, AlertTriangle, Phone, Ticket, History, 
  LifeBuoy, ChevronRight, Play, ExternalLink, MessageCircle,
  Shield, Scale, Zap, Loader2, Send, X, MoreVertical, Layout
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/layout/AdminSidebar'
import toast from 'react-hot-toast'

export default function AdminSupportPage() {
  const { user } = useAuth()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [message, setMessage] = useState('')

  const adminFaqs = [
    { q: 'How to approve a pending provider?', a: 'Navigate to the Providers page, select a pending application, and click "Approve" after verifying their PDF documents.' },
    { q: 'Platform commission adjustments?', a: 'You can adjust the global commission rate in the Settings > Financials section.' },
    { q: 'Managing dispute tickets?', a: 'Open the ticket in the Issue Management hub to review the chat logs between provider and customer.' },
  ]

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header with Profile */}
        <header className="flex items-center justify-between mb-10 gap-8">
          <div className="flex-1 max-w-lg relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30 group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Search administration guides, platform logs, or policy updates..." 
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

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-dark to-slate-800 rounded-[3rem] p-12 text-white mb-10 relative overflow-hidden">
           <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
              <Shield size={300} className="translate-x-1/2 -translate-y-1/4 rotate-12" />
           </div>
           <div className="relative z-10 max-w-2xl">
              <h1 className="font-display text-5xl font-bold mb-4">Admin Command Center</h1>
              <p className="text-white/40 text-lg mb-8 leading-relaxed">Centralized support for platform oversight, provider disputes, and architectural management.</p>
              <div className="flex gap-4">
                 <button onClick={() => setIsChatOpen(true)} className="px-8 py-4 bg-accent text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-accent/20 hover:bg-white hover:text-dark transition-all flex items-center gap-3">
                    <MessageSquare size={16} /> Tech Support Chat
                 </button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                 <h3 className="font-display font-bold text-xl text-dark mb-8 flex items-center gap-3"><Book className="text-accent" /> Admin Knowledge Base</h3>
                 <div className="space-y-4">
                    {adminFaqs.map((faq, i) => (
                       <details key={i} className="group border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                          <summary className="flex items-center justify-between cursor-pointer list-none py-2">
                             <span className="font-bold text-dark group-hover:text-accent transition-colors">{faq.q}</span>
                             <ChevronRight size={16} className="text-dark/20 group-open:rotate-90 transition-transform" />
                          </summary>
                          <p className="mt-4 text-sm text-dark/40 leading-relaxed pl-4 border-l-2 border-accent/20">
                             {faq.a}
                          </p>
                       </details>
                    ))}
                 </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                 <div className="absolute -right-8 -top-8 rotate-12 opacity-5 scale-125 transition-transform duration-700">
                    <Layout size={200} className="text-dark" />
                 </div>
                 <h3 className="font-display font-bold text-xl text-dark mb-6 relative z-10">Platform Governance Guides</h3>
                 <div className="space-y-3 relative z-10">
                    {['Provider Vetting Process', 'Financial Settlement Logic', 'Stripe Integration Guide', 'AWS Maintenance SOP'].map(sop => (
                       <button key={sop} className="w-full flex items-center justify-between p-4 bg-surface/50 border border-gray-100 rounded-2xl hover:bg-dark hover:text-white transition-all group/btn">
                          <span className="text-xs font-bold">{sop}</span>
                          <ExternalLink size={14} className="opacity-40 group-hover/btn:opacity-100" />
                       </button>
                    ))}
                 </div>
              </div>
        </div>
      </main>

      {/* Floating Tech Chat */}
      {isChatOpen && (
         <div className="fixed inset-y-0 right-0 z-50 w-[450px] bg-white shadow-[0_0_100px_rgba(0,0,0,0.2)] flex flex-col p-8 border-l border-gray-50 animate-slide-left">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-dark text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-dark/20">DEV</div>
                  <div>
                     <h4 className="font-bold text-dark text-sm leading-none mb-1">Developer Hotline</h4>
                     <p className="text-[10px] text-success font-bold uppercase tracking-widest">Active Core Systems</p>
                  </div>
               </div>
               <button onClick={() => setIsChatOpen(false)} className="p-2.5 bg-surface text-dark/30 hover:text-dark hover:bg-gray-100 rounded-xl transition-all"><X size={20} /></button>
            </div>

            <div className="flex-1 bg-surface rounded-[2rem] p-6 mb-6 overflow-y-auto space-y-6">
               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-dark text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">DEV</div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[80%]">
                     <p className="text-xs text-dark/60 leading-relaxed font-medium">System Admin {user?.name?.[0]} recognized. How can the core dev team assist with the platform tonight?</p>
                  </div>
               </div>
            </div>

            <div className="relative">
               <input 
                  type="text" 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Query system logs or message devs..." 
                  className="w-full bg-surface border border-gray-100 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
               />
               <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-dark text-white rounded-xl shadow-lg hover:bg-accent transition-all">
                  <Send size={18} />
               </button>
            </div>
         </div>
      )}
    </div>
  )
}
