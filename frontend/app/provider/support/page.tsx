'use client'
import { useState } from 'react'
import { 
  Search, Bell, HelpCircle, Book, Video, ClipboardList, 
  MessageSquare, AlertTriangle, Phone, Ticket, History, 
  LifeBuoy, ChevronRight, Play, ExternalLink, MessageCircle,
  Shield, Scale, Zap, Loader2, Send, X, MoreVertical
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import ProviderSidebar from '@/components/layout/ProviderSidebar'
import toast from 'react-hot-toast'

export default function ProviderSupportPage() {
  const { user } = useAuth()
  const [activeSupportTab, setActiveSupportTab] = useState<'HELP_CENTER' | 'TICKETS' | 'CHAT'>('HELP_CENTER')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [message, setMessage] = useState('')

  const faqs = [
    { q: 'How to reschedule a booking?', a: 'You can reschedule via the My Bookings page up to 24h before the job starts.' },
    { q: 'What is the refund policy?', a: 'HelpLender protects providers. If a customer cancels within 4h, you receive a 50% convenience fee.' },
    { q: 'Service area limits?', a: 'You can define your service radius in the Service Catalog settings (default is 15km).' },
  ]

  const tutorials = [
    { t: 'Completing your first job', d: 'Learn how to use the checklist and upload proof photos.', duration: '2:45' },
    { t: 'Managing your workspace', d: 'A guide to online/offline status and bidding.', duration: '3:15' },
  ]

  const tickets = [
    { id: '#TK-9021', subject: 'Payment Dispute - Deep Clean #102', status: 'In-Progress', date: 'Oct 24' },
    { id: '#TK-8840', subject: 'ID Verification Update', status: 'Resolved', date: 'Oct 20' },
  ]

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      <ProviderSidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header with Profile */}
        <header className="flex items-center justify-between mb-10 gap-8">
          <div className="flex-1 max-w-lg relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30 group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Search help articles, SOPs, or tutorials..." 
              className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent shadow-sm"
            />
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
                <div className="text-right">
                   <p className="text-xs font-bold text-dark leading-none mb-1">{user?.name}</p>
                   <p className="text-[10px] font-bold text-success uppercase tracking-widest leading-none">Primary Provider ✅</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center font-bold font-display shadow-lg shadow-accent/20">
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
        <div className="bg-dark rounded-[3rem] p-12 text-white mb-10 relative overflow-hidden">
           <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
              <LifeBuoy size={300} className="translate-x-1/2 -translate-y-1/4 rotate-12" />
           </div>
           <div className="relative z-10 max-w-2xl">
              <h1 className="font-display text-5xl font-bold mb-4">Pro Support Center</h1>
              <p className="text-white/40 text-lg mb-8 leading-relaxed">Everything you need to grow your business, resolve issues, and provide world-class service to your customers.</p>
              <div className="flex gap-4">
                 <button onClick={() => setIsChatOpen(true)} className="px-8 py-4 bg-accent text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-accent/20 hover:bg-white hover:text-dark transition-all flex items-center gap-3">
                    <MessageCircle size={16} /> Open Live Chat
                 </button>
                 <button className="px-8 py-4 bg-red-500 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-red-500/20 hover:bg-white hover:text-red-600 transition-all flex items-center gap-3 animate-pulse">
                    <AlertTriangle size={16} /> Emergency SOS
                 </button>
              </div>
           </div>
        </div>

        {/* Support Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-surface rounded-[2rem] border border-gray-100 mb-10 w-fit">
           <button onClick={() => setActiveSupportTab('HELP_CENTER')} className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest transition-all ${activeSupportTab === 'HELP_CENTER' ? 'bg-white text-dark shadow-xl' : 'text-dark/30 hover:text-dark'}`}>
              Self-Service Hub
           </button>
           <button onClick={() => setActiveSupportTab('TICKETS')} className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest transition-all ${activeSupportTab === 'TICKETS' ? 'bg-white text-dark shadow-xl' : 'text-dark/30 hover:text-dark'}`}>
              Issue Management
           </button>
        </div>

        {activeSupportTab === 'HELP_CENTER' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              {/* FAQ & Knowledge Base */}
              <div className="lg:col-span-2 space-y-8">
                 <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                    <h3 className="font-display font-bold text-xl text-dark mb-8 flex items-center gap-3"><Book className="text-accent" /> Knowledge Base</h3>
                    <div className="space-y-4">
                       {faqs.map((faq, i) => (
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

                 <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                    <h3 className="font-display font-bold text-xl text-dark mb-8 flex items-center gap-3"><Video className="text-accent" /> Video Tutorials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {tutorials.map((v, i) => (
                          <div key={i} className="group cursor-pointer">
                             <div className="aspect-video bg-surface rounded-2xl relative mb-4 overflow-hidden border border-gray-50 flex items-center justify-center">
                                <Play size={32} className="text-dark/10 group-hover:text-accent group-hover:scale-125 transition-all" />
                                <div className="absolute bottom-3 right-3 px-2 py-1 bg-dark/80 text-[10px] text-white font-bold rounded-lg">{v.duration}</div>
                             </div>
                             <h4 className="font-bold text-dark text-sm mb-1">{v.t}</h4>
                             <p className="text-[11px] text-dark/30 leading-snug">{v.d}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Checklists & SOPs */}
              <div className="space-y-8">
                 <div className="bg-gradient-to-br from-dark to-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 rotate-12 opacity-5 group-hover:scale-125 transition-transform duration-700">
                       <ClipboardList size={200} />
                    </div>
                    <h3 className="font-display font-bold text-xl mb-6 relative z-10">Cleaning SOPs</h3>
                    <div className="space-y-3 relative z-10">
                       {['Standard Clean SOP', 'Deep Clean Checklist', 'Office Sanitization Guide', 'Appliance Care SOP'].map(sop => (
                          <button key={sop} className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-dark transition-all group/btn">
                             <span className="text-xs font-bold">{sop}</span>
                             <ExternalLink size={14} className="opacity-40 group-hover/btn:opacity-100" />
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                    <h3 className="font-display font-bold text-xl text-dark mb-4">Quality & Ratings</h3>
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                       <div className="w-24 h-24 rounded-full border-4 border-success flex items-center justify-center text-3xl font-display font-bold text-success mb-4 shadow-xl shadow-success/10">
                          4.8
                       </div>
                       <p className="text-xs font-bold text-dark/40 uppercase tracking-widest mb-1 font-display">CSAT Rating</p>
                       <p className="text-[10px] text-success font-bold bg-success/5 px-4 py-1 rounded-full uppercase">Top Performance</p>
                    </div>
                    <div className="pt-6 border-t border-gray-50 flex items-center gap-3">
                       <div className="p-2 bg-accent/5 text-accent rounded-lg"><Zap size={16} /></div>
                       <p className="text-[10px] text-dark/40 font-medium italic">"Maintain 4.5+ to stay in the priority list."</p>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* Tickets Tab */}
        {activeSupportTab === 'TICKETS' && (
           <div className="space-y-8 animate-fade-in max-w-4xl">
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                 <div className="flex items-center justify-between mb-10">
                    <div>
                       <h2 className="font-display font-bold text-2xl text-dark">Submit a New Support Ticket</h2>
                       <p className="text-sm text-dark/40">Our expert team typically responds within 4 hours.</p>
                    </div>
                    <button className="px-8 py-4 bg-dark text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl hover:bg-accent transition-all flex items-center gap-2">
                       <Plus size={16} /> Create Ticket
                    </button>
                 </div>

                 <div className="overflow-hidden bg-surface rounded-3xl border border-gray-50">
                    <table className="w-full text-left">
                       <thead className="bg-white border-b border-gray-100 text-[10px] font-bold text-dark/30 uppercase tracking-widest">
                          <tr>
                             <th className="px-8 py-6">Ticket ID</th>
                             <th className="px-8 py-6">Subject</th>
                             <th className="px-8 py-6">Status</th>
                             <th className="px-8 py-6">Last Updated</th>
                             <th className="px-8 py-6 text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {tickets.map(tk => (
                             <tr key={tk.id} className="hover:bg-white transition-colors cursor-pointer group">
                                <td className="px-8 py-6 font-bold text-sm text-dark">{tk.id}</td>
                                <td className="px-8 py-6 text-sm font-medium text-dark/60">{tk.subject}</td>
                                <td className="px-8 py-6">
                                   <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${tk.status === 'Resolved' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                      {tk.status}
                                   </span>
                                </td>
                                <td className="px-8 py-6 text-xs text-dark/30 font-medium">{tk.date}</td>
                                <td className="px-8 py-6 text-right"><ChevronRight size={18} className="ml-auto text-dark/10 group-hover:text-accent transition-colors" /></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}
      </main>

      {/* Floating Live Chat Sidebar */}
      {isChatOpen && (
         <div className="fixed inset-y-0 right-0 z-50 w-[450px] bg-white shadow-[0_0_100px_rgba(0,0,0,0.2)] flex flex-col p-8 border-l border-gray-50 animate-slide-left">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-accent/20">AI</div>
                  <div>
                     <h4 className="font-bold text-dark text-sm leading-none mb-1">HelpLender AI Support</h4>
                     <p className="text-[10px] text-success font-bold uppercase tracking-widest animate-pulse">Online & 24/7 Active</p>
                  </div>
               </div>
               <button onClick={() => setIsChatOpen(false)} className="p-2.5 bg-surface text-dark/30 hover:text-dark hover:bg-gray-100 rounded-xl transition-all"><X size={20} /></button>
            </div>

            <div className="flex-1 bg-surface rounded-[2rem] p-6 mb-6 overflow-y-auto space-y-6">
               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">AI</div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[80%]">
                     <p className="text-xs text-dark/60 leading-relaxed font-medium">Hello {user?.name}! 👋 I'm your AI assistant. I can help with pricing, site updates, or technical issues. How can I help you today?</p>
                  </div>
               </div>
               
               <div className="flex items-start justify-end gap-3">
                  <div className="bg-dark p-4 rounded-2xl rounded-tr-none shadow-xl shadow-dark/20 max-w-[80%] text-white">
                     <p className="text-xs leading-relaxed font-medium">I have a problem with my payment settlement for last week.</p>
                  </div>
               </div>

               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">AI</div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[80%]">
                     <p className="text-xs text-dark/60 leading-relaxed font-medium">I understand. Let me check your wallet. I see a pending settlement of ₹12,450 from deep cleaning jobs. This is scheduled to release on Oct 28th. Would you like to raise a dispute ticket?</p>
                  </div>
               </div>
            </div>

            <div className="relative group">
               <input 
                  type="text" 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type your message to AI Support..." 
                  className="w-full bg-surface border border-gray-100 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all transition-shadow"
               />
               <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-accent text-white rounded-xl shadow-lg shadow-accent/20 hover:bg-dark transition-all">
                  <Send size={18} />
               </button>
            </div>
         </div>
      )}
    </div>
  )
}
