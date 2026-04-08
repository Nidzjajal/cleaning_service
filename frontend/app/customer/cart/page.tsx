'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import CustomerDashboardLayout from '@/components/layout/CustomerDashboardLayout'
import { ShoppingCart, ShoppingBag, ArrowRight, Shield, Zap } from 'lucide-react'

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for draft bookings in session storage
    const draft = sessionStorage.getItem('hl_booking')
    if (draft) {
      setCartItems([JSON.parse(draft)])
    }
    setLoading(false)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-dark uppercase tracking-tight">Your Selection</h1>
          <p className="text-dark/40 text-sm">Review your currently selected services before continuing</p>
        </div>
        
        <div className="flex items-center gap-2 bg-dark rounded-xl px-4 py-2 border border-dark shadow-xl">
           <ShoppingBag className="w-4 h-4 text-accent" />
           <span className="text-xs font-black text-white uppercase tracking-widest">{cartItems.length} ITEM{cartItems.length !== 1 ? 'S' : ''}</span>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center flex flex-col items-center border border-gray-100 shadow-sm">
          <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center mb-6 border border-gray-50 relative">
             <ShoppingCart className="w-10 h-10 text-dark/10" />
             <div className="absolute top-0 right-0 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center text-accent">!</div>
          </div>
          <h3 className="font-display font-black text-xl text-dark mb-2 uppercase">Your tray is empty</h3>
          <p className="text-dark/40 text-sm mb-8 max-w-xs mx-auto font-bold uppercase tracking-widest text-[10px]">Ready to experience premium help at home?</p>
          <Link href="/customer/book" className="btn-accent px-10 py-4 shadow-xl">
            Start Selecting <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-[2rem] p-8 flex flex-col sm:flex-row items-center gap-8 border border-gray-50 shadow-sm relative overflow-hidden group">
                {/* Design element */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-accent group-hover:w-3 transition-all"></div>
                
                <div className="w-20 h-20 rounded-3xl bg-surface border border-gray-100 flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform">
                  {item.service?.icon}
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-display font-black text-xl text-dark uppercase tracking-tight">{item.service?.name}</h3>
                  <p className="text-[10px] text-dark/30 font-black uppercase tracking-[0.2em] mb-4">{item.service?.categoryLabel}</p>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                     <span className="bg-surface px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-dark/40 border border-gray-100 shadow-sm relative hidden sm:block">
                        Scheduled: {new Date(item.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {item.scheduledTime}
                     </span>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <p className="text-[10px] text-dark/30 font-black uppercase tracking-widest mb-1">Total</p>
                  <p className="font-display font-black text-3xl text-dark">₹{item.total?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
             <div className="bg-dark rounded-[2.5rem] p-8 sticky top-24 shadow-2xl text-white">
                <h3 className="font-display font-black text-xl mb-6">SUMMARY</h3>
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center text-white/40 text-[10px] font-black uppercase tracking-widest">
                      <span>Items Count</span>
                      <span className="text-white bg-white/10 px-2 py-0.5 rounded text-[9px]">{cartItems.length}</span>
                   </div>
                   <div className="flex justify-between items-center font-display font-black text-4xl text-accent">
                      <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">Total</span>
                       ₹{cartItems.reduce((s, i) => s + (i.total || 0), 0).toLocaleString('en-IN')}
                   </div>
                </div>

                <Link href="/customer/book/confirm" className="btn-accent w-full py-5 shadow-glow uppercase font-black text-xs tracking-widest group">
                  Continue to Confirm
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="mt-6 flex items-center justify-center gap-3 text-white/20 text-[10px] font-black uppercase tracking-widest">
                   <Shield className="w-3.5 h-3.5" /> 256-BIT ENCRYPTION
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
