'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Service } from '@/types'
import CustomerDashboardLayout from '@/components/layout/CustomerDashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  ChevronRight, Calendar, Clock, MapPin, Plus, Minus,
  CheckCircle, ArrowRight, ArrowLeft, AlertCircle, Zap, Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

// Operating hours: 8:00 AM to 10:00 PM
const OPEN_HOUR = 8   // 8:00 AM
const CLOSE_HOUR = 22 // 10:00 PM
const LEAD_HOURS = 2  // 2-hour minimum lead time

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00',
]

function formatTime(t: string) {
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  if (hr === 0) return `12:${m} AM`
  if (hr === 12) return `12:${m} PM`
  return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

// Convert "HH:MM" to total minutes for easy comparison
function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export default function BookingDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('service')

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAddOns, setSelectedAddOns] = useState<{ name: string; price: number }[]>([])
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [isImmediate, setIsImmediate] = useState(false)
  const [address, setAddress] = useState({ street: '', city: 'Mumbai', pincode: '' })
  const [specialInstructions, setSpecialInstructions] = useState('')

  useEffect(() => {
    if (!serviceId) { router.push('/customer/book'); return }
    const fetchService = async () => {
      try {
        const res = await api.get('/services')
        const found = res.data.services.find((s: Service) => s._id === serviceId)
        if (!found) { toast.error('Service not found'); router.push('/customer/book'); return }
        setService(found)
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        setScheduledDate(tomorrow.toISOString().split('T')[0])
      } catch { toast.error('Failed to load service') }
      finally { setLoading(false) }
    }
    fetchService()
  }, [serviceId])

  const toggleAddOn = (addOn: { name: string; price: number }) => {
    setSelectedAddOns(prev =>
      prev.find(a => a.name === addOn.name)
        ? prev.filter(a => a.name !== addOn.name)
        : [...prev, { name: addOn.name, price: addOn.price }]
    )
  }

  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0)
  const total = (service?.basePrice || 0) + addOnsTotal

  const isToday = scheduledDate === new Date().toISOString().split('T')[0]

  const getEarliestSlotToday = () => {
    const now = new Date()
    const futureMinutes = (now.getHours() + LEAD_HOURS) * 60 + now.getMinutes()
    const roundedMinutes = Math.ceil(futureMinutes / 30) * 30
    const h = Math.floor(roundedMinutes / 60).toString().padStart(2, '0')
    const m = (roundedMinutes % 60).toString().padStart(2, '0')
    return `${h}:${m}`
  }

  const earliestSlotToday = getEarliestSlotToday()
  const earliestMinutes = timeToMinutes(earliestSlotToday)
  const closingMinutes = CLOSE_HOUR * 60

  const hasTodaySlots = earliestMinutes <= closingMinutes

  const availableSlots = timeSlots.filter(time => {
    if (!isToday) return true
    return timeToMinutes(time) >= earliestMinutes
  })

  useEffect(() => {
    if (isToday && scheduledTime && timeToMinutes(scheduledTime) < earliestMinutes) {
      setScheduledTime('')
    }
  }, [scheduledDate])

  const handleDateChange = (dateStr: string) => {
    setScheduledDate(dateStr)
    setScheduledTime('')
    if (dateStr === new Date().toISOString().split('T')[0] && !hasTodaySlots) {
      toast('No slots left for today. Our service hours are 8 AM – 10 PM.', { icon: '🌙' })
    }
  }

  const handleImmediateToggle = () => {
    if (!isImmediate) {
      const today = new Date().toISOString().split('T')[0]
      if (!hasTodaySlots) {
        toast('Same-day booking unavailable. It\'s past our service hours.', { icon: '⏰' })
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        setScheduledDate(tomorrow.toISOString().split('T')[0])
        setScheduledTime(timeSlots[0])
        return
      }
      setScheduledDate(today)
      setScheduledTime(timeSlots.find(t => timeToMinutes(t) >= earliestMinutes) || '')
    } else {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setScheduledDate(tomorrow.toISOString().split('T')[0])
      setScheduledTime('')
    }
    setIsImmediate(!isImmediate)
  }

  const handleProceed = () => {
    if (!scheduledDate) return toast.error('Please select a date')
    if (!scheduledTime) return toast.error('Please select a time slot')
    if (!address.street) return toast.error('Please enter your street address')
    if (!address.pincode) return toast.error('Please enter your pincode')

    const bookingData = {
      serviceId,
      service,
      selectedAddOns,
      scheduledDate,
      scheduledTime,
      isImmediate,
      serviceAddress: address,
      specialInstructions,
      subtotal: service?.basePrice || 0,
      addOnsTotal,
      total,
    }
    sessionStorage.setItem('hl_booking', JSON.stringify(bookingData))
    router.push('/customer/book/confirm')
  }

  if (loading) return <LoadingSpinner text="Loading service..." />
  if (!service) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-dark">Schedule Your Service</h1>
          <p className="text-dark/40 text-sm">Tell us when and where you need {service.name}</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-gray-100 shadow-sm">
           <span className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-[10px] font-bold"><CheckCircle className="w-3 h-3" /></span>
           <span className="text-xs font-bold text-dark/40">Selection</span>
           <ChevronRight className="w-3 h-3 text-dark/20" />
           <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">2</span>
           <span className="text-xs font-bold text-dark">Schedule</span>
           <ChevronRight className="w-3 h-3 text-dark/20" />
           <span className="w-5 h-5 rounded-full bg-dark/5 text-dark/30 flex items-center justify-center text-[10px] font-bold">3</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Service & Toggle */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="card p-6 flex-1 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-accent/5 flex items-center justify-center text-3xl">
                {service.icon}
              </div>
              <div>
                <h2 className="font-display font-black text-dark text-lg uppercase tracking-tight">{service.name}</h2>
                <p className="text-[10px] text-dark/30 font-black uppercase tracking-widest">{service.categoryLabel}</p>
              </div>
            </div>

            {service.isImmediate && (
              <div 
                onClick={handleImmediateToggle}
                className={`card p-6 flex-1 cursor-pointer transition-all border-2 flex items-center gap-4
                  ${isImmediate ? 'border-accent bg-accent/5 ring-1 ring-accent/10' : 'border-transparent'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isImmediate ? 'bg-accent text-white' : 'bg-green-50 text-green-600'}`}>
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-dark text-sm uppercase">Quick Booking</h3>
                  <p className="text-[10px] text-dark/40 font-bold uppercase tracking-widest leading-none mt-1">Available today</p>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors relative ${isImmediate ? 'bg-accent' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isImmediate ? 'right-1' : 'left-1'}`} />
                </div>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="card p-8">
            <h3 className="font-display font-black text-dark mb-6 flex items-center gap-3 uppercase tracking-tight">
              <Calendar className="w-5 h-5 text-accent" />
              Select Appointment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="label uppercase tracking-widest">Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => handleDateChange(e.target.value)}
                  className="input h-14"
                  disabled={isImmediate}
                />
              </div>
              <div>
                 <label className="label uppercase tracking-widest">Time Slot</label>
                 <div className="input h-14 flex items-center px-4 bg-surface/50 border-transparent text-dark font-display font-black text-lg">
                    {scheduledTime ? formatTime(scheduledTime) : '-- : --'}
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {timeSlots.map(time => {
                const isAvailable = !isToday || timeToMinutes(time) >= earliestMinutes
                return (
                  <button
                    key={time}
                    onClick={() => isAvailable && setScheduledTime(time)}
                    disabled={!isAvailable}
                    className={`h-14 rounded-2xl text-[10px] uppercase font-black tracking-widest border transition-all
                      ${!isAvailable
                        ? 'bg-gray-50 text-dark/10 border-gray-100 cursor-not-allowed'
                        : scheduledTime === time
                          ? 'bg-dark text-white border-dark shadow-glow'
                          : 'bg-white text-dark/40 border-gray-100 hover:border-dark/20'
                      }`}
                  >
                    {formatTime(time).replace(' ', '\n')}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Address */}
          <div className="card p-8">
            <h3 className="font-display font-black text-dark mb-6 flex items-center gap-3 uppercase tracking-tight">
              <MapPin className="w-5 h-5 text-accent" />
              Service Address
            </h3>
            <div className="space-y-6">
              <div>
                <label className="label uppercase tracking-widest">Unit / Building / Street</label>
                <input
                  type="text"
                  placeholder="e.g. A-42, Regency Tower, South Street"
                  value={address.street}
                  onChange={e => setAddress(p => ({ ...p, street: e.target.value }))}
                  className="input h-14"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="label uppercase tracking-widest">City</label>
                  <input type="text" value={address.city}
                    onChange={e => setAddress(p => ({ ...p, city: e.target.value }))}
                    className="input h-14" />
                </div>
                <div>
                  <label className="label uppercase tracking-widest">Pincode</label>
                  <input type="text" placeholder="400001" value={address.pincode}
                    onChange={e => setAddress(p => ({ ...p, pincode: e.target.value }))}
                    className="input h-14" maxLength={6} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Column */}
        <div className="lg:col-span-1">
          <div className="card p-8 sticky top-24 border-none shadow-xl bg-dark text-white overflow-hidden">
            {/* Decorative accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
            
            <h3 className="font-display font-black text-xl mb-6 relative z-10">PRICE SUMMARY</h3>
            <div className="space-y-4 mb-8 relative z-10">
              <div className="flex justify-between text-white/50 text-xs font-black uppercase tracking-widest">
                <span>Base Service</span>
                <span className="text-white">₹{service.basePrice.toLocaleString('en-IN')}</span>
              </div>
              {selectedAddOns.map(addon => (
                <div key={addon.name} className="flex justify-between text-white/50 text-xs font-black uppercase tracking-widest">
                  <span>+ {addon.name}</span>
                  <span className="text-white">₹{addon.price.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-4 flex justify-between">
                <span className="font-black text-white/40 uppercase tracking-widest text-[10px] mt-2">Total Amount</span>
                <span className="font-display font-black text-4xl text-accent shadow-accent-glow">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {scheduledDate && scheduledTime && (
              <div className="bg-white/5 rounded-2xl p-6 mb-8 text-xs font-bold text-white/70 space-y-3 relative z-10">
                 <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-accent" />
                    {new Date(scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                 </div>
                 <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-accent" />
                    {formatTime(scheduledTime)} {isImmediate && '(Priority Slot)'}
                 </div>
              </div>
            )}

            <button onClick={handleProceed} className="btn-accent w-full py-5 shadow-2xl relative z-10 text-xs font-black uppercase tracking-[0.2em] group">
              Find My Helper
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/30 font-black uppercase tracking-widest">
               <Shield className="w-3 h-3" /> Secure checkout line
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
