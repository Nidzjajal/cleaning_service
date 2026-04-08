'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '../lib/api'
import { Service } from '../types'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import {
  Star, Clock, Shield, ChevronRight, ArrowRight, MapPin,
  CheckCircle, Users, Award, Zap, Phone, Home, Utensils,
  Layers, Leaf, Sparkles
} from 'lucide-react'

const categoryIcons: Record<string, React.ReactNode> = {
  indoor_living: <Home className="w-6 h-6" />,
  kitchen_dining: <Utensils className="w-6 h-6" />,
  floor_surface: <Layers className="w-6 h-6" />,
  outdoor: <Leaf className="w-6 h-6" />,
  deep_cleaning: <Sparkles className="w-6 h-6" />,
}

const categoryColors: Record<string, string> = {
  indoor_living: 'bg-blue-50 text-blue-600 border-blue-100',
  kitchen_dining: 'bg-orange-50 text-orange-600 border-orange-100',
  floor_surface: 'bg-teal-50 text-teal-600 border-teal-100',
  outdoor: 'bg-green-50 text-green-600 border-green-100',
  deep_cleaning: 'bg-purple-50 text-purple-600 border-purple-100',
}

const stats = [
  { value: '10,000+', label: 'Happy Customers', icon: <Users className="w-5 h-5" /> },
  { value: '500+', label: 'Vetted Helpers', icon: <Shield className="w-5 h-5" /> },
  { value: '4.9★', label: 'Average Rating', icon: <Star className="w-5 h-5" /> },
  { value: '2 hrs', label: 'Avg Response Time', icon: <Clock className="w-5 h-5" /> },
]

const features = [
  {
    icon: <Shield className="w-7 h-7 text-accent" />,
    title: 'Background Verified',
    desc: 'Every helper is personally vetted, ID-verified, and background-checked before onboarding.',
  },
  {
    icon: <Zap className="w-7 h-7 text-accent" />,
    title: 'Same-Day Booking',
    desc: 'Need it today? Book within 3 hours and get a professional at your door.',
  },
  {
    icon: <MapPin className="w-7 h-7 text-accent" />,
    title: 'Live GPS Tracking',
    desc: 'Watch your helper travel to you in real time on a live map — know exactly when they arrive.',
  },
  {
    icon: <Award className="w-7 h-7 text-accent" />,
    title: '100% Satisfaction',
    desc: 'Not happy? We\'ll send another helper or refund you. No questions asked.',
  },
]

const testimonials = [
  {
    name: 'Ananya Mehta',
    city: 'Mumbai',
    rating: 5,
    text: 'Absolutely outstanding service! Raju arrived on time and left my kitchen spotless. The live tracking feature is such a nice touch — I always knew when he\'d arrive.',
    avatar: 'AM',
  },
  {
    name: 'Vikram Patel',
    city: 'Pune',
    rating: 5,
    text: 'Booked a full home deep clean for my move-out. Priced fairly and the work was exceptional. Will definitely use HelpLender again!',
    avatar: 'VP',
  },
  {
    name: 'Sneha Iyer',
    city: 'Mumbai',
    rating: 5,
    text: 'The same-day booking option saved me right before my parents\' visit. The cleaner was professional, thorough, and very respectful.',
    avatar: 'SI',
  },
]

const howItWorks = [
  { step: '01', title: 'Pick a Service', desc: 'Choose from our range of professional home cleaning services.' },
  { step: '02', title: 'Select Date & Time', desc: 'Book for today or schedule ahead. Flexible time slots available.' },
  { step: '03', title: 'Choose Your Helper', desc: 'Browse vetted helpers by rating and distance from you.' },
  { step: '04', title: 'Relax & Track', desc: 'Pay securely and track your helper live on the map.' },
]

export default function LandingPage() {
  const [services, setServices] = useState<Service[]>([])
  const [groupedServices, setGroupedServices] = useState<Record<string, Service[]>>({})
  const [loadingServices, setLoadingServices] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services')
        const data: Service[] = res.data.services
        setServices(data)
        const grouped = data.reduce((acc, svc) => {
          if (!acc[svc.category]) acc[svc.category] = []
          acc[svc.category].push(svc)
          return acc
        }, {} as Record<string, Service[]>)
        setGroupedServices(grouped)
      } catch (err) {
        console.error('Failed to load services')
      } finally {
        setLoadingServices(false)
      }
    }
    fetchServices()
  }, [])

  const displayedServices = activeCategory === 'all'
    ? services
    : services.filter(s => s.category === activeCategory)

  const categories = [
    { key: 'all', label: 'All Services' },
    { key: 'indoor_living', label: '🛋️ Indoor Living' },
    { key: 'kitchen_dining', label: '🍳 Kitchen' },
    { key: 'floor_surface', label: '🧼 Floors' },
    { key: 'outdoor', label: '🌿 Outdoor' },
    { key: 'deep_cleaning', label: '✨ Deep Clean' },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* ── HERO ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-dark min-h-[88vh] flex items-center">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        {/* Gradient blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />

        <div className="container-main w-full relative z-10 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium mb-8 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                India's Most Trusted Home Cleaning Platform
              </div>
              <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] mb-6">
                A Cleaner Home,<br />
                <span className="text-accent">Guaranteed.</span>
              </h1>
              <p className="text-white/60 text-xl leading-relaxed mb-10 max-w-lg">
                Book verified, professional home cleaners in minutes. Live tracking, fair pricing,
                and a 100% satisfaction guarantee.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/customer/book" className="btn-accent btn-lg">
                  Book a Cleaner
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/become-a-helper" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border-2 border-white/20 font-semibold rounded-lg transition-all duration-200 hover:bg-white/20 hover:border-white/40 active:scale-95">
                  Become a Helper
                </Link>
              </div>
              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 text-white/50 text-sm">
                {['No hidden fees', 'Cancel anytime', 'Insured & verified'].map((t) => (
                  <span key={t} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero card */}
            <div className="hidden lg:block animate-slide-up">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold text-lg">Book a Service</h3>
                  <span className="badge bg-success/20 text-success border border-success/30">
                    Available Today
                  </span>
                </div>

                {/* Quick booking grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: '🛋️', name: 'Bedroom Clean', price: '₹799' },
                    { icon: '🍳', name: 'Kitchen Deep Clean', price: '₹999' },
                    { icon: '🧹', name: 'Floor Care', price: '₹499' },
                    { icon: '✨', name: 'Full Home Clean', price: '₹2,999' },
                  ].map((s) => (
                    <Link href="/customer/book" key={s.name}
                      className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-4 transition-all cursor-pointer group">
                      <div className="text-2xl mb-2">{s.icon}</div>
                      <div className="text-white text-sm font-medium leading-tight">{s.name}</div>
                      <div className="text-accent text-sm font-bold mt-1">{s.price}</div>
                    </Link>
                  ))}
                </div>

                {/* Live tracking preview - updated to be a feature highlight */}
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="tracking-pulse">
                      <div className="w-3 h-3 rounded-full bg-accent" />
                    </div>
                    <span className="text-white text-sm font-semibold">Real-time Service Tracking</span>
                  </div>
                  <p className="text-white/50 text-xs mb-3 leading-relaxed">
                    Watch your assigned helper arrive in real-time. Know exactly when they start and finish.
                  </p>
                  <div className="flex gap-2">
                    <div className="h-1.5 flex-1 bg-accent/40 rounded-full" />
                    <div className="h-1.5 flex-1 bg-white/10 rounded-full" />
                    <div className="h-1.5 flex-1 bg-white/10 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 py-10">
        <div className="container-main">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-surface rounded-lg text-dark/40">{s.icon}</div>
                <div className="font-display text-3xl font-bold text-dark">{s.value}</div>
                <div className="text-sm text-dark/50 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────── */}
      <section className="section-lg">
        <div className="container-main">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">What We Offer</span>
            <h2 className="font-display text-4xl font-bold text-dark mt-3 mb-4">
              Professional Cleaning Services
            </h2>
            <p className="text-dark/50 text-lg max-w-2xl mx-auto">
              From a quick bedroom tidy to a full home deep clean — every service delivered by vetted, trained professionals.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200
                  ${activeCategory === cat.key
                    ? 'bg-dark text-white border-dark shadow-button'
                    : 'bg-white text-dark/60 border-gray-200 hover:border-dark/30'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          {loadingServices ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-6 h-64">
                  <div className="skeleton h-10 w-10 rounded-xl mb-4" />
                  <div className="skeleton h-6 w-3/4 mb-2" />
                  <div className="skeleton h-4 w-full mb-1" />
                  <div className="skeleton h-4 w-5/6" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedServices.map((svc) => (
                <Link key={svc._id} href={`/customer/book?service=${svc._id}`}
                  className="card-hover p-6 group animate-fade-in flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl border ${categoryColors[svc.category] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                      {svc.icon}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {svc.isPopular && (
                        <span className="badge bg-amber-100 text-amber-700">⭐ Popular</span>
                      )}
                      {svc.isImmediate && (
                        <span className="badge bg-green-100 text-green-700">⚡ Same Day</span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-dark text-lg mb-2 group-hover:text-accent transition-colors">
                    {svc.name}
                  </h3>
                  <p className="text-dark/50 text-sm leading-relaxed flex-1 mb-4">
                    {svc.description}
                  </p>

                  {/* Inclusions preview */}
                  <ul className="space-y-1 mb-5">
                    {svc.whatIncluded?.slice(0, 3).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-dark/60">
                        <CheckCircle className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                    {svc.whatIncluded?.length > 3 && (
                      <li className="text-xs text-accent font-medium">+{svc.whatIncluded.length - 3} more</li>
                    )}
                  </ul>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-xl font-bold text-dark font-display">
                        ₹{svc.basePrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-dark/40">{svc.priceUnit?.replace('_', ' ')}</div>
                    </div>
                    <span className="btn-primary btn-sm group-hover:bg-dark-lighter">
                      Book Now
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────── */}
      <section className="section bg-dark text-white">
        <div className="container-main">
          <div className="text-center mb-14">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="font-display text-4xl font-bold mt-3">How HelpLender Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="relative text-center">
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-px bg-white/10 border-t border-dashed border-white/20" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-accent font-display font-bold text-xl mx-auto mb-5">
                  {step.step}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ──────────────────────────────────── */}
      <section className="section-lg">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">Why HelpLender?</span>
              <h2 className="font-display text-4xl font-bold text-dark mt-3 mb-6">
                Built for Trust,<br />Designed for Convenience.
              </h2>
              <div className="space-y-6">
                {features.map((f) => (
                  <div key={f.title} className="flex gap-5">
                    <div className="w-14 h-14 bg-surface rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                      {f.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark text-lg mb-1">{f.title}</h3>
                      <p className="text-dark/50 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Feature card */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Live Tracking', icon: '📍', color: 'bg-blue-50 border-blue-100', desc: 'Watch your helper in real time on a map' },
                { title: 'Instant Booking', icon: '⚡', color: 'bg-yellow-50 border-yellow-100', desc: 'Book and get a confirmation in under 60 sec' },
                { title: 'INR Pricing', icon: '₹', color: 'bg-green-50 border-green-100', desc: 'Transparent pricing, no hidden charges' },
                { title: 'SMS Updates', icon: '📱', color: 'bg-purple-50 border-purple-100', desc: 'Get notified at every step of the booking' },
              ].map((item) => (
                <div key={item.title}
                  className={`card p-6 border ${item.color}`}>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h4 className="font-semibold text-dark mb-1">{item.title}</h4>
                  <p className="text-xs text-dark/50 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────── */}
      <section className="section bg-surface">
        <div className="container-main">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Customer Stories</span>
            <h2 className="font-display text-4xl font-bold text-dark mt-3">
              Loved By Thousands
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-7">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-dark/70 text-sm leading-relaxed mb-6 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-dark text-sm">{t.name}</div>
                    <div className="text-xs text-dark/40">{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────── */}
      <section className="section bg-accent">
        <div className="container-narrow text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Ready for a Spotless Home?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join 10,000+ happy customers. Book your first clean today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/customer/book" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-accent font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg">
              Book Your First Clean
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/become-a-helper" className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 text-white border border-white/30 font-semibold rounded-xl hover:bg-white/25 transition-all">
              <Phone className="w-5 h-5" />
              Become a Helper
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
