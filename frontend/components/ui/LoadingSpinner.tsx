'use client'
import { Loader2 } from 'lucide-react'

const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

export default function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className={`${sizes[size]} text-accent animate-spin`} />
      {text && <p className="text-sm text-dark/50 font-medium">{text}</p>}
    </div>
  )
}
