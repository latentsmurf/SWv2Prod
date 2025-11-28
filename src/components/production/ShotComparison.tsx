'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    X, ChevronLeft, ChevronRight,
    ZoomIn, ZoomOut, Move, ArrowLeftRight, Image
} from 'lucide-react';

// Extended Shot type with image_url for comparison
interface ComparisonShot {
    id: string;
    shot_number?: number;
    description?: string;
    image_url?: string; // Can be gcs_path, proxy_path, or any URL
}

interface ShotComparisonProps {
    isOpen: boolean;
    onClose: () => void;
    shots: ComparisonShot[];
    initialLeftIndex?: number;
    initialRightIndex?: number;
    onSelectShot?: (shot: ComparisonShot) => void;
}

type CompareMode = 'side-by-side' | 'overlay' | 'swipe';

export default function ShotComparison({
    isOpen,
    onClose,
    shots,
    initialLeftIndex = 0,
    initialRightIndex = 1,
    onSelectShot
}: ShotComparisonProps) {
    const [leftIndex, setLeftIndex] = useState(initialLeftIndex);
    const [rightIndex, setRightIndex] = useState(initialRightIndex);
    const [compareMode, setCompareMode] = useState<CompareMode>('side-by-side');
    const [overlayOpacity, setOverlayOpacity] = useState(50);
    const [swipePosition, setSwipePosition] = useState(50);
    const [zoom, setZoom] = useState(100);
    const swipeRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const leftShot = shots[leftIndex];
    const rightShot = shots[rightIndex];

    // Handle swipe drag
    const handleSwipeDrag = (e: React.MouseEvent | React.TouchEvent) => {
        if (!swipeRef.current || !isDragging) return;
        
        const rect = swipeRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const position = ((clientX - rect.left) / rect.width) * 100;
        setSwipePosition(Math.max(0, Math.min(100, position)));
    };

    // Navigation
    const navigateLeft = (direction: 'prev' | 'next') => {
        const newIndex = direction === 'prev' 
            ? Math.max(0, leftIndex - 1)
            : Math.min(shots.length - 1, leftIndex + 1);
        if (newIndex !== rightIndex) setLeftIndex(newIndex);
    };

    const navigateRight = (direction: 'prev' | 'next') => {
        const newIndex = direction === 'prev' 
            ? Math.max(0, rightIndex - 1)
            : Math.min(shots.length - 1, rightIndex + 1);
        if (newIndex !== leftIndex) setRightIndex(newIndex);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    if (e.shiftKey) navigateRight('prev');
                    else navigateLeft('prev');
                    break;
                case 'ArrowRight':
                    if (e.shiftKey) navigateRight('next');
                    else navigateLeft('next');
                    break;
                case '1':
                    setCompareMode('side-by-side');
                    break;
                case '2':
                    setCompareMode('overlay');
                    break;
                case '3':
                    setCompareMode('swipe');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, leftIndex, rightIndex]);

    if (!isOpen || !leftShot || !rightShot) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <ArrowLeftRight className="text-yellow-500" />
                        Shot Comparison
                    </h2>
                    
                    {/* Mode Selector */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                        {[
                            { id: 'side-by-side', label: 'Side by Side', key: '1' },
                            { id: 'overlay', label: 'Overlay', key: '2' },
                            { id: 'swipe', label: 'Swipe', key: '3' },
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => setCompareMode(mode.id as CompareMode)}
                                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                                    compareMode === mode.id
                                        ? 'bg-yellow-500 text-black font-medium'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {mode.label} <kbd className="text-[10px] opacity-50 ml-1">{mode.key}</kbd>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setZoom(Math.max(50, zoom - 25))}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                        >
                            <ZoomOut size={18} />
                        </button>
                        <span className="text-sm text-gray-400 w-12 text-center">{zoom}%</span>
                        <button
                            onClick={() => setZoom(Math.min(200, zoom + 25))}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                        >
                            <ZoomIn size={18} />
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Comparison View */}
            <div className="flex-1 relative overflow-hidden">
                {compareMode === 'side-by-side' && (
                    <div className="h-full flex">
                        {/* Left Image */}
                        <div className="flex-1 relative border-r border-white/10">
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
                                {leftShot.image_url ? (
                                    <img
                                        src={leftShot.image_url}
                                        alt={leftShot.description}
                                        className="max-w-full max-h-full object-contain"
                                        style={{ transform: `scale(${zoom / 100})` }}
                                    />
                                ) : (
                                    <div className="text-gray-600 flex flex-col items-center gap-2">
                                        <Image size={48} />
                                        <span>No image</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Navigation */}
                            <button
                                onClick={() => navigateLeft('prev')}
                                disabled={leftIndex === 0}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white disabled:opacity-30"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={() => navigateLeft('next')}
                                disabled={leftIndex === shots.length - 1}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white disabled:opacity-30"
                            >
                                <ChevronRight size={24} />
                            </button>

                            {/* Label */}
                            <div className="absolute bottom-4 left-4 right-4 bg-black/80 rounded-lg p-3">
                                <p className="text-xs text-yellow-500 font-medium">Shot {leftShot.shot_number}</p>
                                <p className="text-sm text-white truncate">{leftShot.description}</p>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="flex-1 relative">
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
                                {rightShot.image_url ? (
                                    <img
                                        src={rightShot.image_url}
                                        alt={rightShot.description}
                                        className="max-w-full max-h-full object-contain"
                                        style={{ transform: `scale(${zoom / 100})` }}
                                    />
                                ) : (
                                    <div className="text-gray-600 flex flex-col items-center gap-2">
                                        <Image size={48} />
                                        <span>No image</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Navigation */}
                            <button
                                onClick={() => navigateRight('prev')}
                                disabled={rightIndex === 0}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white disabled:opacity-30"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={() => navigateRight('next')}
                                disabled={rightIndex === shots.length - 1}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white disabled:opacity-30"
                            >
                                <ChevronRight size={24} />
                            </button>

                            {/* Label */}
                            <div className="absolute bottom-4 left-4 right-4 bg-black/80 rounded-lg p-3">
                                <p className="text-xs text-blue-400 font-medium">Shot {rightShot.shot_number}</p>
                                <p className="text-sm text-white truncate">{rightShot.description}</p>
                            </div>
                        </div>
                    </div>
                )}

                {compareMode === 'overlay' && (
                    <div className="h-full relative">
                        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
                            {/* Base Image */}
                            {leftShot.image_url && (
                                <img
                                    src={leftShot.image_url}
                                    alt={leftShot.description}
                                    className="max-w-full max-h-full object-contain absolute"
                                    style={{ transform: `scale(${zoom / 100})` }}
                                />
                            )}
                            {/* Overlay Image */}
                            {rightShot.image_url && (
                                <img
                                    src={rightShot.image_url}
                                    alt={rightShot.description}
                                    className="max-w-full max-h-full object-contain absolute"
                                    style={{ 
                                        transform: `scale(${zoom / 100})`,
                                        opacity: overlayOpacity / 100
                                    }}
                                />
                            )}
                        </div>

                        {/* Opacity Slider */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 rounded-xl p-4 flex items-center gap-4">
                            <span className="text-sm text-yellow-500">A</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={overlayOpacity}
                                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                                className="w-64 accent-yellow-500"
                            />
                            <span className="text-sm text-blue-400">B</span>
                        </div>
                    </div>
                )}

                {compareMode === 'swipe' && (
                    <div
                        ref={swipeRef}
                        className="h-full relative cursor-ew-resize"
                        onMouseDown={() => setIsDragging(true)}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseLeave={() => setIsDragging(false)}
                        onMouseMove={handleSwipeDrag}
                        onTouchStart={() => setIsDragging(true)}
                        onTouchEnd={() => setIsDragging(false)}
                        onTouchMove={handleSwipeDrag}
                    >
                        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
                            {/* Right (underneath) */}
                            {rightShot.image_url && (
                                <img
                                    src={rightShot.image_url}
                                    alt={rightShot.description}
                                    className="max-w-full max-h-full object-contain absolute"
                                    style={{ transform: `scale(${zoom / 100})` }}
                                />
                            )}
                            {/* Left (clipped) */}
                            <div 
                                className="absolute inset-0 overflow-hidden"
                                style={{ width: `${swipePosition}%` }}
                            >
                                {leftShot.image_url && (
                                    <img
                                        src={leftShot.image_url}
                                        alt={leftShot.description}
                                        className="max-w-full max-h-full object-contain absolute left-0"
                                        style={{ transform: `scale(${zoom / 100})` }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Swipe Handle */}
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                            style={{ left: `${swipePosition}%` }}
                        >
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <Move size={16} className="text-black" />
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="absolute bottom-4 left-4 bg-black/80 rounded-lg px-3 py-2">
                            <span className="text-sm text-yellow-500">A: Shot {leftShot.shot_number}</span>
                        </div>
                        <div className="absolute bottom-4 right-4 bg-black/80 rounded-lg px-3 py-2">
                            <span className="text-sm text-blue-400">B: Shot {rightShot.shot_number}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Shot Thumbnails */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                    {shots.map((shot, index) => (
                        <button
                            key={shot.id}
                            onClick={() => {
                                if (leftIndex !== index && rightIndex !== index) {
                                    setLeftIndex(index);
                                }
                            }}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                if (leftIndex !== index && rightIndex !== index) {
                                    setRightIndex(index);
                                }
                            }}
                            className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                                index === leftIndex
                                    ? 'border-yellow-500 ring-2 ring-yellow-500/30'
                                    : index === rightIndex
                                    ? 'border-blue-400 ring-2 ring-blue-400/30'
                                    : 'border-white/10 hover:border-white/30'
                            }`}
                        >
                            {shot.image_url ? (
                                <img
                                    src={shot.image_url}
                                    alt={shot.description}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600">
                                    <Image size={16} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Click to set left (A) • Right-click to set right (B)
                </p>
            </div>
        </div>
    );
}
