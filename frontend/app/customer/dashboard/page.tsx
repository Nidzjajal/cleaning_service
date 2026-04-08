'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Booking } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  Calendar, Clock, MapPin, ChevronRight, Navigation,
  Package, ArrowRight, RefreshCw, Star, Phone, 
  Search, Shield, FileText, TrendingUp, Users
} from 'lucide-react'
import toast from 'react-hot-toast'

type TabKey = 'active' | 'completed' | 'cancelled'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

const activeStatuses = ['PENDING', 'CONFIRMED', 'PROVIDER_ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS']

export default function CustomerDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('active')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
    if (isAuthenticated) fetchBookings()
  }, [isAuthenticated, authLoading])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await api.get('/bookings/my')
      setBookings(res.data.bookings || [])
    } catch { toast.error('Failed to load bookings') }
    finally { setLoading(false) }
  }

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'active') return activeStatuses.includes(b.status)
    if (activeTab === 'completed') return b.status === 'COMPLETED' || b.status === 'REVIEWED'
    if (activeTab === 'cancelled') return b.status === 'CANCELLED'
    return true
  })

  const formatTime = (t: string) => {
    const [h, m] = t.split(':')
    const hr = parseInt(h)
    return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
  }

  const stats = [
    { label: 'Active Jobs', value: bookings.filter(b => activeStatuses.includes(b.status)).length, icon: Navigation, color: 'text-accent' },
    { label: 'Total Spent', value: `₹${bookings.reduce((sum, b) => sum + (b.pricing?.total || 0), 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-green-500' },
    { label: 'Saved Helpers', value: new Set(bookings.map(b => b.providerId)).size - 1, icon: Star, color: 'text-amber-500' },
  ]

  if (authLoading) return <LoadingSpinner />

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(stat => (
          <div key={stat.label} className="card p-6 flex items-center justify-between group overflow-hidden relative border-none">
            <div className="relative z-10">
              <p className="text-dark/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="font-display font-black text-3xl text-dark tracking-tighter">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-surface flex items-center justify-center relative z-10 transition-all group-hover:bg-dark group-hover:text-white group-hover:scale-110 shadow-sm`}>
              <stat.icon className={`w-6 h-6 ${stat.color} group-hover:text-white transition-colors`} />
            </div>
          </div>
        ))}
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Welcome Card */}
        <div className="bg-dark rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-between min-h-[360px] shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl font-display font-black mb-6 tracking-tighter leading-tight uppercase">Hello, <br/> {user?.name?.split(' ')[0]}! 👋</h2>
            <p className="text-white/40 mb-10 max-w-xs font-bold uppercase tracking-widest text-xs leading-loose">Ready to make your home shine? <br/> Book a professional helper now.</p>
            <Link href="/customer/book" className="btn-accent py-5 px-10 inline-flex items-center gap-3 shadow-glow uppercase font-black text-xs tracking-widest group">
              Book a New Service 
              <Search className="w-4 h-4 group-hover:scale-125 transition-transform" />
            </Link>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* Quick Links / Tasks */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/customer/book" className="card p-8 hover:shadow-card-hover transition-all group border-b-4 border-b-accent !rounded-[2rem]">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-all shadow-inner">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-sm text-dark uppercase tracking-widest mb-1">Book Now</h3>
            <p className="text-[10px] text-dark/30 font-bold uppercase tracking-tight">Standard & Deep Cleaning</p>
          </Link>
          
          <Link href="/customer/tracking" className="card p-8 hover:shadow-card-hover transition-all group border-b-4 border-b-blue-500 !rounded-[2rem]">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-sm text-dark uppercase tracking-widest mb-1">Live Track</h3>
            <p className="text-[10px] text-dark/30 font-bold uppercase tracking-tight">Real-time Location</p>
          </Link>

          <Link href="/customer/settings" className="card p-8 hover:shadow-card-hover transition-all group border-b-4 border-b-green-500 !rounded-[2rem]">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-all shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-sm text-dark uppercase tracking-widest mb-1">Security</h3>
            <p className="text-[10px] text-dark/30 font-bold uppercase tracking-tight">Manage 2FA & Profile</p>
          </Link>

          <Link href="/customer/invoices" className="card p-8 hover:shadow-card-hover transition-all group border-b-4 border-b-purple-500 !rounded-[2rem]">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mb-6 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-sm text-dark uppercase tracking-widest mb-1">Financial</h3>
            <p className="text-[10px] text-dark/30 font-bold uppercase tracking-tight">History & Invoices</p>
          </Link>
        </div>
      </div>

      {/* Bookings Section */}
      <section id="my-bookings">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 mt-12">
          <div>
            <h2 className="font-display font-black text-3xl text-dark uppercase tracking-tighter">My Bookings</h2>
            <p className="text-dark/30 text-xs font-bold uppercase tracking-widest mt-1">Review your service lifecycle</p>
          </div>
          
          <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm">
            {tabs.map(tab => {
              const count = bookings.filter(b =>
                tab.key === 'active' ? activeStatuses.includes(b.status) :
                tab.key === 'completed' ? ['COMPLETED', 'REVIEWED'].includes(b.status) :
                b.status === 'CANCELLED'
              ).length
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3
                    ${activeTab === tab.key ? 'bg-dark text-white shadow-button scale-105' : 'text-dark/40 hover:text-dark hover:bg-surface'}`}
                >
                  {tab.label}
                  {count > 0 && <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${activeTab === tab.key ? 'bg-accent text-white' : 'bg-dark/5'}`}>{count}</span>}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <LoadingSpinner text="Retrieving vault records..." />
          ) : filteredBookings.length === 0 ? (
            <div className="card p-20 text-center flex flex-col items-center !rounded-[3rem] border-dashed border-gray-100">
              <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center mb-8 border border-gray-50 relative">
                <Package className="w-10 h-10 text-dark/10" />
                <div className="absolute top-0 right-0 w-8 h-8 bg-white border border-gray-50 rounded-full flex items-center justify-center text-[10px] font-black text-dark/20">?</div>
              </div>
              <h3 className="font-display font-black text-xl text-dark mb-2 uppercase tracking-tight">No {activeTab} records found</h3>
              <p className="text-dark/30 text-xs mb-10 max-w-xs mx-auto font-bold uppercase tracking-widest leading-loose">Your service vault is currently clear. Ready to book an expert?</p>
              <Link href="/customer/book" className="btn-accent px-12 py-4 shadow-xl uppercase font-black text-xs tracking-widest">
                Explore Services <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredBookings.map(booking => {
                const svc = booking.serviceId as any
                const prov = booking.providerId as any
                const isTrackable = activeStatuses.includes(booking.status)

                return (
                  <div key={booking._id} className="bg-white rounded-[2rem] p-0 overflow-hidden group hover:shadow-card-hover transition-all border border-gray-50 shadow-sm h-full">
                    <div className="flex flex-col lg:flex-row items-stretch min-h-[160px]">
                      {/* Service Info */}
                      <div className="p-8 flex flex-1 flex-col sm:flex-row items-center gap-8 border-b lg:border-b-0 lg:border-r border-gray-50 relative overflow-hidden">
                        {/* Subtle background icon */}
                        <div className="absolute -right-4 -top-4 text-dark/[0.02] rotate-12 group-hover:scale-125 transition-transform">
                           <Package size={120} />
                        </div>

                        <div className="w-20 h-20 rounded-3xl bg-surface border border-gray-100 flex items-center justify-center text-4xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-sm relative z-10 shrink-0">
                          {svc?.icon || '🧹'}
                        </div>
                        <div className="text-center sm:text-left flex-1 min-w-0 relative z-10">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                            <h4 className="font-display font-black text-lg text-dark truncate uppercase tracking-tight">{svc?.name}</h4>
                            <StatusBadge status={booking.status} />
                          </div>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-5 text-[10px] font-black text-dark/30 uppercase tracking-[0.2em] mt-3">
                            <span className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-gray-50"><Calendar className="w-3 h-3 text-accent" /> {new Date(booking.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            <span className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-gray-100"><Clock className="w-3 h-3 text-accent" /> {formatTime(booking.scheduledTime)}</span>
                            <span className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-gray-50"><MapPin className="w-3 h-3 text-accent" /> {booking.serviceAddress?.city}</span>
                          </div>
                        </div>
                      </div>

                      {/* Helper & Actions */}
                      <div className="p-8 bg-surface/30 flex flex-col sm:flex-row lg:w-[450px] items-center justify-between gap-8">
                        <div className="flex items-center gap-4 bg-white p-3 pr-6 rounded-2xl shadow-sm border border-gray-50 hover:border-accent/10 transition-colors">
                          {prov && typeof prov === 'object' ? (
                            <>
                              <div className="w-12 h-12 rounded-xl bg-dark text-white flex items-center justify-center font-black relative group/avatar shadow-xl rotate-1">
                                {prov.name?.[0]}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                              </div>
                              <div>
                                <p className="text-xs font-black text-dark uppercase tracking-tight">{prov.name}</p>
                                <a href={`tel:${prov.phone}`} className="text-[10px] text-accent font-black uppercase tracking-widest flex items-center gap-1.5 mt-1 hover:underline">
                                  <Phone className="w-3 h-3" /> Connect Now
                                </a>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col px-4">
                              <p className="text-[10px] font-black text-dark/40 uppercase tracking-widest animate-pulse">Assigning Expert...</p>
                              <div className="w-full h-1 bg-dark/5 rounded-full mt-2 overflow-hidden">
                                 <div className="h-full bg-accent w-1/2 animate-shimmer"></div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
                          <div className="flex flex-col items-end">
                             <p className="text-[9px] font-black text-dark/20 uppercase tracking-widest">Total Invoice</p>
                             <span className="font-display font-black text-3xl text-dark tracking-tighter">₹{booking.pricing?.total?.toLocaleString('en-IN')}</span>
                          </div>
                          {isTrackable ? (
                            <Link href={`/customer/tracking?booking=${booking._id}`} className="btn-accent btn-sm py-3 px-8 shadow-glow-accent uppercase font-black text-[10px] tracking-widest flex items-center gap-2">
                              <Navigation className="w-3 h-3" /> Live Control
                            </Link>
                          ) : (
                            <Link href={`/customer/bookings/${booking._id}`} className="btn-ghost btn-sm py-3 px-8 border border-dark/5 text-dark/40 hover:text-dark hover:bg-white uppercase font-black text-[10px] tracking-widest flex items-center gap-2">
                              Full Report <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
