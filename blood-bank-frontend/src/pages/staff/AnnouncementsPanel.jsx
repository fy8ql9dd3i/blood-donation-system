import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import Button from '../../../components/ui/Button';

/**
 * Admin Announcements Management Panel
 * Create, edit, and manage news/announcements
 * Posts are broadcasted to all mobile app users and staff
 */
function AnnouncementsPanel() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        imageUrl: '',
        language: 'en'
    });
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Fetch all announcements
    const { data: announcements = [], isLoading } = useQuery({
        queryKey: ['announcements-admin'],
        queryFn: async () => {
            const { data } = await api.get('/news');
            return data.data || [];
        }
    });

    // Create announcement mutation
    const createMutation = useMutation({
        mutationFn: async (payload) => {
            const { data } = await api.post('/news', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements-admin'] });
            toast.success('📢 Announcement posted successfully!');
            setFormData({ title: '', content: '', imageUrl: '', language: 'en' });
            setImageFile(null);
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to create announcement';
            toast.error(message);
        }
    });

    // Delete announcement mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { data } = await api.delete(`/news/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements-admin'] });
            toast.info('Announcement removed');
        },
        onError: (error) => {
            toast.error('Failed to delete announcement');
        }
    });

    // Handle image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formDataObj = new FormData();
        formDataObj.append('image', file);

        try {
            const { data } = await api.post('/news/upload', formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData({ ...formData, imageUrl: data.imageUrl });
            toast.success('Image uploaded successfully');
        } catch (error) {
            toast.error('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            toast.warning('Please fill in title and content');
            return;
        }

        createMutation.mutate(formData);
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="mb-8 pb-6 border-b border-slate-200">
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    <span>📢</span> Announcements & News
                </h2>
                <p className="text-slate-600 text-sm mt-2">
                    Create and broadcast announcements to mobile app users and all staff members
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Create New Announcement</h3>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Title *</label>
                            <input
                                type="text"
                                placeholder="e.g., Holiday Closure Notice"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                maxLength={255}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                            />
                            <p className="text-xs text-slate-500 mt-1">{formData.title.length}/255 characters</p>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Content *</label>
                            <textarea
                                placeholder="Write your announcement here..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={6}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                            />
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Language</label>
                            <select
                                value={formData.language}
                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                            >
                                <option value="en">English</option>
                                <option value="am">Amharic (አማርኛ)</option>
                                <option value="or">Afan Oromo</option>
                            </select>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Image (Optional)</label>
                            <div className="space-y-2">
                                {formData.imageUrl && (
                                    <div className="relative">
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            className="w-full h-32 object-cover rounded-lg border border-slate-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs font-bold hover:bg-red-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading || formData.imageUrl}
                                    className="block w-full text-sm text-slate-500 file:bg-red-500 file:text-white file:px-3 file:py-2 file:rounded-lg file:font-bold file:cursor-pointer file:border-0 disabled:opacity-50"
                                />
                                <p className="text-xs text-slate-500">Max 5MB, JPG/PNG</p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={createMutation.isPending || uploading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2.5 rounded-lg transition-colors uppercase text-sm tracking-wide"
                        >
                            {createMutation.isPending ? '⏳ Publishing...' : '📤 Publish Announcement'}
                        </button>
                    </form>
                </div>

                {/* Announcements List Section */}
                <div className="lg:col-span-2">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900">
                                Recent Announcements ({announcements.length})
                            </h3>
                        </div>

                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-slate-200 animate-pulse p-4 rounded-lg h-32"></div>
                                ))}
                            </div>
                        ) : announcements.length === 0 ? (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                                <p className="text-slate-600 font-semibold">No announcements yet</p>
                                <p className="text-slate-500 text-sm mt-1">Create your first announcement above</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {announcements.map((announcement) => (
                                    <div
                                        key={announcement.id}
                                        className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex gap-3">
                                            {announcement.imageUrl && (
                                                <img
                                                    src={announcement.imageUrl}
                                                    alt={announcement.title}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 truncate text-sm">
                                                    {announcement.title}
                                                </h4>
                                                <p className="text-slate-600 text-xs line-clamp-2 mt-1">
                                                    {announcement.content}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                        {announcement.language?.toUpperCase() || 'EN'}
                                                    </span>
                                                    <span>
                                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {announcement.isActive && (
                                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                                            ✅ Active
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Delete this announcement?')) {
                                                            deleteMutation.mutate(announcement.id);
                                                        }
                                                    }}
                                                    disabled={deleteMutation.isPending}
                                                    className="text-red-600 hover:text-red-700 font-bold text-xs hover:bg-red-50 px-2 py-1 rounded transition"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-2">💡 Broadcasting System:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>All announcements are automatically sent to mobile app users</li>
                    <li>Staff members receive notifications via the notification system</li>
                    <li>Multiple language support (English, Amharic, Afan Oromo)</li>
                    <li>Images help make announcements more engaging</li>
                </ul>
            </div>
        </div>
    );
}

export default AnnouncementsPanel;
