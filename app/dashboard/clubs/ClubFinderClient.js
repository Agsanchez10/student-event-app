"use client";

import { useState } from "react";
import Link from "next/link";

export default function ClubFinderClient({
    clubs,
    user,
    userMemberships,
    appliedClubIds,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPrivate, setFilterPrivate] = useState(null); // null = all, true = private, false = public
    const [loadingClubId, setLoadingClubId] = useState(null);
    const [selectedClub, setSelectedClub] = useState(null);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [applicationMessage, setApplicationMessage] = useState("");

    // Filter clubs based on search and privacy filter
    const filteredClubs = clubs.filter((club) => {
        const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            club.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterPrivate === null || club.isPrivate === filterPrivate;
        return matchesSearch && matchesFilter;
    });

    // Handle joining public club
    const handleJoinPublicClub = async (clubId) => {
        setLoadingClubId(clubId);
        try {
            const response = await fetch(`/api/clubs/${clubId}/join`, {
                method: "POST",
            });

            if (response.ok) {
                alert("Successfully joined the club!");
                window.location.reload();
            } else {
                const error = await response.json();
                alert(error.error || "Failed to join club");
            }
        } catch (error) {
            console.error("Error joining club:", error);
            alert("Error joining club");
        } finally {
            setLoadingClubId(null);
        }
    };


    


    // Handle applying for private club
    const handleApplyForClub = (club) => {
        setSelectedClub(club);
        setShowApplicationForm(true);
        setApplicationMessage("");
    };

    // Handle submit application
    const handleSubmitApplication = async (e) => {
        e.preventDefault();

        if (!applicationMessage.trim()) {
            alert("Please enter a message for your application");
            return;
        }

        setLoadingClubId(selectedClub._id);
        try {
            const response = await fetch(`/api/clubs/${selectedClub._id}/membership-applications`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: applicationMessage,
                }),
            });

            if (response.ok) {
                alert("Application submitted successfully! Please wait for club approval.");
                setShowApplicationForm(false);
                setApplicationMessage("");
                window.location.reload();
            } else {
                const error = await response.json();
                alert(error.error || "Failed to submit application");
            }
        } catch (error) {
            console.error("Error submitting application:", error);
            alert("Error submitting application");
        } finally {
            setLoadingClubId(null);
        }
    };

    const getButtonStatus = (club) => {
        if (userMemberships.includes(club._id)) {
            return { text: "Already a Member", status: "member" };
        }
        if (appliedClubIds.includes(club._id)) {
            return { text: "Application Pending", status: "pending" };
        }
        if (club.isPrivate) {
            return { text: "Request to Join", status: "request" };
        }
        return { text: "Join Club", status: "join" };
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] py-10">
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-semibold text-slate-950">Club Finder</h1>
                            <p className="mt-2 text-slate-700">Explore and join clubs that interest you</p>
                        </div>
                        <Link
                            href="/dashboard/student"
                            className="text-sm font-semibold text-[#e05c5c] hover:text-[#c94a4a] transition"
                        >
                            ← Back
                        </Link>
                    </div>

                    {/* Search and Filters */}
                    <div className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-6 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Search clubs by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-[1.2rem] border border-[#d4b18b]/40 bg-white px-4 py-3 text-slate-950 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c]/50"
                            />

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setFilterPrivate(null)}
                                    className={`rounded-full px-4 py-2 font-semibold transition ${
                                        filterPrivate === null
                                            ? "bg-[#e05c5c] text-white"
                                            : "bg-[#fff5e4] text-slate-950 border border-[#d4b18b]/40 hover:bg-[#f8e7ce]"
                                    }`}
                                >
                                    All Clubs
                                </button>
                                <button
                                    onClick={() => setFilterPrivate(false)}
                                    className={`rounded-full px-4 py-2 font-semibold transition ${
                                        filterPrivate === false
                                            ? "bg-[#e05c5c] text-white"
                                            : "bg-[#fff5e4] text-slate-950 border border-[#d4b18b]/40 hover:bg-[#f8e7ce]"
                                    }`}
                                >
                                    🔓 Public Clubs
                                </button>
                                <button
                                    onClick={() => setFilterPrivate(true)}
                                    className={`rounded-full px-4 py-2 font-semibold transition ${
                                        filterPrivate === true
                                            ? "bg-[#e05c5c] text-white"
                                            : "bg-[#fff5e4] text-slate-950 border border-[#d4b18b]/40 hover:bg-[#f8e7ce]"
                                    }`}
                                >
                                    🔒 Private Clubs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clubs Grid */}
                {filteredClubs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-700 text-lg">No clubs found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredClubs.map((club) => {
                            const buttonStatus = getButtonStatus(club);
                            const isDisabled = buttonStatus.status === "member" || buttonStatus.status === "pending";

                            return (
                                <div
                                    key={club._id}
                                    className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-md shadow-[#b9955d]/10 flex flex-col gap-4"
                                >
                                    {/* Club Header */}
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-lg font-semibold text-slate-950 flex-1">
                                                {club.name}
                                            </h3>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                                                club.isPrivate
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-green-100 text-green-700"
                                            }`}>
                                                {club.isPrivate ? "🔒 Private" : "🔓 Public"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 line-clamp-3">
                                            {club.description || "No description available"}
                                        </p>
                                    </div>

                                    {/* Club Stats */}
                                    <div className="space-y-2 border-t border-[#d4b18b]/40 pt-4 text-sm text-slate-600">
                                        <div>👥 Members: {club.memberList?.length || 0}</div>
                                        <div>📅 Events: {club.eventList?.length || 0}</div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => {
                                            if (buttonStatus.status === "join") {
                                                handleJoinPublicClub(club._id);
                                            } else if (buttonStatus.status === "request") {
                                                handleApplyForClub(club);
                                            }
                                        }}
                                        disabled={isDisabled || loadingClubId === club._id}
                                        className={`rounded-full px-4 py-2 font-semibold transition text-sm ${
                                            isDisabled
                                                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                                : buttonStatus.status === "join"
                                                ? "bg-[#e05c5c] text-white hover:bg-[#c94a4a]"
                                                : buttonStatus.status === "request"
                                                ? "bg-[#d4b18b] text-white hover:bg-[#c8a882]"
                                                : "bg-slate-200 text-slate-600"
                                        }`}
                                    >
                                        {loadingClubId === club._id ? "Processing..." : buttonStatus.text}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Application Modal */}
                {showApplicationForm && selectedClub && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="rounded-[2rem] bg-white border border-[#d4b18b]/40 p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] max-w-md w-full mx-4">
                            <h2 className="text-2xl font-semibold text-slate-950 mb-2">
                                Request to Join
                            </h2>
                            <p className="text-slate-600 mb-6">
                                {selectedClub.name}
                            </p>

                            <form onSubmit={handleSubmitApplication} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-950 mb-2">
                                        Why are you interested in joining this club?
                                    </label>
                                    <textarea
                                        value={applicationMessage}
                                        onChange={(e) => setApplicationMessage(e.target.value)}
                                        placeholder="Tell us why you'd like to join..."
                                        rows={4}
                                        className="w-full rounded-[1.2rem] border border-[#d4b18b]/40 bg-white px-4 py-3 text-slate-950 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c]/50"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowApplicationForm(false);
                                            setApplicationMessage("");
                                        }}
                                        className="flex-1 rounded-full bg-slate-200 text-slate-950 px-4 py-2 font-semibold transition hover:bg-slate-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loadingClubId === selectedClub._id}
                                        className="flex-1 rounded-full bg-[#e05c5c] text-white px-4 py-2 font-semibold transition hover:bg-[#c94a4a] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingClubId === selectedClub._id ? "Submitting..." : "Submit Application"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
