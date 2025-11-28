'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Circle, Eye, Edit, MessageSquare } from 'lucide-react';

interface UserPresence {
    user_id: string;
    user_name: string;
    avatar_url?: string;
    color: string;
    location: {
        type: 'project' | 'scene' | 'shot' | 'editor';
        id: string;
        name?: string;
    };
    activity: 'viewing' | 'editing' | 'commenting';
    cursor?: { x: number; y: number };
    last_seen: string;
}

interface PresenceIndicatorProps {
    projectId: string;
    currentLocation?: {
        type: 'project' | 'scene' | 'shot' | 'editor';
        id: string;
    };
    showCursors?: boolean;
}

const PRESENCE_COLORS = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899'
];

export default function PresenceIndicator({
    projectId,
    currentLocation,
    showCursors = false
}: PresenceIndicatorProps) {
    const [presence, setPresence] = useState<UserPresence[]>([]);
    const [showDetails, setShowDetails] = useState(false);
    const [myColor] = useState(() => PRESENCE_COLORS[Math.floor(Math.random() * PRESENCE_COLORS.length)]);

    // Poll for presence updates
    useEffect(() => {
        const fetchPresence = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/presence`);
                if (res.ok) {
                    const data = await res.json();
                    setPresence(data.filter((p: UserPresence) => p.user_id !== 'current-user'));
                }
            } catch (error) {
                console.error('Error fetching presence:', error);
            }
        };

        // Initial fetch
        fetchPresence();

        // Poll every 5 seconds
        const interval = setInterval(fetchPresence, 5000);

        return () => clearInterval(interval);
    }, [projectId]);

    // Update my presence
    useEffect(() => {
        const updatePresence = async () => {
            if (!currentLocation) return;

            try {
                await fetch(`/api/projects/${projectId}/presence`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        location: currentLocation,
                        activity: 'viewing',
                        color: myColor
                    })
                });
            } catch (error) {
                console.error('Error updating presence:', error);
            }
        };

        updatePresence();

        // Heartbeat every 10 seconds
        const interval = setInterval(updatePresence, 10000);

        return () => clearInterval(interval);
    }, [projectId, currentLocation, myColor]);

    // Get activity icon
    const getActivityIcon = (activity: UserPresence['activity']) => {
        switch (activity) {
            case 'editing':
                return <Edit size={10} />;
            case 'commenting':
                return <MessageSquare size={10} />;
            default:
                return <Eye size={10} />;
        }
    };

    // Filter users in same location
    const usersHere = presence.filter(p =>
        currentLocation &&
        p.location.type === currentLocation.type &&
        p.location.id === currentLocation.id
    );

    const usersElsewhere = presence.filter(p =>
        !currentLocation ||
        p.location.type !== currentLocation.type ||
        p.location.id !== currentLocation.id
    );

    if (presence.length === 0) {
        return null;
    }

    return (
        <div className="relative">
            {/* Presence Avatars */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2"
            >
                <div className="flex -space-x-2">
                    {presence.slice(0, 5).map((user) => (
                        <div
                            key={user.user_id}
                            className="relative"
                            title={user.user_name}
                        >
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.user_name}
                                    className="w-8 h-8 rounded-full border-2"
                                    style={{ borderColor: user.color }}
                                />
                            ) : (
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2"
                                    style={{ backgroundColor: user.color, borderColor: user.color }}
                                >
                                    {user.user_name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {/* Activity indicator */}
                            <div
                                className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full text-white"
                                style={{ backgroundColor: user.color }}
                            >
                                {getActivityIcon(user.activity)}
                            </div>
                        </div>
                    ))}
                </div>
                {presence.length > 5 && (
                    <span className="text-xs text-gray-400">
                        +{presence.length - 5}
                    </span>
                )}
            </button>

            {/* Details Dropdown */}
            {showDetails && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
                    <div className="p-3 border-b border-white/5">
                        <h4 className="text-sm font-medium text-white flex items-center gap-2">
                            <Users size={14} />
                            {presence.length} Online
                        </h4>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        {/* Users in current location */}
                        {usersHere.length > 0 && (
                            <div>
                                <p className="px-3 py-2 text-xs text-gray-500 bg-white/5">
                                    Here with you
                                </p>
                                {usersHere.map((user) => (
                                    <div
                                        key={user.user_id}
                                        className="flex items-center gap-3 px-3 py-2 hover:bg-white/5"
                                    >
                                        <div className="relative">
                                            {user.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt={user.user_name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            ) : (
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                    style={{ backgroundColor: user.color }}
                                                >
                                                    {user.user_name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <Circle
                                                size={10}
                                                className="absolute -bottom-0.5 -right-0.5 fill-green-500 text-green-500"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{user.user_name}</p>
                                            <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                                                {getActivityIcon(user.activity)}
                                                {user.activity}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Users elsewhere */}
                        {usersElsewhere.length > 0 && (
                            <div>
                                <p className="px-3 py-2 text-xs text-gray-500 bg-white/5">
                                    Elsewhere in project
                                </p>
                                {usersElsewhere.map((user) => (
                                    <div
                                        key={user.user_id}
                                        className="flex items-center gap-3 px-3 py-2 hover:bg-white/5"
                                    >
                                        <div className="relative">
                                            {user.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt={user.user_name}
                                                    className="w-8 h-8 rounded-full opacity-70"
                                                />
                                            ) : (
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-70"
                                                    style={{ backgroundColor: user.color }}
                                                >
                                                    {user.user_name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{user.user_name}</p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {user.location.name || `${user.location.type} ${user.location.id.slice(0, 8)}`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Cursors overlay (if enabled) */}
            {showCursors && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {usersHere.filter(u => u.cursor).map((user) => (
                        <div
                            key={user.user_id}
                            className="absolute transition-all duration-100"
                            style={{
                                left: user.cursor!.x,
                                top: user.cursor!.y,
                                transform: 'translate(-2px, -2px)'
                            }}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill={user.color}
                                className="drop-shadow-lg"
                            >
                                <path d="M5.65 2L18.36 12.77L11.81 13.67L8.45 21.58L5.65 2Z" />
                            </svg>
                            <span
                                className="absolute left-5 top-3 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
                                style={{ backgroundColor: user.color }}
                            >
                                {user.user_name}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Compact presence badge
export function PresenceBadge({ count, onClick }: { count: number; onClick?: () => void }) {
    if (count === 0) return null;

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs hover:bg-green-500/20"
        >
            <Circle size={8} className="fill-green-500" />
            {count} online
        </button>
    );
}

// Hook for managing presence
export function usePresence(projectId: string) {
    const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);

    useEffect(() => {
        const fetchPresence = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/presence`);
                if (res.ok) {
                    setOnlineUsers(await res.json());
                }
            } catch (error) {
                // Silently fail
            }
        };

        fetchPresence();
        const interval = setInterval(fetchPresence, 5000);
        return () => clearInterval(interval);
    }, [projectId]);

    const updateActivity = useCallback(async (activity: 'viewing' | 'editing' | 'commenting', location?: any) => {
        try {
            await fetch(`/api/projects/${projectId}/presence`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activity, location })
            });
        } catch (error) {
            // Silently fail
        }
    }, [projectId]);

    return { onlineUsers, updateActivity };
}
