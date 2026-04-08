import Link from 'next/link'
import { Search, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        <div className="w-24 h-24 bg-dark rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-white shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-500">
           <Search className="w-12 h-12" />
        </div>
        
        <h1 className="font-display font-black text-6xl text-dark mb-4 tracking-tighter">404</h1>
        <p className="font-display font-bold text-xl text-dark mb-6 uppercase tracking-tight">Resource Not Found</p>
        
        <p className="text-dark/40 text-sm mb-12 max-w-sm mx-auto font-bold uppercase tracking-widest leading-loose">
           The page you are looking for has been moved or deactivated. 
           Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/customer/dashboard"
            className="btn-accent px-10 py-4 flex items-center gap-3 shadow-xl group"
          >
            <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            Go to Dashboard
          </Link>
          
          <Link href="/" className="btn-ghost px-10 py-4 flex items-center gap-3 border border-dark/10 hover:bg-white transition-all">
            <ArrowLeft className="w-5 h-5" />
            Landing Page
          </Link>
        </div>

        <div className="mt-16 text-[10px] text-dark/15 font-black uppercase tracking-[0.4em] animate-pulse">
           HelpLender Asset Management System
        </div>
      </div>
    </div>
  )
}
