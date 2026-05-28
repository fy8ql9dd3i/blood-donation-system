import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { toast } from 'react-toastify';

/**
 * Announcements & News Page for Mobile App
 * Displays all announcements posted by admin
 * Auto-refreshes every 30 seconds for real-time updates
 */
function AnnouncementsPage() {
    const [language, setLanguage] = useState('en');

    // Fetch announcements from backend
    const { data: announcementsData, isLoading, error, refetch } = useQuery({
        queryKey: ['announcements', language],
        queryFn: async () => {
            const { data } = await api.get('/news', {
                params: { lang: language }
            });
            return data.data || [];
        },
        refetchInterval: 30000, // Auto-refresh every 30 seconds
        staleTime: 10000
    });

    const announcements = Array.isArray(announcementsData) ? announcementsData : [];

    // Manually refresh announcements
    const handleRefresh = () => {
        refetch();
        toast.info('Announcements refreshed');
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
                    <div className="text-4xl mb-4">❌</div>
                    <p className="text-gray-700 font-semibold mb-4">Failed to load announcements</p>
                    <button
                        onClick={handleRefresh}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 shadow-lg sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">📢 Announcements</h1>
                        <p className="text-red-100 text-sm font-semibold mt-1">Latest news from blood bank</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition disabled:opacity-50"
                        title="Refresh announcements"
                    >
                        <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
                    </button>
                </div>

                {/* Language Toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setLanguage('en')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition ${language === 'en'
                                ? 'bg-white text-red-600'
                                : 'bg-red-500 text-white hover:bg-red-400'
                            }`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => setLanguage('am')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition ${language === 'am'
                                ? 'bg-white text-red-600'
                                : 'bg-red-500 text-white hover:bg-red-400'
                            }`}
                    >
                        Amharic
                    </button>
                    <button
                        onClick={() => setLanguage('or')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition ${language === 'or'
                                ? 'bg-white text-red-600'
                                : 'bg-red-500 text-white hover:bg-red-400'
                            }`}
                    >
                        Afan Oromo
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-2xl mx-auto p-4">
                {isLoading ? (
                    // Loading State
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl p-6 shadow animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        ))}
                    </div>
                ) : announcements.length === 0 ? (
                    // Empty State
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">🔇</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Announcements Yet</h2>
                        <p className="text-gray-600 mb-6">Check back soon for latest news and updates from the blood bank.</p>
                        <button
                            onClick={handleRefresh}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold transition"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                ) : (
                    // Announcements List
                    <div className="space-y-4">
                        {announcements.map((announcement, index) => (
                            <AnnouncementCard
                                key={announcement.id || index}
                                announcement={announcement}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Individual Announcement Card Component
 */
function AnnouncementCard({ announcement, index }) {
    const [expanded, setExpanded] = useState(false);

    // Format date
    const dateCreated = new Date(announcement.createdAt);
    const dateString = dateCreated.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Truncate long content
    const contentPreview = announcement.content.substring(0, 150);
    const isLongContent = announcement.content.length > 150;

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
            {/* Image */}
            {announcement.imageUrl && (
                <img
                    src={announcement.imageUrl}
                    alt={announcement.title}
                    className="w-full h-48 object-cover"
                />
            )}

            {/* Content */}
            <div className="p-5">
                {/* Badge & Date */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                        📢 NEWS
                    </span>
                    <span className="text-gray-500 text-xs font-semibold">{dateString}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                    {announcement.title}
                </h3>

                {/* Content */}
                <p className={`text-gray-700 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
                    {expanded ? announcement.content : contentPreview}
                    {isLongContent && !expanded && '...'}
                </p>

                {/* Expand Button */}
                {isLongContent && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-3 text-red-600 hover:text-red-700 font-bold text-sm transition"
                    >
                        {expanded ? '👆 Show Less' : '👇 Read More'}
                    </button>
                )}

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>📝 {announcement.language?.toUpperCase() || 'EN'}</span>
                        <span className={announcement.isActive ? '✅ Active' : '❌ Inactive'} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnnouncementsPage;
