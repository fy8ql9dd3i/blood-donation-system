import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../services/api';

const TEMPLATES = [
  {
    label: '🩸 Urgent Blood Drive',
    color: 'from-red-50 to-rose-50 border-red-200 hover:border-red-500',
    iconBg: 'bg-red-100',
    icon: '🚨',
    title: 'Critical Blood Shortage — We Need You!',
    message: 'Bahir Dar Blood Bank is experiencing a critical shortage of blood. If you are eligible to donate, please visit us today. Your single donation can save up to 3 lives. Thank you for being a hero! 🙏'
  },
  {
    label: '💌 Appreciation Message',
    color: 'from-emerald-50 to-teal-50 border-emerald-200 hover:border-emerald-500',
    iconBg: 'bg-emerald-100',
    icon: '💝',
    title: 'Thank You, Blood Heroes! 💝',
    message: 'From all of us at Bahir Dar Blood Bank — THANK YOU! Your generosity has saved countless lives. Because of your kindness, families have their loved ones home with them. You are true heroes!'
  },
  {
    label: '📢 Registration Drive',
    color: 'from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-500',
    iconBg: 'bg-blue-100',
    icon: '📣',
    title: 'Invite Friends — Help Save Lives!',
    message: 'Help us grow our community! Invite your friends and family to register as blood donors. Every new donor brings us closer to saving more lives in the Amhara region. Share the link below!'
  },
  {
    label: '✅ Status Update',
    color: 'from-amber-50 to-yellow-50 border-amber-200 hover:border-amber-500',
    iconBg: 'bg-amber-100',
    icon: '📋',
    title: 'Donor Profile Updates In Progress',
    message: 'Our medical team is currently reviewing new donor registrations. Please check your app for eligibility updates. Thank you for your patience and dedication to saving lives!'
  },
  {
    label: '🎉 Event Announcement',
    color: 'from-purple-50 to-violet-50 border-purple-200 hover:border-purple-500',
    iconBg: 'bg-purple-100',
    icon: '🎉',
    title: 'Blood Donation Day — Join Us!',
    message: 'You are invited to our Blood Donation Day event at Bahir Dar Blood Bank! Come donate, receive refreshments, and celebrate with fellow heroes. Together we can make a difference!'
  },
  {
    label: '⏰ Eligibility Reminder',
    color: 'from-orange-50 to-amber-50 border-orange-200 hover:border-orange-500',
    iconBg: 'bg-orange-100',
    icon: '⏰',
    title: 'You May Be Ready to Donate Again!',
    message: 'Hello! It has been a while since your last donation. If 90 days have passed, you are likely eligible to donate again. Open your app to check your status and book a visit today!'
  },
];

export default function BroadcastAll() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Fetch total registered donors for live count
  const { data: donorsData } = useQuery({
    queryKey: ['donors', 'count'],
    queryFn: async () => {
      const { data } = await api.get('/donors');
      return data;
    },
    retry: false,
  });
  const donorCount = Array.isArray(donorsData?.data) ? donorsData.data.length
    : Array.isArray(donorsData) ? donorsData.length : null;

  const applyTemplate = (t) => {
    setTitle(t.title);
    setMessage(t.message);
    setResult(null);
    toast.info(`Template "${t.label}" applied ✔`);
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return toast.error('Title and message are required');

    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/notifications/broadcast-all', { title, message });
      if (res.data.success) {
        const count = res.data.data?.donorCount ?? 0;
        setResult({ count, title, message });
        toast.success(`🚀 Broadcast sent to ${count} donors!`);
        setTitle('');
        setMessage('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to broadcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white text-2xl shadow-xl shadow-red-200">
            🔔
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Global Broadcast</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Send push notifications to all registered donors
            </p>
          </div>
        </div>
        {donorCount !== null && (
          <div className="text-center px-6 py-3 bg-red-50 rounded-2xl ring-1 ring-red-100">
            <p className="text-3xl font-black text-red-700">{donorCount}</p>
            <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Registered Donors</p>
          </div>
        )}
      </div>

      {/* ── Warning Banner ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
        <span className="text-2xl shrink-0">⚠️</span>
        <div>
          <p className="font-bold text-amber-800 text-sm">This sends to ALL {donorCount ?? '...'} registered donors</p>
          <p className="text-amber-700 text-xs mt-1 leading-relaxed">
            Every donor who has the app installed will receive a push notification and an in-app message. Use responsibly for important announcements only.
          </p>
        </div>
      </div>

      {/* ── Quick Templates ── */}
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Templates</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TEMPLATES.map((t, idx) => (
            <button
              key={idx}
              onClick={() => applyTemplate(t)}
              className={`p-4 bg-gradient-to-br border rounded-xl text-left hover:shadow-md transition-all group ${t.color}`}
            >
              <div className={`w-8 h-8 ${t.iconBg} rounded-lg flex items-center justify-center text-base mb-2`}>
                {t.icon}
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.label}</p>
              <p className="font-bold text-slate-800 text-xs leading-snug line-clamp-2">{t.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Compose Form ── */}
      <form onSubmit={handleBroadcast} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-4 flex items-center gap-3">
          <span className="text-xl">✍️</span>
          <h2 className="text-white font-bold text-base">Compose Broadcast Message</h2>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Notification Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="e.g. Urgent Blood Drive — We Need You!"
            />
            <p className="text-[10px] text-slate-400 mt-1">{title.length}/100</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Message *
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              maxLength={500}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all"
              placeholder="Write a clear, compelling message for your donors..."
            />
            <p className="text-[10px] text-slate-400 mt-1">{message.length}/500 characters</p>
          </div>

          {/* Live Preview */}
          {(title || message) && (
            <div className="bg-slate-900 rounded-2xl p-4 text-white">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3 flex items-center gap-2">
                <span>📱</span> Push Notification Preview
              </p>
              <div className="flex gap-3 items-start bg-slate-800 rounded-xl p-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-sm shrink-0">
                  🩸
                </div>
                <div>
                  <p className="font-bold text-sm">{title || 'Notification Title'}</p>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed line-clamp-3">
                    {message || 'Your message preview appears here.'}
                  </p>
                  <p className="text-slate-500 text-[10px] mt-1.5">Bahir Dar Blood Bank · now</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !title || !message}
            className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-200 active:scale-[0.99]"
          >
            {loading ? (
              <><span className="animate-spin">⏳</span> Sending to all donors...</>
            ) : (
              <><span>🚀</span> Send to {donorCount ?? 'All'} Donors</>
            )}
          </button>
        </div>
      </form>

      {/* ── Success Result ── */}
      {result && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-3">✅</div>
          <h3 className="text-xl font-black text-emerald-800">Broadcast Sent Successfully!</h3>
          <p className="text-emerald-600 mt-2">
            Your message is being delivered to{' '}
            <span className="font-black text-emerald-700">{result.count}</span> registered donors.
          </p>
          <div className="mt-4 bg-white rounded-xl p-4 text-left border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Message Sent</p>
            <p className="font-bold text-slate-800 text-sm">{result.title}</p>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{result.message}</p>
          </div>
          <button
            onClick={() => setResult(null)}
            className="mt-4 px-6 py-2 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-200 transition-colors"
          >
            Send Another
          </button>
        </div>
      )}
    </div>
  );
}
