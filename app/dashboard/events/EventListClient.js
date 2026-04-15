"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const formatDate = (value) => {
    if (!value) return "TBD";
    return new Date(value).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

const formatTime = (value) => {
    if (!value) return "TBD";
    return new Date(value).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
};

const truncate = (text, length = 140) => {
    if (!text) return "No description available.";
    return text.length > length ? `${text.slice(0, length)}...` : text;
};

const formatDateToISO = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

export default function EventListClient({ events, currentUser }) {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [filter, setFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [registeringEvents, setRegisteringEvents] = useState(new Set());
    const router = useRouter();

    const filteredEvents = events.filter((event) => {
        const matchesText =
            event.name.toLowerCase().includes(filter.toLowerCase()) ||
            event.description.toLowerCase().includes(filter.toLowerCase()) ||
            (event.location && event.location.toLowerCase().includes(filter.toLowerCase()));

        const matchesDate = !dateFilter || formatDateToISO(event.date) === dateFilter;

        return matchesText && matchesDate;
    });

    const isUserRegistered = (event) => {
        if (!currentUser || !event.registrationList) return false;
        return event.registrationList.some(id => String(id) === String(currentUser._id));
    };

    const handleRegister = async (eventId) => {
        if (!currentUser) return;

        setRegisteringEvents(prev => new Set(prev).add(eventId));

        try {
            const response = await fetch(`/api/events/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',                    
                },
                body: JSON.stringify({ studentId: currentUser._id }),

            });

            if (response.ok) {
                router.refresh();
            } else {
                const error = await response.json();
                alert(`Registration failed: ${error.error}`);
            }
        } catch (error) {
            alert('An error occurred while registering for the event');
        } finally {
            setRegisteringEvents(prev => {
                const newSet = new Set(prev);
                newSet.delete(eventId);
                return newSet;
            });
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] py-10 text-slate-900">
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 rounded-3xl border border-[#d4b18b]/40 bg-[#fff5e4] p-8 shadow-sm ring-1 ring-[#d4b18b]/20">
                    <h1 className="text-3xl font-semibold text-slate-950">Events Bulletin Board</h1>
                    <p className="mt-3 text-sm text-[#a33b3b]">Browse all events pinned like notes on a bulletin board.</p>
                    <div className="mt-6">
                        <input
                            type="text"
                            placeholder="Search events by name, description, or location..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-200 dark:focus:ring-slate-700"
                        />
                        <div className="mt-4">
                            <label htmlFor="date-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Filter by date (optional)
                            </label>
                            <input
                                id="date-filter"
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-200 dark:focus:ring-slate-700"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event, index) => (
                            <div
                                key={event._id}
                                className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff7e4] p-6 shadow-lg shadow-[#b08f6c]/10 transition hover:scale-105 hover:shadow-2xl"
                            >
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-950">{event.name || "Untitled Event"}</h2>
                                        <p className="mt-2 text-sm leading-5 text-slate-700">{truncate(event.description)}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 text-xs text-[#8a5f3a]">
                                        <span>📅 {formatDate(event.date)}</span>
                                        <span>🕒 {formatTime(event.date)}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedEvent(event)}
                                            className="inline-flex items-center justify-center rounded-full bg-[#e05c5c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
                                        >
                                            View details
                                        </button>
                                        {currentUser && !isUserRegistered(event) && (
                                            <button
                                                type="button"
                                                onClick={() => handleRegister(event._id)}
                                                disabled={registeringEvents.has(event._id)}
                                                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {registeringEvents.has(event._id) ? 'Registering...' : 'Register for event'}
                                            </button>
                                        )}
                                        {currentUser && isUserRegistered(event) && (
                                            <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                                                ✓ Registered
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : events.length > 0 ? (
                        <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                            No events match your search.
                        </div>
                    ) : (
                        <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                            No events available yet.
                        </div>
                    )
                }
                </div>
            </main>

            {selectedEvent ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
                    onClick={() => setSelectedEvent(null)}
                >
                    <div
                        className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-700"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
                                    Event details
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                                    {selectedEvent.name || "Untitled Event"}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedEvent(null)}
                                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                            >
                                Close
                            </button>
                        </div>
                        <div className="space-y-6 px-6 py-6 sm:px-8">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Date</p>
                                    <p className="mt-2 text-lg font-medium text-slate-950 dark:text-white">{formatDate(selectedEvent.date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Time</p>
                                    <p className="mt-2 text-lg font-medium text-slate-950 dark:text-white">{formatTime(selectedEvent.date)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Description</p>
                                <p className="mt-2 text-base leading-7 text-slate-700 dark:text-slate-300">{selectedEvent.description || "No description available."}</p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                    <p className="font-semibold text-slate-900 dark:text-white">Location</p>
                                    <p className="mt-2">{selectedEvent.location || "Location TBD"}</p>
                                </div>
                                <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                    <p className="font-semibold text-slate-900 dark:text-white">Event ID</p>
                                    <p className="mt-2">{selectedEvent._id}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
