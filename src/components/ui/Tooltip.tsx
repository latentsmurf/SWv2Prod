'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export default function Tooltip({
    children,
    content,
    position = 'top',
    delay = 300
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showTooltip = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        if (isVisible && triggerRef.current && tooltipRef.current) {
            const trigger = triggerRef.current.getBoundingClientRect();
            const tooltip = tooltipRef.current.getBoundingClientRect();
            
            let top = 0;
            let left = 0;

            switch (position) {
                case 'top':
                    top = trigger.top - tooltip.height - 8;
                    left = trigger.left + (trigger.width - tooltip.width) / 2;
                    break;
                case 'bottom':
                    top = trigger.bottom + 8;
                    left = trigger.left + (trigger.width - tooltip.width) / 2;
                    break;
                case 'left':
                    top = trigger.top + (trigger.height - tooltip.height) / 2;
                    left = trigger.left - tooltip.width - 8;
                    break;
                case 'right':
                    top = trigger.top + (trigger.height - tooltip.height) / 2;
                    left = trigger.right + 8;
                    break;
            }

            // Keep tooltip within viewport
            const padding = 8;
            top = Math.max(padding, Math.min(top, window.innerHeight - tooltip.height - padding));
            left = Math.max(padding, Math.min(left, window.innerWidth - tooltip.width - padding));

            setCoords({ top, left });
        }
    }, [isVisible, position]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                className="inline-block"
            >
                {children}
            </div>
            {isVisible && (
                <div
                    ref={tooltipRef}
                    className="fixed z-[9999] px-3 py-2 text-xs font-medium text-white bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl pointer-events-none animate-in fade-in duration-150"
                    style={{ top: coords.top, left: coords.left }}
                >
                    {content}
                    {/* Arrow */}
                    <div 
                        className={`absolute w-2 h-2 bg-[#1a1a1a] border-white/10 transform rotate-45 ${
                            position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b' :
                            position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-l border-t' :
                            position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-r border-t' :
                            'left-[-5px] top-1/2 -translate-y-1/2 border-l border-b'
                        }`}
                    />
                </div>
            )}
        </>
    );
}
