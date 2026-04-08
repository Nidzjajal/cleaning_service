'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, User } from 'lucide-react'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const dashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'admin') return '/admin/dashboard'
    if (user.role === 'provider') return '/provider/dashboard'
    return '/customer/dashboard'
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-dark flex items-center justify-center text-white font-display font-bold text-base transition-transform group-hover:scale-105">
              H
            </div>
            <span className="font-display font-bold text-dark text-xl">
              Help<span className="text-accent">Lender</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            <Link href="/#services" className="nav-link">Services</Link>
            <Link href="/become-a-helper" className="nav-link">Become a Helper</Link>
            <Link href="/customer/book" className="nav-link">Book Now</Link>
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-dark text-white flex items-center justify-center text-sm font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-dark">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 text-dark/40 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 card shadow-modal border border-gray-100 animate-fade-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-surface">
                      <p className="text-xs text-dark/40 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-dark truncate">{user?.email}</p>
                      <span className="badge-confirmed mt-1">{user?.role}</span>
                    </div>
                    <div className="py-1">
                      <Link href={dashboardLink()} onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-surface transition-colors">
                        <LayoutDashboard className="w-4 h-4 text-dark/40" />
                        Dashboard
                      </Link>
                      <Link href="/profile" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-surface transition-colors">
                        <User className="w-4 h-4 text-dark/40" />
                        My Profile
                      </Link>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link href="/signup" className="btn-primary text-sm px-5 py-2.5">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-surface">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-1 animate-slide-up">
            {[
              { href: '/', label: 'Home' },
              { href: '/customer/book', label: 'Book a Service' },
              { href: '/become-a-helper', label: 'Become a Helper' },
            ].map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-dark hover:bg-surface rounded-lg">
                {link.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2 px-4">
              {isAuthenticated ? (
                <>
                  <Link href={dashboardLink()} className="btn-primary text-center">Dashboard</Link>
                  <button onClick={handleLogout} className="btn-outline text-error border-error/20">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-outline text-center">Sign In</Link>
                  <Link href="/signup" className="btn-primary text-center">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
