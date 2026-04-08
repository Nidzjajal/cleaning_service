'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Booking } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { 
  Star, MessageSquare, Shield, CheckCircle, 
  ArrowLeft, ArrowRight, Loader2, Sparkles, User, Award
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function BookingReviewPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Review State
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const reviewTags = [
    { id: 'punctual', label: 'Punctual' },
    { id: 'thorough', label: 'Thorough' },
    { id: 'professional', label: 'Professional' },
    { id: 'friendly', label: 'Friendly' },
    { id: 'value', label: 'Value for Money' }
  ]

  useEffect(() => {
    fetchBooking()
  }, [])

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${params.id}`)
      setBooking(res.data.booking)
      if (res.data.booking.status !== 'COMPLETED' && res.data.booking.status !== 'REVIEWED') {
        toast.error('Only completed bookings can be reviewed')
        router.push('/customer/dashboard')
      }
    } catch {
      toast.error('Failed to load booking details')
      router.push('/customer/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (id: string) => {
    setSelectedTags(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/reviews', {
        bookingId: params.id,
        rating,
        comment,
        tags: selectedTags
      })
      toast.success('Thank you for your feedback! 🎉')
      router.push('/customer/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!booking) return null

  const prov = booking.providerId as any
  const svc = booking.serviceId as any

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <Link href="/customer/dashboard" className="inline-flex items-center gap-2 text-dark/40 hover:text-dark font-black text-[10px] uppercase tracking-widest mb-10 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="space-y-8">
        <header className="text-center">
           <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-accent animate-pulse" />
           </div>
           <h1 className="font-display font-black text-4xl text-dark tracking-tighter uppercase mb-2">Service Review</h1>
           <p className="text-dark/40 font-bold uppercase tracking-widest text-xs">Help us perfect our service standards</p>
        </header>

        {/* Info Card */}
        <div className="card p-8 bg-surface/50 border-none shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm">
                 {svc?.icon || '🧹'}
              </div>
              <div>
                 <h4 className="font-display font-black text-dark uppercase">{svc?.name}</h4>
                 <p className="text-[10px] font-black text-dark/20 uppercase tracking-widest leading-none mt-1">Ref: {booking.bookingRef}</p>
              </div>
           </div>
           <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                 <p className="text-xs font-black text-dark tracking-tight uppercase">{prov?.name}</p>
                 <User className="w-4 h-4 text-dark/20" />
              </div>
              <p className="text-[9px] font-black text-success uppercase tracking-widest flex items-center gap-1.5 justify-end">
                <CheckCircle className="w-3 h-3" /> Job Completed
              </p>
           </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
           {/* Star Rating */}
           <div className="text-center space-y-4">
              <p className="text-[10px] font-black text-dark/60 uppercase tracking-[0.3em]">Overall Satisfaction</p>
              <div className="flex items-center justify-center gap-3">
                 {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="transition-all hover:scale-125 focus:outline-none"
                    >
                       <Star 
                         className={`w-12 h-12 ${
                           (hoverRating || rating) >= star 
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]' 
                            : 'text-dark/5 fill-dark/5'
                         } transition-all duration-300`} 
                       />
                    </button>
                 ))}
              </div>
              {rating > 0 && (
                <p className="text-xs font-black text-amber-500 uppercase tracking-widest animate-in fade-in slide-in-from-bottom-1">
                  {['Needs Improvemet', 'Fair Service', 'Good Work', 'Very Professional', 'Exceeded Expectations'][rating - 1]}
                </p>
              )}
           </div>

           {/* Tags */}
           <div className="space-y-4">
              <p className="text-[10px] font-black text-dark/60 uppercase tracking-[0.3em] flex items-center gap-2">
                 <Award className="w-4 h-4 text-accent" /> What stood out?
              </p>
              <div className="flex flex-wrap gap-3">
                 {reviewTags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border
                        ${selectedTags.includes(tag.id) 
                         ? 'bg-dark text-white border-dark shadow-lg scale-105' 
                         : 'bg-white text-dark/40 border-gray-100 hover:border-dark/20'}`}
                    >
                       {tag.label}
                    </button>
                 ))}
              </div>
           </div>

           {/* Comment */}
           <div className="space-y-4">
              <p className="text-[10px] font-black text-dark/60 uppercase tracking-[0.3em] flex items-center gap-2">
                 <MessageSquare className="w-4 h-4 text-accent" /> Additional Comments
              </p>
              <div className="relative group">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience (optional)..."
                  rows={4}
                  className="w-full bg-surface border border-gray-100 rounded-3xl p-6 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent outline-none transition-all placeholder:text-dark/20 focus:bg-white"
                />
                <div className="absolute right-6 bottom-4 text-[10px] font-black text-dark/10 group-focus-within:text-accent/30 tracking-widest">HL-SECURE FEEDBACK</div>
              </div>
           </div>

           <button
             type="submit"
             disabled={submitting || rating === 0}
             className="btn-accent w-full py-6 shadow-glow uppercase font-black text-xs tracking-[0.3em] disabled:opacity-50 group"
           >
             {submitting ? (
               <Loader2 className="w-5 h-5 animate-spin" />
             ) : (
               <span className="flex items-center gap-3">
                 Submit Review <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </span>
             )}
           </button>

           <div className="flex items-center justify-center gap-3 text-[9px] font-black text-dark/20 uppercase tracking-[0.2em] pt-4">
              <Shield className="w-3.5 h-3.5" /> Reviews are used to maintain platform quality standards
           </div>
        </form>
      </div>
    </div>
  )
}
