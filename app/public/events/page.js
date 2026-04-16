import Link from "next/link";
import { getPublicEvents } from "@/services/eventService";

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

export default async function PublicEventsPage() {
    const events = await getPublicEvents();
    const today = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });


    return (
        <div className="  from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-10">
            <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <section className="mb-10 rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-950 dark:text-white">Campus Events</h1>
                            <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
                                Discover and join upcoming campus events
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                        >
                            ← Back Home
                        </Link>
                    </div>
                </section>

                {/* Events Grid */}
                {events.length === 0 ? (
                    <div className="rounded-3xl bg-white p-12 text-center shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                        <p className="text-lg text-slate-600 dark:text-slate-300">
                            No public events available at this time. Check back soon!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {events
                            .filter((event) => Date.parse(event.date) >= Date.parse(today))
                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                            .map((event) => (
                            <div
                                key={event._id}
                                className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200 transition hover:shadow-lg dark:bg-slate-900 dark:ring-slate-700"
                            >
                                {/* Event Date Badge */}
                                <div className="mb-4 inline-flex rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                    {formatDate(event.date)}
                                </div>

                                {/* Event Title */}
                                <h3 className="text-xl font-bold text-slate-950 dark:text-white line-clamp-2">
                                    {event.name || "Untitled Event"}
                                </h3>

                                {/* Event Details */}
                                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                    {event.location && (
                                        <p>
                                            <span className="font-semibold text-slate-900 dark:text-white">Location:</span>{" "}
                                            {event.location}
                                        </p>
                                    )}
                                    {event.date && (
                                        <p>
                                            <span className="font-semibold text-slate-900 dark:text-white">Time:</span>{" "}
                                            {formatTime(event.date)}
                                        </p>
                                    )}
                                    {event.club && (
                                        <p>
                                            <span className="font-semibold text-slate-900 dark:text-white">Club:</span>{" "}
                                            {event.club}
                                        </p>
                                    )}
                                </div>

                                {/* Event Description */}
                                {event.description && (
                                    <p className="mt-4 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                                        {event.description}
                                    </p>
                                )}

                               
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Info */}
                <div className="mt-10 rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-6">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                        <span className="font-semibold">ℹ️ Note:</span> Sign in to your account to register for events and see more details.
                    </p>
                </div>
            </main>
        </div>
    );
}
