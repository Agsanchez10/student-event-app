"use client";

import Link from "next/link";

export default function ClubDetailsClient({
    club,
    clubAnnouncements,
    clubEvents,
    isAdmin,
    ownerNameCache,
    setSelectedEvent,
    handleOpenFlagForm,
    formatDate,
}) {
    return (
        <div className="space-y-8">
            {/* Info Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <button
                    onClick={() => {
                        // Navigate to announcements tab through parent
                        window.dispatchEvent(new CustomEvent("switchTab", { detail: "announcements" }));
                    }}
                    className="relative rounded-[1.8rem] border border-[#c8884a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10 transition hover:shadow-lg hover:shadow-[#b9955d]/20 hover:border-[#c8884a]/50 cursor-pointer"
                >
                    <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">📢 Announcements</p>
                    <p className="mt-4 text-2xl font-semibold text-slate-950">{clubAnnouncements.length}</p>
                    <p className="mt-2 text-xs text-slate-600">Click to view all</p>
                </button>

                <button
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent("switchTab", { detail: "events" }));
                    }}
                    className="relative rounded-[1.8rem] border border-[#d4975a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10 transition hover:shadow-lg hover:shadow-[#b9955d]/20 hover:border-[#d4975a]/50 cursor-pointer"
                >
                    <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">📅 Events</p>
                    <p className="mt-4 text-2xl font-semibold text-slate-950">{clubEvents.length}</p>
                    <p className="mt-2 text-xs text-slate-600">Click to view all</p>
                </button>

                <button
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent("switchTab", { detail: "community" }));
                    }}
                    className="relative rounded-[1.8rem] border border-[#d4975a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10 transition hover:shadow-lg hover:shadow-[#b9955d]/20 hover:border-[#d4975a]/50 cursor-pointer"
                >
                    <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">👥 Community</p>
                    <p className="mt-4 text-2xl font-semibold text-slate-950">{club.memberList?.length || 0}</p>
                    <p className="mt-2 text-xs text-slate-600">Click to view members</p>
                </button>
            </div>

            {/* Recent Announcements Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-slate-950">Recent Announcements</h2>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent("switchTab", { detail: "announcements" }));
                            }}
                            className="text-sm font-semibold text-[#e05c5c] hover:text-[#c94a4a]"
                        >
                            Manage →
                        </button>
                    )}
                </div>
                
                {clubAnnouncements.length > 0 ? (
                    <div className="space-y-4">
                        {clubAnnouncements.slice(0, 3).map((announcement) => {
                            const relatedEvent = announcement.eventId ? clubEvents.find(e => String(e._id) === String(announcement.eventId)) : null;
                            return (
                            <div
                                key={announcement._id}
                                className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-md shadow-[#b9955d]/10"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-slate-950">
                                            {announcement.title}
                                        </h3>
                                        <p className="mt-2 text-slate-700">
                                            {announcement.description}
                                        </p>
                                        {relatedEvent && (
                                            <button
                                                onClick={() => setSelectedEvent(relatedEvent)}
                                                className="mt-3 w-full rounded-lg border border-[#e05c5c]/30 bg-[#e05c5c]/5 p-3 text-left transition hover:bg-[#e05c5c]/10 hover:border-[#e05c5c]/50 cursor-pointer"
                                            >
                                                <p className="text-sm font-semibold text-[#a33b3b]">📅 Related Event</p>
                                                <p className="mt-1 text-sm font-semibold text-slate-950">{relatedEvent.name}</p>
                                                <p className="mt-1 text-xs text-slate-600">
                                                    {formatDate(relatedEvent.date)}
                                                </p>
                                                {relatedEvent.location && (
                                                    <p className="mt-1 text-xs text-slate-600">
                                                        📍 {relatedEvent.location}
                                                    </p>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <div className="text-right whitespace-nowrap">
                                        <p className="text-xs font-semibold text-slate-600">
                                            {ownerNameCache[announcement.ownerId] || "Unknown"}
                                        </p>
                                        <p className="mt-2 text-xs text-slate-500">
                                            {formatDate(announcement.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                        {clubAnnouncements.length > 3 && (
                            <button
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent("switchTab", { detail: "announcements" }));
                                }}
                                className="text-sm font-semibold text-[#e05c5c] hover:text-[#c94a4a]"
                            >
                                View all announcements →
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 text-center">
                        <p className="text-slate-700">No announcements yet.</p>
                        {isAdmin && (
                            <button
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent("switchTab", { detail: "announcements" }));
                                }}
                                className="mt-3 text-sm font-semibold text-[#e05c5c] hover:text-[#c94a4a]"
                            >
                                Post the first announcement →
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
