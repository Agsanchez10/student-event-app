"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerForEventAction, unregisterFromEventAction } from "@/app/actions/eventActions";

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

const isEventInFuture = (eventDate) => {
    if (!eventDate) return false;
    return new Date(eventDate) > new Date();
};

export default function EventListClient({ events, currentUser }) {
    const ITEMS_PER_PAGE = 21;
    
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [filter, setFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [priceFilter, setPriceFilter] = useState("");
    const [sortBy, setSortBy] = useState("date");
    const [currentPage, setCurrentPage] = useState(1);
    const [registeringEvents, setRegisteringEvents] = useState(new Set());
    const [unregisteringEvents, setUnregisteringEvents] = useState(new Set());
    const router = useRouter();

    const categories = ["music", "tech", "sports", "social", "academic", "arts", "wellness", "gaming", "networking", "professional", "community-service", "fundraising", "other"];

    const filteredEvents = events.filter((event) => {
        // Remove past events
        if (!isEventInFuture(event.date)) return false;

        const matchesText =
            event.name.toLowerCase().includes(filter.toLowerCase()) ||
            event.description.toLowerCase().includes(filter.toLowerCase()) ||
            (event.location && event.location.toLowerCase().includes(filter.toLowerCase()));

        const matchesDate = !dateFilter || formatDateToISO(event.date) === dateFilter;

        const matchesCategory = !categoryFilter || event.category === categoryFilter;

        const matchesPrice = !priceFilter || (priceFilter === "free" ? event.isFree !== false : event.isFree === false);

            
        return matchesText && matchesDate && matchesCategory && matchesPrice;
    }).sort((a, b) => {
        if (sortBy === "date") {
            return new Date(a.date) - new Date(b.date);
        } else if (sortBy === "popularity-desc") {
            return (b.registrationList?.length || 0) - (a.registrationList?.length || 0);
        } else if (sortBy === "popularity-asc") {
            return (a.registrationList?.length || 0) - (b.registrationList?.length || 0);
        }
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;
    const paginatedEvents = filteredEvents.slice(startIdx, endIdx);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, dateFilter, categoryFilter, priceFilter, sortBy]);

    const isUserRegistered = (event) => {
        if (!currentUser || !event.registrationList) return false;
        return event.registrationList.some(id => String(id) === String(currentUser._id));
    };

    const handleRegister = async (eventId) => {
        if (!currentUser) return;

        setRegisteringEvents(prev => new Set(prev).add(eventId));

        try {
            const response = await registerForEventAction(eventId, currentUser._id);
            if (response.success) {
                router.refresh();
            } else {
                alert(`Registration failed: ${response.error}`);
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

    const handleUnregister = async (eventId) => {
        if (!currentUser) return;

        const confirmed = window.confirm('Are you sure you want to unregister from this event?');
        if (!confirmed) return;

        setUnregisteringEvents(prev => new Set(prev).add(eventId));

        try {
            const response = await unregisterFromEventAction(eventId);
            if (response.success) {
                router.refresh();
            } else {
                alert(`Unregistration failed: ${response.error}`);
            }
        } catch (error) {
            alert('An error occurred while unregistering from the event');
        } finally {
            setUnregisteringEvents(prev => {
                const newSet = new Set(prev);
                newSet.delete(eventId);
                return newSet;
            });
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] py-10 text-slate-900">
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-950">Events Bulletin Board</h1>
                        <p className="mt-2 text-sm text-slate-600">Browse all events pinned like notes on a bulletin board.</p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center rounded-3xl border border-[#d4b18b] bg-[#fff5e4] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-[#c1a06e] hover:bg-[#f8e7ce] whitespace-nowrap"
                    >
                        ← Back to dashboard
                    </Link>
                </div>
                <div className="mb-8 rounded-3xl border border-[#d4b18b]/40 bg-[#fff5e4] p-8 shadow-sm ring-1 ring-[#d4b18b]/20">
                    <div className="mt-6 space-y-4">
                        <input
                            type="text"
                            placeholder="Search events by name, description, or location..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-200 dark:focus:ring-slate-700"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label htmlFor="date-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Filter by date
                                </label>
                                <input
                                    id="date-filter"
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-200 dark:focus:ring-slate-700"
                                />
                            </div>
                            <div>
                                <label htmlFor="category-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Filter by category
                                </label>
                                <select
                                    id="category-filter"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-200 dark:focus:ring-slate-700"
                                >
                                    <option value="">All categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="price-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Filter by price
                                </label>
                                <select
                                    id="price-filter"
                                    value={priceFilter}
                                    onChange={(e) => setPriceFilter(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-200 dark:focus:ring-slate-700"
                                >
                                    <option value="">All events</option>
                                    <option value="free">Free</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="sort-by" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Sort by
                                </label>
                                <select
                                    id="sort-by"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-200 dark:focus:ring-slate-700"
                                >
                                    <option value="date">Date (earliest first)</option>
                                    <option value="popularity-desc">Most popular</option>
                                    <option value="popularity-asc">Least popular</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedEvents.length > 0 ? (
                        paginatedEvents.map((event, index) => (
                            <div
                                key={event._id}
                                className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff7e4] p-6 shadow-lg shadow-[#b08f6c]/10 transition hover:scale-105 hover:shadow-2xl"
                            >
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-950">{event.name || "Untitled Event"}</h2>
                                        <p className="mt-2 text-sm leading-5 text-slate-700">{truncate(event.description)}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 text-xs text-[#8a5f3a]">
                                        <div className="flex flex-wrap gap-2">
                                            {event.category && (
                                                <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700 font-medium">
                                                    {event.category.charAt(0).toUpperCase() + event.category.slice(1).replace("-", " ")}
                                                </span>
                                            )}
                                            <span className={`rounded-full px-2 py-1 font-medium ${
                                                event.isFree !== false ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                            }`}>
                                                {event.isFree !== false ? "Free" : `Paid - $${event.price}`}
                                            </span>
                                            <span className="rounded-full bg-purple-100 px-2 py-1 text-purple-700 font-medium">
                                                {event.registrationList?.length || 0} registered
                                            </span>
                                        </div>
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
                                            <button
                                                type="button"
                                                onClick={() => handleUnregister(event._id)}
                                                disabled={unregisteringEvents.has(event._id)}
                                                className="inline-flex items-center justify-center rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {unregisteringEvents.has(event._id) ? 'Unregistering...' : '✓ Registered - Click to unregister'}
                                            </button>
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

                {/* Pagination Controls */}
                {filteredEvents.length > ITEMS_PER_PAGE && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ← Previous
                        </button>

                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                                            currentPage === pageNum
                                                ? "bg-slate-900 text-white"
                                                : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next →
                        </button>

                        <span className="ml-4 text-sm text-slate-600">
                            Page {currentPage} of {totalPages} ({filteredEvents.length} total)
                        </span>
                    </div>
                )}
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
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Category</p>
                                    <p className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                                        {selectedEvent.category?.charAt(0).toUpperCase() + selectedEvent.category?.slice(1).replace(/-/g, " ") || "Uncategorized"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Price</p>
                                    <p className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                                        selectedEvent.isFree !== false ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
                                    }`}>
                                        {selectedEvent.isFree !== false ? "Free" : `$${selectedEvent.price}`}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Description</p>
                                <p className="mt-2 text-base leading-7 text-slate-700 dark:text-slate-300">{selectedEvent.description || "No description available."}</p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                    <p className="font-semibold text-slate-900 dark:text-white">Location</p>
                                    <p className="mt-2">{selectedEvent.location || "Location TBD"}</p>
                                </div>
                                <div className="rounded-3xl bg-purple-50 p-5 text-sm text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                    <p className="font-semibold text-purple-900 dark:text-purple-100">Registrations</p>
                                    <p className="mt-2 text-lg font-bold text-purple-900 dark:text-purple-100">{selectedEvent.registrationList?.length || 0}</p>
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
