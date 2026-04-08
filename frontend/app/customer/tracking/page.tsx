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
  Activity, ArrowRight, Package, Calendar, CheckCircle, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import TrackingMap from '@/components/tracking/TrackingMap'

const trackableStatuses = ['CONFIRMED', 'PROVIDER_ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS']

export default function OrderTrackingPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeBookings, setActiveBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [providerLoc, setProviderLoc] = useState<{lat: number, lng: number} | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoaded] = useState(true)
  const [hasToastedComplete, setHasToastedComplete] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const bId = params.get('booking')
    if (isAuthenticated) fetchActiveJobs(bId)
  }, [isAuthenticated])

  useEffect(() => {
    if (!selectedBooking) return
    const socket = require('@/lib/socket').getSocket()
    socket.emit('join-booking-room', { bookingId: selectedBooking._id })

    // Use specific function references to avoid stacking
    const handleLocation = (data: any) => {
      if (data.bookingId === selectedBooking._id) {
        setProviderLoc({ lat: data.lat, lng: data.lng })
      }
    }

    const handleStatus = (data: any) => {
      setSelectedBooking(prev => prev ? { ...prev, status: data.status } : null)
      if (data.status === 'COMPLETED' && !hasToastedComplete) {
         setHasToastedComplete(true)
         toast.success('Job completed! Thank you for choosing HelpLender.', { id: 'job-complete' })
         fetchActiveJobs()
      }
    }

    socket.on('provider-location', handleLocation)
    socket.on('booking-status', handleStatus)

    return () => {
      socket.off('provider-location', handleLocation)
      socket.off('booking-status', handleStatus)
    }
  }, [selectedBooking, hasToastedComplete])

  const fetchActiveJobs = async (selectId?: string | null) => {
    setLoading(true)
    try {
      const res = await api.get('/bookings/my')
      const active = res.data.bookings.filter((b: Booking) => trackableStatuses.includes(b.status))
      setActiveBookings(active)
      if (selectId) {
        const found = active.find((b: Booking) => b._id === selectId)
        if (found) setSelectedBooking(found)
      }
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
      ) : selectedBooking ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Detailed Status & Map */}
           <div className="lg:col-span-2 space-y-6">
              <div className="card p-0 h-[500px] border-none shadow-2xl overflow-hidden relative group">
                 <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                    <StatusBadge status={selectedBooking.status} />
                    {providerLoc && <span className="badge bg-green-50 text-green-600 border border-green-100 shadow-sm">Signal Strong 📡</span>}
                 </div>

                 <TrackingMap 
                    customerLocation={{ lat: selectedBooking.serviceAddress.lat || 19.0760, lng: selectedBooking.serviceAddress.lng || 72.8777 }}
                    providerLocation={providerLoc || (selectedBooking.liveLocation ? { lat: selectedBooking.liveLocation.lat, lng: selectedBooking.liveLocation.lng } : null)} 
                    status={selectedBooking.status}
                 />

                 {/* Map Overlay Stats */}
                 <div className="absolute bottom-6 left-6 right-6 z-10 flex gap-4">
                    <div className="flex-1 bg-white/95 backdrop-blur-md p-5 rounded-[2rem] shadow-2xl flex items-center justify-between border border-white/20">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-dark text-white flex items-center justify-center">
                             <Clock className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-dark/30 uppercase tracking-widest">Est. Arrival</p>
                             <p className="font-display font-black text-dark text-xl">{selectedBooking.etaMinutes || 'Calculating...'} mins</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button className="w-12 h-12 rounded-2xl bg-surface border border-gray-100 flex items-center justify-center text-dark/40 hover:text-accent transition-colors"><Phone size={18}/></button>
                          <button className="w-12 h-12 rounded-2xl bg-surface border border-gray-100 flex items-center justify-center text-dark/40 hover:text-accent transition-colors"><MessageSquare size={18}/></button>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="card p-8 bg-dark text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-44 h-44 bg-accent/20 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
                 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Service Execution</h4>
                        <h3 className="font-display font-black text-2xl uppercase tracking-tighter">{(selectedBooking.serviceId as any)?.name}</h3>
                    </div>
                    <button onClick={() => setSelectedBooking(null)} className="btn-ghost bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                       Switch Booking
                    </button>
                 </div>
              </div>
           </div>

           {/* Provider & Summary Sidebar */}
           <div className="space-y-6">
              <div className="card p-8 border-none shadow-xl">
                 <h4 className="text-[10px] font-black text-dark/30 uppercase tracking-[0.3em] mb-6">Assigned Helper</h4>
                 <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-dark text-white flex items-center justify-center font-black text-4xl shadow-glow mb-6 relative">
                       {(selectedBooking.providerId as any).name?.[0]}
                       <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white rounded-full flex items-center justify-center p-1">
                          <Star className="w-full h-full fill-white text-white" />
                       </div>
                    </div>
                    <h3 className="font-display font-black text-2xl text-dark uppercase tracking-tight">{(selectedBooking.providerId as any).name}</h3>
                    <p className="text-xs text-dark/40 font-bold uppercase tracking-widest mb-6">Expert Professional</p>
                    
                    <div className="grid grid-cols-2 w-full gap-4">
                       <div className="bg-surface p-4 rounded-3xl">
                          <p className="text-[9px] font-black text-dark/30 uppercase tracking-widest mb-1">Rating</p>
                          <p className="font-display font-black text-xl text-dark">{(selectedBooking.providerId as any).profile?.rating || '4.9'}</p>
                       </div>
                       <div className="bg-surface p-4 rounded-3xl">
                          <p className="text-[9px] font-black text-dark/30 uppercase tracking-widest mb-1">Status</p>
                          <p className="font-display font-black text-xl text-success">Verified</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="card p-8 border-none shadow-xl bg-surface/50">
                 <h4 className="text-[10px] font-black text-dark/30 uppercase tracking-[0.3em] mb-6">Live Checklist</h4>
                 <div className="space-y-4">
                    {[
                       { l: 'Journey Initialized', c: true },
                       { l: 'Background Verification', c: true },
                       { l: 'On the Way', c: selectedBooking.status === 'ON_THE_WAY' },
                       { l: 'Safe Arrival', c: ['ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(selectedBooking.status) },
                    ].map((step, i) => (
                       <div key={i} className={`flex items-center gap-3 ${step.c ? 'text-dark' : 'text-dark/20'}`}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${step.c ? 'bg-success text-white' : 'border border-dark/10'}`}>
                             {step.c && <CheckCircle className="w-3 h-3" />}
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest">{step.l}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      ) : activeBookings.length === 0 ? (
        <div className="card p-24 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-surface border border-gray-50 flex items-center justify-center mb-8 shadow-sm">
             <Navigation className="w-12 h-12 text-dark/10" />
          </div>
          <h3 className="font-display font-black text-2xl text-dark mb-3 uppercase tracking-tighter">No Trackable Records</h3>
          <p className="text-dark/40 text-sm max-w-sm mb-10 leading-relaxed font-bold uppercase tracking-widest">Active tracking activates once your professional helper initiates the journey.</p>
          <Link href="/customer/dashboard" className="btn-accent py-5 px-10 shadow-glow uppercase font-black text-xs tracking-[0.2em]">
            Booking History <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activeBookings.map(job => {
            const svc = job.serviceId as any
            const prov = job.providerId as any
            const isLive = job.status === 'ON_THE_WAY'

            return (
              <div key={job._id} className={`bg-white rounded-[2.5rem] p-0 overflow-hidden relative border border-gray-50 shadow-sm transition-all hover:shadow-card-hover group
                ${isLive ? 'ring-2 ring-accent' : ''}`}>
                
                {isLive && (
                  <div className="bg-accent px-8 py-2.5 text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                     <Activity className="w-4 h-4 animate-pulse" />
                     Live Satellite Feed Active
                  </div>
                )}

                <div className="flex flex-col lg:flex-row items-stretch">
                  {/* Header + Progress */}
                  <div className="p-10 flex-1">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-6">
                         <div className="w-20 h-20 rounded-3xl bg-surface border border-gray-100 shadow-sm flex items-center justify-center text-4xl group-hover:rotate-6 transition-transform">
                           {svc?.icon || '🧹'}
                         </div>
                         <div>
                           <h3 className="font-display font-black text-2xl text-dark uppercase tracking-tighter">{svc?.name}</h3>
                           <div className="flex items-center gap-3 mt-1">
                              <p className="text-[10px] text-dark/30 font-black uppercase tracking-widest">HL-REF: {job.bookingRef}</p>
                              <StatusBadge status={job.status} />
                           </div>
                         </div>
                      </div>
                    </div>
 
                    <div className="grid grid-cols-1 md:grid-cols-2 mt-8 gap-8">
                      <div className="flex items-center gap-4 bg-surface/50 p-4 rounded-2xl">
                        <Calendar className="w-6 h-6 text-accent" />
                        <div>
                          <p className="text-[9px] text-dark/30 uppercase font-black tracking-widest">Scheduled For</p>
                          <p className="text-sm font-black text-dark uppercase">{new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-surface/50 p-4 rounded-2xl">
                        <MapPin className="w-6 h-6 text-accent" />
                        <div>
                          <p className="text-[9px] text-dark/30 uppercase font-black tracking-widest">Service Node</p>
                          <p className="text-sm font-black text-dark uppercase">{job.serviceAddress?.city}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Helper Info + Action */}
                  <div className="p-10 lg:w-[450px] bg-surface/30 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100">
                    <div className="space-y-6">
                       <h4 className="text-[10px] text-dark/30 uppercase font-black tracking-[0.4em] mb-6">Assigned Operative</h4>
                       {prov ? (
                         <div className="flex items-center gap-5 p-5 bg-white rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden group/card">
                           <div className="w-16 h-16 rounded-[1.5rem] bg-dark text-white flex items-center justify-center font-black text-2xl relative z-10">
                             {prov.name?.[0]}
                           </div>
                           <div className="relative z-10">
                             <p className="font-display font-black text-dark text-xl uppercase tracking-tight">{prov.name}</p>
                             <div className="flex items-center gap-2 mt-1 underline decoration-accent/30 underline-offset-4 text-xs font-black text-dark/40 uppercase tracking-widest decoration-2 italic">
                               Expert Verified
                             </div>
                           </div>
                           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                         </div>
                       ) : (
                         <div className="flex items-center gap-4 p-8 bg-white/50 rounded-3xl border-2 border-dashed border-dark/5">
                           <Loader2 className="w-6 h-6 text-dark/20 animate-spin" />
                           <p className="text-[10px] text-dark/30 font-black uppercase tracking-widest animate-pulse">Assigning Local Expert...</p>
                         </div>
                       )}
                    </div>

                    <div className="flex gap-4 mt-12">
                      <button className="w-16 h-16 bg-white border border-gray-200 rounded-3xl flex items-center justify-center text-dark/40 hover:text-accent hover:border-accent hover:shadow-glow-accent transition-all">
                         <MessageSquare className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => setSelectedBooking(job)}
                        className="flex-1 btn-accent h-16 shadow-glow flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em]"
                      >
                         Live Monitor <Navigation className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
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
