import React from 'react'
import About from './About'
import Login from '../auth/Login'

import BloodBankTemplate from '../../components/BloodBankTemplate'
import DonorCTA from '../../components/DonorCTA'

export default function Landing() {
  const [showLogin, setShowLogin] = React.useState(false)


  return (
    <div className="flex flex-col bg-white">

      {/* ═══════════════════════════════════════════════ */}
      {/* 0. Life-Saving Quote Banner — ABOVE the heading */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 py-4 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-white font-medium text-sm md:text-base leading-relaxed">
            <span className="font-black text-rose-200">❝</span>
            {' '}The blood you donate gives someone another chance at life.{' '}
            <span className="text-rose-200 font-bold">One day that someone may be a close relative, a friend, or maybe even you.</span>
            <span className="font-black text-rose-200">❞</span>
          </p>
          <p className="text-rose-200 text-xs mt-1 font-bold tracking-widest uppercase">
            ❤️ &nbsp;
            <span className="font-black text-white">አንድ ጠብታ ደም ሦስት ህይወቶችን ሊያድን ይችላል</span>
            &nbsp;•&nbsp;
            Dhiigi qabdu lubbuu sadii ol-baasuu danda'a
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* 1. Ultra-Premium Hero Section           */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-900">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/bahirdar_blood_bank_hero_1777980007216.png"
            className="w-full h-full object-cover opacity-40 scale-105"
            style={{ animation: 'pulse-slow 15s ease-in-out infinite' }}
            alt="Bahir Dar Blood Bank"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full py-20">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand-600/10 border border-brand-500/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-400">
                Regional Life-Saving Center • የቀጠናዊ ህይወት አድን ማዕከል
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
              Every Drop <br />
              <span className="text-brand-500">Saves Lives.</span>
            </h1>

            <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-xl">
              Bahir Dar District Blood Bank — Leveraging cutting-edge technology and a dedicated community to ensure safe blood supply across the Amhara region.
            </p>
            <p className="text-slate-400 text-sm font-medium italic">
              ባህር ዳር አውራጃ የደም ባንክ — ለአማራ ክልል ደህንነቱ የተጠበቀ ደም አቅርቦት ዘመናዊ ቴክኖሎጂን ተጠቅሞ ያቀርባል።
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-brand-600 hover:bg-brand-700 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-brand-500/40 transition-all active:scale-95"
              >
                Explore Services →
              </button>
              <button
                onClick={() => {
                  setShowLogin(true)
                  setTimeout(() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
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

        <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] animate-pulse" />
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* 2. About Section                        */}
      {/* ═══════════════════════════════════════ */}
      <section id="about-section" className="relative z-20 -mt-20 bg-white rounded-t-[4rem] shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.1)] py-20">
        <About isLandingPart={true} />
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* 3. Service Cards                        */}
      {/* ═══════════════════════════════════════ */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="p-10 bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 group border border-slate-100">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:rotate-6 transition-transform">🚑</div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Regional Logistics</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">አካባቢያዊ ሎጂስቲክስ</p>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">Synchronized dispatch network serving over 50 hospitals across the Amhara region with real-time tracking.</p>
          </div>
          <div className="p-10 bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 group border border-slate-100">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:rotate-6 transition-transform">🔬</div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Precision Screening</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">ፈጣን ምርመራ</p>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">Every donation undergoes rigorous molecular testing to ensure the highest standards of safety for recipients.</p>
          </div>
          <div className="p-10 bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 group border border-slate-100">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:rotate-6 transition-transform">📱</div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Donor Mobile App</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">የለጋሽ ሞባይል መተግበሪያ</p>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">Register, track your donation history, earn hero points, and receive emergency alerts — all through our dedicated mobile app.</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 4. Blood Bank Template (EN / አማርኛ) — NEW SECTION   */}
      {/* ═══════════════════════════════════════════════════ */}
      <BloodBankTemplate />

      {/* ═══════════════════════════════════════ */}
      {/* 5. Staff Login Section                  */}
      {/* ═══════════════════════════════════════ */}
      <section id="login-section" className="bg-white py-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-32 bg-gradient-to-b from-slate-200 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">System Entry</h2>
          <p className="text-slate-500 font-medium mt-2">የሰራተኞች መግቢያ — Staff Portal</p>
          <p className="text-slate-400 font-medium mt-2 max-w-lg mx-auto">Authorized medical personnel and administrators only. Secure encrypted session.</p>
        </div>

        <div className="max-w-lg mx-auto px-4">
          {!showLogin ? (
            <button
              onClick={() => setShowLogin(true)}
              className="w-full bg-slate-900 hover:bg-black text-white p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Click to reveal</p>
                  <h3 className="text-2xl font-black tracking-tighter uppercase">Open Staff Portal</h3>
                  <p className="text-slate-500 text-xs mt-1">ሰራተኞች ፖርታል ይክፈቱ</p>
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

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 6. "Give Blood — Save a Life" — EN / አማርኛ / Afaan Oromoo + CTA */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <DonorCTA />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
        }
      `}} />
    </div>
  )
}
