"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export default function StudentDashboardClient({ user, clubs }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredClubs = useMemo(() => {
        return clubs.filter((club) => {
            const matchesSearch = 
                club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesSearch;
        });
    }, [clubs, searchTerm]);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] py-10">
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-semibold text-slate-950">Welcome, {user.firstName}!</h1>
                        <p className="mt-2 text-slate-700">Manage your clubs and explore events.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center rounded-3xl border border-[#d4b18b] bg-[#fff5e4] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-[#c1a06e] hover:bg-[#f8e7ce]"
                        >
                            ← Back to dashboard
                        </Link>
                        <Link
                            href="/dashboard/clubs"
                            className="rounded-full bg-[#d4b18b] text-white px-6 py-3 font-semibold transition hover:bg-[#c8a882]"
                        >
                            🔍 Find Clubs
                        </Link>
                    </div>
                </div>

                {/* My Clubs Section */}
                <div className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-950">My Clubs</h2>
                            <p className="mt-2 text-slate-700">Clubs you are a member of</p>
                        </div>
                        <div className="text-sm text-slate-600">
                            {filteredClubs.length} of {clubs.length} clubs
                        </div>
                    </div>

                    {/* Search Box */}
                    {clubs.length > 0 && (
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search clubs by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-[1.2rem] border border-[#d4b18b]/40 bg-white px-4 py-3 text-slate-950 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c]/50"
                            />
                        </div>
                    )}

                    {clubs.length === 0 ? (
                        <div className="mt-6 rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 text-center text-slate-700">
                            <p className="mb-4">You are not a member of any clubs yet.</p>
                            <Link href="/dashboard/clubs" className="inline-block rounded-full bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]">
                                Explore Clubs
                            </Link>
                        </div>
                    ) : filteredClubs.length === 0 ? (
                        <div className="mt-6 rounded-[1.8rem] border border-dashed border-[#d4b18b] bg-[#fff5e4] p-12 text-center text-slate-700">
                            <p>No clubs match your search.</p>
                        </div>
                    ) : (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredClubs.map((club) => (
                                <Link
                                    key={club._id}
                                    href={`/dashboard/clubs/${club._id}`}
                                    className="group rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-md shadow-[#b9955d]/10 transition hover:bg-[#f8e7ce] hover:border-[#d4b18b]/60 hover:shadow-md hover:shadow-[#b9955d]/20"
                                >
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold text-slate-950 group-hover:text-[#a33b3b] transition">
                                            {club.name}
                                        </h3>
                                        <p className="text-sm text-slate-700 line-clamp-2">
                                            {club.description || "No description available"}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-[#e05c5c]">
                                            View Club
                                            <span className="transition group-hover:translate-x-1">→</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
