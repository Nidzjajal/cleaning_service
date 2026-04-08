'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Booking } from '@/types'
import CustomerDashboardLayout from '@/components/layout/CustomerDashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import StatusBadge from '@/components/ui/StatusBadge'
import { 
  Navigation, MapPin, MessageSquare, Phone, 
  Clock, Shield, Star, AlertCircle, TrendingUp,
  Activity, ArrowRight, Package, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'

const trackableStatuses = ['CONFIRMED', 'PROVIDER_ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS']

export default function OrderTrackingPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeBookings, setActiveBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) fetchActiveJobs()
  }, [isAuthenticated])

  const fetchActiveJobs = async () => {
    setLoading(true)
    try {
      const res = await api.get('/bookings/my')
      const active = res.data.bookings.filter((b: Booking) => trackableStatuses.includes(b.status))
      setActiveBookings(active)
    } catch {
      toast.error('Failed to load active tracking data')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return <LoadingSpinner />

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-dark mb-2">Live Job Tracking</h1>
          <p className="text-dark/40">Monitor your active service requests in real-time.</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-green-50 text-green-700 rounded-2xl border border-green-100 pr-4">
          <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse ml-2"></span>
          <span className="text-xs font-black uppercase tracking-widest leading-none">System Live</span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Connecting to live feed..." />
      ) : activeBookings.length === 0 ? (
        <div className="card p-24 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-surface border border-gray-50 flex items-center justify-center mb-8 shadow-sm">
             <Navigation className="w-12 h-12 text-dark/10" />
          </div>
          <h3 className="font-display font-black text-2xl text-dark mb-3 uppercase tracking-tighter">No Active Jobs</h3>
          <p className="text-dark/40 text-sm max-w-sm mb-10 leading-relaxed font-semibold">Live tracking is only available while your helper is on the way or working.</p>
          <Link href="/customer/dashboard" className="btn-accent py-4 px-10 shadow-lg">
            Check Booking History <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activeBookings.map(job => {
            const svc = job.serviceId as any
            const prov = job.providerId as any
            const isLive = job.status === 'ON_THE_WAY'

            return (
              <div key={job._id} className={`card p-0 overflow-hidden relative border-none shadow-sm transition-all hover:shadow-card-hover group
                ${isLive ? 'ring-2 ring-accent' : ''}`}>
                
                {isLive && (
                  <div className="bg-accent px-6 py-2 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                     <Activity className="w-3.5 h-3.5 animate-pulse" />
                     Live Updates Active
                  </div>
                )}

                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-50">
                  {/* Header + Progress */}
                  <div className="p-8 flex-1">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-16 rounded-2xl bg-surface border border-gray-50 shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                           {svc?.icon || '🧹'}
                         </div>
                         <div>
                           <h3 className="font-display font-black text-xl text-dark uppercase tracking-tight">{svc?.name}</h3>
                           <p className="text-xs text-dark/30 font-bold uppercase tracking-widest">ID: {job.bookingRef}</p>
                         </div>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>

                    {/* Progress Bar (Visual) */}
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between text-[10px] font-black uppercase tracking-widest text-dark/30">
                        <span>Progress</span>
                        <span>{job.status === 'IN_PROGRESS' ? '70%' : '20%'}</span>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-surface border border-gray-50">
                        <div style={{ width: job.status === 'IN_PROGRESS' ? '70%' : '20%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent transition-all duration-1000"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 mt-8 gap-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-[10px] text-dark/30 uppercase font-black tracking-widest">Job Date</p>
                          <p className="text-sm font-bold text-dark">{new Date(job.scheduledDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-[10px] text-dark/30 uppercase font-black tracking-widest">Location</p>
                          <p className="text-sm font-bold text-dark truncate max-w-[120px]">{job.serviceAddress?.city}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Helper Info + Action */}
                  <div className="p-8 lg:w-96 bg-surface/20 flex flex-col justify-between">
                    <div className="space-y-6">
                       <h4 className="text-[10px] text-dark/30 uppercase font-black tracking-[0.3em] mb-4">Assigned Expert</h4>
                       {prov ? (
                         <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-50 shadow-sm relative overflow-hidden group/card shadow-element">
                           <div className="w-14 h-14 rounded-2xl bg-dark text-white flex items-center justify-center font-black text-xl shadow-lg relative z-10 group-hover/card:scale-105 transition-transform">
                             {prov.name?.[0]}
                           </div>
                           <div className="relative z-10">
                             <p className="font-display font-black text-dark text-lg leading-tight uppercase">{prov.name}</p>
                             <div className="flex items-center gap-1 mt-1 text-amber-500 font-bold text-xs ring-1 ring-amber-100 px-2 rounded-full w-fit bg-amber-50">
                               <Star className="w-3.5 h-3.5 fill-current" />
                               <span>{prov.profile?.rating || 'NEW'}</span>
                             </div>
                           </div>
                           {/* Background accent */}
                           <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                         </div>
                       ) : (
                         <div className="flex items-center gap-4 p-6 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                           <TrendingUp className="w-6 h-6 text-dark/15 animate-bounce" />
                           <p className="text-xs text-dark/40 font-bold uppercase tracking-widest">Optimizing Provider Allocation...</p>
                         </div>
                       )}
                    </div>

                    <div className="flex gap-3 mt-8">
                      <button className="flex-1 bg-white border border-gray-100 h-14 rounded-2xl text-dark/60 font-black text-xs uppercase tracking-widest hover:bg-dark hover:text-white transition-all shadow-sm">
                         <MessageSquare className="w-4 h-4 mx-auto" />
                      </button>
                      <Link href={`/customer/tracking?booking=${job._id}`} className="flex-[3] btn-accent h-14 shadow-glow flex items-center gap-3">
                         Live Map <Navigation className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
