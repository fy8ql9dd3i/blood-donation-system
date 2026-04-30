import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function BroadcastAll() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sentCount, setSentCount] = useState(null);

    const templates = [
        { 
            label: '📢 Registration Drive', 
            title: 'Invite New Donors! 🩸', 
            message: 'Help us grow our community. Invite your friends and family to register as donors today and save more lives together!' 
        },
        { 
            label: '✅ Approval Update', 
            title: 'Profile Reviews in Progress', 
            message: 'Our medical team is currently reviewing new donor registrations. Check your app status regularly for your eligibility update.' 
        },
        { 
            label: '🚨 Urgent Need', 
            title: 'Critical Blood Shortage!', 
            message: 'We are experiencing an urgent need for all blood types. If you are eligible to donate, please visit your nearest center today.' 
        }
    ];

    const applyTemplate = (t) => {
        setTitle(t.title);
        setMessage(t.message);
        toast.info(`${t.label} template applied`);
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!title || !message) return toast.error('Title and message are required');

        setLoading(true);
        setSentCount(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/notifications/broadcast-all',
                { title, message },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                // If it's a bulk operation, the count might be in the message or data
                const count = res.data.data?.length || res.data.count || 0;
                setSentCount(count);
                toast.success(`Notification broadcasted successfully!`);
                setTitle(''); setMessage('');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to broadcast');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white text-2xl shadow-xl shadow-red-200">🔔</div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Broadcast</h1>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Push Notifications to All Donors</p>
                    </div>
                </div>
            </div>

            {/* Quick Templates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((t, idx) => (
                    <button
                        key={idx}
                        onClick={() => applyTemplate(t)}
                        className="p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-red-500 hover:shadow-md transition-all group"
                    >
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">{t.label}</p>
                        <p className="font-bold text-slate-800 text-sm group-hover:text-red-700">{t.title}</p>
                    </button>
                ))}
            </div>

            {/* Info Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <span className="text-2xl shrink-0">⚠️</span>
                <div>
                    <p className="font-semibold text-amber-800 text-sm">This sends to ALL donors</p>
                    <p className="text-amber-700 text-sm mt-1">
                        This will deliver a push notification to every donor who has the app installed and notifications enabled.
                        Use this for important, urgent announcements only.
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleBroadcast} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                    <h2 className="text-white font-semibold text-lg">Compose Broadcast Message</h2>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notification Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="e.g. Urgent Blood Drive"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Message *</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={5}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            placeholder="Write the notification message here..."
                        />
                        <p className="text-xs text-slate-400 mt-1">{message.length} / 500 characters</p>
                    </div>

                    {/* Preview */}
                    {(title || message) && (
                        <div className="bg-slate-900 rounded-2xl p-4 text-white">
                            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-2">Push Notification Preview</p>
                            <div className="flex gap-3 items-start">
                                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-sm shrink-0">🩸</div>
                                <div>
                                    <p className="font-semibold text-sm">{title || 'Notification Title'}</p>
                                    <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">{message || 'Your message preview appears here.'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><span className="animate-spin">⏳</span> Sending...</>
                        ) : (
                            <><span>🚀</span> Send to All Donors</>
                        )}
                    </button>
                </div>
            </form>

            {/* Success result */}
            {sentCount !== null && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <h3 className="text-xl font-bold text-green-800">Broadcast Sent!</h3>
                    <p className="text-green-700 mt-1">
                        Successfully notified <span className="font-bold">{sentCount}</span> donors via Firebase push notification.
                    </p>
                </div>
            )}
        </div>
    );
}
