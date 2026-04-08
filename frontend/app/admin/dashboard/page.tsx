'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import {
  Users, TrendingUp, CheckCircle, Clock, Search,
  IndianRupee, BarChart2, RefreshCw, Shield, ChevronRight,
  ThumbsUp, ThumbsDown, Loader2, Bell, HelpCircle, XCircle, Package, Settings, AlertCircle, Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import AdminSidebar from '@/components/layout/AdminSidebar'

interface DashStats {
  totalCustomers: number; 
  totalProviders: number; 
  pendingProviders: number;
  totalBookings: number; 
  activeBookings: number; 
  completedBookings: number;
  totalServices: number;
  totalRevenue: number; 
  totalCommission: number; 
  totalProviderPayouts: number;
  monthlyRevenue: { _id: { year: number; month: number }; revenue: number; commission: number; count: number }[]
}

interface Provider {
  _id: string; name: string; email: string; phone: string; status: string; createdAt: string
  idDocumentUrl?: string;
  providerProfile?: { 
    skills: string[]; 
    rating: number; 
    experience: string;
    bio?: string;
    hourlyRate?: number;
  }
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [stats, setStats] = useState<DashStats | null>(null)
  const [pendingProviders, setPendingProviders] = useState<Provider[]>([])
  const [topWorkers, setTopWorkers] = useState<Provider[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/')
  }, [user])

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoadingStats(true)
    setError(null)
    console.log('Fetching Admin Dashboard Data...')
    try {
      const [dashRes, pendingRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/providers?status=PENDING'),
      ])
      
      console.log('Dashboard Data Received:', dashRes.data)
      console.log('Pending Providers Received:', pendingRes.data)
      
      if (dashRes.data.success) {
        setStats(dashRes.data.stats)
      } else {
        setError('Backend returned success: false for dashboard stats')
      }
      
      if (pendingRes.data.success) {
        setPendingProviders(pendingRes.data.providers || [])
      }

      const providersRes = await api.get('/admin/providers?status=APPROVED')
      setTopWorkers(providersRes.data.providers?.slice(0, 5) || [])
      
    } catch (err: any) {
      console.error('FAILED TO FETCH DASHBOARD:', err)
      if (err.response?.status === 401) {
         setError('Your session has expired. Redirecting to login...')
         return; 
      }
      const msg = err.response?.data?.message || err.message || 'Failed to connect to server'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleProviderAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id)
    try {
      await api.put(`/admin/providers/${id}/${action}`)
      toast.success(`Provider ${action}d successfully`)
      fetchAll()
    } catch {
      toast.error(`Failed to ${action} provider`)
    } finally {
      setActionLoading(null)
    }
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
              placeholder="Search providers, bookings, or transactions..." 
              className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent shadow-sm translate-all"
            />
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 pr-6 border-r border-gray-100 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push('/admin/settings')}>
                <div className="text-right">
                   <p className="text-xs font-bold text-dark leading-none mb-1">{user?.name || 'HelpLender Admin'}</p>
                   <p className="text-[10px] font-bold text-accent uppercase tracking-widest leading-none">Super Admin Hub ✅</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-dark text-white flex items-center justify-center font-bold font-display shadow-lg shadow-dark/20">
                   {user?.name?.[0] || 'H'}
                </div>
             </div>
             <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-dark/40 hover:text-accent relative transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full border-2 border-white" />
             </button>
             <button onClick={() => router.push('/admin/settings')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-dark/40 hover:text-accent transition-colors">
               <Settings className="w-5 h-5" />
             </button>
          </div>
        </header>

        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-dark mb-1">Command Control Center</h1>
            <p className="text-dark/40 text-sm italic">Real-time platform oversight & provider operations.</p>
          </div>
          <button onClick={fetchAll} className="p-4 bg-white border border-gray-100 rounded-2xl text-dark/40 hover:border-accent hover:text-accent transition-all shadow-sm"><RefreshCw size={24} className={loadingStats ? 'animate-spin' : ''} /></button>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600 animate-fade-in">
            <AlertCircle size={24} />
            <div>
              <p className="font-bold text-sm uppercase tracking-widest">Connection Error</p>
              <p className="text-xs opacity-70 mt-0.5">{error}. Check if backend is running and MONGODB_URI is correct.</p>
            </div>
            <button onClick={fetchAll} className="ml-auto px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Retry Connection</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {/* Stats Cards */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white relative shadow-lg overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500"><RefreshCw size={100} /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md"><Clock className="w-5 h-5" /></div>
                <p className="text-sm font-semibold text-white/80 uppercase tracking-widest">Active Jobs</p>
              </div>
              <div className="font-display text-5xl font-bold mb-4">{stats?.activeBookings || 0}</div>
              <p className="text-xs text-white/50 font-bold uppercase">Work in progress</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-3xl p-8 text-white relative shadow-lg overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500"><Shield size={100} /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md"><Users className="w-5 h-5" /></div>
                <p className="text-sm font-semibold text-white/80 uppercase tracking-widest">Active Providers</p>
              </div>
              <div className="font-display text-5xl font-bold mb-4">{stats?.totalProviders || 0}</div>
              <p className="text-xs text-white/50 font-bold uppercase">Ready for hire (Approved)</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-surface group-hover:scale-110 transition-transform duration-500"><TrendingUp size={100} /></div>
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-surface rounded-xl text-accent"><IndianRupee className="w-5 h-5" /></div>
                  <p className="text-sm font-semibold text-dark/40 uppercase tracking-widest">Platform Take</p>
               </div>
               <div className="font-display text-5xl font-bold text-dark mb-4">₹{(stats?.totalCommission || 0).toLocaleString()}</div>
               <p className="text-xs text-dark/20 font-bold uppercase tracking-widest leading-none">Net earned commission</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-surface group-hover:scale-110 transition-transform duration-500"><Package size={100} /></div>
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-surface rounded-xl text-dark/40"><Layers size={20} /></div>
                  <p className="text-sm font-semibold text-dark/40 uppercase tracking-widest">Total Services</p>
               </div>
               <div className="font-display text-5xl font-bold text-dark mb-4">{stats?.totalServices || 0}</div>
               <p className="text-xs text-dark/20 font-bold uppercase tracking-widest mt-1">Available in catalog</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Pending Applications */}
           <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-display font-bold text-dark">Provider Applications</h2>
                 <Link href="/admin/providers" className="text-accent text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1">Manage All <ChevronRight size={14} /></Link>
              </div>
              
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                 {loadingStats ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                       <Loader2 size={40} className="animate-spin text-accent" />
                       <p className="text-[10px] font-bold text-dark/20 uppercase tracking-widest">Verifying Backgrounds...</p>
                    </div>
                 ) : pendingProviders.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center">
                       <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center text-dark/10 mb-4"><CheckCircle size={32} /></div>
                       <h3 className="font-display font-bold text-dark italic">Queue is Clear</h3>
                       <p className="text-xs text-dark/40 mt-1">No new provider applications found.</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-gray-50">
                       {pendingProviders.map(p => (
                          <div key={p._id} className="p-6 hover:bg-surface/30 transition-all flex items-center justify-between group">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-dark/5 rounded-xl flex items-center justify-center font-bold text-dark">{p.name[0]}</div>
                                <div>
                                   <p className="font-bold text-dark text-sm">{p.name}</p>
                                   <p className="text-[10px] text-dark/40 font-bold uppercase tracking-widest">{p.phone}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                   onClick={() => { setSelectedProvider(p); setDetailModalOpen(true) }}
                                   className="p-2 text-dark/40 hover:text-dark hover:bg-white rounded-lg transition-all"
                                ><Info size={18} /></button>
                                <button 
                                   onClick={() => handleProviderAction(p._id, 'approve')}
                                   className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all shadow-sm shadow-green-600/10"
                                >Approve</button>
                                <button 
                                   onClick={() => handleProviderAction(p._id, 'reject')}
                                   className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm shadow-red-600/10"
                                >Reject</button>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>

           {/* Metrics Sidebar */}
           <div className="space-y-8">
               <div className="bg-dark rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-500"><Setting size={120} /></div>
                  <h3 className="font-display font-bold text-lg mb-6">Service Health</h3>
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                           <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Active Jobs</span>
                        </div>
                        <span className="font-bold text-sm">{stats?.activeBookings || 0}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                           <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Customers</span>
                        </div>
                        <span className="font-bold text-sm">{stats?.totalCustomers || 0}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                           <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Providers</span>
                        </div>
                        <span className="font-bold text-sm">{stats?.totalProviders || 0}</span>
                     </div>
                  </div>
                  <button onClick={() => router.push('/admin/services')} className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">Platform Audit</button>
               </div>
           </div>
        </div>
      </main>
    </div>
  )
}

function Layers({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
  )
}

function Setting({ size }: { size: number }) {
  return <Settings className="w-full h-full" size={size} />
}
