'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Users, UserPlus, Layers, 
  IndianRupee, Settings, HelpCircle, Bell,
  LogOut, Shield, ChevronRight
} from 'lucide-react'

import { useAuth } from '@/context/AuthContext'

const menuItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Providers', href: '/admin/providers', icon: <UserPlus size={20} /> },
  { label: 'Customers', href: '/admin/customers', icon: <Users size={20} /> },
  { label: 'Manage Services', href: '/admin/services', icon: <Layers size={20} /> },
  { label: 'Transactions', href: '/admin/transactions', icon: <IndianRupee size={20} /> },
  { label: 'Broadcasts', href: '/admin/notifications', icon: <Bell size={20} /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings size={20} /> },
]


export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed top-0 left-0">
      {/* Brand */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-dark flex items-center justify-center font-display font-bold text-white shadow-lg">H</div>
        <span className="font-display font-bold text-xl text-dark">Help<span className="text-accent">Lender</span></span>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 overflow-y-auto pt-6 px-4 space-y-1.5">
        <p className="px-4 mb-2 text-[10px] font-bold text-dark/30 uppercase tracking-widest">Main Menu</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
                ${isActive 
                  ? 'bg-accent text-white shadow-button' 
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
      <div className="p-4 border-t border-gray-100 mt-auto bg-surface/50">
        <div className="grid grid-cols-2 gap-2">
          <Link href="/admin/support" className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-[10px] font-bold text-dark/50 hover:bg-white hover:text-dark border border-transparent hover:border-gray-100 transition-all">
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

