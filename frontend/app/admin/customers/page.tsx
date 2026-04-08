'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Users, Search, Bell, Filter, Download, MoreVertical, 
  Mail, Phone, Calendar, ArrowUpRight, History, CreditCard, 
  MapPin, Shield, Ban, CheckCircle, ChevronRight, X, Info,
  Loader2, ExternalLink, Send
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import AdminSidebar from '@/components/layout/AdminSidebar'

interface Customer {
  _id: string
  name: string
  email: string
  phone: string
  status: string
  createdAt: string
  totalSpend: number
}

export default function AdminCustomersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/')
    fetchCustomers()
  }, [user])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/customers')
      setCustomers(res.data.customers || [])
    } catch { toast.error('Failed to fetch customers') }
    finally { setLoading(false) }
  }

  const fetchDetails = async (id: string) => {
    setDetailLoading(true)
    setShowDetail(true)
    try {
      const res = await api.get(`/admin/customers/${id}`)
      setSelectedCustomer(res.data)
    } catch { toast.error('Failed to load customer profile') }
    finally { setDetailLoading(false) }
  }

  const filtered = customers.filter(c => (
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c._id.includes(searchTerm)
  ))

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
              placeholder="Search by ID, name, or email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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

        <div className="flex items-center justify-between mb-10 text-dark">
           <div>
              <h1 className="font-display text-4xl font-bold mb-1">Client Directory</h1>
              <p className="text-dark/40 text-sm">Managing {customers.length} total active and historical customers.</p>
           </div>
           <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-xs font-bold uppercase tracking-widest text-dark/60 hover:border-accent hover:text-accent transition-all shadow-sm">
                 <Download size={16} /> Export CSV
              </button>
              <button className="flex items-center gap-2 px-6 py-3.5 bg-dark text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-dark/20 hover:bg-accent transition-all">
                 <Send size={16} /> Broadcast Message
              </button>
           </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
           <button className="flex items-center gap-2 px-6 py-2.5 bg-dark text-white border border-dark rounded-full text-xs font-bold">All Clients</button>
           <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-dark/50 border border-gray-100 rounded-full text-xs font-bold hover:border-dark hover:text-dark transition-all">High Spenders (VIP)</button>
           <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-dark/50 border border-gray-100 rounded-full text-xs font-bold hover:border-dark hover:text-dark transition-all">New (Last 7 Days)</button>
           <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-dark/50 border border-gray-100 rounded-full text-xs font-bold hover:border-dark hover:text-dark transition-all">Churned Users</button>
        </div>

        {/* Directory Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
           {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                 <Loader2 size={40} className="animate-spin text-accent" />
                 <p className="text-xs font-bold text-dark/20 uppercase tracking-widest">Aggregating Life Value Data...</p>
              </div>
           ) : (
              <table className="w-full text-left">
                 <thead className="bg-surface/50 border-b border-gray-100 text-[10px] font-bold text-dark/30 uppercase tracking-widest">
                    <tr>
                       <th className="px-8 py-6">User & Profile</th>
                       <th className="px-8 py-6">Contact Channels</th>
                       <th className="px-8 py-6">Status Info</th>
                       <th className="px-8 py-6">Join Date</th>
                       <th className="px-8 py-6">Lifetime Value (LTV)</th>
                       <th className="px-8 py-6 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {filtered.map(c => (
                       <tr key={c._id} className="hover:bg-surface/30 transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-dark/5 text-dark flex items-center justify-center font-bold text-sm">
                                   {c.name?.[0]}
                                </div>
                                <div>
                                   <p className="font-bold text-dark text-sm leading-tight">{c.name}</p>
                                   <p className="text-[10px] font-mono text-dark/30">ID: {c._id.slice(-6).toUpperCase()}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <button className="p-2 bg-surface text-dark/40 rounded-lg hover:text-accent hover:bg-accent/5 transition-all"><Mail size={14} /></button>
                                <button className="p-2 bg-surface text-dark/40 rounded-lg hover:text-accent hover:bg-accent/5 transition-all"><Phone size={14} /></button>
                                <div className="text-[11px] font-bold text-dark/60 ml-2">{c.email}</div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${c.status === 'ACTIVE' || c.status === 'APPROVED' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                {c.status}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                             <p className="text-xs font-bold text-dark/40">{format(new Date(c.createdAt), 'MMM dd, yyyy')}</p>
                          </td>
                          <td className="px-8 py-6">
                             <p className="text-sm font-display font-bold text-dark">₹{c.totalSpend.toLocaleString()}</p>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button onClick={() => fetchDetails(c._id)} className="px-6 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-dark/40 hover:border-accent hover:text-accent transition-all group-hover:shadow-md">View Profile</button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           )}
        </div>
      </main>

      {/* Drill-down Modal */}
      {showDetail && (
         <div className="fixed inset-0 z-50 flex items-center justify-end bg-dark/70 backdrop-blur-sm animate-fade-in p-4">
            <div className={`bg-white h-full w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col animate-slide-left transition-all ${detailLoading ? 'opacity-50' : 'opacity-100'}`}>
               {detailLoading ? (
                  <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-accent" size={40} /></div>
               ) : (
                  <>
                     <div className="p-12 bg-dark text-white relative">
                        <button onClick={() => setShowDetail(false)} className="absolute top-10 right-10 p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all"><X size={20} /></button>
                        <div className="flex items-center gap-6 mb-8">
                           <div className="w-20 h-20 rounded-[2rem] bg-accent flex items-center justify-center text-4xl font-bold shadow-2xl shadow-accent/20">
                              {selectedCustomer?.customer?.name?.[0]}
                           </div>
                           <div>
                              <h2 className="text-4xl font-display font-bold mb-2">{selectedCustomer?.customer?.name}</h2>
                              <div className="flex items-center gap-4 text-white/40 text-xs font-bold uppercase tracking-widest">
                                 <span className="flex items-center gap-1"><Mail size={12} /> {selectedCustomer?.customer?.email}</span>
                                 <span className="flex items-center gap-1"><Phone size={12} /> {selectedCustomer?.customer?.phone}</span>
                              </div>
                           </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                           <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Total Bookings</p>
                              <p className="text-xl font-bold font-display">{selectedCustomer?.bookings?.length || 0}</p>
                           </div>
                           <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Lifetime Value</p>
                              <p className="text-xl font-bold font-display">₹{(selectedCustomer?.transactions?.reduce((sum: number, t: any) => sum + (t.customerPaid || 0), 0) || 0).toLocaleString()}</p>
                           </div>
                           <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Member Since</p>
                              <p className="text-xl font-bold font-display text-accent">{selectedCustomer?.customer?.createdAt ? format(new Date(selectedCustomer.customer.createdAt), 'yyyy') : 'N/A'}</p>
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-surface/50">
                        {/* Address Book */}
                        <div>
                           <h3 className="font-display font-bold text-xl text-dark mb-6 flex items-center gap-2"><MapPin className="text-accent" /> Saved Addresses</h3>
                           <div className="grid grid-cols-1 gap-4">
                              <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm relative group hover:border-accent transition-all">
                                 <div className="p-2 bg-surface text-dark/20 rounded-lg absolute top-5 right-5 group-hover:text-accent transition-colors"><Shield size={16} /></div>
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-dark/30 mb-1">Home Office</p>
                                 <p className="font-bold text-dark text-sm">{selectedCustomer?.customer?.address?.street}, {selectedCustomer?.customer?.address?.city}</p>
                                 <p className="text-xs text-dark/40 mt-1">{selectedCustomer?.customer?.address?.state}, {selectedCustomer?.customer?.address?.pincode}</p>
                              </div>
                           </div>
                        </div>

                        {/* Recent Bookings */}
                        <div>
                            <h3 className="font-display font-bold text-xl text-dark mb-6 flex items-center gap-2"><History className="text-accent" /> Booking Lifecycle</h3>
                            <div className="space-y-4">
                               {selectedCustomer?.bookings?.slice(0, 3).map((bk: any) => (
                                  <div key={bk._id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm group hover:scale-[1.01] transition-all cursor-pointer">
                                     <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-2xl">{bk.serviceId?.icon || '🧹'}</div>
                                        <div>
                                           <p className="font-bold text-dark text-sm">{bk.serviceId?.name}</p>
                                           <p className="text-[10px] font-bold text-dark/30 uppercase tracking-widest">{format(new Date(bk.scheduledDate), 'MMM dd, yyyy')}</p>
                                        </div>
                                     </div>
                                     <div className="text-right">
                                        <p className="text-sm font-bold text-dark">₹{bk.pricing?.total}</p>
                                        <div className="text-[9px] font-bold uppercase text-accent">{bk.status}</div>
                                     </div>
                                  </div>
                               ))}
                            </div>
                        </div>

                        {/* Internal Notes */}
                        <div>
                           <h3 className="font-display font-bold text-xl text-dark mb-4">Internal Admin Notes</h3>
                           <textarea 
                              placeholder="Write private notes about this client (e.g., 'Requires pet-friendly supplies')..."
                              className="w-full bg-white border border-gray-100 rounded-3xl p-6 text-sm italic text-dark/60 focus:ring-accent/10 focus:border-accent transition-all min-h-[120px] shadow-sm"
                           />
                        </div>

                        <div className="flex gap-4 pt-8">
                           <button className="flex-1 py-5 bg-dark text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-black transition-all">
                              <Ban size={16} /> Mark as Banned
                           </button>
                           <button className="flex-1 py-5 border-2 border-dark text-dark rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-surface transition-all">
                              <MoreVertical size={16} /> More Actions
                           </button>
                        </div>
                     </div>
                  </>
               )}
            </div>
         </div>
      )}
    </div>
  )
}
