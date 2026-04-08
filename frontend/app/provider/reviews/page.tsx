'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Star, MessageSquare, Calendar, User, 
  ChevronRight, Award, Trash2, ShieldCheck,
  TrendingUp, TrendingDown, Filter, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import ProviderSidebar from '@/components/layout/ProviderSidebar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ProviderReviewsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    avg: 0,
    total: 0,
    sentiment: 'Positive'
  })

  useEffect(() => {
    if (user && user.role !== 'provider') router.push('/')
    if (user) fetchReviews()
  }, [user])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/reviews/provider/${user?._id}`)
      setReviews(res.data.reviews)
      
      const total = res.data.reviews.length
      const avg = total > 0 
        ? res.data.reviews.reduce((s: number, r: any) => s + r.rating, 0) / total 
        : 0
      
      setStats({
        avg: Math.round(avg * 10) / 10,
        total,
        sentiment: avg >= 4 ? 'Excellent' : avg >= 3 ? 'Good' : 'Needs Improvement'
      })
    } catch {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      <ProviderSidebar />

      <main className="flex-1 ml-64 p-12">
        <header className="flex items-center justify-between mb-12">
           <div>
              <h1 className="font-display font-black text-4xl text-dark tracking-tighter uppercase mb-2">Service Feedback</h1>
              <p className="text-dark/40 font-bold uppercase tracking-widest text-xs">Monitor your professional reputation and ratings</p>
           </div>
           <div className="flex gap-4">
              <button onClick={fetchReviews} className="btn-ghost bg-white border border-gray-100 p-4 rounded-2xl hover:bg-surface transition-all">
                 <Zap className="w-5 h-5 text-accent" />
              </button>
           </div>
        </header>

        {/* Rep Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
           <div className="card p-8 border-none shadow-xl bg-dark text-white relative overflow-hidden">
              <div className="relative z-10">
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Overall Rating</p>
                 <div className="flex items-center gap-4">
                    <span className="font-display font-black text-6xl tracking-tighter">{stats.avg}</span>
                    <div className="flex flex-col">
                       <div className="flex text-amber-400">
                          {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= Math.round(stats.avg) ? 'fill-current' : 'text-white/10'} />)}
                       </div>
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Based on {stats.total} reviews</span>
                    </div>
                 </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
           </div>

           <div className="card p-8 border-none shadow-sm flex flex-col justify-between">
              <div>
                 <p className="text-dark/30 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Customer Sentiment</p>
                 <h3 className="font-display font-black text-2xl text-dark uppercase">{stats.sentiment}</h3>
              </div>
              <div className="flex items-center gap-2 text-success">
                 <TrendingUp size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">+2.4% vs last month</span>
              </div>
           </div>

           <div className="card p-8 border-none shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                 <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-accent shadow-inner">
                    <Award size={24} />
                 </div>
                 <span className="badge bg-green-50 text-green-600 font-black text-[10px] uppercase">Elite Tier</span>
              </div>
              <div className="mt-4">
                 <p className="text-dark/30 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Peer Ranking</p>
                 <p className="font-display font-black text-xl text-dark uppercase tracking-tight">Top 10% Experts</p>
              </div>
           </div>
        </div>

        {/* Reviews List */}
        <section>
           <div className="flex items-center justify-between mb-8">
              <h2 className="font-display font-black text-2xl text-dark uppercase tracking-tighter flex items-center gap-4">
                 Recent Feed <span className="w-8 h-8 rounded-full bg-dark text-white flex items-center justify-center text-xs font-black">{reviews.length}</span>
              </h2>
              <button className="flex items-center gap-2 text-[10px] font-black text-dark/40 uppercase tracking-widest hover:text-dark transition-colors">
                 <Filter size={14} /> Filter & Sort
              </button>
           </div>

           {loading ? (
             <LoadingSpinner text="Retrieving client sentiment..." />
           ) : reviews.length === 0 ? (
             <div className="card p-24 text-center flex flex-col items-center border-dashed border-gray-100 !rounded-[3rem]">
                <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-6">
                   <MessageSquare className="w-10 h-10 text-dark/10" />
                </div>
                <h4 className="font-display font-black text-xl text-dark mb-2 uppercase">No reviews yet</h4>
                <p className="text-dark/40 text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto">Complete your assignments and deliver exceptional service to start building your professional profile.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-6">
                {reviews.map(review => (
                   <div key={review._id} className="card p-8 hover:shadow-card-hover transition-all group relative overflow-hidden">
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                         {/* Customer Info */}
                         <div className="flex flex-row md:flex-col items-center md:items-start gap-4 shrink-0 md:w-32">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-dark text-white flex items-center justify-center font-black text-2xl shadow-xl group-hover:scale-110 transition-transform">
                               {review.customerId?.name?.[0] || 'U'}
                            </div>
                            <div className="md:mt-2">
                               <p className="font-display font-black text-dark text-xs uppercase tracking-tight truncate max-w-[120px]">{review.customerId?.name}</p>
                               <p className="text-[9px] font-black text-dark/20 uppercase tracking-widest truncate">HL-CLIENT</p>
                            </div>
                         </div>

                         {/* Review Body */}
                         <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-1">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} size={16} className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-dark/5 fill-dark/5'} />
                                  ))}
                                  <span className="ml-2 text-[10px] font-black text-dark/60 uppercase racking-widest">{review.rating}.0 Rating</span>
                               </div>
                               <div className="flex items-center gap-2 text-[9px] font-black text-dark/20 uppercase tracking-widest">
                                  <Calendar size={12} /> {new Date(review.createdAt).toLocaleDateString()}
                               </div>
                            </div>

                            <p className="text-sm font-bold text-dark/70 leading-relaxed italic border-l-4 border-accent/10 pl-6 py-1">
                               "{review.comment || 'The professional completed the service successfully with high standards.'}"
                            </p>

                            <div className="flex flex-wrap gap-2 pt-2">
                               {review.tags?.map((t: string) => (
                                 <span key={t} className="px-3 py-1 bg-surface rounded-lg text-[9px] font-black text-dark/40 uppercase tracking-widest border border-gray-100 flex items-center gap-1.5">
                                    <ShieldCheck size={10} className="text-success" /> {t}
                                 </span>
                               ))}
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                               <div className="flex items-center gap-2 px-4 py-2 bg-surface/50 rounded-xl text-[9px] font-black text-dark/30 uppercase tracking-widest">
                                  <span>Service:</span>
                                  <span className="text-dark">{review.serviceId?.name || 'Cleaning Service'}</span>
                               </div>
                               <button className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline decoration-2 underline-offset-4 ml-auto">
                                  Reply to Review
                               </button>
                            </div>
                         </div>
                      </div>
                      
                      {/* Background accent */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-accent/10 transition-all"></div>
                   </div>
                ))}
             </div>
           )}
        </section>
      </main>
    </div>
  )
}
