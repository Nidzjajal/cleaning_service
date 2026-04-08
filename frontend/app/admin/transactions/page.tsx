'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import StatusBadge from '@/components/ui/StatusBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  ArrowLeft, IndianRupee, Search, RefreshCw,
  TrendingUp, CreditCard, Banknote, Download, Bell, Settings, Filter, MoreVertical, Calendar, User, ChevronRight, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import AdminSidebar from '@/components/layout/AdminSidebar'

interface TransactionItem {
  _id: string
  bookingId: { bookingRef: string; _id: string } | string
  customerId: { name: string; email: string } | string
  providerId: { name: string } | string
  customerPaid: number
  commissionRate: number
  adminCommission: number
  providerPayout: number
  paymentMethod: 'CARD' | 'COD'
  status: string
  createdAt: string
}

export default function AdminTransactionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/')
  }, [user])

  useEffect(() => { fetchTransactions() }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/transactions')
      setTransactions(res.data.transactions || [])
    } catch { toast.error('Failed to load transactions') }
    finally { setLoading(false) }
  }

  const filtered = transactions.filter(t => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter
    const booking = typeof t.bookingId === 'object' ? t.bookingId : { bookingRef: '' }
    const customer = typeof t.customerId === 'object' ? t.customerId : { name: '' }
    const matchesSearch = booking.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalRevenue = filtered.reduce((sum, t) => sum + t.customerPaid, 0)
  const totalCommission = filtered.reduce((sum, t) => sum + t.adminCommission, 0)
  const totalPayouts = filtered.reduce((sum, t) => sum + t.providerPayout, 0)

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
              placeholder="Search by Booking ID or Customer..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
              <h1 className="font-display text-4xl font-bold text-dark mb-1">Financial Oversight</h1>
              <p className="text-dark/40 text-sm italic">Audit platform revenue, service commissions, and provider payout streams.</p>
           </div>
           <div className="flex gap-3">
              <button onClick={fetchTransactions} className="p-4 bg-white border border-gray-100 rounded-2xl text-dark/40 hover:border-accent hover:text-accent transition-all shadow-sm">
                 <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <button className="flex items-center gap-2 px-6 py-4 bg-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-dark/20 hover:bg-accent transition-all">
                 <Download size={16} /> Export Ledger
              </button>
           </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:border-dark transition-all">
               <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-surface rounded-xl text-dark/40 group-hover:bg-dark group-hover:text-white transition-all"><IndianRupee size={20} /></div>
                  <span className="text-[9px] font-bold text-dark/20 uppercase tracking-widest">Total Gross Revenue</span>
               </div>
               <p className="text-3xl font-display font-bold text-dark">₹{totalRevenue.toLocaleString()}</p>
               <p className="text-[10px] text-dark/30 mt-2 font-bold uppercase tracking-widest">Across {filtered.length} settlements</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:border-accent transition-all">
               <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-surface rounded-xl text-dark/40 group-hover:bg-accent group-hover:text-white transition-all"><TrendingUp size={20} /></div>
                  <span className="text-[9px] font-bold text-dark/20 uppercase tracking-widest">Net Platform Take</span>
               </div>
               <p className="text-3xl font-display font-bold text-accent">₹{totalCommission.toLocaleString()}</p>
               <p className="text-[10px] text-accent/40 mt-2 font-bold uppercase tracking-widest">Secured Commissions</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:border-success transition-all">
               <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-surface rounded-xl text-dark/40 group-hover:bg-green-600 group-hover:text-white transition-all"><CreditCard size={20} /></div>
                  <span className="text-[9px] font-bold text-dark/20 uppercase tracking-widest">Provider Disbursements</span>
               </div>
               <p className="text-3xl font-display font-bold text-green-600">₹{totalPayouts.toLocaleString()}</p>
               <p className="text-[10px] text-green-600/40 mt-2 font-bold uppercase tracking-widest">Liquid Payouts</p>
            </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 p-1.5 bg-surface rounded-2xl border border-gray-100 mb-8 w-fit">
           {['ALL', 'PENDING', 'COMPLETED', 'REFUNDED'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white text-dark shadow-md' : 'text-dark/30 hover:text-dark'}`}>
                 {s}
              </button>
           ))}
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
           {loading ? (
             <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 size={40} className="animate-spin text-accent" />
                <p className="text-[10px] font-bold text-dark/20 uppercase tracking-widest">Decrypting Transaction Streams...</p>
             </div>
           ) : filtered.length === 0 ? (
             <div className="p-20 text-center">
                <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center text-dark/10 mx-auto mb-4"><IndianRupee size={32} /></div>
                <h3 className="font-display font-bold text-dark">No records in this stream</h3>
                <p className="text-xs text-dark/40 mt-1">Adjust filters to broaden your audit.</p>
             </div>
           ) : (
             <table className="w-full text-left">
                <thead className="bg-surface/50 border-b border-gray-100 text-[10px] font-bold text-dark/30 uppercase tracking-widest">
                   <tr>
                      <th className="px-8 py-6">Audit ID / Ref</th>
                      <th className="px-8 py-6">Participants</th>
                      <th className="px-8 py-6">Settlement (INR)</th>
                      <th className="px-8 py-6">Platform Cut</th>
                      <th className="px-8 py-6">Method</th>
                      <th className="px-8 py-6">Status Info</th>
                      <th className="px-8 py-6 text-right">Rapid View</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {filtered.map(t => {
                      const booking = typeof t.bookingId === 'object' ? t.bookingId : null
                      const customer = typeof t.customerId === 'object' ? t.customerId : null
                      const provider = typeof t.providerId === 'object' ? t.providerId : null
                      return (
                        <tr key={t._id} className="hover:bg-surface/30 transition-colors group">
                           <td className="px-8 py-6">
                              <p className="font-mono text-xs font-bold text-dark">{booking?.bookingRef || t._id.slice(-8).toUpperCase()}</p>
                              <p className="text-[10px] font-bold text-dark/30 uppercase mt-0.5">{new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-2 text-xs font-bold text-dark"><User size={12} className="text-dark/20" /> {customer?.name || 'Client'}</div>
                                 <div className="flex items-center gap-2 text-[10px] font-bold text-dark/40"><Shield size={10} className="text-dark/20" /> {provider?.name || 'Helper'}</div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <p className="font-display font-bold text-dark text-sm">₹{t.customerPaid.toLocaleString()}</p>
                           </td>
                           <td className="px-8 py-6">
                              <p className="font-display font-bold text-accent text-sm">₹{t.adminCommission.toLocaleString()}</p>
                              <p className="text-[9px] font-bold text-accent/40 uppercase tracking-tighter">@ {(t.commissionRate * 100).toFixed(0)}%</p>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <div className={`p-2 rounded-xl border flex items-center justify-center w-fit ${t.paymentMethod === 'CARD' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                                 {t.paymentMethod === 'CARD' ? <CreditCard size={14} /> : <Banknote size={14} />}
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <StatusBadge status={t.status} />
                           </td>
                           <td className="px-8 py-6 text-right">
                              <button className="px-6 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-dark/40 hover:border-accent hover:text-accent transition-all group-hover:shadow-md">Audit</button>
                           </td>
                        </tr>
                      )
                   })}
                </tbody>
             </table>
           )}
        </div>
      </main>
    </div>
  )
}
