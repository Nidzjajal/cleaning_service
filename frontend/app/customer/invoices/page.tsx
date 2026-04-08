'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import CustomerDashboardLayout from '@/components/layout/CustomerDashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import StatusBadge from '@/components/ui/StatusBadge'
import { 
  FileText, Download, Search, Filter, 
  Calendar, CreditCard, ChevronRight,
  ArrowUpDown, ExternalLink, Printer
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Invoice {
  _id: string;
  bookingRef: string;
  serviceId: { name: string; icon: string };
  scheduledDate: string;
  pricing: { total: number };
  paymentMethod: string;
  paymentStatus: string;
  status: string;
}

export default function CustomerInvoicesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isAuthenticated) fetchInvoices()
  }, [isAuthenticated])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      // In this system, completed bookings act as invoices
      const res = await api.get('/bookings/my')
      const allBookings = res.data.bookings || []
      // Filter for completed or those that have payments
      const invs = allBookings.filter((b: any) => 
        ['COMPLETED', 'REVIEWED'].includes(b.status) || b.paymentStatus === 'PAID'
      )
      setInvoices(invs)
    } catch {
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(inv => 
    inv.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.serviceId?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDownload = (id: string) => {
    toast.success('Preparing your PDF invoice...')
    window.print(); // Placeholder for actual PDF generation
  }

  if (authLoading) return <LoadingSpinner />

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-dark mb-2">Invoice History</h1>
          <p className="text-dark/40">View and download your service receipts.</p>
        </div>
        <button onClick={() => window.print()} className="btn-accent py-3 px-6 shadow-xl flex items-center gap-2">
          <Printer className="w-5 h-5" />
          Print All
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
          <input 
            type="text" 
            placeholder="Search by ID or service..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-12 h-14" 
          />
        </div>
        <button className="bg-white border border-gray-100 flex items-center gap-2 px-6 rounded-2xl text-dark/60 font-bold hover:bg-surface transition-all">
          <Filter className="w-4 h-4" />
          Recently Paid
        </button>
      </div>

      {/* Invoice Table / List */}
      {loading ? (
        <LoadingSpinner text="Fetching receipts..." />
      ) : filteredInvoices.length === 0 ? (
        <div className="card p-20 text-center flex flex-col items-center border-dashed border-2">
          <FileText className="w-16 h-16 text-dark/10 mb-6" />
          <h3 className="font-bold text-dark text-xl mb-2">No invoices found</h3>
          <p className="text-dark/40 text-sm max-w-sm">Completed services and paid bookings will appear here automatically.</p>
        </div>
      ) : (
        <div className="card overflow-hidden border-none shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-dark/40">Invoice #</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-dark/40">Service</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-dark/40">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-dark/40">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-dark/40">Method</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-dark/40">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-dark/40">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-surface/30 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="font-mono text-sm font-bold text-dark">{inv.bookingRef}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{inv.serviceId?.icon || '🧹'}</span>
                        <span className="text-sm font-bold text-dark">{inv.serviceId?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs text-dark/60 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-accent" />
                        {new Date(inv.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-display font-black text-dark">₹{inv.pricing?.total?.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs text-dark/50 uppercase font-black tracking-tighter">
                        <CreditCard className="w-3.5 h-3.5" />
                        {inv.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={inv.paymentStatus === 'PAID' ? 'PAID' : inv.status} />
                    </td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => handleDownload(inv._id)}
                        className="w-10 h-10 rounded-xl bg-surface text-dark/40 flex items-center justify-center hover:bg-dark hover:text-white transition-all group-hover:scale-110 shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
