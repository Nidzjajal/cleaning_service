'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-500 shadow-xl border border-red-50">
          <AlertCircle className="w-10 h-10" />
        </div>
        
        <h1 className="font-display font-black text-3xl text-dark mb-4 uppercase tracking-tighter">System Interruption</h1>
        <p className="text-dark/40 text-sm mb-12 font-bold uppercase tracking-widest leading-loose">
           Something unexpected occurred. Our engineering team has been notified. 
           <br/>
           <span className="text-red-500/50 text-[10px]">{error.message || 'RUNTIME_EXCEPTION'}</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="btn-dark px-10 py-4 flex items-center gap-3 shadow-2xl group"
          >
            <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </button>
          
          <Link href="/" className="btn-ghost px-10 py-4 flex items-center gap-3 border border-dark/5 hover:bg-white transition-all">
            <Home className="w-5 h-5" />
            Back Home
          </Link>
        </div>

        <p className="mt-12 text-[10px] text-dark/20 font-black uppercase tracking-[0.3em]">HelpLender Security Layer Active</p>
      </div>
    </div>
  )
}
