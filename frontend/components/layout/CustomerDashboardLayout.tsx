'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard,
  Calendar,
  Search,
  FileText,
  Navigation,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  ChevronRight,
  Shield,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  ShoppingBag
} from 'lucide-react'
import toast from 'react-hot-toast'

interface CustomerDashboardLayoutProps {
  children: React.ReactNode
}

// Mock notifications for demonstration
const mockNotifications = [
  { id: 1, title: 'Booking Confirmed', message: 'Your deep cleaning is scheduled for tomorrow at 10 AM.', type: 'success', time: '2 mins ago', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
  { id: 2, title: 'Helper Assigned', message: 'Riya has been assigned to your kitchen cleaning task.', type: 'info', time: '1 hour ago', icon: <UserIcon className="w-4 h-4 text-blue-500" /> },
  { id: 3, title: 'Service Reminder', message: 'Rating your last service helps us improve!', type: 'warning', time: '5 hours ago', icon: <Calendar className="w-4 h-4 text-amber-500" /> },
]

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  
  const notificationRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { name: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Services', href: '/customer/book', icon: Search },
    { name: 'Cart', href: '/customer/cart', icon: ShoppingBag },
    { name: 'My Bookings', href: '/customer/dashboard#my-bookings', icon: Calendar },
    { name: 'Order Tracking', href: '/customer/tracking', icon: Navigation },
    { name: 'Invoices', href: '/customer/invoices', icon: FileText },
    { name: 'Settings', href: '/customer/settings', icon: Settings },
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-surface flex selection:bg-accent/10">
      {/* Desktop Sidebar */}
      <aside 
        className={`bg-white border-r border-gray-100 flex-col fixed inset-y-0 left-0 z-50 transition-all duration-[400ms] cubic-bezier(0.4, 0, 0.2, 1) hidden lg:flex
          ${isSidebarOpen ? 'w-72' : 'w-24'}`}
      >
        <div className="p-8 flex items-center gap-4 group cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-12 h-12 bg-dark rounded-2xl flex items-center justify-center text-white font-display font-black text-2xl shrink-0 group-hover:scale-110 transition-transform shadow-xl rotate-3 group-hover:rotate-0">
            H
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-display font-black text-xl text-dark tracking-tighter leading-none">HELP</span>
              <span className="font-display font-black text-xl text-accent tracking-tighter leading-none -mt-0.5">LENDER</span>
            </div>
          )}
        </div>

        <div className={`px-6 mb-8 ${!isSidebarOpen && 'flex justify-center'}`}>
          <div className={`bg-dark rounded-3xl p-5 flex items-center gap-4 transition-all duration-500 shadow-2xl relative overflow-hidden
            ${!isSidebarOpen ? 'w-14 h-14 p-0 justify-center' : ''}`}>
            {/* Background design */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
            
            <div className="w-10 h-10 rounded-2xl bg-white text-dark flex items-center justify-center font-black shrink-0 relative z-10">
              {user?.name?.[0] || 'U'}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0 relative z-10 text-white">
                <p className="text-sm font-black truncate uppercase tracking-tight leading-tight">{user?.name}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black mt-0.5">Premium Customer</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative
                  ${isActive 
                    ? 'bg-dark text-white shadow-glow translate-x-1' 
                    : 'text-dark/40 hover:bg-surface hover:text-dark'}`}
              >
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-125 ${isActive ? 'text-accent' : 'group-hover:text-dark'}`} />
                {isSidebarOpen && <span className="font-black text-xs uppercase tracking-widest">{item.name}</span>}
                {isActive && isSidebarOpen && <div className="absolute left-0 w-1.5 h-6 bg-accent rounded-r-full -translate-x-6" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t border-gray-50 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-xs uppercase tracking-widest"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full h-12 flex items-center justify-center rounded-2xl text-dark/15 hover:bg-surface hover:text-dark/40 transition-all"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (Simplified for brevety, same logic) */}
      <aside className={`fixed inset-y-0 left-0 w-80 bg-white z-[70] transition-transform duration-500 ease-out shadow-2xl lg:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* ... mobile sidebar content ... */}
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col transition-all duration-[400ms] cubic-bezier(0.4, 0, 0.2, 1) ${isSidebarOpen ? 'lg:pl-72' : 'lg:pl-24'}`}>
        {/* Universal Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 p-6 sticky top-0 z-40 items-center justify-between flex h-24 px-8 lg:px-12">
          {/* Mobile Toggle */}
          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-surface text-dark">
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex flex-col">
            <h2 className="font-display font-black text-2xl text-dark uppercase tracking-tighter">
              {pathname === '/customer/dashboard' ? 'Overview' : pathname.split('/').pop()?.replace(/-/g, ' ')}
            </h2>
            <div className="flex items-center gap-2 text-dark/30 text-[10px] font-black uppercase tracking-widest mt-1">
               <Shield className="w-3.5 h-3.5 text-accent" />
               SECURE_ENVIRONMENT_ACTIVE
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Notification Center */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all relative border border-transparent shadow-sm
                  ${isNotificationOpen ? 'bg-dark text-white shadow-xl' : 'bg-surface text-dark/30 hover:border-gray-200'}`}
              >
                <Bell className={`w-6 h-6 ${isNotificationOpen ? 'animate-none' : 'animate-swing'}`} />
                <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white"></span>
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute top-20 right-0 w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-dark">
                    <h4 className="font-display font-black text-sm text-white uppercase tracking-widest">Update Center</h4>
                    <span className="bg-accent text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">3 New</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {mockNotifications.map((n) => (
                      <div key={n.id} className="p-5 border-b border-gray-50 hover:bg-surface cursor-pointer transition-colors flex gap-4 bg-white">
                        <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center shrink-0 shadow-sm border border-gray-50">
                          {n.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-xs text-dark uppercase tracking-tight mb-0.5">{n.title}</p>
                          <p className="text-[11px] text-dark/40 font-semibold leading-relaxed line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-accent/50 font-black uppercase tracking-widest mt-2">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setIsNotificationOpen(false)} className="w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-dark/30 hover:bg-surface hover:text-dark transition-all">
                    View All Activity Hub
                  </button>
                </div>
              )}
            </div>

            {/* Profile Dropdown Placeholder */}
            <div className="flex items-center gap-4 bg-surface p-1.5 rounded-2xl border border-gray-50 shadow-inner group cursor-pointer hover:border-accent/20 transition-all">
               <div className="w-11 h-11 rounded-xl bg-dark text-white flex items-center justify-center font-black text-sm shadow-xl group-hover:scale-105 transition-transform rotate-1 group-hover:rotate-0">
                  {user?.name?.[0]}
               </div>
               <div className="hidden sm:block pr-4">
                  <p className="text-xs font-black text-dark uppercase tracking-tighter leading-none">{user?.name?.split(' ')[0]}</p>
                  <p className="text-[10px] text-dark/30 font-bold uppercase tracking-widest leading-none mt-1">Status: Online</p>
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 lg:p-12 flex-1 animate-in fade-in duration-700 slide-in-from-bottom-2">
          {children}
        </div>
      </main>
    </div>
  )
}

