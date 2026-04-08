'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Plus, Edit2, Trash2, Save, X, Search, 
  ChevronRight, Layout, Info, IndianRupee, Loader2, Bell, Settings, Filter, Star
} from 'lucide-react'
import toast from 'react-hot-toast'
import AdminSidebar from '@/components/layout/AdminSidebar'

interface Service {
  _id: string
  name: string
  category: string
  basePrice: number
  priceUnit: string
  description: string
  icon: string
  isPopular?: boolean
  isImmediate?: boolean
}

export default function AdminServicesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/')
    fetchServices()
  }, [user])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/services')
      setServices(res.data.services)
    } catch { toast.error('Failed to load services') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!editingService?.name || !editingService?.basePrice) return toast.error('Please fill in required fields')
    setSaving(true)
    try {
      if (editingService._id) {
        await api.put(`/admin/services/${editingService._id}`, editingService)
        toast.success('Service updated!')
      } else {
        await api.post('/admin/services', editingService)
        toast.success('Service created!')
      }
      setModalOpen(false)
      fetchServices()
    } catch { toast.error('Failed to save service') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    try {
      await api.delete(`/admin/services/${id}`)
      toast.success('Service deleted')
      fetchServices()
    } catch { toast.error('Failed to delete service') }
  }

  const filtered = services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
              placeholder="Search catalog by service name..." 
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
              <h1 className="font-display text-4xl font-bold text-dark mb-1">Service Protocols</h1>
              <p className="text-dark/40 text-sm">Design and deploy specialized cleaning experiences for your platform.</p>
           </div>
           <button onClick={() => { setEditingService({ icon: '🧹', category: 'indoor_living', priceUnit: 'per_hour', basePrice: 300 }); setModalOpen(true) }} 
             className="px-8 py-4 bg-dark text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-dark/20 hover:bg-accent transition-all flex items-center gap-3">
              <Plus size={16} /> Add Domain
           </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-surface rounded-[2.5rem] animate-pulse border border-gray-100" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(s => (
               <div key={s._id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-xl group relative overflow-hidden flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:bg-accent group-hover:text-white transition-all">
                       {s.icon}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => { setEditingService(s); setModalOpen(true) }} className="p-2.5 bg-surface rounded-xl text-dark/30 hover:text-accent transition-all"><Edit2 size={16} /></button>
                       <button onClick={() => handleDelete(s._id)} className="p-2.5 bg-surface rounded-xl text-dark/30 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display font-bold text-xl text-dark mb-2">{s.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                       <span className="px-3 py-1 bg-surface text-dark/40 text-[9px] font-bold uppercase tracking-widest rounded-lg">{s.category.replace(/_/g, ' ')}</span>
                       {s.isPopular && <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1"><Star size={10} fill="currentColor" /> Popular</span>}
                    </div>
                    <p className="text-dark/40 text-xs leading-relaxed line-clamp-3 mb-6 italic">"{s.description}"</p>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                     <div>
                        <p className="text-lg font-display font-bold text-dark">₹{s.basePrice}</p>
                        <p className="text-[9px] text-dark/30 font-bold uppercase tracking-widest">{s.priceUnit.replace(/_/g, ' ')}</p>
                     </div>
                     <ChevronRight size={18} className="text-dark/10 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
               </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-slide-up border border-white/20">
               <div className="bg-dark p-12 text-white relative">
                  <div className="absolute top-8 right-8 cursor-pointer text-white/50 hover:text-white transition-colors" onClick={() => setModalOpen(false)}><X size={24} /></div>
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-2xl">
                     {editingService?.icon || '🛠️'}
                  </div>
                  <h3 className="text-3xl font-display font-bold mb-2">{editingService?._id ? 'Refine Protocol' : 'Deploy New Protocol'}</h3>
                  <p className="text-white/40 text-sm italic">Define the DNA of your platform's service catalog.</p>
               </div>
               
               <div className="p-12 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-hide bg-surface/50">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Public Domain Name</label>
                       <input value={editingService?.name || ''} onChange={e => setEditingService({...editingService, name: e.target.value})} className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold text-dark focus:ring-accent/10" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Visual ID (Emoji)</label>
                       <input value={editingService?.icon || ''} onChange={e => setEditingService({...editingService, icon: e.target.value})} className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold text-dark text-center focus:ring-accent/10" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Logical Category</label>
                    <select className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold text-dark appearance-none focus:ring-accent/10" value={editingService?.category || ''} onChange={e => setEditingService({...editingService, category: e.target.value})}>
                       <option value="indoor_living">Indoor Living</option>
                       <option value="kitchen_dining">Kitchen & Dining</option>
                       <option value="floor_surface">Floor & Surface</option>
                       <option value="outdoor">Outdoor</option>
                       <option value="deep_cleaning">Deep Cleaning</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Administrative Base Price (₹)</label>
                       <input type="number" value={editingService?.basePrice || 0} onChange={e => setEditingService({...editingService, basePrice: parseInt(e.target.value)})} className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold text-dark focus:ring-accent/10" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Measurement Unit</label>
                       <select className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold text-dark appearance-none focus:ring-accent/10" value={editingService?.priceUnit || ''} onChange={e => setEditingService({...editingService, priceUnit: e.target.value})}>
                          <option value="per_hour">Per Hour</option>
                          <option value="fixed_rate">Fixed Rate</option>
                          <option value="per_room">Per Room</option>
                       </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30 ml-2">Operational Logic Description</label>
                    <textarea rows={3} value={editingService?.description || ''} onChange={e => setEditingService({...editingService, description: e.target.value})} className="w-full bg-white border-none rounded-2xl p-4 text-sm italic text-dark/60 focus:ring-accent/10" />
                  </div>

                  <div className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                       <input type="checkbox" className="w-4 h-4 rounded text-accent" checked={editingService?.isPopular || false} onChange={e => setEditingService({...editingService, isPopular: e.target.checked})} />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-dark/60">High Demand Tag</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer select-none border-l border-gray-100 pl-4 ml-auto">
                       <input type="checkbox" className="w-4 h-4 rounded text-accent" checked={editingService?.isImmediate || false} onChange={e => setEditingService({...editingService, isImmediate: e.target.checked})} />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-dark/60">Immediate Availability</span>
                    </label>
                  </div>
               </div>

               <div className="p-12 bg-surface flex justify-end gap-4 border-t border-gray-100">
                  <button onClick={() => setModalOpen(false)} className="px-8 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-dark/40 hover:text-dark transition-all">Discard</button>
                  <button onClick={handleSave} disabled={saving} className="px-10 py-4 bg-accent text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl hover:bg-dark transition-all flex items-center gap-3">
                     {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 🚀 Commit Protocol
                  </button>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
