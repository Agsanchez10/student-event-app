import Link from "next/link";
import { getPublicEvents } from "@/services/eventService";

const ITEMS_PER_PAGE = 6;

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

export default async function PublicEventsPage({ searchParams }) {
    const events = await getPublicEvents();
    const today = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }); 
    const upcomingEvents = events.filter((event) => new Date(event.date) >= new Date(today));
    
    const currentPage = Number((await searchParams)?.eventPage) || 1;
    const eventPageStart = (currentPage - 1) * ITEMS_PER_PAGE;
    const totalPages = Math.max(1, Math.ceil(upcomingEvents.length / ITEMS_PER_PAGE));



    return (
        <div className="  from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-10">
            <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <section className="mb-10 rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-950 dark:text-white">Public Campus Events</h1>
                            <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
                                Browse Public Events happening around campus. Sign in to register and see more details!
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
                {upcomingEvents.length === 0 ? (
                    <div className="rounded-3xl bg-white p-12 text-center shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                        <p className="text-lg text-slate-600 dark:text-slate-300">
                            No public events available at this time. Check back soon!
                        </p>
                    </div>
                ) : (
                    <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {upcomingEvents.slice(eventPageStart, eventPageStart + ITEMS_PER_PAGE)
                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                            .map((upcomingEvents) => (
                            <div
                                key={upcomingEvents._id}
                                className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200 transition hover:shadow-lg dark:bg-slate-900 dark:ring-slate-700"
                            >
                                {/* Event Date Badge */}
                                <div className="mb-4 inline-flex rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                    {formatDate(upcomingEvents.date)}
                                </div>

                                {/* Event Title */}
                                <h3 className="text-xl font-bold text-slate-950 dark:text-white line-clamp-2">
                                    {upcomingEvents.name || "Untitled Event"}
                                </h3>

                                {/* Event Details */}
                                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                    {upcomingEvents.location && (
                                        <p>
                                            <span className="font-semibold text-slate-900 dark:text-white">Location:</span>{" "}
                                            {upcomingEvents.location}
                                        </p>
                                    )}
                                    {upcomingEvents.date && (
                                        <p>
                                            <span className="font-semibold text-slate-900 dark:text-white">Time:</span>{" "}
                                            {formatTime(upcomingEvents.date)}
                                        </p>
                                    )}
                                    {upcomingEvents.club && (
                                        <p>
                                            <span className="font-semibold text-slate-900 dark:text-white">Club:</span>{" "}
                                            {upcomingEvents.club}
                                        </p>
                                    )}
                                </div>

                                {/* Event Description */}
                                {upcomingEvents.description && (
                                    <p className="mt-4 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                                        {upcomingEvents.description}
                                    </p>
                                )}                               
                            </div>
                        ))}
                    </div>

                  
                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center space-x-2">
                            <Link  
                                href={`/public/events?eventPage=${Math.max(1, currentPage - 1)}`}
                                className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                                    currentPage === 1 ? "cursor-not-allowed bg-gray-300 text-gray-500" : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                                }`}
                            >
                                Previous
                            </Link>
                            <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
                            <Link
                                href={`/public/events?eventPage=${Math.min(totalPages, currentPage + 1)}`}
                                className={`rounded-md px-3 py-1 text-sm font-medium transition ${currentPage === totalPages ? "cursor-not-allowed bg-gray-300 text-gray-500" : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                                }`}                  
                            >
                                Next
                            </Link>
                        </div>
                    )}                   
                </>
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
