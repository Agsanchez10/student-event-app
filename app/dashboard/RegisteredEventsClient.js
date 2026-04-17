"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { unregisterFromEventAction } from "@/app/actions/eventActions";

const ITEMS_PER_PAGE = 3;

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

export default function RegisteredEventsClient({ registeredEvents, eventPage, clubPage, currentUser }) {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [unregisteringEvent, setUnregisteringEvent] = useState(null);
    const eventPageStart = (eventPage - 1) * ITEMS_PER_PAGE;
    const studentEventPages = Math.max(1, Math.ceil(registeredEvents.length / ITEMS_PER_PAGE));

    const router = useRouter();

    const handleUnregister = async (event) => {
        if(!currentUser) return;

        const confirmed = window.confirm(`Are you sure you want to unregister from "${event.name}"?`);
        if (!confirmed) return;

        setUnregisteringEvent(event._id);

        try {
            const response = await unregisterFromEventAction(event._id, currentUser._id);
            if (response.success) {
                router.refresh();
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
        <div className="relative rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-semibold text-slate-950">Registered events</h2>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Showing {Math.min(ITEMS_PER_PAGE, registeredEvents.length)} of {registeredEvents.length} events you are registered for:</p>
                                </div>
                                <Link href="/dashboard/registeredEvents" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200">View all registered events</Link>
                            </div>
                            
                            {registeredEvents.length === 0 ? (
                                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">You are not registered for any events yet.</div>
                            ) : (
                                <>
                                    <div className="mt-6 space-y-4">
                                        {registeredEvents.slice(eventPageStart, eventPageStart + ITEMS_PER_PAGE).map((event) => (
                                            <div key={event._id} className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-md shadow-[#b9955d]/10">
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{event.name || "Untitled Event"}</h3>
                                                    <p>
                                                        {event.location ? (<>
                                                           📍 Location: {event.location}
                                                        </>) : "Location TBD"}
                                                    </p>
                                                    </div>
                                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{event.description || "No description provided."}</p>
                                                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                                                
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedEvent(event)}
                                                        className="inline-flex items-center justify-center rounded-full bg-[#e05c5c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"                                      >
                                                        View details
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleUnregister(event)}
                                                        className="inline-flex items-center justify-center rounded-full bg-gray-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-gray-500"                                      >
                                                        Unregister
                                                    </button>
                                                    </div>
                                                    
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                                                    <span>📅 {formatDate(event.date)}</span>
                                                    <span>🕒 {formatTime(event.date)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {studentEventPages > 1 ? (
                                        <div className="mt-6 flex items-center justify-between rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-4 text-sm text-slate-700">
                                            <Link
                                                href={`/dashboard?eventPage=${Math.max(1, eventPage - 1)}&clubPage=${clubPage}`}
                                                className={`rounded-full px-4 py-2 transition ${eventPage === 1 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"}`}
                                            >
                                                Previous
                                            </Link>
                                            <span>Page {eventPage} of {studentEventPages}</span>
                                            <Link
                                                href={`/dashboard?eventPage=${Math.min(studentEventPages, eventPage + 1)}&clubPage=${clubPage}`}
                                                className={`rounded-full px-4 py-2 transition ${eventPage === studentEventPages ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"}`}
                                            >
                                                Next
                                            </Link>
                                        </div>
                                    ) : null}
                                </>
                            )}
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
                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">Event details</p>
                                <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{selectedEvent.name || "Untitled Event"}</h2>
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
    )};