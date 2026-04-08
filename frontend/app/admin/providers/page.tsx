'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import StatusBadge from '@/components/ui/StatusBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  ArrowLeft, Users, ThumbsUp, ThumbsDown, Search,
  Shield, Star, MapPin, Loader2, RefreshCw, Phone, Mail, Bell, Settings
} from 'lucide-react'
import toast from 'react-hot-toast'
import AdminSidebar from '@/components/layout/AdminSidebar'

interface Provider {
  _id: string; name: string; email: string; phone: string
  status: string; createdAt: string; isOnline: boolean
  providerProfile?: { skills: string[]; rating: number; totalJobs: number; hourlyRate: number; experience: string; bio: string }
}

export default function AdminProvidersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/')
  }, [user])

  useEffect(() => { fetchProviders() }, [statusFilter])

  const fetchProviders = async () => {
    setLoading(true)
    try {
      const params = statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''
      const res = await api.get(`/admin/providers${params}`)
      setProviders(res.data.providers || [])
    } catch { toast.error('Failed to load providers') }
    finally { setLoading(false) }
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id + '-approve')
    try {
      await api.put(`/admin/providers/${id}/approve`)
      toast.success('Provider approved! SMS credentials sent.')
      fetchProviders()
    } catch { toast.error('Failed to approve') }
    finally { setActionLoading(null) }
  }

  const handleReject = async (id: string) => {
    setActionLoading(id + '-reject')
    try {
      await api.put(`/admin/providers/${id}/reject`)
      toast.success('Provider rejected.')
      fetchProviders()
    } catch { toast.error('Failed to reject') }
    finally { setActionLoading(null) }
  }

  const filtered = providers.filter(p =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statuses = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'ACTIVE']

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
              placeholder="Search by provider name or email..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent shadow-sm"
            />
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 pr-6 border-r border-gray-100 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push('/admin/settings')}>
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

        <div className="flex items-center justify-between mb-10">
           <div>
              <h1 className="font-display text-4xl font-bold text-dark mb-1">Provider Workforce</h1>
              <p className="text-dark/40 text-sm">Review, approve, and manage your network of service professionals.</p>
           </div>
           <div className="flex gap-2 p-1.5 bg-surface rounded-2xl border border-gray-100">
              {statuses.map(s => (
                <button 
                  key={s} 
                  onClick={() => setStatusFilter(s)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest
                    ${statusFilter === s ? 'bg-dark text-white shadow-lg' : 'text-dark/40 hover:text-dark hover:bg-white'}`}
                >
                  {s}
                </button>
              ))}
           </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
           {loading ? (
             <div className="p-20"><LoadingSpinner text="Fetching professionals..." /></div>
           ) : (
             <table className="w-full text-left">
                <thead className="bg-surface/50 border-b border-gray-100 text-[10px] font-bold text-dark/30 uppercase tracking-widest">
                   <tr>
                      <th className="px-8 py-6">Provider</th>
                      <th className="px-8 py-6">Contact Info</th>
                      <th className="px-8 py-6">Verification</th>
                      <th className="px-8 py-6">LTV/Rating</th>
                      <th className="px-8 py-6">Signup Date</th>
                      <th className="px-8 py-6 text-right">Rapid Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {filtered.map(p => (
                      <tr key={p._id} className="hover:bg-surface/30 transition-colors group">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-dark text-white flex items-center justify-center font-bold text-sm shadow-md">{p.name[0]}</div>
                               <div>
                                  <p className="font-bold text-dark text-sm leading-tight">{p.name}</p>
                                  <p className="text-[10px] font-bold text-dark/30 uppercase tracking-widest mt-1">{p.providerProfile?.experience || 'Professional'}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="space-y-1">
                               <div className="flex items-center gap-2 text-xs font-bold text-dark/60"><Mail size={12} className="text-dark/20" /> {p.email}</div>
                               <div className="flex items-center gap-2 text-xs font-bold text-dark/60"><Phone size={12} className="text-dark/20" /> {p.phone}</div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <StatusBadge status={p.status} />
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-1.5 font-bold text-dark text-sm">
                               <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                               {p.providerProfile?.rating || '—'}
                               <span className="text-[10px] text-dark/30 ml-1">({p.providerProfile?.totalJobs || 0} jobs)</span>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                             <p className="text-xs font-bold text-dark/40">{new Date(p.createdAt).toLocaleDateString('en-IN')}</p>
                         </td>
                         <td className="px-8 py-6 text-right">
                            {p.status === 'PENDING' ? (
                               <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => handleReject(p._id)} disabled={!!actionLoading} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                    {actionLoading === p._id + '-reject' ? <Loader2 size={16} className="animate-spin" /> : <ThumbsDown size={16} />}
                                 </button>
                                 <button onClick={() => handleApprove(p._id)} disabled={!!actionLoading} className="px-6 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                                    {actionLoading === p._id + '-approve' ? <Loader2 size={16} className="animate-spin" /> : <><ThumbsUp size={16} /> Approve Access</>}
                                 </button>
                               </div>
                            ) : (
                               <button className="px-6 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-dark/40 hover:border-accent hover:text-accent transition-all shadow-sm">View Profile</button>
                            )}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
           )}
        </div>
      </main>
    </div>
  )
}
