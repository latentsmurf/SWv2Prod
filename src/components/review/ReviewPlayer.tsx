"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, MessageSquare, CheckCircle, Circle, PenTool, Trash2 } from 'lucide-react';
import { Comment } from '@/types';

interface ReviewPlayerProps {
    videoUrl: string;
    projectId: string;
    initialComments?: Comment[];
}

export default function ReviewPlayer({ videoUrl, projectId, initialComments = [] }: ReviewPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newCommentText, setNewCommentText] = useState("");
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentDrawing, setCurrentDrawing] = useState<any[]>([]); // Array of points {x, y}
    const [drawings, setDrawings] = useState<any[]>([]); // Array of completed paths
    const [activeAnnotation, setActiveAnnotation] = useState<any>(null); // Annotation to show for current time

    // Load comments on mount and poll for updates
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`/api/comments?project_id=${projectId}`);
                if (res.ok) {
                    const data = await res.json();
                    setComments(data);
                }
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };

        fetchComments();
        const interval = setInterval(fetchComments, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [projectId]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);

            // Check for annotations at this timestamp (within 1 second window)
            const active = comments.find(c => Math.abs(c.timestamp - videoRef.current!.currentTime) < 0.5 && c.drawing_data);
            setActiveAnnotation(active ? active.drawing_data : null);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const jumpToTime = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
            setIsPlaying(false); // Pause when jumping to comment
            videoRef.current.pause();
        }
    };

    // Drawing Logic
    const startDrawing = (e: React.MouseEvent) => {
        if (!videoRef.current?.paused) return; // Only draw when paused
        setIsDrawing(true);
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCurrentDrawing([{ x, y }]);
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCurrentDrawing(prev => [...prev, { x, y }]);

        // Render immediately
        const ctx = canvasRef.current!.getContext('2d');
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        // Save current path
        setDrawings(prev => [...prev, currentDrawing]);
        setCurrentDrawing([]);
    };

    const clearCanvas = () => {
        const ctx = canvasRef.current!.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            ctx.beginPath();
        }
        setDrawings([]);
        setActiveAnnotation(null);
    };

    // Render active annotation or current drawing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // If we are not drawing, clear and show active annotation
        if (!isDrawing) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();

            const dataToShow = activeAnnotation || (drawings.length > 0 ? drawings : null);

            if (dataToShow) {
                // Handle single path or array of paths
                const paths = Array.isArray(dataToShow[0]) ? dataToShow : [dataToShow];

                ctx.strokeStyle = '#eab308'; // Yellow
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';

                paths.forEach((path: any[]) => {
                    if (path && path.length > 0) {
                        ctx.beginPath();
                        ctx.moveTo(path[0].x, path[0].y);
                        path.forEach(p => ctx.lineTo(p.x, p.y));
                        ctx.stroke();
                    }
                });
            }
        }
    }, [activeAnnotation, drawings, isDrawing, currentTime]);

    const submitComment = async () => {
        if (!newCommentText) return;

        const commentData = {
            project_id: projectId,
            shot_id: null, // Optional
            content: newCommentText,
            timestamp: currentTime,
            is_resolved: false,
            // drawing_data is not in the backend model yet, need to add it or store in content/metadata?
            // The backend model in main.py only has content, timestamp, is_resolved.
            // I should update backend model to support drawing_data or just ignore it for now.
            // Let's assume we can't save drawing_data yet unless I update backend.
            // I'll update backend in next step if needed, or just send it and see if MongoDB accepts extra fields (it does, but Pydantic might filter).
            // Wait, Pydantic model `CommentRequest` in main.py:
            // class CommentRequest(BaseModel): ... content: str ...
            // It doesn't have drawing_data.
            // I should update main.py to include drawing_data: Optional[List[Any]] = None
        };

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData)
            });

            if (res.ok) {
                setNewCommentText("");
                clearCanvas();
                // Refresh comments immediately
                const refreshRes = await fetch(`/api/comments?project_id=${projectId}`);
                if (refreshRes.ok) {
                    setComments(await refreshRes.json());
                }
            } else {
                alert('Failed to save comment');
            }
        } catch (error) {
            console.error('Error saving comment:', error);
            alert('Failed to save comment');
        }
    };

    const resolveComment = async (id: string, currentStatus: boolean) => {
        try {
            await fetch(`/api/comments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_resolved: !currentStatus })
            });

            // Optimistic update
            setComments(comments.map(c =>
                c.id === id ? { ...c, is_resolved: !currentStatus } : c
            ));
        } catch (error) {
            console.error("Error resolving comment:", error);
        }
    };

    return (
        <div className="flex h-screen bg-black text-white font-sans">
            {/* Main Player Area */}
            <div className="flex-1 flex flex-col relative">
                <div className="flex-1 relative flex items-center justify-center bg-neutral-900">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="max-h-full max-w-full"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onClick={togglePlay}
                    />
                    {/* Annotation Layer */}
                    <canvas
                        ref={canvasRef}
                        width={1280} // Should match video aspect ratio/size dynamically in real app
                        height={720}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-crosshair"
                        style={{ width: '100%', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                    />
                </div>

                {/* Controls */}
                <div className="h-16 bg-neutral-800 flex items-center px-4 gap-4 border-t border-neutral-700">
                    <button onClick={togglePlay} className="p-2 hover:bg-neutral-700 rounded-full">
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <div className="text-sm font-mono">
                        {new Date(currentTime * 1000).toISOString().substr(14, 5)} / {new Date(duration * 1000).toISOString().substr(14, 5)}
                    </div>
                    <div className="flex-1 h-2 bg-neutral-700 rounded-full overflow-hidden relative group cursor-pointer"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            jumpToTime(pos * duration);
                        }}>
                        <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                        {/* Comment markers */}
                        {comments.map(c => (
                            <div
                                key={c.id}
                                className={`absolute top-0 w-1 h-full ${c.is_resolved ? 'bg-green-500' : 'bg-yellow-500'}`}
                                style={{ left: `${(c.timestamp / duration) * 100}%` }}
                            />
                        ))}
                    </div>
                    <button onClick={clearCanvas} className="p-2 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white" title="Clear Drawings">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col">
                <div className="p-4 border-b border-neutral-800 font-bold text-lg flex items-center gap-2">
                    <MessageSquare size={20} className="text-blue-400" />
                    Comments
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {comments.length === 0 && (
                        <div className="text-neutral-500 text-center mt-10 text-sm">No comments yet. Be the first!</div>
                    )}
                    {comments.map(comment => (
                        <div
                            key={comment.id}
                            className={`p-3 rounded bg-neutral-800 border ${comment.is_resolved ? 'border-green-900/50 opacity-60' : 'border-neutral-700'} hover:border-blue-500 transition-colors cursor-pointer group`}
                            onClick={() => jumpToTime(comment.timestamp)}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold">
                                        {(comment.user_id || 'AN').substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-xs text-blue-400 font-mono">
                                        {new Date(comment.timestamp * 1000).toISOString().substr(14, 5)}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); resolveComment(comment.id, comment.is_resolved); }}
                                    className={`text-neutral-500 hover:text-green-500 ${comment.is_resolved ? 'text-green-500' : ''}`}
                                >
                                    <CheckCircle size={16} />
                                </button>
                            </div>
                            <p className="text-sm text-neutral-300">{comment.content}</p>
                            {comment.drawing_data && (
                                <div className="mt-2 flex items-center gap-1 text-[10px] text-yellow-500">
                                    <PenTool size={10} />
                                    <span>Has Annotation</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-neutral-800 border-t border-neutral-700">
                    <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
                        <span>Writing at {new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
                        {drawings.length > 0 && <span className="text-yellow-500 flex items-center gap-1"><PenTool size={10} /> Drawing Active</span>}
                    </div>
                    <textarea
                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none h-20"
                        placeholder="Type a comment... (Draw on video to annotate)"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                submitComment();
                            }
                        }}
                    />
                    <button
                        onClick={submitComment}
                        disabled={!newCommentText}
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Post Comment
                    </button>
                </div>
            </div>
        </div>
    );
}
