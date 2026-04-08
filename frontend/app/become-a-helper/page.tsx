'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import {
  User, Phone, Mail, Lock, Briefcase, ChevronRight,
  ChevronLeft, Upload, CheckCircle, Loader2, Star
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const skills = [
  { key: 'bedroom_cleaning', label: 'Bedroom & Living Room', icon: '🛋️' },
  { key: 'kitchen_cleaning', label: 'Kitchen Deep Clean', icon: '🍳' },
  { key: 'floor_care', label: 'Floor & Surface Care', icon: '🧹' },
  { key: 'bathroom_cleaning', label: 'Bathroom Cleaning', icon: '🚿' },
  { key: 'carpet_cleaning', label: 'Carpet & Upholstery', icon: '🪑' },
  { key: 'balcony_cleaning', label: 'Terrace & Balcony', icon: '🌿' },
  { key: 'window_cleaning', label: 'Window Cleaning', icon: '🪟' },
  { key: 'deep_cleaning', label: 'Full Home Deep Clean', icon: '✨' },
  { key: 'appliance_cleaning', label: 'Appliance Cleaning', icon: '🧺' },
]

const steps = ['Your Details', 'Skills & Experience', 'Document Upload', 'Review & Submit']

export default function BecomeHelperPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    bio: '', experience: '0-1 years', hourlyRate: 300,
    skills: [] as string[],
    city: 'Mumbai', pincode: '', street: '',
  })

  const toggleSkill = (key: string) => {
    setForm(p => ({
      ...p,
      skills: p.skills.includes(key) ? p.skills.filter(s => s !== key) : [...p.skills, key],
    }))
  }

  const validate = () => {
    if (step === 0 && (!form.name || !form.email || !form.phone || !form.password)) {
      toast.error('Please fill in all required fields'); return false
    }
    if (step === 1 && form.skills.length === 0) {
      toast.error('Please select at least one skill'); return false
    }
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'skills') formData.append(k, JSON.stringify(v))
        else formData.append(k, String(v))
      })
      if (file) formData.append('idDocument', file)

      await api.post('/auth/become-helper', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSubmitted(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    setTimeout(() => router.push('/login'), 4000)
    
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center max-w-lg p-8 animate-fade-in">
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          <h1 className="font-display text-3xl font-bold text-dark mb-3">Application Received!</h1>
          <p className="text-dark/60 text-lg mb-4">
            Thank you, <strong>{form.name}</strong>! Your application has been submitted.
          </p>
          <p className="text-dark/50 text-sm mb-8">
            Our team will review your profile and send you an SMS to <strong>{form.phone}</strong> within 24–48 hours with your login credentials.
          </p>
          <Link href="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* Hero */}
      <section className="bg-dark py-16 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '32px 32px' }} />
        <div className="container-narrow relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/70 text-sm mb-6">
            <Star className="w-4 h-4 text-accent" fill="currentColor" />
            Join 500+ Verified Helpers Earning Monthly
          </div>
          <h1 className="font-display text-5xl font-bold mb-4">
            Earn Doing What<br /><span className="text-accent">You Do Best</span>
          </h1>
          <p className="text-white/60 text-xl max-w-xl mx-auto">
            Set your own hours, choose your services, and build a steady income helping Indian homes shine.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-10 max-w-lg mx-auto">
            {[['₹15,000+', 'Avg Monthly Earning'], ['4.9★', 'Provider Rating'], ['2 days', 'Application Time']].map(([v, l]) => (
              <div key={l} className="bg-white/10 rounded-xl p-4">
                <div className="font-display text-2xl font-bold">{v}</div>
                <div className="text-white/40 text-xs mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-step Form */}
      <section className="section-lg">
        <div className="container-narrow">
          {/* Step Indicators */}
          <div className="flex items-center justify-center mb-12">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2.5 ${i <= step ? 'text-dark' : 'text-dark/30'}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${i < step ? 'bg-success text-white' : i === step ? 'bg-dark text-white' : 'bg-gray-100 text-dark/30'}`}>
                    {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`mx-4 flex-1 h-px w-12 md:w-20 ${i < step ? 'bg-success' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="card p-8 max-w-2xl mx-auto">
            {/* Step 0: Personal Details */}
            {step === 0 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="font-display text-2xl font-bold text-dark">Tell us about yourself</h2>
                {[
                  { id: 'h-name', label: 'Full Name', type: 'text', key: 'name', icon: <User className="w-4 h-4" />, ph: 'Your Name' },
                  { id: 'h-email', label: 'Email', type: 'email', key: 'email', icon: <Mail className="w-4 h-4" />, ph: 'email@example.com' },
                  { id: 'h-phone', label: 'Phone Number', type: 'tel', key: 'phone', icon: <Phone className="w-4 h-4" />, ph: '9876543210' },
                  { id: 'h-pass', label: 'Set Password', type: 'password', key: 'password', icon: <Lock className="w-4 h-4" />, ph: 'Min. 8 characters' },
                ].map(f => (
                  <div key={f.id}>
                    <label htmlFor={f.id} className="label">{f.label}</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark/30">{f.icon}</span>
                      <input id={f.id} type={f.type} placeholder={f.ph} className="input pl-10"
                        value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">City</label>
                    <input type="text" className="input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Pincode</label>
                    <input type="text" className="input" placeholder="400001" value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Skills */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="font-display text-2xl font-bold text-dark mb-2">Your Skills & Services</h2>
                <p className="text-dark/50 text-sm mb-6">Select all the services you can confidently provide.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {skills.map(s => (
                    <button key={s.key} type="button" onClick={() => toggleSkill(s.key)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-sm
                        ${form.skills.includes(s.key)
                          ? 'border-accent bg-accent/5 text-dark font-semibold'
                          : 'border-gray-150 bg-white text-dark/60 hover:border-gray-300'}`}>
                      <span className="text-xl">{s.icon}</span>
                      <span className="leading-tight">{s.label}</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Experience</label>
                    <select className="input" value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}>
                      {['0-1 years', '1-3 years', '3-5 years', '5+ years'].map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Hourly Rate (₹)</label>
                    <input type="number" className="input" min={200} max={1000} step={50}
                      value={form.hourlyRate} onChange={e => setForm(p => ({ ...p, hourlyRate: parseInt(e.target.value) }))} />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="label">Tell customers about yourself</label>
                  <textarea rows={3} className="input" placeholder="E.g. I have 3 years of experience in professional home cleaning. I'm thorough, punctual, and bring my own supplies."
                    value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
                </div>
              </div>
            )}

            {/* Step 2: Documents */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="font-display text-2xl font-bold text-dark mb-2">Identity Verification</h2>
                <p className="text-dark/50 text-sm mb-6">Upload a government-issued ID (Aadhaar, PAN, or Passport). Only our admin team can view this.</p>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                  onChange={e => setFile(e.target.files?.[0] || null)} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-10 text-center transition-all
                    ${file ? 'border-success bg-success/5' : 'border-gray-200 hover:border-accent hover:bg-accent/5'}`}>
                  {file ? (
                    <div>
                      <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
                      <p className="font-semibold text-dark">{file.name}</p>
                      <p className="text-xs text-dark/40 mt-1">Click to change file</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-10 h-10 text-dark/20 mx-auto mb-3" />
                      <p className="font-medium text-dark/60">Click to upload ID document</p>
                      <p className="text-xs text-dark/30 mt-1">PDF, JPG, PNG — Max 5MB</p>
                    </div>
                  )}
                </button>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs text-blue-700 font-semibold mb-1">🔒 Your data is secure</p>
                  <p className="text-xs text-blue-600">Documents are encrypted and only viewed by our vetting team. Never shared with customers.</p>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="font-display text-2xl font-bold text-dark mb-6">Review Your Application</h2>
                <div className="space-y-4">
                  <div className="bg-surface rounded-xl p-5 border border-gray-100">
                    <h4 className="font-semibold text-dark text-sm mb-3">Personal Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-dark/40">Name:</span> <span className="font-medium">{form.name}</span></div>
                      <div><span className="text-dark/40">Email:</span> <span className="font-medium">{form.email}</span></div>
                      <div><span className="text-dark/40">Phone:</span> <span className="font-medium">{form.phone}</span></div>
                      <div><span className="text-dark/40">City:</span> <span className="font-medium">{form.city}</span></div>
                    </div>
                  </div>
                  <div className="bg-surface rounded-xl p-5 border border-gray-100">
                    <h4 className="font-semibold text-dark text-sm mb-3">Skills ({form.skills.length} selected)</h4>
                    <div className="flex flex-wrap gap-2">
                      {form.skills.map(s => (
                        <span key={s} className="badge badge-confirmed">{skills.find(sk => sk.key === s)?.label || s}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-dark/40 leading-relaxed">
                    By submitting, you confirm all information is accurate. Our team will review your application and contact you within 24–48 hours via SMS.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
                className="btn-outline disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />Back
              </button>
              {step < steps.length - 1 ? (
                <button onClick={() => { if (validate()) setStep(s => s + 1) }} className="btn-primary">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="btn-success">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : '🚀 Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
