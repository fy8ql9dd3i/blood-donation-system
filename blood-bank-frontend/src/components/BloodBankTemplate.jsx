import React, { useState } from 'react'

const LANG = {
  en: {
    tag: 'Blood Bank Template',
    title: 'Bahir Dar District\nBlood Bank',
    subtitle: 'Your Regional Life-Saving Center',
    mission: 'To provide safe, quality, and sufficient blood and blood products to patients in Bahir Dar and the entire Amhara region through voluntary donation and modern processing.',
    certifiedLabel: 'WHO Certified Institution',
    ruleTitle: 'Donor Eligibility Rules',
    rules: [
      { icon: '🔞', text: 'Age 18–65 years old' },
      { icon: '⚖️', text: 'Weight at least 50 kg (110 lbs)' },
      { icon: '❤️', text: 'Good health — no fever, infection, or chronic illness' },
      { icon: '🩺', text: 'Hemoglobin ≥ 12.5 g/dL (Women) / 13.5 g/dL (Men)' },
      { icon: '⏳', text: 'At least 90 days since last donation' },
      { icon: '🚫', text: 'No high-risk behavior in past 12 months' },
      { icon: '💊', text: 'Not on certain medications (ask staff)' },
    ],
    lifeFacts: [
      { num: '1', fact: 'One donation can save up to 3 lives.' },
      { num: '2', fact: 'Blood cannot be manufactured — it can only come from donors like YOU.' },
      { num: '3', fact: 'Every 2 seconds, someone in Ethiopia needs blood.' },
      { num: '4', fact: 'Donation takes only 10 minutes. Your gift lasts forever.' },
      { num: '5', fact: 'Type O- blood is the universal donor — always in critical demand.' },
    ],
    servicesTitle: 'Our Services',
    services: [
      'Whole Blood Donation',
      'Platelet Apheresis',
      'Plasma Collection',
      'Blood Typing & Screening',
      'Emergency Blood Supply 24/7',
      'Donor Counseling & Support',
    ],
    hoursTitle: 'Operating Hours',
    hours: [
      { day: 'Mon – Fri', time: '8:00 AM – 6:30 PM' },
      { day: 'Saturday', time: '9:00 AM – 4:00 PM' },
      { day: 'Sunday', time: 'Emergency Only' },
    ],
    contactTitle: 'Contact',
    address: 'Hospital Road, Near Felege Hiwot Hospital, Bahir Dar',
    phone: '+251 58 220 1234',
    email: 'bahirdar.bloodbank@health.gov.et',
  },
  am: {
    tag: 'የደም ባንክ ቅጽ',
    title: 'ባህር ዳር አውራጃ\nየደም ባንክ',
    subtitle: 'የቀጠናዊ ህይወት አድን ማዕከልዎ',
    mission: 'በባህር ዳር እና በአጠቃላይ የአማራ ክልል ለሚገኙ ታካሚዎች ፈቃደኝነት ባለው ልገሳ እና ዘመናዊ ሂደቶች አስተማማኝ፣ ጥራት ያለው እና በቂ ደም እና ደም ዝግጅቶችን ለማቅረብ።',
    certifiedLabel: 'WHO የተረጋገጠ ተቋም',
    ruleTitle: 'የለጋሽ ብቁነት ህጎች',
    rules: [
      { icon: '🔞', text: 'ዕድሜ 18–65 ዓመት' },
      { icon: '⚖️', text: 'ክብደት ቢያንስ 50 ኪ.ግ' },
      { icon: '❤️', text: 'ጥሩ ጤና — ምንም ትኩሳት፣ ኢንፌክሽን ወይም ሥር የሰደደ ሕመም የለም' },
      { icon: '🩺', text: 'ሄሞግሎቢን ≥ 12.5 g/dL (ሴቶች) / 13.5 g/dL (ወንዶች)' },
      { icon: '⏳', text: 'ከመጨረሻው ልገሳ ቢያንስ 90 ቀናት' },
      { icon: '🚫', text: 'ባለፉት 12 ወራት ከፍተኛ አደጋ ያለው ባህሪ የለም' },
      { icon: '💊', text: 'በተወሰኑ መድሃኒቶች ላይ አይደለም (ሰራተኞቹን ይጠይቁ)' },
    ],
    lifeFacts: [
      { num: '፩', fact: 'አንድ ልገሳ እስከ 3 ህይወቶችን ማዳን ይችላል።' },
      { num: '፪', fact: 'ደም ሊሰራ አይችልም — ብቸኛ ምንጩ እርስዎ ያሉ ለጋሾች ናቸው።' },
      { num: '፫', fact: 'ኢትዮጵያ ውስጥ በየ2 ሰከንዱ አንድ ሰው ደም ያስፈልጋቸዋል።' },
      { num: '፬', fact: 'ልገሳ ወደ 10 ደቂቃ ብቻ ይወስዳል። ስጦታዎ ለዘለዓለም ይቆያል።' },
      { num: '፭', fact: 'O- ዓይነት ደም ሁለንተናዊ ለጋሽ ነው — ሁልጊዜ ወሳኝ ፍላጎት አለው።' },
    ],
    servicesTitle: 'አገልግሎቶቻችን',
    services: [
      'ሙሉ ደም ልገሳ',
      'የፕሌትሌት አፌሬሲስ',
      'የፕላዝማ ክምችት',
      'የደም ዓይነት ምርመራ',
      'የአደጋ ጊዜ ደም አቅርቦት 24/7',
      'የለጋሽ ምክር እና ድጋፍ',
    ],
    hoursTitle: 'የስራ ሰዓቶች',
    hours: [
      { day: 'ሰኞ – አርብ', time: '8:00 - 6:30 (EAT)' },
      { day: 'ቅዳሜ', time: '9:00 - 4:00 (EAT)' },
      { day: 'እሁድ', time: 'ለአስቸኳይ ብቻ' },
    ],
    contactTitle: 'አድራሻ',
    address: 'ሆስፒታል መንገድ፣ ፌሌጌ ሂወት ሆስፒታል አካባቢ፣ ባህር ዳር',
    phone: '+251 58 220 1234',
    email: 'bahirdar.bloodbank@health.gov.et',
  }
}

export default function BloodBankTemplate() {
  const [lang, setLang] = useState('en')
  const t = LANG[lang]

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-100/40 rounded-full blur-[120px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/40 rounded-full blur-[100px] -ml-32 -mb-32" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-rose-50 border border-rose-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">
              {lang === 'en' ? 'Official Blood Bank Profile' : 'ኦፊሴላዊ የደም ባንክ መረጃ'}
            </span>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[['en', 'English'], ['am', 'አማርኛ']].map(([code, label]) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  lang === code
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <h2 className="text-5xl font-black text-slate-900 tracking-tighter whitespace-pre-line leading-tight">
            {t.title}
          </h2>
          <p className="text-brand-600 font-black uppercase tracking-widest mt-2 text-sm">{t.subtitle}</p>
          <div className="inline-block mt-4 px-4 py-1 bg-emerald-100 border border-emerald-200 rounded-full">
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">✓ {t.certifiedLabel}</span>
          </div>
        </div>

        {/* Mission banner */}
        <div className="bg-slate-900 rounded-[2.5rem] p-10 mb-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />
          <p className="relative z-10 text-white text-xl font-medium leading-relaxed italic text-center max-w-4xl mx-auto">
            ❝ {t.mission} ❞
          </p>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Services */}
          <div className="bg-rose-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-rose-200">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-8 border-b border-white/20 pb-4">
              {t.servicesTitle}
            </h3>
            <ul className="space-y-5">
              {t.services.map((s, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-white/60 flex-shrink-0" />
                  <span className="font-bold text-sm leading-tight">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours + Contact */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl ring-1 ring-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">{t.hoursTitle}</h3>
              <div className="space-y-3">
                {t.hours.map((h, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <span className="font-bold text-slate-600">{h.day}</span>
                    <span className="font-black text-slate-900 text-sm">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl ring-1 ring-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">{t.contactTitle}</h3>
              <div className="space-y-4">
                {[
                  { icon: '📍', val: t.address },
                  { icon: '📞', val: t.phone },
                  { icon: '✉️', val: t.email },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">{c.icon}</div>
                    <p className="text-slate-700 font-medium text-sm leading-relaxed pt-2">{c.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Donor Eligibility Rules */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl ring-1 ring-slate-100 mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">📋</div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t.ruleTitle}</h3>
              <p className="text-slate-500 text-sm">{lang === 'en' ? 'Requirements to donate blood safely' : 'ደም ደህንነቱ ለማስጠበቅ የሚያስፈልጉ መስፈርቶች'}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {t.rules.map((r, i) => (
              <div key={i} className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-2xl">{r.icon}</span>
                <p className="text-slate-700 font-medium text-sm leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Life-saving facts */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 text-white shadow-2xl">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 text-center">
            {lang === 'en' ? '🩸 Life-Saving Facts' : '🩸 ህይወት ቀይሮ የሚያሳዩ እውነታዎች'}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.lifeFacts.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className="text-4xl font-black text-rose-400 mb-3">{f.num}</div>
                <p className="text-slate-300 font-medium text-sm leading-relaxed">{f.fact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
