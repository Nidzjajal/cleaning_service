'use client'
import React, { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { 
  ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, 
  MoreVertical, Search, Bell, HelpCircle, Plus
} from 'lucide-react'
import toast from 'react-hot-toast'
import ProviderSidebar from '@/components/layout/ProviderSidebar'

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8) // 8 AM to 10 PM
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ProviderSchedulePage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await api.get('/providers/jobs')
      setJobs(res.data.jobs || [])
    } catch { toast.error('Failed to load schedule') }
    finally { setLoading(false) }
  }

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  const startOfWeek = getStartOfWeek(currentDate)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      <ProviderSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <header className="flex items-center justify-between p-8 gap-8 border-b border-gray-50 bg-white">
          <h1 className="font-display text-2xl font-bold text-dark">Weekly Schedule</h1>
          <div className="flex-1 max-w-md relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
             <input type="text" placeholder="Search appointments..." className="w-full bg-surface border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10" />
          </div>
          <div className="flex items-center gap-4">
             <button className="btn-accent btn-sm shadow-lg shadow-accent/20"><Plus size={16} /> New Slot</button>
             <button className="p-2.5 bg-surface rounded-xl text-dark/40"><Bell size={18} /></button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-x-auto">
          <div className="min-w-[1000px] bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-50">
              <h2 className="font-display font-bold text-xl text-dark">Schedule Calendar</h2>
              <div className="flex items-center gap-4">
                <div className="flex bg-surface rounded-xl p-1">
                  <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d) }} 
                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"><ChevronLeft size={18} /></button>
                  <div className="px-4 py-2 text-sm font-bold text-dark">
                    {startOfWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d) }}
                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"><ChevronRight size={18} /></button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[100px_repeat(7,1fr)]">
              <div className="p-4 border-r border-gray-50 bg-surface/30"></div>
              {weekDays.map((date, i) => (
                <div key={i} className="p-4 text-center border-b border-gray-50">
                  <p className="text-[10px] font-bold text-dark/30 uppercase tracking-widest mb-1">{DAYS[date.getDay()]}</p>
                  <p className={`text-2xl font-display font-bold ${date.toDateString() === new Date().toDateString() ? 'text-accent' : 'text-dark'}`}>
                    {date.getDate()}
                  </p>
                </div>
              ))}

              {HOURS.map(hour => (
                <React.Fragment key={hour}>
                  <div className="p-4 text-right border-r border-gray-50 text-[10px] font-bold text-dark/30 align-top">
                    {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                  </div>
                  {weekDays.map((date, i) => {
                    const job = jobs.find(j => {
                      const jDate = new Date(j.scheduledDate)
                      const jHour = parseInt(j.scheduledTime.split(':')[0])
                      return jDate.toDateString() === date.toDateString() && jHour === hour
                    })

                    return (
                      <div key={i} className="p-1 border-r border-b border-gray-50 h-28 relative group">
                        {job && (
                          <div className={`absolute inset-1 rounded-xl p-3 border-l-4 transition-all hover:scale-[1.02] cursor-pointer shadow-sm ${job.status === 'COMPLETED' ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-500'}`}>
                             <div className="flex items-center justify-between mb-1">
                                <span className={`text-[9px] font-bold uppercase tracking-tighter ${job.status === 'COMPLETED' ? 'text-green-600' : 'text-blue-600'}`}>{job.status === 'COMPLETED' ? 'Finished' : 'Full Time'}</span>
                                <MoreVertical size={12} className="text-dark/20" />
                             </div>
                             <p className="text-xs font-bold text-dark truncate">{(job.serviceId as any)?.name || 'Cleaning Job'}</p>
                             <p className="text-[10px] font-medium text-dark/40">{job.scheduledTime}</p>
                          </div>
                        )}
                        {!job && i === 5 && hour === 13 && (
                           <div className="absolute inset-1 rounded-xl p-3 border-l-4 bg-orange-50 border-orange-500 shadow-sm">
                              <span className="text-[9px] font-bold uppercase tracking-tighter text-orange-600">Part Time</span>
                              <p className="text-xs font-bold text-dark">Shift A</p>
                              <p className="text-[10px] font-medium text-dark/40">1:00 PM</p>
                           </div>
                        )}
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
