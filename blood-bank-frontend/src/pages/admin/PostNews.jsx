import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import api from '../../services/api';

const LANG_LABELS = { en: 'English', am: 'Amharic', or: 'Oromoo' };
const LANG_FLAGS  = { en: '🇬🇧', am: '🇪🇹', or: '🇪🇹' };

export default function PostNews() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [language, setLanguage] = useState('en');
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterLang, setFilterLang] = useState('all');

    const fetchNews = async () => {
        try {
            const res = await api.get('/news');
            if (res.data.success) setNewsList(res.data.data);
        } catch (error) {
            console.error('Failed to fetch news', error);
        }
    };

    useEffect(() => { fetchNews(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content) return toast.error('Title and message are required');
        setLoading(true);
        try {
            const res = await api.post('/news', { title, content, imageUrl, language });
            if (res.data.success) {
                toast.success('Announcement posted!');
                setTitle(''); setContent(''); setImageUrl('');
                fetchNews();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            const res = await api.delete(`/news/${id}`);
            if (res.data.success) {
                toast.success('Announcement deleted');
                fetchNews();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            toast.info('Uploading image...');
            const res = await api.post('/news/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setImageUrl(res.data.imageUrl);
                toast.success('Image uploaded successfully');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload image');
        }
    };

    const filtered = filterLang === 'all' ? newsList : newsList.filter(n => n.language === filterLang);

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white text-xl">📢</div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Post News & Announcements</h1>
                    <p className="text-sm text-slate-500">Publish multilingual updates visible to all donors in the mobile app</p>
                </div>
            </div>

            {/* Quick Templates */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { 
                        icon: '🌊', 
                        label: 'Lake Tana Drive', 
                        title: 'Special Blood Drive at Lake Tana', 
                        content: 'Join us for a special blood donation event at the Lake Tana waterfront this Saturday! Help us save lives while enjoying the view. \n\nበዚህ ቅዳሜ በጣና ሐይቅ ዳርቻ ልዩ የደም ልገሳ መርሃ ግብር አዘጋጅተናል! እየተዝናኑ ህይወት ያድኑ።',
                        lang: 'am'
                    },
                    { 
                        icon: '🚨', 
                        label: 'Bahir Dar Emergency', 
                        title: 'Urgent: O- Negative Needed in Bahir Dar', 
                        content: 'Our Bahir Dar center is currently low on O-Negative blood. If you are O-Negative, please visit our main center immediately. \n\nበባህር ዳር ማዕከላችን የኦ-ኔጌቲቭ (O-) ደም እጥረት አጋጥሞናል። ደም አይነታችሁ ኦ-ኔጌቲቭ የሆናችሁ እባካችሁ አሁኑኑ ማዕከላችን በመምጣት ይለግሱ።',
                        lang: 'am'
                    },
                    { 
                        icon: '🏥', 
                        label: 'Main Center Update', 
                        title: 'Bahir Dar Center Extended Hours', 
                        content: 'The Bahir Dar Main Blood Bank will now remain open until 7:30 PM daily to serve our local heroes. \n\nየባህር ዳር ዋና የደም ባንክ የለጋሾችን ምቾት ለመጠበቅ በየቀኑ እስከ ምሽቱ 1፡30 ክፍት ሆኖ ይቆያል።',
                        lang: 'am'
                    },
                    { 
                        icon: '🙏', 
                        label: 'Hero Appreciation', 
                        title: 'Thank You Bahir Dar Donors!', 
                        content: 'Last week was incredible! We collected over 150 units in Bahir Dar. You are making a difference! \n\nባለፈው ሳምንት በባህር ዳር ከ150 ዩኒት በላይ ደም ተሰብስቧል። ለለጋሾቻችን ከልብ እናመሰግናለን!',
                        lang: 'am'
                    },
                ].map((t, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => { setTitle(t.title); setContent(t.content); setLanguage(t.lang || 'en'); toast.info(`${t.label} template applied`); }}
                        className="p-4 bg-white border border-slate-200 rounded-2xl text-center hover:border-brand-500 hover:shadow-md transition-all group"
                    >
                        <div className="text-2xl mb-2">{t.icon}</div>
                        <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1">{t.label}</p>
                        <p className="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors">Apply Template</p>
                    </button>
                ))}
            </div>

            {/* Compose Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-white font-black text-xl uppercase tracking-tight">Compose Announcement</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Design your community update</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white text-xl">✍️</div>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Announcement Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full rounded-2xl bg-slate-50 border-slate-200 px-6 py-4 text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-brand-100 transition-all"
                                placeholder="Headline of your news..."
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Target Language</label>
                            <select
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                className="w-full rounded-2xl bg-slate-50 border-slate-200 px-6 py-4 text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-brand-100 transition-all appearance-none"
                            >
                                <option value="en">🇬🇧 English</option>
                                <option value="am">🇪ቲ አማርኛ (Amharic)</option>
                                <option value="or">🇪ቲ Afaan Oromoo</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Announcement Media (Optional)</label>
                        <div className="flex flex-wrap gap-3 mb-4">
                            {[
                                { name: 'Blood bag', url: 'https://images.unsplash.com/photo-1615461066841-6116ecaaba3a?auto=format&fit=crop&q=80&w=400' },
                                { name: 'Hospital', url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400' },
                                { name: 'Donor', url: 'https://images.unsplash.com/photo-1536856789559-1cb49a9ec061?auto=format&fit=crop&q=80&w=400' },
                                { name: 'Helping hand', url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=400' },
                            ].map((img, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setImageUrl(img.url)}
                                    className={clsx(
                                        "w-20 h-20 rounded-2xl overflow-hidden border-4 transition-all hover:scale-105 active:scale-95",
                                        imageUrl === img.url ? "border-brand-500 ring-4 ring-brand-100" : "border-transparent"
                                    )}
                                >
                                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={e => setImageUrl(e.target.value)}
                                className="flex-1 rounded-2xl bg-slate-50 border-slate-200 px-6 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-100 transition-all"
                                placeholder="Or paste a custom image URL here (optional)..."
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById('image-upload').click()}
                                className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-brand-500 hover:text-brand-600 transition-all"
                            >
                                <span className="text-xl">+</span>
                                <span className="text-[8px] font-black uppercase text-center leading-tight mt-1">Upload File</span>
                            </button>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleUpload}
                            />
                            {imageUrl && (
                                <button
                                    type="button"
                                    onClick={() => setImageUrl('')}
                                    className="px-4 py-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold transition-all"
                                >
                                    Clear Image
                                </button>
                            )}
                        </div>
                        
                        {imageUrl && (
                            <div className="mt-4 relative rounded-2xl overflow-hidden border border-slate-100 group max-w-sm">
                                <img src={imageUrl} alt="preview" className="w-full h-32 object-cover" />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Message Content</label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            rows={5}
                            className="w-full rounded-2xl bg-slate-50 border-slate-200 px-6 py-6 text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-brand-100 transition-all resize-none"
                            placeholder="Tell your story or share the update..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-2xl shadow-brand-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <><span className="animate-spin text-xl">⏳</span> Publishing...</>
                        ) : (
                            <><span>🚀</span> Post to Mobile App</>
                        )}
                    </button>
                </div>
            </form>

            {/* Published News */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Published Announcements</h2>
                    <div className="flex gap-2">
                        {['all', 'en', 'am', 'or'].map(l => (
                            <button
                                key={l}
                                onClick={() => setFilterLang(l)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${filterLang === l ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {l === 'all' ? 'All' : `${LANG_FLAGS[l]} ${LANG_LABELS[l]}`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {filtered.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                            <div className="text-4xl mb-3">📭</div>
                            <p className="font-medium">No announcements yet</p>
                        </div>
                    )}
                    {filtered.map(news => (
                        <div key={news.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm transition-all duration-200">
                            {news.imageUrl && (
                                <img src={news.imageUrl} alt={news.title} className="w-24 h-24 object-cover rounded-xl shrink-0 shadow-sm" />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-bold text-slate-800 truncate">{news.title}</h3>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                                            {LANG_FLAGS[news.language]} {LANG_LABELS[news.language] || 'English'}
                                        </span>
                                        <button 
                                            onClick={() => handleDelete(news.id)}
                                            className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                                            title="Delete announcement"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{news.content}</p>
                                
                                {/* Social Media Share Buttons */}
                                <div className="mt-3 flex items-center gap-3 pt-3 border-t border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share on:</span>
                                    <a 
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/news/' + news.id)}&quote=${encodeURIComponent(news.title)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                                        title="Share on Facebook"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    </a>
                                    <a 
                                        href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin + '/news/' + news.id)}&text=${encodeURIComponent(news.title + '\n\n' + news.content)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-all"
                                        title="Share on Telegram"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.303.48-.43-.01-1.258-.245-1.873-.445-.754-.245-1.354-.374-1.302-.79.027-.216.325-.437.893-.663 3.508-1.527 5.845-2.534 7.014-3.02 3.334-1.386 4.03-1.627 4.482-1.635z"/></svg>
                                    </a>
                                    <a 
                                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(news.title + ': ' + window.location.origin + '/news/' + news.id)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all"
                                        title="Share on WhatsApp"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                    </a>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-2">{new Date(news.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
