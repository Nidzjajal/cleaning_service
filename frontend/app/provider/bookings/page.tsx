'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { 
  Calendar, Clock, MapPin, Search, Filter, 
  MoreVertical, CheckCircle, XCircle, ChevronRight, 
  User, Eye, Edit3, ClipboardList, Info, AlertCircle,
  FileText, Camera, CheckSquare, Wallet, Bell, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import ProviderSidebar from '@/components/layout/ProviderSidebar'
import { Booking } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
  CONFIRMED: 'bg-blue-50 text-blue-600 border-blue-100',
  ON_THE_WAY: 'bg-purple-50 text-purple-600 border-purple-100',
  IN_PROGRESS: 'bg-accent/10 text-accent border-accent/20',
  COMPLETED: 'bg-green-50 text-green-600 border-green-100',
  CANCELLED: 'bg-red-50 text-red-600 border-red-100',
}

export default function ProviderBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await api.get('/providers/jobs')
      setBookings(res.data.jobs || [])
    } catch { toast.error('Failed to load bookings') }
    finally { setLoading(false) }
  }

  const handleAction = async (id: string, action: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status: action })
      toast.success(`Booking ${action.toLowerCase()}!`)
      fetchBookings()
      if (selectedBooking?._id === id) setIsDetailOpen(false)
    } catch { toast.error('Action failed') }
  }

  const filtered = bookings.filter(b => {
    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus
    const matchesSearch = b.bookingRef?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (b.customerId as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const stats = {
    today: bookings.filter(b => new Date(b.scheduledDate).toDateString() === new Date().toDateString()).length,
    new: bookings.filter(b => b.status === 'PENDING').length,
    ongoing: bookings.filter(b => ['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)).length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  }

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
              placeholder="Search by ID or Customer..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent shadow-sm"
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
             <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-dark/40 hover:text-accent relative transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full border-2 border-white" />
             </button>
          </div>
        </header>

        {/* Quick Glance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Calendar size={20} /></div>
              <div>
                 <p className="text-[10px] font-bold text-dark/30 uppercase tracking-widest">Today's Jobs</p>
                 <p className="text-2xl font-bold text-dark">{stats.today}</p>
              </div>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 border-l-[6px] border-l-amber-400">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center"><AlertCircle size={20} /></div>
              <div>
                 <p className="text-[10px] font-bold text-dark/30 uppercase tracking-widest">New Requests</p>
                 <p className="text-2xl font-bold text-dark">{stats.new}</p>
              </div>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center"><Clock size={20} /></div>
              <div>
                 <p className="text-[10px] font-bold text-dark/30 uppercase tracking-widest">Ongoing Projects</p>
                 <p className="text-2xl font-bold text-dark">{stats.ongoing}</p>
              </div>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center"><XCircle size={20} /></div>
              <div>
                 <p className="text-[10px] font-bold text-dark/30 uppercase tracking-widest">Cancelled Bids</p>
                 <p className="text-2xl font-bold text-dark">{stats.cancelled}</p>
              </div>
           </div>
        </div>

        {/* Filters & Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-8 border-b border-gray-50 flex items-center justify-between flex-wrap gap-4">
              <div>
                 <h3 className="font-display font-bold text-xl text-dark">Management Workboard</h3>
                 <p className="text-xs text-dark/40">Filter by status or category to manage cleaning crews.</p>
              </div>
              <div className="flex gap-2 bg-surface p-1.5 rounded-2xl">
                 {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].map(status => (
                    <button 
                       key={status}
                       onClick={() => setFilterStatus(status)}
                       className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest
                          ${filterStatus === status ? 'bg-dark text-white shadow-lg' : 'text-dark/40 hover:text-dark'}`}
                    >
                       {status.replace('_', ' ')}
                    </button>
                 ))}
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-surface/50 border-b border-gray-50 text-[10px] font-bold text-dark/30 uppercase tracking-widest">
                    <tr>
                       <th className="px-8 py-4">Job ID & Service</th>
                       <th className="px-8 py-4">Customer</th>
                       <th className="px-8 py-4">Status</th>
                       <th className="px-8 py-4">Staff Assigned</th>
                       <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {filtered.length === 0 ? (
                       <tr><td colSpan={5} className="py-20 text-center text-dark/30 font-medium">No bookings match your criteria.</td></tr>
                    ) : (
                       filtered.map(booking => {
                          const svc = booking.serviceId as any;
                          const cust = booking.customerId as any;
                          return (
                             <tr key={booking._id} className="hover:bg-surface/30 transition-colors group">
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-surface border border-gray-100 flex items-center justify-center text-xl group-hover:bg-accent group-hover:text-white transition-all">
                                         {svc?.icon || '🧹'}
                                      </div>
                                      <div>
                                         <p className="font-bold text-sm text-dark">#{booking.bookingRef}</p>
                                         <p className="text-[10px] font-bold text-dark/40 uppercase tracking-tighter">{svc?.name}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <p className="font-bold text-sm text-dark">{cust?.name}</p>
                                   <p className="text-xs text-dark/40 flex items-center gap-1"><MapPin size={10} /> {booking.serviceAddress?.city}</p>
                                </td>
                                <td className="px-8 py-6">
                                   <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${STATUS_COLORS[booking.status]}`}>
                                      {booking.status.replace('_', ' ')}
                                   </span>
                                </td>
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full bg-dark text-white flex items-center justify-center text-[10px] font-bold">
                                         {user?.name?.[0]}
                                      </div>
                                      <p className="text-xs font-bold text-dark/70">Self (Provider)</p>
                                   </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                   <div className="flex items-center justify-end gap-2">
                                      {booking.status === 'PENDING' && (
                                         <>
                                            <button onClick={() => handleAction(booking._id, 'CANCELLED')} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all"><XCircle size={16} /></button>
                                            <button onClick={() => handleAction(booking._id, 'CONFIRMED')} className="p-2 bg-accent text-white rounded-lg shadow-sm hover:shadow-lg transition-all"><CheckCircle size={16} /></button>
                                         </>
                                      )}
                                      <button 
                                         onClick={() => { setSelectedBooking(booking); setIsDetailOpen(true); }}
                                         className="p-2 hover:bg-surface text-dark/40 hover:text-dark rounded-lg transition-all"
                                      >
                                         <Eye size={16} />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          )
                       })
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </main>

      {/* Booking Detail Sidebar (Modal Style) */}
      {isDetailOpen && selectedBooking && (
         <div className="fixed inset-0 z-50 flex items-center justify-end bg-dark/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-xl h-full bg-white shadow-2xl overflow-y-auto animate-slide-left p-10">
               <div className="flex items-center justify-between mb-10">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${STATUS_COLORS[selectedBooking.status]}`}>
                     {selectedBooking.status}
                  </span>
                  <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-surface rounded-full text-dark/30 transition-all"><XCircle size={20} /></button>
               </div>

               <h2 className="text-3xl font-display font-bold text-dark mb-2">Booking #{(selectedBooking.serviceId as any)?.name}</h2>
               <p className="text-dark/40 font-medium mb-10 flex items-center gap-2"><Info size={16} /> Job Tracking ID: #{selectedBooking.bookingRef}</p>

               <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="space-y-6">
                     <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-dark/30 mb-2">Customer Instructions</h4>
                        <div className="bg-surface rounded-2xl p-5 border border-gray-50 italic text-sm text-dark/60 leading-relaxed">
                           "Customer mentioned: {selectedBooking.specialInstructions || 'Handle with care'}"
                        </div>
                     </div>
                     <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-dark/30 mb-3">Service Tasks</h4>
                        <div className="space-y-2">
                           {['Kitchen Scrubbing', 'Vacuuming', 'Window Polish', 'Trash Removal'].map((task, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                                 <CheckSquare size={16} className={i < 2 ? 'text-accent' : 'text-gray-200'} />
                                 <span className={`text-xs font-bold ${i < 2 ? 'text-dark' : 'text-dark/30'}`}>{task}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="p-5 bg-dark rounded-2xl text-white shadow-xl shadow-dark/20 relative overflow-hidden">
                        <div className="absolute -right-8 -bottom-8 text-white/5"><Wallet size={120} /></div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Total Payment</h4>
                        <p className="text-4xl font-display font-bold mb-4">₹{selectedBooking.pricing?.total.toLocaleString('en-IN')}</p>
                        <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg text-[9px] font-bold w-fit">
                           {selectedBooking.status === 'COMPLETED' ? 'PAYMENT SUCCESSFUL ✅' : 'PENDING SETTLEMENT 💳'}
                        </div>
                     </div>

                     <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-dark/30 mb-3">Post-Job Verification</h4>
                        <div className="grid grid-cols-2 gap-2">
                           <div className="aspect-square bg-surface border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-dark/30 gap-1 hover:border-accent hover:text-accent transition-all cursor-pointer">
                              <Camera size={20} />
                              <span className="text-[9px] font-bold">Before</span>
                           </div>
                           <div className="aspect-square bg-surface border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-dark/30 gap-1 hover:border-accent hover:text-accent transition-all cursor-pointer">
                              <Camera size={20} />
                              <span className="text-[9px] font-bold">After</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="border-t border-gray-50 pt-8 flex gap-4">
                  {selectedBooking.status === 'PENDING' ? (
                     <>
                        <button onClick={() => handleAction(selectedBooking._id, 'CANCELLED')} className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all">Reject Job</button>
                        <button onClick={() => handleAction(selectedBooking._id, 'CONFIRMED')} className="flex-1 py-4 bg-accent text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-accent/20 hover:bg-dark transition-all">Accept Job</button>
                     </>
                  ) : (
                     <button className="w-full py-4 bg-surface text-dark/40 rounded-2xl font-bold uppercase tracking-widest text-xs" disabled>RESCHEDULE NOT AVAILABLE</button>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  )
}
