'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { AvailableProvider } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  ChevronRight, CheckCircle, Star, MapPin, Clock,
  CreditCard, Banknote, ArrowRight, ArrowLeft,
  Shield, AlertCircle, Loader2, User, Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function BookingConfirmPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [bookingData, setBookingData] = useState<any>(null)
  const [providers, setProviders] = useState<AvailableProvider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<AvailableProvider | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'COD'>('COD')
  const [loadingProviders, setLoadingProviders] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('hl_booking')
    if (!stored) { router.push('/customer/book'); return }
    const data = JSON.parse(stored)
    setBookingData(data)
    fetchProviders(data)
  }, [])

  const fetchProviders = async (data: any) => {
    setLoadingProviders(true)
    try {
      const params = new URLSearchParams({
        serviceId: data.serviceId,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        isImmediate: String(data.isImmediate),
      })
      const res = await api.get(`/bookings/available-providers?${params}`)
      setProviders(res.data.providers || [])
    } catch {
      setProviders([])
    } finally {
      setLoadingProviders(false)
    }
  }

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('hl_redirect', '/customer/book/confirm')
      toast('Please sign in to confirm your booking', { icon: '🔐' })
      router.push('/login')
      return
    }

    if (!bookingData) return

    setSubmitting(true)
    try {
      const payload = {
        serviceId: bookingData.serviceId,
        scheduledDate: bookingData.scheduledDate,
        scheduledTime: bookingData.scheduledTime,
        isImmediate: bookingData.isImmediate,
        serviceAddress: bookingData.serviceAddress,
        paymentMethod,
        selectedAddOns: bookingData.selectedAddOns,
        specialInstructions: bookingData.specialInstructions,
        providerId: selectedProvider?.provider._id || null,
      }

      const res = await api.post('/bookings', payload)
      sessionStorage.removeItem('hl_booking')
      sessionStorage.removeItem('hl_redirect')

      if (paymentMethod === 'CARD' && res.data.stripeUrl) {
        window.location.href = res.data.stripeUrl
        return
      }

      toast.success('Booking recorded! Assigning provider... 🎉')
      router.push('/customer/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (!bookingData) return <LoadingSpinner />

  const formatTime = (t: string) => {
    const [h, m] = t.split(':')
    const hr = parseInt(h)
    return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-dark">Confirm & Pay</h1>
          <p className="text-dark/40 text-sm">Review your request and securely confirm your helper</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-gray-100 shadow-sm">
           <span className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-[10px] font-bold"><CheckCircle className="w-3 h-3" /></span>
           <span className="text-xs font-bold text-dark/40">Selection</span>
           <ChevronRight className="w-3 h-3 text-dark/20" />
           <span className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-[10px] font-bold"><CheckCircle className="w-3 h-3" /></span>
           <span className="text-xs font-bold text-dark/40">Schedule</span>
           <ChevronRight className="w-3 h-3 text-dark/20" />
           <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">3</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Helper Selection */}
          <div className="card p-8">
            <h3 className="font-display font-black text-dark mb-6 flex items-center gap-3 uppercase tracking-tight">
              <User className="w-5 h-5 text-accent" />
              Select Your Expert
            </h3>

            {loadingProviders ? (
              <LoadingSpinner size="sm" text="Optimizing available helper list..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Auto-assign */}
                <div
                  onClick={() => setSelectedProvider(null)}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between
                    ${!selectedProvider ? 'border-accent bg-accent/5 ring-1 ring-accent/10' : 'border-gray-100 hover:border-dark/10'}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-dark text-white flex items-center justify-center">
                      <Star className="w-6 h-6 fill-current" />
                    </div>
                    {!selectedProvider && <CheckCircle className="w-6 h-6 text-accent" />}
                  </div>
                  <div>
                    <h4 className="font-black text-dark uppercase text-sm tracking-tight">Auto-Assign</h4>
                    <p className="text-[10px] text-dark/40 font-bold uppercase tracking-widest mt-1">Highest rated nearby expert</p>
                  </div>
                </div>

                {providers.map(prov => (
                  <div
                    key={prov.provider._id}
                    onClick={() => setSelectedProvider(prov)}
                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between
                      ${selectedProvider?.provider._id === prov.provider._id ? 'border-accent bg-accent/5 ring-1 ring-accent/10' : 'border-gray-100 hover:border-dark/10'}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex -space-x-2">
                         <div className="w-12 h-12 rounded-2xl bg-surface border border-gray-100 flex items-center justify-center font-black text-dark text-xl relative z-10">
                            {prov.provider.name?.[0]}
                         </div>
                         <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg relative z-20 translate-y-1">
                            <Star className="w-5 h-5 fill-current" />
                         </div>
                      </div>
                      {selectedProvider?.provider._id === prov.provider._id && <CheckCircle className="w-6 h-6 text-accent" />}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                         <h4 className="font-black text-dark uppercase text-sm tracking-tight">{prov.provider.name}</h4>
                         <span className="text-amber-500 font-black text-xs">{prov.profile?.rating || 'NEW'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-dark/30">
                         <MapPin className="w-3 h-3" /> {prov.distanceKm?.toFixed(1)}km • <Clock className="w-3 h-3" /> {prov.etaMinutes}m ETA
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Options */}
          <div className="card p-8">
            <h3 className="font-display font-black text-dark mb-6 flex items-center gap-3 uppercase tracking-tight">
              <CreditCard className="w-5 h-5 text-accent" />
              Payment Gateway
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-6
                  ${paymentMethod === 'COD' ? 'border-accent bg-accent/5' : 'border-gray-100 hover:border-surface'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${paymentMethod === 'COD' ? 'bg-accent text-white shadow-glow' : 'bg-surface text-dark/20'}`}>
                  <Banknote className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-dark uppercase text-sm">After Service</h4>
                  <p className="text-[10px] text-dark/40 font-bold uppercase tracking-widest leading-none mt-1">Cash on Delivery</p>
                </div>
              </div>
              
              <div
                onClick={() => setPaymentMethod('CARD')}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-6
                  ${paymentMethod === 'CARD' ? 'border-accent bg-accent/5' : 'border-gray-100 hover:border-surface'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${paymentMethod === 'CARD' ? 'bg-info text-white shadow-glow' : 'bg-surface text-dark/20'}`}>
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-dark uppercase text-sm">Pay Now</h4>
                  <p className="text-[10px] text-dark/40 font-bold uppercase tracking-widest leading-none mt-1">Stripe Checkout</p>
                </div>
              </div>
            </div>

            {paymentMethod === 'CARD' && (
              <div className="mt-8 bg-info/5 border border-info/10 rounded-2xl p-6 flex items-start gap-4">
                <Shield className="w-6 h-6 text-info shrink-0" />
                <div>
                  <p className="text-xs font-black text-info uppercase tracking-widest mb-1">Encrypted Transaction</p>
                  <p className="text-[10px] text-info/60 font-bold uppercase leading-relaxed">
                    Payments handled by Stripe. Test card: <span className="text-info font-black">4242 4242 4242 4242</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-8 sticky top-24 border-none shadow-xl bg-dark text-white overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
            
             <h3 className="font-display font-black text-xl mb-6 relative z-10">BOOKING TOTAL</h3>
             
             <div className="space-y-6 mb-8 pb-8 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-4">
                   <span className="text-3xl">{bookingData.service?.icon}</span>
                   <div>
                      <p className="font-display font-black text-lg leading-tight uppercase">{bookingData.service?.name}</p>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{bookingData.service?.categoryLabel}</p>
                   </div>
                </div>
                <div className="space-y-3 font-bold text-xs text-white/40">
                   <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-accent" />
                      <span className="truncate max-w-[200px]">{bookingData.serviceAddress?.street}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-accent" />
                      <span>{new Date(bookingData.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {formatTime(bookingData.scheduledTime)}</span>
                   </div>
                </div>
             </div>

             <div className="space-y-3 mb-10 relative z-10">
                <div className="flex justify-between text-white/30 text-[10px] font-black uppercase tracking-widest">
                   <span>Service Fee</span>
                   <span className="text-white">₹{bookingData.subtotal?.toLocaleString('en-IN')}</span>
                </div>
                {bookingData.selectedAddOns?.map((a: any) => (
                  <div key={a.name} className="flex justify-between text-white/30 text-[10px] font-black uppercase tracking-widest">
                     <span>+ {a.name}</span>
                     <span className="text-white">₹{a.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="pt-4 flex justify-between items-baseline">
                   <span className="font-black text-white/20 uppercase tracking-[0.2em] text-[10px]">Grand Total</span>
                   <span className="font-display font-black text-5xl text-accent shadow-accent-glow">₹{bookingData.total?.toLocaleString('en-IN')}</span>
                </div>
             </div>

             <button
               onClick={handleConfirmBooking}
               disabled={submitting}
               className="btn-accent w-full py-6 shadow-2xl relative z-10 text-xs font-black uppercase tracking-[0.3em] group disabled:opacity-50"
             >
               {submitting ? (
                 <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
               ) : (
                 <>Finalize Booking <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
               )}
             </button>

             <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/20 font-black uppercase tracking-widest">
                <Activity className="w-3 h-3 text-success" /> Live system priority enabled
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
