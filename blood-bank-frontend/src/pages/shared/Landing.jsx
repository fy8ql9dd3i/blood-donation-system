import React from 'react'
import About from './About'
import Login from '../auth/Login'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const [showLogin, setShowLogin] = React.useState(false)

  return (
    <div className="flex flex-col bg-white">
      {/* 1. Ultra-Premium Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-900">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/bahirdar_blood_bank_hero_1777980007216.png" 
            className="w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow" 
            alt="Bahir Dar Blood Bank"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full py-20">
          <div className="max-w-3xl space-y-8 animate-in slide-in-from-left-10 duration-1000">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand-600/10 border border-brand-500/20 backdrop-blur-md">
               <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-400">Regional Life-Saving Center</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
              Every Drop <br/>
              <span className="text-brand-500">Saves Lives.</span>
            </h1>
            
            <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-xl">
              Bahir Dar District Blood Bank: Leveraging cutting-edge technology and a dedicated community to ensure safe blood supply across the Amhara region.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                onClick={() => document.getElementById('about-section').scrollIntoView({ behavior: 'smooth' })}
                className="bg-brand-600 hover:bg-brand-700 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-brand-500/40 border-none transition-all active:scale-95"
              >
                Explore Services →
              </Button>
              <button 
                 onClick={() => {
                   setShowLogin(true);
                   setTimeout(() => document.getElementById('login-section').scrollIntoView({ behavior: 'smooth' }), 100);
                 }}
                 className="px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest text-white border-2 border-white/20 hover:bg-white/10 transition-all backdrop-blur-md"
              >
                Staff Portal
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-white/10">
               <div>
                  <p className="text-3xl font-black text-white">5k+</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Monthly Donors</p>
               </div>
               <div>
                  <p className="text-3xl font-black text-white">24/7</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Emergency Service</p>
               </div>
               <div>
                  <p className="text-3xl font-black text-white">100%</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Safety Tested</p>
               </div>
            </div>
          </div>
        </div>
        
        {/* Floating Abstract Elements */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] animate-pulse" />
      </section>

      {/* 2. About Section (Now as a smooth transition) */}
      <section id="about-section" className="relative z-20 -mt-20 bg-white rounded-t-[4rem] shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.1)] py-20">
        <About isLandingPart={true} />
      </section>

      {/* 3. Modern Call to Action / Info Grid */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
           <Card className="p-10 formal-border bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:rotate-6 transition-transform">🚑</div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4">Regional Logistics</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Synchronized dispatch network serving over 50 hospitals across the Amhara region with real-time tracking.</p>
           </Card>
           <Card className="p-10 formal-border bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:rotate-6 transition-transform">🔬</div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4">Precision Screening</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Every donation undergoes rigorous molecular testing to ensure the highest standards of safety for recipients.</p>
           </Card>
           <Card className="p-10 formal-border bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:rotate-6 transition-transform">📱</div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4">Donor Experience</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Access your donation history, earn hero points, and receive emergency alerts directly through our mobile platform.</p>
           </Card>
        </div>
      </section>

      {/* 4. Login Section (Bottom) */}
      <section id="login-section" className="bg-white py-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-32 bg-gradient-to-b from-slate-200 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
           <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">System Entry</h2>
           <p className="text-slate-500 font-medium mt-4 max-w-lg mx-auto">Authorized medical personnel and administrators only. Secure encrypted session.</p>
        </div>

        <div className="max-w-lg mx-auto px-4">
           {!showLogin ? (
             <button 
                onClick={() => setShowLogin(true)}
                className="w-full bg-slate-900 hover:bg-black text-white p-8 rounded-[2.5rem] formal-border shadow-2xl transition-all duration-500 group relative overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex items-center justify-between">
                   <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Click to reveal</p>
                      <h3 className="text-2xl font-black tracking-tighter uppercase">Open Staff Portal</h3>
                   </div>
                   <div className="text-4xl">🔐</div>
                </div>
             </button>
           ) : (
             <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                <Login isLandingPart={true} />
                <div className="text-center">
                   <button 
                      onClick={() => setShowLogin(false)}
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-600 transition-colors"
                   >
                      ← Close Portal Access
                   </button>
                </div>
             </div>
           )}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 15s ease-in-out infinite;
        }
      `}} />
    </div>
  )
}
