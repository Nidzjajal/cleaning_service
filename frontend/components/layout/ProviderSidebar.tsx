'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, ClipboardList, Calendar, Layers, 
  Wallet, FileText, Megaphone, Star, 
  HelpCircle, LogOut, ChevronRight, Zap, Settings
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const menuItems = [
  { label: 'Dashboard', href: '/provider/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'My Bookings', href: '/provider/bookings', icon: <ClipboardList size={20} /> },
  { label: 'Schedule', href: '/provider/schedule', icon: <Calendar size={20} /> },
  { label: 'Service Catalog', href: '/provider/services', icon: <Layers size={20} /> },
  { label: 'Earnings & Wallet', href: '/provider/wallet', icon: <Wallet size={20} /> },
  { label: 'Invoices', href: '/provider/invoices', icon: <FileText size={20} /> },
  { label: 'Marketing', href: '/provider/marketing', icon: <Megaphone size={20} /> },
  { label: 'Reviews', href: '/provider/reviews', icon: <Star size={20} /> },
  { label: 'Preferences & Security', href: '/provider/settings', icon: <Settings size={20} /> },
]


export default function ProviderSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed top-0 left-0 z-40">
      {/* Brand */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center font-display font-bold text-white shadow-lg shadow-accent/20">H</div>
        <div className="flex flex-col">
           <span className="font-display font-bold text-lg text-dark leading-none">HelpLender</span>
           <span className="text-[10px] font-bold text-accent uppercase tracking-widest mt-1">Provider Pro</span>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 overflow-y-auto pt-6 px-4 space-y-1.5 scrollbar-hide">
        <p className="px-4 mb-2 text-[10px] font-bold text-dark/30 uppercase tracking-widest">Management</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
                ${isActive 
                  ? 'bg-dark text-white shadow-xl shadow-dark/20' 
                  : 'text-dark/50 hover:bg-surface hover:text-accent'}`}
            >
              <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-dark/30 group-hover:text-accent'}`}>
                {item.icon}
              </span>
              {item.label}
              {isActive && <ChevronRight className="ml-auto w-4 h-4 opacity-70" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-100 bg-surface/30 mt-auto">
        <div className="grid grid-cols-2 gap-2">
          <Link href="/provider/support" className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-[10px] font-bold text-dark/50 hover:bg-white hover:text-dark border border-transparent hover:border-gray-100 transition-all">
            <HelpCircle size={14} /> Support
          </Link>
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-[10px] font-bold text-red-500/80 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-50 transition-all"
          >
            <LogOut size={14} /> Exit
          </button>
        </div>
      </div>
    </aside>
  )
}

