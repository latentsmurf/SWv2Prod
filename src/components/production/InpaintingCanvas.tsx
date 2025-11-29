'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Paintbrush, Undo, Save, Loader2 } from 'lucide-react';

interface InpaintingCanvasProps {
    imageUrl: string;
    shotId: string;
    onRepair: (maskBase64: string, prompt: string) => Promise<void>;
}

export default function InpaintingCanvas({ imageUrl, shotId, onRepair }: InpaintingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(20);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas initially
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // We don't draw the image on the canvas itself, we use it as a background
        // The canvas is purely for the mask (white on transparent)
    }, [imageUrl]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // Semi-transparent white for visibility
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleRepair = async () => {
        if (!prompt) return alert("Please enter a prompt for what to fix.");
        const canvas = canvasRef.current;
        if (!canvas) return;

        setLoading(true);
        const maskBase64 = canvas.toDataURL('image/png');
        await onRepair(maskBase64, prompt);
        setLoading(false);
        clearCanvas();
    };

    return (
        <div className="flex flex-col gap-4 max-w-4xl mx-auto p-6 bg-[#121212] rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Eraser className="text-yellow-500" /> The Repair Shop
                </h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Paintbrush size={16} className="text-gray-400" />
                        <input
                            type="range"
                            min="5"
                            max="100"
                            value={brushSize}
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            className="w-32 accent-yellow-500"
                        />
                    </div>
                    <button
                        onClick={clearCanvas}
                        className="p-2 rounded bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        title="Clear Mask"
                    >
                        <Undo size={18} />
                    </button>
                </div>
            </div>

            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-white/10 group">
                {/* Background Image */}
                {/* Background Image or Video */}
                {imageUrl.endsWith('.mp4') ? (
                    <video
                        src={imageUrl}
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        autoPlay
                        muted
                        loop
                    />
                ) : (
                    <img
                        src={imageUrl}
                        alt="Shot to repair"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                )}

                {/* Canvas Overlay */}
                <canvas
                    ref={canvasRef}
                    width={1920}
                    height={1080}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="absolute inset-0 w-full h-full cursor-crosshair opacity-70 hover:opacity-90 transition-opacity"
                    style={{ touchAction: 'none' }}
                />

                <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded text-xs text-gray-300 pointer-events-none">
                    Draw over the area to fix
                </div>
            </div>

            <div className="flex gap-4">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what to fix (e.g., 'remove the boom mic', 'fix the hand')"
                    className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors"
                />
                <button
                    onClick={handleRepair}
                    disabled={loading || !prompt}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Repair Shot
                </button>
            </div>
        </div>
    );
}
