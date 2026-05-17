import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function NewsTicker() {
  const navigate = useNavigate()
  const { data: news = [] } = useQuery({
    queryKey: ['news', 'ticker'],
    queryFn: async () => {
      const { data } = await api.get('/news')
      return data.success ? data.data : []
    },
    refetchInterval: 60000 // Refresh every minute
  })

  if (news.length === 0) return null

  return (
    <div className="bg-slate-900 text-white overflow-hidden py-2 border-b border-white/10 relative z-[60]">
      <div className="max-w-[100vw] whitespace-nowrap flex items-center">
        <div className="pl-6" />
        
        <div className="animate-marquee inline-block hover:pause flex items-center gap-12">
          {news.map((item) => (
            <div 
              key={item.id} 
              className="inline-flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate('/about')}
            >
              <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded text-brand-300">
                {item.language === 'am' ? 'AM' : item.language === 'or' ? 'OR' : 'EN'}
              </span>
              <span className="text-sm font-bold group-hover:text-brand-400 transition-colors">
                {item.title}
              </span>
              <span className="text-white/30 text-xs">|</span>
              <span className="text-xs text-slate-400 font-medium">
                {item.content.substring(0, 80)}...
              </span>
              <span className="text-brand-500 font-black ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {news.map((item) => (
            <div 
              key={`${item.id}-dup`} 
              className="inline-flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate('/about')}
            >
              <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded text-brand-300">
                {item.language === 'am' ? 'AM' : item.language === 'or' ? 'OR' : 'EN'}
              </span>
              <span className="text-sm font-bold group-hover:text-brand-400 transition-colors">
                {item.title}
              </span>
              <span className="text-white/30 text-xs">|</span>
              <span className="text-xs text-slate-400 font-medium">
                {item.content.substring(0, 80)}...
              </span>
              <span className="text-brand-500 font-black ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  )
}
