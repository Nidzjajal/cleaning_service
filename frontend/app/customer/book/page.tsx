'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Service } from '@/types'
import CustomerDashboardLayout from '@/components/layout/CustomerDashboardLayout'
import {
  Search, ChevronRight, Clock, CheckCircle, Star, Zap,
  Home, Utensils, Layers, Leaf, Sparkles, ArrowRight
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const categoryIcons: Record<string, React.ReactNode> = {
  all: <Search className="w-4 h-4" />,
  indoor_living: <Home className="w-4 h-4" />,
  kitchen_dining: <Utensils className="w-4 h-4" />,
  floor_surface: <Layers className="w-4 h-4" />,
  outdoor: <Leaf className="w-4 h-4" />,
  deep_cleaning: <Sparkles className="w-4 h-4" />,
}

const categoryColors: Record<string, string> = {
  indoor_living: 'bg-blue-50 text-blue-600 border-blue-100',
  kitchen_dining: 'bg-orange-50 text-orange-600 border-orange-100',
  floor_surface: 'bg-teal-50 text-teal-600 border-teal-100',
  outdoor: 'bg-green-50 text-green-600 border-green-100',
  deep_cleaning: 'bg-purple-50 text-purple-600 border-purple-100',
}

const categories = [
  { key: 'all', label: 'All Services' },
  { key: 'indoor_living', label: 'Indoor Living' },
  { key: 'kitchen_dining', label: 'Kitchen' },
  { key: 'floor_surface', label: 'Floors' },
  { key: 'outdoor', label: 'Outdoor' },
  { key: 'deep_cleaning', label: 'Deep Clean' },
]

export default function BookServicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedId = searchParams.get('service')

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services')
        setServices(res.data.services)
        if (preselectedId) {
          router.push(`/customer/book/details?service=${preselectedId}`)
        }
      } catch (err) {
        console.error('Failed to load services')
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const filteredServices = services.filter(s => {
    const matchCat = activeCategory === 'all' || s.category === activeCategory
    const matchSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
      || s.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Simplified Header for Dashboard Content */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-dark">Select a Service</h1>
          <p className="text-dark/40 text-sm">Pick the professional help you need today</p>
        </div>
        
        {/* Dashboard-style breadcrumbs */}
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-gray-100 shadow-sm">
           <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">1</span>
           <span className="text-xs font-bold text-dark">Service Selection</span>
           <ChevronRight className="w-3 h-3 text-dark/20" />
           <span className="w-5 h-5 rounded-full bg-dark/5 text-dark/30 flex items-center justify-center text-[10px] font-bold">2</span>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-12 h-14"
          />
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar max-w-full md:max-w-md">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all
                ${activeCategory === cat.key ? 'bg-dark text-white' : 'text-dark/40 hover:text-dark hover:bg-surface'}`}
            >
              {categoryIcons[cat.key]}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <LoadingSpinner text="Searching for expert services..." />
      ) : filteredServices.length === 0 ? (
        <div className="card p-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6">
             <Search className="w-8 h-8 text-dark/15" />
          </div>
          <h3 className="font-display font-bold text-xl text-dark mb-2">No services found</h3>
          <p className="text-dark/40 text-sm max-w-xs">We couldn't find any services matching your current filters. Try searching for "Cleaning" or "Deep Clean".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map(svc => (
            <Link
              key={svc._id}
              href={`/customer/book/details?service=${svc._id}`}
              className="card p-0 overflow-hidden group hover:shadow-card-hover transition-all flex flex-col min-h-[380px]"
            >
              {/* Visual Header */}
              <div className={`p-6 pb-20 relative overflow-hidden transition-colors ${categoryColors[svc.category] || 'bg-gray-50'}`}>
                <div className="relative z-10 flex justify-between items-start">
                   <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-lg border border-white/50 group-hover:scale-110 transition-transform">
                      {svc.icon}
                   </div>
                   <div className="flex flex-col gap-2">
                      {svc.isPopular && <span className="bg-amber-100/80 backdrop-blur-sm text-amber-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-block">Popular Choice</span>}
                      {svc.isImmediate && <span className="bg-green-100/80 backdrop-blur-sm text-green-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-block">⚡ Immediate Helper</span>}
                   </div>
                </div>
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
              </div>

              {/* Content */}
              <div className="p-8 -mt-12 bg-white rounded-t-3xl flex-1 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.05)] relative z-10 transition-all group-hover:shadow-none">
                <h3 className="font-display font-black text-xl text-dark mb-3 group-hover:text-accent transition-colors">
                  {svc.name}
                </h3>
                <p className="text-dark/50 text-sm leading-relaxed mb-6 font-medium">
                  {svc.description}
                </p>

                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-dark/30 font-black uppercase tracking-widest leading-none mb-1">Starting from</p>
                    <div className="flex items-baseline gap-1">
                       <span className="text-2xl font-display font-black text-dark">₹{svc.basePrice.toLocaleString('en-IN')}</span>
                       <span className="text-[10px] text-dark/40 font-bold uppercase tracking-widest">/{svc.priceUnit?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-dark text-white flex items-center justify-center group-hover:bg-accent group-hover:shadow-glow transition-all">
                     <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
