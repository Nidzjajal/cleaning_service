'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { 
  Plus, Edit2, Trash2, Save, X, Layers, Search, Bell, 
  CheckCircle, Shield, Clock, IndianRupee, Loader2, 
  Zap, ToggleLeft, ToggleRight, Filter, Info, Lock, ArrowRight, Star
} from 'lucide-react'
import toast from 'react-hot-toast'
import ProviderSidebar from '@/components/layout/ProviderSidebar'
import { Service } from '@/types'

type ActiveTab = 'MY_SERVICES' | 'MARKETPLACE'

export default function ProviderServicesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>('MY_SERVICES')
  const [services, setServices] = useState<Service[]>([])
  const [mySkills, setMySkills] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [customPrice, setCustomPrice] = useState(0)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [svcRes, meRes] = await Promise.all([
        api.get('/services'),
        api.get('/auth/me'),
      ])
      setServices(svcRes.data.services || [])
      setMySkills(meRes.data.user.providerProfile?.skills || [])
    } catch { toast.error('Failed to load catalog') }
    finally { setLoading(false) }
  }

  const handleToggleSkill = async (skillId: string, isRemoving: boolean = false) => {
    setActionLoading(skillId)
    try {
      const newSkills = isRemoving 
        ? mySkills.filter(s => s !== skillId) 
        : [...mySkills, skillId]
      
      await api.put('/providers/me/profile', { skills: newSkills })
      setMySkills(newSkills)
      toast.success(isRemoving ? 'Service removed' : 'Service added to your profile!')
      setShowAddModal(false)
    } catch { toast.error('Failed to update service profile') }
    finally { setActionLoading(null) }
  }

  const myActiveServices = services.filter(s => mySkills.includes(s.slug))
  const marketplaceServices = services.filter(s => !mySkills.includes(s.slug))

  const filteredMy = myActiveServices.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredMarket = marketplaceServices.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      <ProviderSidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header with Dashboard Style */}
        <header className="flex items-center justify-between mb-10 gap-8">
          <div className="flex-1 max-w-lg relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30 group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Search across all service categories..." 
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
             <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-dark/40 hover:text-accent relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full border-2 border-white" />
             </button>
          </div>
        </header>

        {/* Tab Selection */}
        <div className="flex items-center justify-between mb-10">
           <div>
              <h1 className="font-display text-4xl font-bold text-dark mb-1">Service Category</h1>
              <p className="text-dark/40 text-sm">Manage your specialized workforce and discover new revenue streams.</p>
           </div>
           <div className="flex gap-2 p-1.5 bg-surface rounded-2xl border border-gray-100 shadow-sm">
              <button 
                onClick={() => setActiveTab('MY_SERVICES')}
                className={`px-6 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-widest
                    ${activeTab === 'MY_SERVICES' ? 'bg-dark text-white shadow-xl shadow-dark/20' : 'text-dark/40 hover:text-dark hover:bg-white'}`}
              >
                 My Managed Services ({mySkills.length})
              </button>
              <button 
                onClick={() => setActiveTab('MARKETPLACE')}
                className={`px-6 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-widest
                    ${activeTab === 'MARKETPLACE' ? 'bg-dark text-white shadow-xl shadow-dark/20' : 'text-dark/40 hover:text-dark hover:bg-white'}`}
              >
                 Service Marketplace ({marketplaceServices.length})
              </button>
           </div>
        </div>

        {/* My Services Grid */}
        {activeTab === 'MY_SERVICES' && (
           <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredMy.map(svc => (
                    <div key={svc._id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 group hover:shadow-xl hover:shadow-dark/5 transition-all relative overflow-hidden">
                       {/* Background Icon Watermark */}
                       <div className="absolute -right-4 -bottom-4 text-dark/5 opacity-0 group-hover:opacity-100 group-hover:scale-120 transition-all duration-700">
                          <span className="text-[120px]">{svc.icon}</span>
                       </div>

                       <div className="relative z-10">
                          <div className="flex items-center justify-between mb-6">
                             <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-2xl group-hover:bg-accent group-hover:text-white transition-all shadow-inner">
                                {svc.icon}
                             </div>
                             <div className="flex gap-2">
                                <button className="p-2.5 rounded-xl bg-surface border border-gray-100 text-dark/30 hover:text-accent hover:border-accent hover:bg-accent/5 transition-all"><Edit2 size={16} /></button>
                                <button onClick={() => handleToggleSkill(svc.slug, true)} className="p-2.5 rounded-xl bg-surface border border-gray-100 text-dark/30 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"><Trash2 size={16} /></button>
                             </div>
                          </div>
                          
                          <h3 className="font-bold text-lg text-dark mb-1">{svc.name}</h3>
                          <p className="text-[10px] text-dark/30 uppercase font-bold tracking-widest mb-4">{svc.categoryLabel || svc.category.replace('_',' ')}</p>
                          
                          <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-gray-100 mb-6">
                             <div>
                                <p className="text-[9px] font-bold text-dark/30 uppercase tracking-widest">Your Price</p>
                                <p className="text-xl font-display font-bold text-dark">₹{svc.basePrice}<span className="text-[10px] ml-1 font-normal text-dark/30">/ job</span></p>
                             </div>
                             <div className="flex flex-col items-end gap-1">
                                <span className="text-[9px] font-bold text-success uppercase tracking-widest">LIVE STATUS</span>
                                <ToggleRight size={24} className="text-success cursor-pointer" />
                             </div>
                          </div>

                          <button className="w-full py-3.5 bg-white border border-gray-100 text-dark/60 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-accent hover:text-accent flex items-center justify-center gap-2 transition-all">
                             Manage Estimates <ArrowRight size={14} />
                          </button>
                       </div>
                    </div>
                 ))}

                 {/* Add New Quick Link */}
                 <button 
                  onClick={() => setActiveTab('MARKETPLACE')}
                  className="rounded-[2rem] border-2 border-dashed border-gray-100 hover:border-accent hover:bg-accent/5 transition-all flex flex-col items-center justify-center py-10 group"
                 >
                    <div className="w-14 h-14 rounded-full bg-surface text-dark/20 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-all shadow-inner">
                       <Plus size={28} />
                    </div>
                    <p className="font-bold text-dark/40 group-hover:text-accent">Add New Service</p>
                    <p className="text-xs text-dark/20 mt-1 uppercase tracking-widest font-bold">Discover Marketplace</p>
                 </button>
              </div>
           </div>
        )}

        {/* Marketplace Grid */}
        {activeTab === 'MARKETPLACE' && (
           <div className="space-y-8 animate-fade-in">
              <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-hide">
                 {['All Categories', 'Residential', 'Commercial', 'Sanitization', 'Deep Clean'].map(cat => (
                    <button key={cat} className="whitespace-nowrap px-6 py-2.5 bg-white border border-gray-100 rounded-full text-xs font-bold text-dark/50 hover:bg-dark hover:text-white hover:border-dark transition-all shadow-sm">
                       {cat}
                    </button>
                 ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {filteredMarket.map(svc => (
                    <div key={svc._id} className="bg-white rounded-3xl p-6 border border-gray-100 group hover:border-accent transition-all relative overflow-hidden flex flex-col">
                       {/* Hot Tag */}
                       {svc.isPopular && (
                          <div className="absolute top-0 right-0 px-4 py-1.5 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-2xl flex items-center gap-1 shadow-lg shadow-orange-500/20">
                             <Zap size={10} fill="currentColor" /> HIGH DEMAND
                          </div>
                       )}

                       <div className="w-11 h-11 rounded-2xl bg-surface flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                          {svc.icon}
                       </div>
                       
                       <div className="flex-1">
                          <h3 className="font-bold text-dark mb-1 leading-tight">{svc.name}</h3>
                          <p className="text-[10px] text-dark/30 uppercase font-bold tracking-widest mb-4">Starting ₹{svc.basePrice}</p>
                          
                          {/* Requirement Indicators */}
                          {svc.slug.includes('deep') && (
                             <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg mb-4">
                                <Lock size={12} />
                                <span className="text-[9px] font-bold uppercase">Certification Req.</span>
                             </div>
                          )}
                       </div>

                       <button 
                        onClick={() => { setSelectedService(svc); setShowAddModal(true); setCustomPrice(svc.basePrice); }}
                        className="w-full py-3 bg-surface text-dark/60 rounded-xl text-[10px] font-bold uppercase tracking-widest group-hover:bg-accent group-hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                       >
                          Add to Profile <Plus size={14} />
                       </button>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* Empty States */}
        {!loading && filteredMy.length === 0 && activeTab === 'MY_SERVICES' && (
           <div className="bg-white rounded-[2.5rem] p-24 text-center border-2 border-dashed border-gray-100">
              <Layers className="w-16 h-16 text-dark/10 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-dark mb-2">No Active Services</h2>
              <p className="text-dark/40 max-w-sm mx-auto mb-8">You haven't added any services to your managed catalog yet. Browse our marketplace to start earning!</p>
              <button onClick={() => setActiveTab('MARKETPLACE')} className="btn-accent px-10 py-4 uppercase tracking-widest text-[10px] font-bold">Open Marketplace</button>
           </div>
        )}
      </main>

      {/* Add Service Modal */}
      {showAddModal && selectedService && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden animate-slide-up shadow-2xl border border-white/20">
               <div className="bg-dark p-12 text-white relative">
                  <div className="absolute top-8 right-8 cursor-pointer text-white/50 hover:text-white transition-colors" onClick={() => setShowAddModal(false)}>
                     <X size={24} />
                  </div>
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-2xl">
                     {selectedService.icon}
                  </div>
                  <h3 className="text-3xl font-display font-bold mb-2">Add {selectedService.name}</h3>
                  <p className="text-white/40 text-sm">{selectedService.categoryLabel || 'Residential Service'} Specialty</p>
               </div>

               <div className="p-12 space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-dark/30">Set Your Professional Rate</label>
                       <span className="text-[10px] font-bold text-accent bg-accent/5 px-3 py-1 rounded-full uppercase">Est. Market: ₹{selectedService.basePrice}</span>
                    </div>
                    <div className="relative">
                       <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-dark/20 w-6 h-6" />
                       <input 
                         type="number" 
                         value={customPrice}
                         onChange={e => setCustomPrice(parseInt(e.target.value))}
                         className="w-full bg-surface border-none rounded-[1.5rem] py-6 pl-16 pr-8 font-display text-4xl font-bold text-dark focus:ring-4 focus:ring-accent/10 transition-all" 
                       />
                    </div>
                    <div className="flex items-center gap-3 mt-4 text-dark/30">
                       <Shield size={14} />
                       <p className="text-[10px] font-medium leading-relaxed italic">You keep 80% of this fee (₹{(customPrice * 0.8).toFixed(0)}) after platform processing.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-surface rounded-2xl border border-gray-100">
                        <Clock className="text-dark/40 mb-2" size={18} />
                        <h4 className="text-[9px] font-bold text-dark/30 uppercase tracking-widest mb-1">Base Duration</h4>
                        <p className="text-sm font-bold text-dark font-display">{selectedService.duration?.min || 60} - {selectedService.duration?.max || 120} Mins</p>
                     </div>
                     <div className="p-4 bg-surface rounded-2xl border border-gray-100">
                        <Star className="text-dark/40 mb-2" size={18} />
                        <h4 className="text-[9px] font-bold text-dark/30 uppercase tracking-widest mb-1">Potential Leads</h4>
                        <p className="text-sm font-bold text-dark font-display">High Momentum</p>
                     </div>
                  </div>

                  <button 
                     disabled={!!actionLoading}
                     onClick={() => handleToggleSkill(selectedService.slug)}
                     className="w-full py-5 bg-accent text-white rounded-[1.5rem] text-sm font-bold uppercase tracking-widest shadow-2xl shadow-accent/20 hover:bg-dark transition-all flex items-center justify-center gap-3"
                  >
                     {actionLoading === selectedService.slug ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                     Confirm & Add Service
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}
