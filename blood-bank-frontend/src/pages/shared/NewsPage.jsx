import React, { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function NewsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedLang, setSelectedLang] = useState('all')
  const [expandedPostId, setExpandedPostId] = useState(null)

  const newsQuery = useQuery({
    queryKey: ['news', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/news')
      return data.success ? data.data : []
    }
  })

  // Filter posts based on selected language
  const filteredNews = newsQuery.data?.filter(post => {
    if (selectedLang === 'all') return true
    return post.language === selectedLang
  }) || []

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-800 to-rose-600 text-white overflow-hidden py-16 px-4 mb-12 shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60" />
        <div className="absolute -bottom-24 -left-20 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md">
              📢 Center Broadcasts
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none">
              News & Announcements <br/>
              <span className="text-rose-100 text-2xl sm:text-3xl font-black">የዜና እና ማስታወቂያ ሰሌዳ</span>
            </h1>
            <p className="text-rose-50 text-sm sm:text-base font-medium opacity-90">
              Stay informed about local blood drives, emergencies, schedule updates, and community impacts in the Bahir Dar district.
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button 
              onClick={() => navigate('/admin/news')} 
              className="bg-white hover:bg-slate-50 text-red-700 font-bold px-8 py-4 shadow-2xl transition-all duration-300 active:scale-95"
            >
              + Post News Update
            </Button>
          )}
          {user?.role === 'blood_bank_staff' && (
            <Button 
              onClick={() => navigate('/blood-bank/news')} 
              className="bg-white hover:bg-slate-50 text-red-700 font-bold px-8 py-4 shadow-2xl transition-all duration-300 active:scale-95"
            >
              + Post News Update
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Language Tabs & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-5">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            {[
              { id: 'all', label: 'All Updates / ሁሉንም' },
              { id: 'en', label: 'English' },
              { id: 'am', label: 'አማርኛ' },
              { id: 'or', label: 'Oromoo' }
            ].map(lang => (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  selectedLang === lang.id
                    ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Showing {filteredNews.length} announcements
          </div>
        </div>

        {/* News Grid */}
        {newsQuery.isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 bg-slate-100 rounded-[2.5rem] animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredNews.map((post) => {
              const isExpanded = expandedPostId === post.id;
              return (
                <Card 
                  key={post.id} 
                  className={`group overflow-hidden rounded-[2.5rem] formal-border shadow-xl hover:shadow-2xl transition-all duration-500 bg-white flex flex-col h-full ${
                    isExpanded ? 'md:col-span-2 lg:col-span-3' : ''
                  }`}
                >
                  <div className={`relative ${isExpanded ? 'md:h-96' : 'h-52'} overflow-hidden transition-all duration-500`}>
                    <img 
                      src={post.imageUrl || 'https://images.unsplash.com/photo-1615461066841-6116ecaaba3a?auto=format&fit=crop&q=80&w=800'} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Floating Info Overlay */}
                    <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between z-10">
                      <span className="px-3.5 py-1 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-brand-900/40">
                        {post.language === 'am' ? 'አማርኛ' : post.language === 'or' ? 'Oromoo' : 'English'}
                      </span>
                      <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">
                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4 group-hover:text-brand-600 transition-colors">
                        {post.title}
                      </h3>
                      
                      <div className="text-slate-600 text-sm leading-relaxed font-medium whitespace-pre-line">
                        {isExpanded ? (
                          post.content
                        ) : (
                          post.content.length > 180 
                            ? `${post.content.substring(0, 180)}...` 
                            : post.content
                        )}
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                      <button 
                        onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                        className="text-xs font-black text-brand-600 uppercase tracking-widest hover:text-slate-950 transition-colors flex items-center gap-1.5"
                      >
                        {isExpanded ? 'Collapse Details ⬆' : 'Read Full Details ⬇'}
                      </button>
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs hover:bg-rose-50 transition cursor-pointer" title="Like">❤️</div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs hover:bg-blue-50 transition cursor-pointer" title="Share">🔗</div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-xl max-w-2xl mx-auto mt-8">
             <span className="text-6xl animate-bounce inline-block">📭</span>
             <p className="mt-6 text-slate-900 text-lg font-black uppercase tracking-widest">No updates listed</p>
             <p className="text-slate-400 text-sm mt-2 font-medium">There are currently no active announcements in this language tab.</p>
          </div>
        )}
      </div>
    </div>
  )
}
