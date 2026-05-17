import React from 'react'
import { Card } from '../../components/ui/Card'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import BloodBankInfo from './BloodBankInfo'

export default function About({ isLandingPart = false }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const newsQ = useQuery({
    queryKey: ['news', 'latest'],
    queryFn: async () => {
      const { data } = await api.get('/news')
      return data.success ? data.data.slice(0, 3) : []
    }
  })

  return (
    <div className="space-y-12">
      {!isLandingPart && (
        <div className="max-w-6xl mx-auto px-4 pt-6 flex justify-end">
          <Button 
            onClick={() => navigate('/login')} 
            className="bg-slate-800 hover:bg-slate-900 text-white shadow-xl shadow-slate-200"
          >
            🔑 Staff Portal Login
          </Button>
        </div>
      )}

      {/* 1. Reuse existing Center Info component for the "About Us" section */}
      <BloodBankInfo />

      {/* 2. Latest Announcements / News Section */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Latest Announcements / የቅርብ ጊዜ ማስታወቂያዎች</h2>
            <p className="text-slate-500 font-medium">Stay updated with our Bahir Dar community news</p>
          </div>
          {user?.role === 'admin' && (
            <Button 
              onClick={() => navigate('/admin/news')} 
              className="bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-200"
            >
              + Post New Update
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {newsQ.isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-[2rem] animate-pulse" />)
          ) : newsQ.data?.length > 0 ? (
            newsQ.data.map((post) => (
              <Card key={post.id} className="group overflow-hidden rounded-[2.5rem] formal-border shadow-xl hover:shadow-2xl transition-all duration-500 bg-white flex flex-col">
                {post.imageUrl && (
                  <div className="h-48 overflow-hidden relative">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-4 left-4 px-3 py-1 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                      {post.language === 'am' ? 'አማርኛ' : post.language === 'or' ? 'Oromoo' : 'English'}
                    </span>
                  </div>
                )}
                <div className="p-8 flex-1 flex flex-col">
                  <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] mb-2">
                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 group-hover:text-brand-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-3 font-medium flex-1">
                    {post.content}
                  </p>
                  <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <button className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-brand-600 transition-colors">
                      Read More →
                    </button>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs">💬</div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs">❤️</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-3 py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
               <span className="text-5xl">📭</span>
               <p className="mt-4 text-slate-400 font-black uppercase tracking-widest">No recent updates found</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Our Values / Template Section */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 py-10">
         <div className="space-y-6">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Why Donate in Bahir Dar? <br/> ለምን ባህር ዳር ላይ ይለግሳሉ?</h2>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
               We utilize advanced screening technology and maintain a strictly temperature-controlled inventory to serve the Amhara region with life-saving blood products.
            </p>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                  <div className="text-3xl mb-2">🧪</div>
                  <h4 className="font-black text-blue-900 text-sm uppercase tracking-tight">Rapid Testing / ፈጣን ምርመራ</h4>
                  <p className="text-xs text-blue-700 mt-1">Advanced NAT screening for all donations.</p>
               </div>
               <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                  <div className="text-3xl mb-2">⚡</div>
                  <h4 className="font-black text-rose-900 text-sm uppercase tracking-tight">Emergency Ready / ለአደጋ ጊዜ ዝግጁ</h4>
                  <p className="text-xs text-rose-700 mt-1">24/7 dispatch for life-saving situations in the region.</p>
               </div>
            </div>
         </div>
         <div className="relative">
            <div className="absolute inset-0 bg-brand-600 rounded-[3rem] rotate-3 -z-10" />
            <img 
              src="https://images.unsplash.com/photo-1579154235602-3c2c2aa5d72f?auto=format&fit=crop&q=80&w=800" 
              alt="Lab work" 
              className="rounded-[3rem] shadow-2xl h-full object-cover border-8 border-white"
            />
         </div>
      </div>
    </div>
  )
}
