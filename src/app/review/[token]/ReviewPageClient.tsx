'use client';

import React, { useState, useEffect } from 'react';
import {
    Lock, ArrowLeft, MessageSquare, Check, Send, Loader2,
    Grid, Film, Play, ChevronLeft, ChevronRight, Image,
    Eye, Clock, ThumbsUp, ThumbsDown, Flag, X
} from 'lucide-react';
import ReviewPlayer from '@/components/review/ReviewPlayer';
import { Scene, Shot, Comment } from '@/types';

interface ReviewData {
    project_id: string;
    project_name: string;
    video_url?: string;
    allow_comments: boolean;
    password_protected: boolean;
    scenes?: Scene[];
    shots?: Shot[];
}

interface ReviewPageClientProps {
    data: ReviewData;
    token: string;
}

export default function ReviewPageClient({ data, token }: ReviewPageClientProps) {
    const [isUnlocked, setIsUnlocked] = useState(!data.password_protected);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [viewMode, setViewMode] = useState<'video' | 'storyboard'>('storyboard');
    const [selectedShotIndex, setSelectedShotIndex] = useState(0);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [reviewerName, setReviewerName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showShotDetail, setShowShotDetail] = useState(false);

    const shots = data.shots || [];
    const scenes = data.scenes || [];

    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`/api/review/${token}/comments`);
                if (res.ok) {
                    setComments(await res.json());
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        if (isUnlocked) {
            fetchComments();
            const interval = setInterval(fetchComments, 10000);
            return () => clearInterval(interval);
        }
    }, [token, isUnlocked]);

    // Handle password submission
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/review/${token}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            
            if (res.ok) {
                setIsUnlocked(true);
                setPasswordError('');
            } else {
                setPasswordError('Incorrect password');
            }
        } catch (error) {
            setPasswordError('Error verifying password');
        }
    };

    // Submit comment
    const submitComment = async () => {
        if (!newComment.trim() || !data.allow_comments) return;
        
        setSubmitting(true);
        try {
            const res = await fetch(`/api/review/${token}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newComment,
                    reviewer_name: reviewerName || 'Anonymous',
                    shot_id: shots[selectedShotIndex]?.id,
                    timestamp: selectedShotIndex
                })
            });
            
            if (res.ok) {
                const comment = await res.json();
                setComments(prev => [...prev, comment]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Get comments for current shot
    const shotComments = comments.filter(c => 
        c.shot_id === shots[selectedShotIndex]?.id
    );

    // Password screen
    if (!isUnlocked) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Lock className="text-yellow-500" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Protected Review
                        </h1>
                        <p className="text-gray-500">
                            Enter the password to view "{data.project_name}"
                        </p>
                    </div>

                    <form onSubmit={handlePasswordSubmit}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 mb-4"
                        />
                        {passwordError && (
                            <p className="text-red-400 text-sm mb-4">{passwordError}</p>
                        )}
                        <button
                            type="submit"
                            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors"
                        >
                            View Project
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Video mode
    if (viewMode === 'video' && data.video_url) {
        return (
            <div className="h-screen">
                <div className="absolute top-4 left-4 z-10">
                    <button
                        onClick={() => setViewMode('storyboard')}
                        className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-black/70 transition-colors"
                    >
                        <Grid size={16} />
                        Storyboard View
                    </button>
                </div>
                <ReviewPlayer
                    videoUrl={data.video_url}
                    projectId={data.project_id}
                    initialComments={comments}
                />
            </div>
        );
    }

    // Storyboard mode
    const currentShot = shots[selectedShotIndex];

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                            <Film className="text-yellow-500" size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">
                                {data.project_name}
                            </h1>
                            <p className="text-xs text-gray-500">
                                Review • {shots.length} shots
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {data.video_url && (
                            <button
                                onClick={() => setViewMode('video')}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors"
                            >
                                <Play size={16} />
                                Video Player
                            </button>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Eye size={14} />
                            Review Mode
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Main Content */}
                <main className="flex-1 p-6">
                    {/* Shot Navigator */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedShotIndex(Math.max(0, selectedShotIndex - 1))}
                                disabled={selectedShotIndex === 0}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            
                            <span className="text-lg font-medium">
                                Shot {selectedShotIndex + 1} of {shots.length}
                            </span>
                            
                            <button
                                onClick={() => setSelectedShotIndex(Math.min(shots.length - 1, selectedShotIndex + 1))}
                                disabled={selectedShotIndex === shots.length - 1}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors">
                                <ThumbsUp size={18} />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                <ThumbsDown size={18} />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors">
                                <Flag size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Current Shot Display */}
                    {currentShot ? (
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
                            <div className="aspect-video bg-black relative">
                                {currentShot.gcs_path || currentShot.proxy_path ? (
                                    <img
                                        src={currentShot.proxy_path || currentShot.gcs_path}
                                        alt={`Shot ${selectedShotIndex + 1}`}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <Image size={64} />
                                    </div>
                                )}
                                
                                {/* Shot Type Badge */}
                                <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-lg">
                                    <span className="text-sm font-medium text-white">
                                        {currentShot.shot_type?.toUpperCase() || 'SHOT'}
                                    </span>
                                </div>
                            </div>

                            {/* Shot Info */}
                            <div className="p-6">
                                <p className="text-white mb-2">
                                    {currentShot.description || currentShot.prompt}
                                </p>
                                {currentShot.notes && (
                                    <p className="text-sm text-gray-500 italic">
                                        Note: {currentShot.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-20 text-center">
                            <Image className="mx-auto text-gray-600 mb-4" size={48} />
                            <p className="text-gray-500">No shots available for review</p>
                        </div>
                    )}

                    {/* Shot Thumbnails Grid */}
                    <div className="mt-6 grid grid-cols-6 gap-2">
                        {shots.map((shot, index) => (
                            <button
                                key={shot.id}
                                onClick={() => setSelectedShotIndex(index)}
                                className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                                    index === selectedShotIndex
                                        ? 'border-yellow-500 scale-105 shadow-lg shadow-yellow-500/20'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                            >
                                {shot.proxy_path || shot.gcs_path ? (
                                    <img
                                        src={shot.proxy_path || shot.gcs_path}
                                        alt={`Shot ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                        <span className="text-xs text-gray-600">{index + 1}</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </main>

                {/* Comments Sidebar */}
                <aside className="w-96 border-l border-white/5 bg-[#0a0a0a] flex flex-col h-[calc(100vh-73px)] sticky top-[73px]">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <MessageSquare size={18} className="text-yellow-500" />
                            Comments
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {shotComments.length} comments on this shot
                        </p>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {shotComments.length === 0 ? (
                            <div className="text-center py-12 text-gray-600 text-sm">
                                No comments on this shot yet
                            </div>
                        ) : (
                            shotComments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className={`p-3 rounded-xl border ${
                                        comment.is_resolved
                                            ? 'bg-green-500/5 border-green-500/20'
                                            : 'bg-white/5 border-white/10'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-[10px] font-bold text-black">
                                                {(comment.user_id || 'AN').substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-sm text-white font-medium">
                                                {comment.user_id || 'Anonymous'}
                                            </span>
                                        </div>
                                        {comment.is_resolved && (
                                            <Check size={14} className="text-green-400" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-300">{comment.content}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Comment Input */}
                    {data.allow_comments && (
                        <div className="p-4 border-t border-white/5">
                            {!reviewerName && (
                                <input
                                    type="text"
                                    value={reviewerName}
                                    onChange={(e) => setReviewerName(e.target.value)}
                                    placeholder="Your name (optional)"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 mb-3"
                                />
                            )}
                            <div className="flex gap-2">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Leave feedback on this shot..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 resize-none h-20"
                                />
                            </div>
                            <button
                                onClick={submitComment}
                                disabled={!newComment.trim() || submitting}
                                className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Send size={16} />
                                )}
                                Post Comment
                            </button>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
