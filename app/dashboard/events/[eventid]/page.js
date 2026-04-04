import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent } from "@/services/eventService";

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

export default async function EventDetails({ params }) {
    let event;

    try {
        event = await getEvent(params.eventid);
    } catch (error) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
            <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl bg-white/90 px-6 py-6 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900/90 dark:ring-slate-700">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">Event details</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{event.name || "Untitled Event"}</h1>
                    </div>
                    <Link href="/dashboard/events" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200">
                        Back to events
                    </Link>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Date</p>
                            <p className="mt-2 text-lg font-medium text-slate-950 dark:text-white">{formatDate(event.date)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Time</p>
                            <p className="mt-2 text-lg font-medium text-slate-950 dark:text-white">{formatTime(event.date)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Location</p>
                            <p className="mt-2 text-lg font-medium text-slate-950 dark:text-white">{event.location || "TBD"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Club</p>
                            <p className="mt-2 text-lg font-medium text-slate-950 dark:text-white">{event.club || "Student event"}</p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Description</p>
                            <p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-300">{event.description || "No description available for this event."}</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                <p className="font-semibold text-slate-900 dark:text-white">Event ID</p>
                                <p className="mt-2">{event._id}</p>
                            </div>
                            <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                <p className="font-semibold text-slate-900 dark:text-white">Created</p>
                                <p className="mt-2">{formatDate(event.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
