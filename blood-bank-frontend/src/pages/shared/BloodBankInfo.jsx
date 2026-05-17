import React from 'react'
import { Card } from '../../components/ui/Card'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

export default function BloodBankInfo() {
  const { data, isLoading } = useQuery({
    queryKey: ['system', 'info'],
    queryFn: async () => {
      // In a real app, this might fetch from a 'settings' or 'organization' endpoint
      // For now, we'll provide a high-quality template
      return {
        name: "Bahir Dar District Blood Bank",
        mission: "በባህር ዳር እና አካባቢው ለሚገኙ ታካሚዎች አስተማማኝ እና ጥራት ያለው ደም በፈቃደኝነት በሚሰጥ ልገሳ እና በዘመናዊ የደም ዝግጅት ሂደት ማቅረብ። / To provide a safe and reliable supply of blood to patients in Bahir Dar and surrounding areas.",
        address: "Hospital Road, Near Felege Hiwot Hospital, Bahir Dar",
        phone: "+251 58 220 1234",
        email: "bahirdar.bloodbank@health.gov.et",
        hours: [
          { day: "ሰኞ - አርብ (Mon - Fri)", time: "8:00 AM - 6:30 PM" },
          { day: "ቅዳሜ (Sat)", time: "9:00 AM - 4:00 PM" },
          { day: "እሁድ (Sun)", time: "ለአስቸኳይ ብቻ (Emergency Only)" }
        ],
        services: [
          "ሙሉ ደም ልገሳ (Whole Blood Donation)",
          "የፕሌትሌት ልገሳ (Platelet Apheresis)",
          "የፕላዝማ ክምችት (Plasma Collection)",
          "የደም አይነት ምርመራ (Blood Typing & Screening)",
          "የአደጋ ጊዜ ደም አቅርቦት (Emergency Blood Supply)"
        ]
      }
    }
  })

  if (isLoading) return <div className="p-10 text-center animate-pulse font-black text-slate-400 uppercase tracking-widest">Loading Center Profile...</div>

  const info = data

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-6 duration-1000">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/20 rounded-full -mr-48 -mt-48 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/10 rounded-full -ml-36 -mb-36 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl rotate-3">
             <span className="text-6xl">🩸</span>
          </div>
          <div>
            <span className="px-4 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-red-300">Certified Institution</span>
            <h1 className="text-5xl font-black tracking-tighter mt-4">{info.name}</h1>
            <p className="text-slate-400 mt-4 max-w-2xl text-xl font-medium leading-relaxed italic">
              "{info.mission}"
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact Information */}
        <Card className="lg:col-span-2 rounded-[2rem] border-none shadow-xl ring-1 ring-slate-100 p-10 bg-white">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 border-b border-slate-100 pb-4">Our Facility Information</h3>
          
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-2xl">📍</div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Physical Location</p>
                  <p className="font-bold text-slate-800 mt-1">{info.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-2xl">📞</div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct Contact</p>
                  <p className="font-bold text-slate-800 mt-1">{info.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-2xl">✉️</div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Email</p>
                  <p className="font-bold text-slate-800 mt-1">{info.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
               <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest mb-6">Operating Schedule</h4>
               <div className="space-y-4">
                 {info.hours.map((h, i) => (
                   <div key={i} className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                     <span className="text-sm font-bold text-slate-500">{h.day}</span>
                     <span className="text-sm font-black text-slate-800">{h.time}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </Card>

        {/* Specialized Services */}
        <Card className="rounded-[2rem] border-none shadow-xl ring-1 ring-slate-100 p-10 bg-indigo-600 text-white">
          <h3 className="text-sm font-black uppercase tracking-widest mb-8 opacity-80 border-b border-white/20 pb-4">Our Services</h3>
          <ul className="space-y-6">
            {info.services.map((s, i) => (
              <li key={i} className="flex items-center gap-4">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="font-bold text-lg tracking-tight">{s}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-12 p-6 bg-white/10 rounded-2xl border border-white/20">
             <p className="text-xs font-medium italic leading-relaxed">
               Every drop counts. We are committed to maintaining the highest standards of safety and care for our donors and recipients.
             </p>
          </div>
        </Card>
      </div>

      {/* Safety Section */}
      <div className="bg-emerald-50 rounded-[2.5rem] p-10 border border-emerald-100 flex flex-col md:flex-row items-center gap-8">
         <div className="text-5xl">🛡️</div>
         <div>
            <h2 className="text-xl font-black text-emerald-900 uppercase tracking-tighter">Safety & Quality Assurance</h2>
            <p className="text-emerald-700 font-medium mt-1 leading-relaxed">
               All blood units undergo rigorous screening for infectious diseases and are processed in a sterile, temperature-controlled environment following international WHO guidelines.
            </p>
         </div>
      </div>
    </div>
  )
}
