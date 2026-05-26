import React from 'react'

const appFeatures = [
  {
    icon: '📱',
    title: 'Easy Registration',
    titleAm: 'ቀላል ምዝገባ',
    desc: 'Register as a donor in seconds from your phone.',
  },
  {
    icon: '🔔',
    title: 'Emergency Alerts',
    titleAm: 'የአደጋ ጊዜ ማንቂያ',
    desc: 'Get notified instantly when your blood type is urgently needed.',
  },
  {
    icon: '📊',
    title: 'Donation History',
    titleAm: 'የልገሳ ታሪክ',
    desc: 'Track all your donations, certificates, and hero points.',
  },
  {
    icon: '🗺️',
    title: 'Find Nearby Centers',
    titleAm: 'አቅራቢያ ያሉ ማዕከላትን ያግኙ',
    desc: 'Locate the closest blood bank or donation camp near you.',
  },
]

export default function DonorCTA() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-32">
      {/* Animated background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* Top badge */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400">
              Download Our Mobile App • የሞባይል መተግበሪያችንን ያውርዱ
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
            Donate Blood.<br />
            <span className="text-rose-500">Use the App.</span>
          </h2>
          <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto font-medium">
            All donor services — registration, emergency alerts, donation history, and more — are available exclusively through our mobile app.
          </p>
          <p className="text-slate-500 mt-2 text-sm font-medium italic">
            ሁሉም የለጋሽ አገልግሎቶች — ምዝገባ፣ የአደጋ ጊዜ ማንቂያዎች፣ የልገሳ ታሪክ እና ሌሎችም — በሞባይል መተግበሪያችን ብቻ ይገኛሉ።
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {appFeatures.map((f) => (
            <div
              key={f.title}
              className="relative overflow-hidden rounded-[2rem] bg-white/5 border border-white/10 p-8 group hover:-translate-y-2 hover:bg-white/10 transition-all duration-500"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="text-lg font-black text-white tracking-tight mb-1">{f.title}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-3">{f.titleAm}</p>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Blood type compatibility banner */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 mb-16">
          <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">
            All Blood Types Needed • ሁሉም የደም ዓይነቶች ያስፈልጋሉ
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map((type) => (
              <div
                key={type}
                className={`px-5 py-3 rounded-xl font-black text-sm border transition-all hover:scale-105 ${
                  type === 'O−'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/50'
                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                }`}
              >
                {type}
                {type === 'O−' && <span className="ml-1 text-[8px] font-black opacity-70 uppercase">Universal</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Primary CTA — Download App */}
        <div className="text-center space-y-8">
          <div className="space-y-2">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
              Ready to become a hero? • ጀግና ለመሆን ዝግጁ ናቸው?
            </p>
            <h3 className="text-3xl font-black text-white tracking-tight">
              Download the Donor App Today
            </h3>
            <p className="text-slate-400 text-sm">ዛሬ የለጋሽ መተግበሪያውን ያውርዱ</p>
          </div>

          {/* App Store Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              href="#"
              className="group inline-flex items-center gap-4 bg-white hover:bg-slate-100 text-slate-900 px-10 py-5 rounded-2xl text-sm font-black shadow-2xl shadow-white/10 transition-all duration-300 active:scale-95"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">🤖</span>
              <div className="text-left">
                <span className="block text-[9px] text-slate-400 uppercase tracking-widest">Get it on</span>
                <span className="block text-lg font-black leading-tight tracking-tight">Google Play</span>
              </div>
            </a>
            <a
              href="#"
              className="group inline-flex items-center gap-4 bg-white hover:bg-slate-100 text-slate-900 px-10 py-5 rounded-2xl text-sm font-black shadow-2xl shadow-white/10 transition-all duration-300 active:scale-95"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">🍎</span>
              <div className="text-left">
                <span className="block text-[9px] text-slate-400 uppercase tracking-widest">Download on</span>
                <span className="block text-lg font-black leading-tight tracking-tight">App Store</span>
              </div>
            </a>
          </div>

          {/* Sub-links */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            <button
              onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              ✦ Staff Login
            </button>
          </div>
        </div>

        {/* Emergency contact strip */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-6 p-6 bg-rose-950/50 border border-rose-900/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">🚨</span>
            <div>
              <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Emergency Hotline • የአደጋ ጊዜ ስልክ</p>
              <p className="text-white font-black text-lg">+251 58 220 1234</p>
            </div>
          </div>
          <div className="hidden md:block w-[1px] h-12 bg-rose-900" />
          <p className="text-rose-300 text-xs font-medium text-center">
            Available 24/7 for emergency blood requests<br />
            <span className="text-rose-500">ለአስቸኳይ ደም ጥያቄዎች 24/7 ይደርሳሉ</span>
          </p>
        </div>
      </div>
    </section>
  )
}
