import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Card } from '../../components/ui/Card'
import api from '../../services/api'
import clsx from 'clsx'
import { io } from 'socket.io-client'

// 🌐 Translation Dictionary
const translations = {
  en: {
    title: "Emergency Sentinel",
    subtitle: "Blood Bank Donor Broadcast",
    liveResponse: "Live Emergency Response",
    createRequest: "Create Urgent Request",
    targetBlood: "Target Blood Group",
    selectHospital: "Select Hospital",
    selectHospitalPlaceholder: "-- Select Hospital --",
    targetRadius: "Target Radius (km)",
    detailedMessage: "Detailed Message",
    detailedMessagePlaceholder: "Urgent: Your blood type is needed at City Hospital...",
    sendAlert: "Send Nearby Emergency Alert",
    sendingAlert: "Sending Emergency Alert...",
    donorsPreview: "Nearby Donors Preview",
    loadingDonors: "Loading nearby donors...",
    noDonors: "No nearby donors match the selected hospital and blood type.",
    manualReminders: "Manual Reminders",
    manualRemindersDesc: "Triggers the system to search for all donors who have passed their 90-day waiting period and sends them a 'Ready to Donate' notification.",
    triggerReminders: "Trigger System-Wide Reminders",
    triggeringReminders: "Sending Reminders...",
    howItWorks: "How Broadcast works",
    step1: "Select the critical blood type in short supply and the hospital.",
    step2: "Filters all registered donors by blood type and proximity to the selected hospital.",
    step3: "Instant Firebase Push Notifications are sent.",
    governancePolicy: "Governance Policy",
    governanceDesc: "ONLY USE FOR CRITICAL SHORTAGES TO AVOID NOTIFICATION FATIGUE.",
    incomingRequests: "Active Hospital Emergencies",
    noIncomingRequests: "No active pending emergency requests from hospitals.",
    loadingRequests: "Loading active requests...",
    patient: "Patient",
    units: "Units Required",
    status: "Status",
    urgency: "Urgency",
    broadcastThis: "Use for Broadcast",
    confirmBroadcastTitle: "Confirm Broadcast",
    successAlertSent: "Emergency broadcast sent to all matching donors!",
    errorAlertSent: "Failed to send broadcast.",
    unauthorizedSend: "You do not have permission to send emergency alerts.",
    remindersSent: "Donation reminders sent to all eligible donors!",
    remindersFailed: "Failed to trigger manual reminders.",
    selectBloodWarn: "Please select a blood type",
    selectHospitalWarn: "Please select a hospital",
    noDonorsWarn: "No nearby donors found for selected hospital",
    activeRequestDetails: "Linked to Active Request"
  },
  am: {
    title: "አስቸኳይ መቆጣጠሪያ (Emergency Sentinel)",
    subtitle: "የደም ባንክ የለጋሾች ስርጭት",
    liveResponse: "ቀጥታ የአስቸኳይ ጊዜ ምላሽ",
    createRequest: "አስቸኳይ የደም ጥሪ ፍጠር",
    targetBlood: "የደም ዓይነት (Target Blood Group)",
    selectHospital: "ሆስፒታል ይምረጡ",
    selectHospitalPlaceholder: "-- ሆስፒታል ይምረጡ --",
    targetRadius: "የፍለጋ ራዲየስ (በኪሎሜትር)",
    detailedMessage: "ዝርዝር መልዕክት (Detailed Message)",
    detailedMessagePlaceholder: "አስቸኳይ፡ የእርስዎ የደም ዓይነት በከተማው ሆስፒታል ውስጥ ያስፈልጋል...",
    sendAlert: "አስቸኳይ መልዕክት ለለጋሾች ላክ",
    sendingAlert: "መልዕክት በመላክ ላይ...",
    donorsPreview: "በአቅራቢያ ያሉ ለጋሾች ቅድመ-እይታ",
    loadingDonors: "በአቅራቢያ ያሉ ለጋሾችን በመፈለግ ላይ...",
    noDonors: "ከተመረጠው ሆስፒታል እና የደም ዓይነት ጋር የሚዛመዱ ለጋሾች በአቅራቢያ አልተገኙም።",
    manualReminders: "እጅ አስታዋሾች (Manual Reminders)",
    manualRemindersDesc: "የ90 ቀናት የጥበቃ ጊዜያቸውን ያለፉ ለጋሾችን በሙሉ ፈልጎ 'ለመለገስ ዝግጁ' የሚል ማሳሰቢያ እንዲልክ ያደርጋል።",
    triggerReminders: "አጠቃላይ አስታዋሾችን ላክ",
    triggeringReminders: "አስታዋሾችን በመላክ ላይ...",
    howItWorks: "ስርጭቱ እንዴት እንደሚሰራ",
    step1: "በአስቸኳይ ሁኔታ ላይ ያለውን የደም ዓይነት እና ሆስፒታሉን ይምረጡ።",
    step2: "ሁሉንም የተመዘገቡ ለጋሾችን በደም ዓይነት እና በተመረጠው ሆስፒታል አቅራቢያ ያጣራል።",
    step3: "ፈጣን የሞባይል ፑሽ ማሳወቂያዎች (Firebase Push Notifications) ይላካሉ።",
    governancePolicy: "የአስተዳደር ፖሊሲ",
    governanceDesc: "የማሳወቂያ ሰልችቶታን ለማስወገድ በአስቸኳይ እጥረት ጊዜ ብቻ ይጠቀሙ።",
    incomingRequests: "የሆስፒታሎች አስቸኳይ የደም ጥያቄዎች",
    noIncomingRequests: "ከሆስፒታሎች ምንም አስቸኳይ የደም ጥያቄዎች የሉም።",
    loadingRequests: "የደም ጥያቄዎችን በመጫን ላይ...",
    patient: "ታካሚ",
    units: "ክፍል (Units)",
    status: "ሁኔታ",
    urgency: "አስቸኳይነት",
    broadcastThis: "ለጥሪው ተጠቀም",
    confirmBroadcastTitle: "የስርጭት ማረጋገጫ",
    successAlertSent: "የአስቸኳይ ጊዜ ስርጭት ለሁሉም ተዛማጅ ለጋሾች ተልኳል!",
    errorAlertSent: "ስርጭቱን መላክ አልተቻለም።",
    unauthorizedSend: "የአስቸኳይ ጊዜ መልዕክቶችን ለመላክ ፈቃድ የሉዎትም።",
    remindersSent: "የለጋሾች አስታዋሾች ለሁሉም ብቁ ለጋሾች ተልከዋል!",
    remindersFailed: "አጠቃላይ አስታዋሾችን መላክ አልተቻለም።",
    selectBloodWarn: "እባክዎ የደም ዓይነት ይምረጡ",
    selectHospitalWarn: "እባክዎ ሆስፒታል ይምረጡ",
    noDonorsWarn: "ከተመረጠው ሆስፒታል ጋር የሚስማማ የደም ለጋሽ በአቅራቢያ አልተገኘም",
    activeRequestDetails: "ከአክቲቭ ጥያቄ ጋር የተያያዘ"
  }
}

export default function EmergencyAlerts() {
   const [lang, setLang] = useState('en') // Bilingual Language state
   const [bloodType, setBloodType] = useState('O+')
   const [hospitalId, setHospitalId] = useState('')
   const [message, setMessage] = useState('Urgent: Blood donor needed at local facility.')
   const [hospitals, setHospitals] = useState([])
   const [nearbyDonors, setNearbyDonors] = useState([])
   const [loadingDonors, setLoadingDonors] = useState(false)
   const [radiusKm, setRadiusKm] = useState(50)
   const [incomingRequests, setIncomingRequests] = useState([])
   const [loadingRequests, setLoadingRequests] = useState(false)

   const t = translations[lang]

   // 1️⃣ Fetch hospitals on mount
   useEffect(() => {
      api.get('/hospitals/public-list')
         .then(res => setHospitals(res.data?.data || []))
         .catch(() => setHospitals([]))
   }, [])

   // 2️⃣ Fetch incoming requests on mount
   const fetchIncomingRequests = () => {
      setLoadingRequests(true)
      api.get('/requests')
         .then(res => {
            // Filter pending and emergency level requests
            const allReqs = res.data?.data || []
            const activeEmergencies = allReqs.filter(r => r.urgencyLevel === 'emergency' && r.status === 'pending')
            setIncomingRequests(activeEmergencies)
         })
         .catch(err => {
            console.error('Error fetching blood requests:', err)
            setIncomingRequests([])
         })
         .finally(() => setLoadingRequests(false))
   }

   useEffect(() => {
      fetchIncomingRequests()
   }, [])

   // 3️⃣ Real-time socket updates for incoming hospital emergencies
   useEffect(() => {
      const socket = io(`http://${window.location.hostname}:5000`)
      
      socket.on('emergency_blood_request', (data) => {
         // Update the incoming requests list in real time
         setIncomingRequests(prev => {
            if (prev.some(r => r.id === data.requestId)) return prev
            const newReq = {
               id: data.requestId,
               hospital: { name: data.hospitalName },
               bloodType: data.bloodType,
               unitsRequired: data.unitsRequired,
               urgencyLevel: data.urgencyLevel,
               patientName: data.patientName || "Emergency Patient",
               status: data.status || 'pending',
               createdAt: new Date().toISOString()
            }
            return [newReq, ...prev]
         })
         // Show notification to staff
         toast.error(`🚨 Real-time Emergency Request Received from ${data.hospitalName}!`)
      })

      return () => socket.disconnect()
   }, [])

   // 4️⃣ Fetch nearby donors when blood type or hospital changes
   useEffect(() => {
      if (bloodType && hospitalId) {
         setLoadingDonors(true)
         api.get(`/notifications/nearby-donors`, {
            params: { bloodType, hospitalId, radiusKm }
         })
            .then(res => setNearbyDonors(res.data?.data || []))
            .catch(err => {
               console.error('Error fetching nearby donors:', err)
               setNearbyDonors([])
            })
            .finally(() => setLoadingDonors(false))
      }
   }, [bloodType, hospitalId, radiusKm])

   const broadcastM = useMutation({
      mutationFn: (payload) => api.post('/notifications/broadcast-nearest', payload),
      onSuccess: (res) => {
         toast.success(res.data?.message || t.successAlertSent)
         setNearbyDonors([])
         fetchIncomingRequests() // Refresh list on success
      },
      onError: (err) => {
         console.error('Emergency Broadcast Error:', err)
         const msg = err?.response?.data?.message || err?.message || t.errorAlertSent
         toast.error(msg, { autoClose: 5000 })
         if (err?.response?.status === 403) toast.warning(t.unauthorizedSend)
      }
   })

   const reminderM = useMutation({
      mutationFn: () => api.post('/notifications/reminders'),
      onSuccess: (res) => {
         toast.info(res.data?.message || t.remindersSent)
      },
      onError: () => toast.error(t.remindersFailed)
   })

   const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

   const handleSend = () => {
      if (!bloodType) return toast.warning(t.selectBloodWarn)
      if (!hospitalId) return toast.warning(t.selectHospitalWarn)
      if (nearbyDonors.length === 0) return toast.warning(t.noDonorsWarn)
      broadcastM.mutate({
         bloodType,
         hospitalId,
         radiusKm,
         message: message || `Urgent: ${bloodType} blood needed near you. Can you donate?`
      })
   }

   // Quick load request into form
   const loadRequest = (req) => {
      setBloodType(req.bloodType)
      
      // Try to find the matching hospital in public-list
      const matched = hospitals.find(h => h.name === req.hospital?.name || h.hospitalId === req.hospitalId)
      if (matched) {
         setHospitalId(matched.hospitalId || matched.id)
      }
      
      const amMsg = `አስቸኳይ የደም ጥሪ፡ የደም አይነት ${req.bloodType} ለለጋሾች በ${req.hospital?.name || 'ሆስፒታል'} በአስቸኳይ ያስፈልጋል። እባክዎን ህይወት ያድኑ!`
      const enMsg = `Urgent Emergency Alert: Blood Type ${req.bloodType} is critically required at ${req.hospital?.name || 'hospital'}. Please donate to save a life!`
      
      setMessage(lang === 'am' ? amMsg : enMsg)
      toast.info(lang === 'am' ? `የ${req.hospital?.name || 'ሆስፒታል'} የደም ጥያቄ ዝርዝር በተሳካ ሁኔታ ተጭኗል!` : `Emergency details from ${req.hospital?.name || 'hospital'} loaded into form!`)
      
      // Smooth scroll to top form
      window.scrollTo({ top: 0, behavior: 'smooth' })
   }

   return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
         {/* Top Banner and Lang Toggle */}
         <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16" />
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.title}</h1>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">{t.subtitle}</p>
            </div>
            
            {/* Language & Live Indicator buttons */}
            <div className="flex flex-wrap items-center gap-3">
               <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  <button 
                     onClick={() => setLang('en')}
                     className={clsx("px-4 py-1.5 rounded-lg text-xs font-black transition-all", lang === 'en' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")}
                  >
                     EN
                  </button>
                  <button 
                     onClick={() => setLang('am')}
                     className={clsx("px-4 py-1.5 rounded-lg text-xs font-black transition-all", lang === 'am' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")}
                  >
                     አማርኛ
                  </button>
               </div>
               
               <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-rose-600 uppercase">{t.liveResponse}</span>
               </div>
            </div>
         </div>

         <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Columns - Form & Incoming Requests */}
            <div className="lg:col-span-2 space-y-8">
               <Card className="rounded-[2.5rem] border-none shadow-xl ring-1 ring-slate-100 p-8">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">{t.createRequest}</h3>
                  <div className="space-y-6">
                     <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase px-1">{t.targetBlood}</label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2">
                           {bloodTypes.map(t => (
                              <button
                                 key={t}
                                 onClick={() => setBloodType(t)}
                                 className={clsx(
                                    "py-3 rounded-xl text-xs font-black transition-all border-2",
                                    bloodType === t
                                       ? "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200 scale-105"
                                       : "bg-slate-50 border-slate-100 text-slate-600 hover:border-rose-200"
                                 )}
                              >
                                 {t}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                           <label className="text-[11px] font-black text-slate-500 uppercase px-1">{t.selectHospital}</label>
                           <select
                              className="w-full mt-2 bg-slate-50 border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-rose-100 transition-all cursor-pointer"
                              value={hospitalId}
                              onChange={e => setHospitalId(e.target.value)}
                           >
                              <option value="">{t.selectHospitalPlaceholder}</option>
                              {hospitals.map(h => (
                                 <option key={h.hospitalId || h.id} value={h.hospitalId || h.id}>
                                    {h.name} ({h.address})
                                 </option>
                              ))}
                           </select>
                        </div>
                        <div>
                           <label className="text-[11px] font-black text-slate-500 uppercase px-1">{t.targetRadius}</label>
                           <input
                              type="number"
                              min="1"
                              value={radiusKm}
                              onChange={e => setRadiusKm(Number(e.target.value))}
                              className="w-full mt-2 bg-slate-50 border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-rose-100 transition-all"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase px-1">{t.detailedMessage}</label>
                        <textarea
                           rows={4}
                           value={message}
                           onChange={e => setMessage(e.target.value)}
                           className="w-full mt-2 bg-slate-50 border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-rose-100 transition-all resize-none"
                           placeholder={t.detailedMessagePlaceholder}
                        />
                     </div>

                     <button
                        onClick={handleSend}
                        disabled={broadcastM.isPending}
                        className="w-full bg-slate-900 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-widest hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                     >
                        {broadcastM.isPending ? t.sendingAlert : t.sendAlert}
                     </button>
                  </div>
               </Card>

               {/* Real-time Incoming Hospital Requests Table */}
               <Card className="rounded-[2.5rem] border-none shadow-xl ring-1 ring-slate-100 p-8">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{t.incomingRequests}</h3>
                     <span className="bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full animate-pulse">
                        {incomingRequests.length} Active
                     </span>
                  </div>

                  <div className="space-y-4">
                     {loadingRequests ? (
                        <p className="text-sm text-slate-500 font-medium">{t.loadingRequests}</p>
                     ) : incomingRequests.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                           <p className="text-sm text-slate-500 font-bold">{t.noIncomingRequests}</p>
                        </div>
                     ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                           {incomingRequests.map(req => (
                              <div key={req.id} className="rounded-2xl border-2 border-rose-100 p-5 bg-rose-50/50 flex flex-col justify-between gap-4 transition-all hover:border-rose-300">
                                 <div>
                                    <div className="flex items-center justify-between mb-2">
                                       <span className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center font-black text-white text-sm shadow-md">
                                          {req.bloodType}
                                       </span>
                                       <span className="bg-rose-100 text-rose-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                                          {t.urgency}: {req.urgencyLevel}
                                       </span>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 line-clamp-1">{req.hospital?.name || "Hospital Request"}</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-1">{t.patient}: {req.patientName || "Emergency patient"}</p>
                                    <p className="text-xs text-slate-600 font-bold mt-2 bg-slate-100 py-1 px-3 rounded-lg inline-block">{t.units}: {req.unitsRequired}</p>
                                 </div>
                                 <button
                                    onClick={() => loadRequest(req)}
                                    className="w-full bg-rose-600 text-white rounded-xl py-2.5 text-[10px] font-black uppercase tracking-wider hover:bg-rose-700 shadow-md shadow-rose-100 transition-all active:scale-95"
                                 >
                                    🚀 {t.broadcastThis}
                                 </button>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </Card>
            </div>

            {/* Right Column - Nearby Donors & Instructions */}
            <div className="space-y-6">
               <Card className="rounded-[2.5rem] border-none shadow-xl ring-1 ring-slate-100 p-8">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">{t.donorsPreview}</h3>
                  <div className="space-y-4">
                     {loadingDonors ? (
                        <p className="text-sm text-slate-500">{t.loadingDonors}</p>
                     ) : nearbyDonors.length === 0 ? (
                        <p className="text-xs text-slate-400 font-bold bg-slate-50 py-6 px-4 rounded-2xl border-2 border-dashed border-slate-200 text-center">{t.noDonors}</p>
                     ) : (
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                           {nearbyDonors.map(donor => (
                              <div key={donor.donorID || donor.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                                 <div className="flex items-center justify-between gap-4">
                                    <div>
                                       <p className="text-xs font-black text-slate-900">{donor.name}</p>
                                       <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{donor.bloodType} • {donor.address}</p>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-1 rounded-md">{donor.distance} km</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </Card>

               <Card className="rounded-[2.5rem] bg-indigo-600 border-none shadow-xl p-8 text-white">
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">{t.manualReminders}</h4>
                  <p className="text-xs mt-2 opacity-90 leading-relaxed">
                     {t.manualRemindersDesc}
                  </p>
                  <button
                     onClick={() => reminderM.mutate()}
                     disabled={reminderM.isPending}
                     className="mt-6 w-full bg-white text-indigo-600 font-black uppercase text-[10px] py-4 rounded-2xl shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                  >
                     {reminderM.isPending ? t.triggeringReminders : t.triggerReminders}
                  </button>
               </Card>

               <Card className="rounded-[2.5rem] bg-slate-900 border-none shadow-xl p-8 text-white">
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">{t.howItWorks}</h4>
                  <ul className="mt-4 space-y-4 text-xs font-medium">
                     <li className="flex gap-3 text-slate-400 font-bold">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center font-black text-white">1</span>
                        {t.step1}
                     </li>
                     <li className="flex gap-3 text-slate-400 font-bold">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center font-black text-white">2</span>
                        {t.step2}
                     </li>
                     <li className="flex gap-3 text-slate-400 font-bold">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center font-black text-white">3</span>
                        {t.step3}
                     </li>
                  </ul>
               </Card>

               <div className="p-6 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-lg shadow-sm">⚠️</div>
                  <p className="text-[10px] font-black text-slate-800 uppercase mt-3">{t.governancePolicy}</p>
                  <p className="text-[9px] text-slate-500 font-black mt-1 uppercase leading-normal px-2">{t.governanceDesc}</p>
               </div>
            </div>
         </div>
      </div>
   )
}
