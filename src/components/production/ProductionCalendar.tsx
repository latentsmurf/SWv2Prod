'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin,
    Users, Film, X, Loader2, Check, Edit, Trash2, AlertCircle
} from 'lucide-react';

interface ScheduleEvent {
    id: string;
    title: string;
    type: 'shoot' | 'review' | 'deadline' | 'meeting' | 'other';
    start_date: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    description?: string;
    scene_ids?: string[];
    shot_ids?: string[];
    assignees?: string[];
    color?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface ProductionCalendarProps {
    projectId: string;
}

const EVENT_TYPES = {
    shoot: { label: 'Shoot Day', color: 'bg-blue-500', icon: Film },
    review: { label: 'Review', color: 'bg-purple-500', icon: Users },
    deadline: { label: 'Deadline', color: 'bg-red-500', icon: AlertCircle },
    meeting: { label: 'Meeting', color: 'bg-green-500', icon: Users },
    other: { label: 'Other', color: 'bg-gray-500', icon: Calendar }
};

export default function ProductionCalendar({ projectId }: ProductionCalendarProps) {
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Event form state
    const [eventForm, setEventForm] = useState({
        title: '',
        type: 'shoot' as ScheduleEvent['type'],
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        location: '',
        description: ''
    });

    // Fetch events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const res = await fetch(`/api/projects/${projectId}/schedule?year=${year}&month=${month}`);
                if (res.ok) {
                    setEvents(await res.json());
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [projectId, currentDate]);

    // Get days in month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days: (Date | null)[] = [];

        // Add empty slots for days before first of month
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        // Add days of month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d));
        }

        return days;
    };

    // Get events for a specific day
    const getEventsForDay = (day: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.start_date);
            return eventDate.toDateString() === day.toDateString();
        });
    };

    // Navigate months
    const goToPrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Open event modal
    const openNewEvent = (date?: Date) => {
        setSelectedEvent(null);
        setEventForm({
            title: '',
            type: 'shoot',
            start_date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            end_date: '',
            start_time: '09:00',
            end_time: '18:00',
            location: '',
            description: ''
        });
        setShowEventModal(true);
    };

    const openEditEvent = (event: ScheduleEvent) => {
        setSelectedEvent(event);
        setEventForm({
            title: event.title,
            type: event.type,
            start_date: event.start_date.split('T')[0],
            end_date: event.end_date?.split('T')[0] || '',
            start_time: event.start_time || '09:00',
            end_time: event.end_time || '18:00',
            location: event.location || '',
            description: event.description || ''
        });
        setShowEventModal(true);
    };

    // Save event
    const saveEvent = async () => {
        try {
            const url = selectedEvent
                ? `/api/projects/${projectId}/schedule/${selectedEvent.id}`
                : `/api/projects/${projectId}/schedule`;

            const res = await fetch(url, {
                method: selectedEvent ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventForm)
            });

            if (res.ok) {
                const saved = await res.json();
                if (selectedEvent) {
                    setEvents(prev => prev.map(e => e.id === saved.id ? saved : e));
                } else {
                    setEvents(prev => [...prev, saved]);
                }
                setShowEventModal(false);
            }
        } catch (error) {
            console.error('Error saving event:', error);
        }
    };

    // Delete event
    const deleteEvent = async (eventId: string) => {
        if (!confirm('Delete this event?')) return;

        try {
            const res = await fetch(`/api/projects/${projectId}/schedule/${eventId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setEvents(prev => prev.filter(e => e.id !== eventId));
                setShowEventModal(false);
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const days = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const today = new Date();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Calendar className="text-yellow-500" />
                        Production Schedule
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Plan and track your production timeline
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => openNewEvent()}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                    >
                        <Plus size={18} />
                        Add Event
                    </button>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                <button
                    onClick={goToPrevMonth}
                    className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"
                >
                    <ChevronLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white">{monthName}</h3>
                <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-white/5">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div
                            key={day}
                            className="p-3 text-center text-sm font-medium text-gray-500"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7">
                    {days.map((day, index) => {
                        const dayEvents = day ? getEventsForDay(day) : [];
                        const isToday = day?.toDateString() === today.toDateString();
                        const isCurrentMonth = day?.getMonth() === currentDate.getMonth();

                        return (
                            <div
                                key={index}
                                className={`min-h-[100px] border-r border-b border-white/5 p-2 ${
                                    !day ? 'bg-black/20' : 'hover:bg-white/5 cursor-pointer'
                                }`}
                                onClick={() => day && openNewEvent(day)}
                            >
                                {day && (
                                    <>
                                        <div className={`text-sm font-medium mb-1 ${
                                            isToday
                                                ? 'w-7 h-7 bg-yellow-500 text-black rounded-full flex items-center justify-center'
                                                : isCurrentMonth ? 'text-white' : 'text-gray-600'
                                        }`}>
                                            {day.getDate()}
                                        </div>
                                        <div className="space-y-1">
                                            {dayEvents.slice(0, 3).map((event) => {
                                                const config = EVENT_TYPES[event.type];
                                                return (
                                                    <button
                                                        key={event.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditEvent(event);
                                                        }}
                                                        className={`w-full text-left text-xs px-2 py-1 rounded truncate ${config.color} text-white`}
                                                    >
                                                        {event.title}
                                                    </button>
                                                );
                                            })}
                                            {dayEvents.length > 3 && (
                                                <p className="text-xs text-gray-500 pl-2">
                                                    +{dayEvents.length - 3} more
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Event Legend */}
            <div className="flex items-center gap-4 justify-center">
                {Object.entries(EVENT_TYPES).map(([type, config]) => (
                    <div key={type} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${config.color}`} />
                        <span className="text-xs text-gray-500">{config.label}</span>
                    </div>
                ))}
            </div>

            {/* Event Modal */}
            {showEventModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-lg font-bold text-white">
                                {selectedEvent ? 'Edit Event' : 'New Event'}
                            </h3>
                            <button
                                onClick={() => setShowEventModal(false)}
                                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                    placeholder="Event title"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Type</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {Object.entries(EVENT_TYPES).map(([type, config]) => {
                                        const Icon = config.icon;
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => setEventForm({ ...eventForm, type: type as any })}
                                                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors ${
                                                    eventForm.type === type
                                                        ? 'border-yellow-500 bg-yellow-500/10'
                                                        : 'border-white/10 hover:border-white/20'
                                                }`}
                                            >
                                                <Icon size={18} className={eventForm.type === type ? 'text-yellow-500' : 'text-gray-400'} />
                                                <span className="text-xs text-gray-400">{config.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={eventForm.start_date}
                                        onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={eventForm.end_date}
                                        onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Start Time</label>
                                    <input
                                        type="time"
                                        value={eventForm.start_time}
                                        onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">End Time</label>
                                    <input
                                        type="time"
                                        value={eventForm.end_time}
                                        onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Location</label>
                                <input
                                    type="text"
                                    value={eventForm.location}
                                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                                    placeholder="Event location"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={eventForm.description}
                                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                    placeholder="Event details..."
                                    rows={3}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex items-center justify-between">
                            {selectedEvent ? (
                                <button
                                    onClick={() => deleteEvent(selectedEvent.id)}
                                    className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                                >
                                    <Trash2 size={18} />
                                    Delete
                                </button>
                            ) : (
                                <div />
                            )}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowEventModal(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveEvent}
                                    disabled={!eventForm.title.trim() || !eventForm.start_date}
                                    className="flex items-center gap-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                                >
                                    <Check size={18} />
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
