'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import {
  Wallet, Star, MapPin, Clock, CheckCircle, XCircle,
  Loader2, ToggleLeft, ToggleRight, Navigation,
  RefreshCw, Package, Search, Bell, HelpCircle, TrendingUp, Info, ChevronRight, Zap,
  ClipboardList, FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useGeolocation } from '@/hooks/useGeolocation'
import { getSocket } from '@/lib/socket'
import { Booking } from '@/types'
import ProviderSidebar from '@/components/layout/ProviderSidebar'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'badge-pending' },
  CONFIRMED: { label: 'Confirmed', color: 'badge-confirmed' },
  PROVIDER_ASSIGNED: { label: 'Assigned', color: 'badge-confirmed' },
  ON_THE_WAY: { label: 'On the Way', color: 'badge-onway' },
  ARRIVED: { label: 'Arrived', color: 'badge-active' },
  IN_PROGRESS: { label: 'In Progress', color: 'badge-active' },
  COMPLETED: { label: 'Completed', color: 'badge-completed' },
}

export default function ProviderDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Booking[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [isOnline, setIsOnline] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeJob, setActiveJob] = useState<Booking | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { location, startTracking, stopTracking, isTracking } = useGeolocation()

  useEffect(() => {
    if (user && user.role !== 'provider') router.push('/')
    if (user?.isFirstLogin) router.push('/reset-password')
    setIsOnline(user?.isOnline || false)
    fetchDashboard()
  }, [user])

  useEffect(() => {
    if (!activeJob || !location) return
    const socket = getSocket()
    socket.emit('location-update', {
      bookingId: activeJob._id, lat: location.lat, lng: location.lng
    })
  }, [location, activeJob])

  useEffect(() => {
    if (user && user.role === 'provider') {
      const socket = getSocket()
      const handleNewJob = (jobData: any) => {
        toast('New job request just arrived! ⚡', { icon: '🔔' })
        fetchDashboard()
      }
      
      socket.on('new-job-request', handleNewJob)
      
      return () => {
        socket.off('new-job-request', handleNewJob)
      }
    }
  }, [user])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const [jobsRes, newJobsRes, meRes] = await Promise.all([
        api.get('/providers/jobs').catch(() => ({ data: { jobs: [] } })),
        api.get('/providers/jobs/new').catch(() => ({ data: { jobs: [] } })),
        api.get('/auth/me'),
      ])
      
      setProfile(meRes.data.user)
      
      const assignedJobs = jobsRes.data.jobs || []
      const unclaimedJobs = newJobsRes.data.jobs || []
      
      // Combine and remove duplicates (though they should be distinct by providerId filter)
      const combinedJobs = [...assignedJobs]
      unclaimedJobs.forEach((nj: any) => {
        if (!combinedJobs.find(aj => aj._id === nj._id)) {
          combinedJobs.push(nj)
        }
      })

      setJobs(combinedJobs)
    } catch (err: any) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const toggleOnline = async () => {
    try {
      await api.put('/providers/me/status', { isOnline: !isOnline })
      setIsOnline(!isOnline)
      toast.success(isOnline ? 'You are now Offline' : 'You are now Online — Go get them! 🚀')
    } catch { toast.error('Failed to update status') }
  }

  const handleAccept = async (booking: Booking) => {
    setActionLoading(booking._id + '-accept')
    try {
      await api.post(`/bookings/${booking._id}/accept`)
      toast.success('Job accepted!')
      fetchDashboard()
    } catch { toast.error('Failed to accept job') }
    finally { setActionLoading(null) }
  }

  const handleReject = async (booking: Booking) => {
    setActionLoading(booking._id + '-reject')
    try {
      await api.post(`/bookings/${booking._id}/reject`)
      toast('Job rejected', { icon: '↩️' })
      fetchDashboard()
    } catch { toast.error('Failed to reject job') }
    finally { setActionLoading(null) }
  }

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    setActionLoading(bookingId + '-status')
    try {
      // Use socket for real-time status update or API
      await api.put(`/bookings/${bookingId}/status`, { status })
      
      // If going ON_THE_WAY, start geolocation tracking
      if (status === 'ON_THE_WAY') {
        startTracking()
        setActiveJob(jobs.find(j => j._id === bookingId) || null)
      } else if (status === 'COMPLETED') {
        stopTracking()
        setActiveJob(null)
      }
      
      toast.success(`Status updated to ${status.replace('_', ' ')}`)
      fetchDashboard()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setActionLoading(null)
    }
  }

  const pendingJobs = jobs.filter(j => j.status === 'PENDING')
  const ongoingJobs = jobs.filter(j => ['CONFIRMED', 'PROVIDER_ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(j.status))
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED')
  const totalEarnings = completedJobs.reduce((sum, j) => sum + (j.pricing?.providerEarning || 0), 0)

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      <ProviderSidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        {/* Top Header & Search Bar */}
        <header className="flex items-center justify-between mb-10 gap-8">
          <div className="flex-1 max-w-lg relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30 focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Search bookings, invoices, or customer names..." 
              className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
                <div className="text-right">
                   <p className="text-xs font-bold text-dark leading-none mb-1">{user?.name}</p>
                   <p className="text-[10px] font-bold text-success uppercase tracking-widest leading-none">Verify ID: Approved ✅</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center font-bold font-display shadow-lg shadow-accent/20">
                   {user?.name?.[0]}
                </div>
             </div>

             <div className="flex items-center gap-4">
                <button 
                  onClick={toggleOnline}
                  className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border font-bold text-sm transition-all
                      ${isOnline 
                      ? 'bg-green-50 border-green-100 text-green-600' 
                      : 'bg-white border-gray-100 text-dark/40 hover:bg-gray-50'}`}
                >
                   <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-dark/20'}`} />
                   {isOnline ? 'Active' : 'Offline'}
                </button>
                <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-dark/40 hover:text-accent transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full border-2 border-white" />
                </button>
             </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold text-dark">Provider Pro Dashboard</h1>
          <p className="text-dark/40 text-sm mt-1">Hello {user?.name}, you have {pendingJobs.length} new requests awaiting your update.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
           {/* Revenue Gradient */}
           <div className="bg-gradient-to-br from-dark to-slate-800 rounded-3xl p-6 text-white relative shadow-lg overflow-hidden group col-span-2">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <TrendingUp size={100} />
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                 <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Total Net Revenue</p>
                    <span className="px-2 py-0.5 bg-accent rounded-lg text-[10px] font-bold">PRO ACCOUNT</span>
                 </div>
                 <div className="flex items-end gap-3 mb-6">
                    <div className="font-display text-5xl font-bold leading-none">₹{totalEarnings.toLocaleString('en-IN')}</div>
                    <div className="text-white/40 text-[10px] font-bold pb-1">+ 14.2% (MTD)</div>
                 </div>
                 <div className="flex gap-4">
                    <button className="flex-1 py-3 bg-white/10 hover:bg-white text-white hover:text-dark rounded-2xl text-xs font-bold transition-all border border-white/5 uppercase tracking-widest">Withdrawals</button>
                    <button className="flex-1 py-3 bg-accent text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-accent/20 border border-transparent uppercase tracking-widest">Wallet Details</button>
                 </div>
              </div>
           </div>

           {/* Small Stats Cards */}
           <Link href="/provider/reviews" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:border-accent transition-all group/rating">
              <div>
                 <div className="p-2 bg-blue-50 rounded-xl text-blue-600 inline-block mb-4 group-hover/rating:bg-accent group-hover/rating:text-white transition-all"><Star size={20} /></div>
                 <h4 className="text-[10px] uppercase font-bold text-dark/30 tracking-widest mb-1">Service Rating</h4>
                 <div className="font-display text-3xl font-bold text-dark">{profile?.providerProfile?.rating || '4.8'}</div>
              </div>
              <div className="text-[11px] text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-lg text-center mt-4 group-hover/rating:bg-accent/10 group-hover/rating:text-accent transition-all">View All Reviews</div>
           </Link>

           <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute -bottom-6 -right-6 text-accent/5 group-hover:scale-110 transition-transform"><Package size={80} /></div>
              <div className="relative z-10">
                 <div className="p-2 bg-amber-50 rounded-xl text-amber-600 inline-block mb-4"><Package size={20} /></div>
                 <h4 className="text-[10px] uppercase font-bold text-dark/30 tracking-widest mb-1">Jobs Completed</h4>
                 <div className="font-display text-3xl font-bold text-dark">{completedJobs.length}</div>
              </div>
              <Link href="/provider/bookings" className="text-[11px] text-dark/40 font-bold flex items-center gap-1 hover:text-accent transition-colors mt-4">View History <ChevronRight size={12} /></Link>
           </div>
        </div>

        {/* Content Section - Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Job Lists (Requests & Ongoing) */}
           <div className="lg:col-span-2 space-y-8">
              {/* Ongoing Projects (The list in mockup) */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h3 className="font-display font-bold text-xl text-dark">Current Workboard</h3>
                       <p className="text-xs text-dark/40">Real-time job updates & management</p>
                    </div>
                    <div className="flex gap-2">
                       <button className="badge bg-green-50 text-green-600 border border-green-100">Syncing Live 📍</button>
                    </div>
                 </div>

                 {ongoingJobs.length === 0 ? (
                    <div className="py-20 text-center">
                       <Package size={50} className="text-dark/10 mx-auto mb-4" />
                       <p className="text-dark/30 font-medium">No ongoing jobs. Go Online to receive bids!</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       {ongoingJobs.map(job => (
                          <div key={job._id} className="flex items-center gap-4 p-5 hover:bg-surface/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all group">
                             <div className="w-12 h-12 rounded-2xl bg-surface border border-gray-100 flex items-center justify-center text-accent text-xl font-bold font-display group-hover:bg-accent group-hover:text-white transition-all">
                                {(job.serviceId as any)?.icon || '🧹'}
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                   <p className="font-bold text-dark text-sm truncate">{(job.serviceId as any)?.name}</p>
                                   <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${STATUS_CONFIG[job.status]?.color || 'bg-gray-100'}`}>
                                      {STATUS_CONFIG[job.status]?.label}
                                   </span>
                                </div>
                                <p className="text-xs text-dark/40 flex items-center gap-2">
                                   <Clock size={12} /> {job.scheduledTime} · <MapPin size={12} /> {job.serviceAddress?.street}
                                </p>
                             </div>
                             <div className="flex gap-2">
                                <Link href={`/provider/bookings/${job._id}`} className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-dark/40 hover:bg-surface transition-all">
                                   Details
                                </Link>
                                
                                {job.status === 'CONFIRMED' || job.status === 'PROVIDER_ASSIGNED' ? (
                                  <button 
                                    onClick={() => handleStatusUpdate(job._id, 'ON_THE_WAY')}
                                    className="px-6 py-2.5 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/20 hover:bg-dark transition-all flex items-center gap-2"
                                  >
                                    <Navigation className="w-3 h-3" /> Start Journey
                                  </button>
                                ) : job.status === 'ON_THE_WAY' ? (
                                  <button 
                                    onClick={() => handleStatusUpdate(job._id, 'ARRIVED')}
                                    className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-600 transition-all flex items-center gap-2"
                                  >
                                    <MapPin className="w-3 h-3" /> I Have Arrived
                                  </button>
                                ) : job.status === 'ARRIVED' ? (
                                  <button 
                                    onClick={() => handleStatusUpdate(job._id, 'IN_PROGRESS')}
                                    className="px-6 py-2.5 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-200 hover:bg-green-600 transition-all flex items-center gap-2"
                                  >
                                    <Zap className="w-3 h-3" /> Start Service
                                  </button>
                                ) : job.status === 'IN_PROGRESS' ? (
                                  <button 
                                    onClick={() => handleStatusUpdate(job._id, 'COMPLETED')}
                                    className="px-6 py-2.5 bg-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-dark/20 hover:bg-black transition-all flex items-center gap-2"
                                  >
                                    <CheckCircle className="w-3 h-3" /> Mark Complete
                                  </button>
                                ) : null}
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              {/* New Requests Section */}
              {pendingJobs.length > 0 && (
                <div className="bg-amber-50/50 rounded-[2rem] p-8 border border-amber-100">
                    <div className="flex items-center justify-between mb-8">
                       <div>
                          <h3 className="font-display font-bold text-xl text-amber-900 flex items-center gap-2">
                             New Job Requests <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-lg text-xs">{pendingJobs.length}</span>
                          </h3>
                          <p className="text-xs text-amber-800/50">Opportunities to grow your business</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       {pendingJobs.map(job => (
                          <div key={job._id} className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-6 rounded-2xl border border-amber-200/50 shadow-sm">
                             <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                   <h4 className="font-bold text-dark italic">{(job.customerId as any)?.name || 'New Customer'}</h4>
                                   <span className="text-[10px] bg-dark text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Incoming</span>
                                </div>
                                <h4 className="font-black text-xs text-dark/40 uppercase tracking-widest mb-2">{(job.serviceId as any)?.name}</h4>
                                <div className="flex flex-wrap gap-4 text-xs text-dark/40 font-medium">
                                   <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}</span>
                                   <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.serviceAddress?.city}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <div className="text-right">
                                   <p className="text-xs font-bold text-dark/30 uppercase tracking-widest">Earning (Est.)</p>
                                   <p className="text-xl font-bold text-success">₹{(job.pricing?.providerEarning || 0).toLocaleString('en-IN')}</p>
                                </div>
                                <div className="flex gap-2">
                                   <button onClick={() => handleReject(job)} className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><XCircle size={18} /></button>
                                   <button onClick={() => handleAccept(job)} className="p-3 rounded-xl bg-accent text-white hover:bg-dark transition-all"><CheckCircle size={18} /></button>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                </div>
              )}
           </div>

           {/* Right Sidebar - Analytics & Quick Tools */}
           <div className="space-y-8">
              {/* Satisfaction Gague Card */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 overflow-hidden relative">
                 <h3 className="font-display font-bold text-xl text-dark mb-6">Efficiency Level</h3>
                 <div className="flex flex-col items-center justify-center py-6">
                    <div className="relative w-44 h-44 mb-6">
                       <svg className="w-full h-full transform -rotate-180" viewBox="0 0 100 50">
                          <path d="M 10 50 A 40 40 0 1 1 90 50" fill="none" stroke="#F1F5F9" strokeWidth="10" strokeLinecap="round" />
                          <path d="M 10 50 A 40 40 0 1 1 85 20" fill="none" stroke="#3ACF8D" strokeWidth="10" strokeLinecap="round" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                          <span className="font-display text-4xl font-bold text-dark">94.7</span>
                          <span className="text-[10px] text-dark/30 font-bold uppercase tracking-widest">Out of 100</span>
                       </div>
                    </div>
                    <div className="w-full space-y-3">
                        <div className="flex justify-between items-center bg-surface p-3 rounded-xl">
                           <span className="text-xs font-bold text-dark/40">SLA Punctuality</span>
                           <span className="text-xs font-bold text-dark">98.2%</span>
                        </div>
                        <div className="flex justify-between items-center bg-surface p-3 rounded-xl">
                           <span className="text-xs font-bold text-dark/40">Checklist Accuracy</span>
                           <span className="text-xs font-bold text-dark">85.0%</span>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Service Pro Tools */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 h-full">
                 <h3 className="font-display font-bold text-xl text-dark mb-6">Quick Pro Tools</h3>
                 <div className="space-y-3">
                    {[
                       { l: 'Digital Checklists', i: <ClipboardList size={14} />, c: 'bg-blue-50 text-blue-600' },
                       { l: 'Generate Invoice', i: <FileText size={14} />, c: 'bg-green-50 text-green-600' },
                       { l: 'Route Optimization', i: <Navigation size={14} />, c: 'bg-purple-50 text-purple-600' },
                       { l: 'Coupons & Promos', i: <TrendingUp size={14} />, c: 'bg-orange-50 text-orange-600' },
                    ].map(t => (
                       <button key={t.l} className="w-full flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:border-accent hover:shadow-lg hover:shadow-accent/5 transition-all group">
                          <div className={`p-2 rounded-lg ${t.c} group-hover:scale-110 transition-transform`}>{t.i}</div>
                          <span className="text-xs font-bold text-dark">{t.l}</span>
                          <ChevronRight size={14} className="ml-auto text-dark/20" />
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  )
}
