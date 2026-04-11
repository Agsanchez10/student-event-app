"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

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

const formatDateToISO = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Returns YYYY-MM-DD
};

export default function RegisteredEventsListClient({ registeredEvents, currentUser }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [sortBy, setSortBy] = useState("date"); // "date", "name"
    const [unregisteringEvent, setUnregisteringEvent] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [page, setPage] = useState(1);
    const router = useRouter();

    // Filter events
    const filteredEvents = registeredEvents.filter((event) => {
        const matchesSearch =
            event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesDate = !dateFilter || formatDateToISO(event.date) === dateFilter;

        console.log("Filtering event:", event.name, "Matches search:", matchesSearch, "Matches date:", formatDate(event.date), "Date filter:", dateFilter, "Matches date filter:", matchesDate);

        return matchesSearch && matchesDate;
    });

    // Sort events
    const sortedEvents = [...filteredEvents].sort((a, b) => {
        if (sortBy === "name") {
            return (a.name || "").localeCompare(b.name || "");
        }
        // date
        return new Date(a.date || 0) - new Date(b.date || 0);
    });

    // Pagination
    const pageStart = (page - 1) * ITEMS_PER_PAGE;
    const paginatedEvents = sortedEvents.slice(pageStart, pageStart + ITEMS_PER_PAGE);
    const totalPages = Math.max(1, Math.ceil(sortedEvents.length / ITEMS_PER_PAGE));

    const handleUnregister = async (event) => {
        if (!currentUser) return;

        const confirmed = window.confirm(
            `Are you sure you want to unregister from "${event.name}"?`
        );
        if (!confirmed) return;

        setUnregisteringEvent(event._id);

        try {
            const response = await fetch(`/api/events/${event._id}/register`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                router.refresh();
                setSelectedEvent(null);
            } else {
                alert("Failed to unregister from the event. Please try again.");
            }
        } catch (error) {
            console.error("Error unregistering from event:", error);
            alert("An error occurred while unregistering from the event. Please try again.");
        } finally {
            setUnregisteringEvent(null);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] py-10 text-slate-900">
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-semibold text-slate-950">Your Registered Events</h1>
                            <p className="mt-2 text-slate-700">View and manage all events you are registered for</p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="text-sm font-semibold text-[#e05c5c] hover:text-[#c94a4a] transition"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>

                    {/* Search and Filters */}
                    <div className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-6 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
                        <div className="space-y-4">
                            {/* Search */}
                            <input
                                type="text"
                                placeholder="Search by event name, description, or location..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full rounded-[1.2rem] border border-[#d4b18b]/40 bg-white px-4 py-3 text-slate-950 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c]/50"
                            />

                            {/* Filters Row */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                {/* Date Filter */}
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-[#8a5f3a] mb-1 uppercase">
                                        Filter by Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateFilter}
                                        onChange={(e) => {
                                            setDateFilter(e.target.value);
                                            setPage(1);
                                        }}
                                        className="w-full rounded-[1.2rem] border border-[#d4b18b]/40 bg-white px-4 py-2 text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#e05c5c]/50"
                                    />
                                </div>

                                {/* Sort */}
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-[#8a5f3a] mb-1 uppercase">
                                        Sort By
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => {
                                            setSortBy(e.target.value);
                                            setPage(1);
                                        }}
                                        className="w-full rounded-[1.2rem] border border-[#d4b18b]/40 bg-white px-4 py-2 text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#e05c5c]/50"
                                    >
                                        <option value="date">Date (Earliest First)</option>
                                        <option value="name">Name (A-Z)</option>
                                    </select>
                                </div>

                                {/* Clear Filters */}
                                {(searchTerm || dateFilter) && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm("");
                                            setDateFilter("");
                                            setPage(1);
                                        }}
                                        className="rounded-[1.2rem] bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-400"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {registeredEvents.length === 0 ? (
                    <div className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-8 text-center text-slate-700">
                        <p className="text-lg">You are not registered for any events yet.</p>
                        <Link
                            href="/dashboard/events"
                            className="mt-4 inline-block rounded-full bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
                        >
                            Browse all events
                        </Link>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-8 text-center text-slate-700">
                        <p className="text-lg">No events match your search criteria.</p>
                    </div>
                ) : (
                    <>
                        {/* Events List */}
                        <div className="space-y-4">
                            {paginatedEvents.map((event) => (
                                <div
                                    key={event._id}
                                    className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-md shadow-[#b9955d]/10"
                                >
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-slate-950">
                                                    {event.name || "Untitled Event"}
                                                </h3>
                                                <p className="mt-2 text-sm text-slate-700">
                                                    {event.description || "No description provided."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Event Details */}
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm text-slate-600 border-t border-[#d4b18b]/40 pt-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide font-semibold text-[#8a5f3a]">Date</p>
                                                <p className="mt-1">{formatDate(event.date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide font-semibold text-[#8a5f3a]">Time</p>
                                                <p className="mt-1">{formatTime(event.date)}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-2">
                                                <p className="text-xs uppercase tracking-wide font-semibold text-[#8a5f3a]">Location</p>
                                                <p className="mt-1">{event.location || "TBD"}</p>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => setSelectedEvent(event)}
                                            className="w-full sm:w-auto rounded-full bg-[#e05c5c] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-between rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-4">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className={`rounded-full px-4 py-2 font-semibold transition ${
                                        page === 1
                                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                            : "bg-[#e05c5c] text-white hover:bg-[#c94a4a]"
                                    }`}
                                >
                                    Previous
                                </button>
                                <span className="font-semibold text-slate-700">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className={`rounded-full px-4 py-2 font-semibold transition ${
                                        page === totalPages
                                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                            : "bg-[#e05c5c] text-white hover:bg-[#c94a4a]"
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Event Details Modal */}
                {selectedEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="rounded-[2rem] bg-white border border-[#d4b18b]/40 p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <h2 className="text-2xl font-semibold text-slate-950 flex-1">
                                    {selectedEvent.name}
                                </h2>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="text-slate-400 hover:text-slate-600 transition text-2xl leading-none"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Event Description */}
                                <div>
                                    <p className="text-xs uppercase tracking-wide font-semibold text-[#8a5f3a]">Description</p>
                                    <p className="mt-2 text-slate-700">
                                        {selectedEvent.description || "No description provided."}
                                    </p>
                                </div>

                                {/* Event Details Grid */}
                                <div className="grid grid-cols-2 gap-4 border-t border-[#d4b18b]/40 pt-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide font-semibold text-[#8a5f3a]">Date</p>
                                        <p className="mt-1 text-slate-700">{formatDate(selectedEvent.date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide font-semibold text-[#8a5f3a]">Time</p>
                                        <p className="mt-1 text-slate-700">{formatTime(selectedEvent.date)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs uppercase tracking-wide font-semibold text-[#8a5f3a]">Location</p>
                                        <p className="mt-1 text-slate-700">{selectedEvent.location || "TBD"}</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3 border-t border-[#d4b18b]/40 pt-4 sm:flex-row">
                                    <button
                                        onClick={() => setSelectedEvent(null)}
                                        className="flex-1 rounded-full bg-slate-200 text-slate-950 px-6 py-3 font-semibold transition hover:bg-slate-300"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => handleUnregister(selectedEvent)}
                                        disabled={unregisteringEvent === selectedEvent._id}
                                        className="flex-1 rounded-full bg-red-500 text-white px-6 py-3 font-semibold transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {unregisteringEvent === selectedEvent._id
                                            ? "Unregistering..."
                                            : "Unregister from Event"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
