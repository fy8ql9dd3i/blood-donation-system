import { useState, useEffect } from 'react';
import axios from 'axios';
import clsx from 'clsx';

export default function NewsWidget() {
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/news');
                if (res.data.success) {
                    setNewsList(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch news', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading) return (
        <div className="p-12 text-center bg-white rounded-[2.5rem] border border-slate-200 animate-pulse">
            <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto mb-4" />
            <div className="h-4 w-48 bg-slate-100 rounded mx-auto" />
        </div>
    );

    if (newsList.length === 0) return null;

    const currentNews = newsList[currentIndex];

    return (
        <div className="relative group overflow-hidden bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-10 animate-in slide-in-from-bottom-8 duration-1000">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50 rounded-full -mr-48 -mt-48 blur-[80px] opacity-50" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                {/* Image Section */}
                <div className="w-full lg:w-1/3 aspect-video lg:aspect-square relative group/img cursor-pointer">
                    <div className="absolute inset-0 bg-brand-600 rounded-[2rem] rotate-3 opacity-10 group-hover/img:rotate-0 transition-transform duration-500" />
                    <img 
                        src={currentNews.imageUrl || 'https://images.unsplash.com/photo-1615461066841-6116ecaaba3a?auto=format&fit=crop&q=80&w=600'} 
                        alt={currentNews.title} 
                        className="relative z-10 w-full h-full object-cover rounded-[2rem] shadow-2xl -rotate-2 group-hover/img:rotate-0 transition-transform duration-500" 
                    />
                </div>

                {/* Content Section */}
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-red-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">Announcement</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Published: {new Date(currentNews.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">
                        {currentNews.title}
                    </h2>
                    
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        {currentNews.content.length > 250 
                            ? `${currentNews.content.substring(0, 250)}...` 
                            : currentNews.content}
                    </p>

                    <div className="flex items-center gap-6 pt-4">
                        <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95">
                           Read Full Details
                        </button>
                        
                        {/* Navigation Dots */}
                        <div className="flex gap-2">
                            {newsList.map((_, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={clsx(
                                        "h-2 rounded-full transition-all duration-300",
                                        currentIndex === idx ? "w-8 bg-brand-600" : "w-2 bg-slate-200 hover:bg-slate-300"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            {newsList.length > 1 && (
                <>
                    <button 
                        onClick={() => setCurrentIndex(prev => (prev === 0 ? newsList.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                    >
                        ←
                    </button>
                    <button 
                        onClick={() => setCurrentIndex(prev => (prev === newsList.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                    >
                        →
                    </button>
                </>
            )}
        </div>
    );
}

