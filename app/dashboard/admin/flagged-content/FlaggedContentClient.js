"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function FlaggedContentClient({ initialFlags }) {
    const [flags, setFlags] = useState(initialFlags || []);
    const [selectedFlag, setSelectedFlag] = useState(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isSuspending, setIsSuspending] = useState(false);
    const [filterType, setFilterType] = useState("all");

    const contentTypeIcons = {
        announcement: "📢",
        event: "📅",
        club: "🏢",
        user: "👤",
    };

    const reasonColors = {
        spam: "bg-blue-100 text-blue-800",
        harassment: "bg-red-100 text-red-800",
        inappropriate: "bg-orange-100 text-orange-800",
        misinformation: "bg-yellow-100 text-yellow-800",
        other: "bg-gray-100 text-gray-800",
    };

    const filteredFlags = filterType === "all" 
        ? flags 
        : flags.filter(flag => flag.type === filterType);

    const handleSelectFlag = (flag) => {
        setSelectedFlag(flag);
        setAdminNotes(flag.adminNotes || "");
    };

    const handleSaveNotes = async () => {
        if (!selectedFlag) return;

        setIsSaving(true);
        try {
            const response = await fetch(`/api/flags/${selectedFlag._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    adminNotes: adminNotes,
                }),
            });

            if (response.ok) {
                const updatedFlag = await response.json();
                setFlags(flags.map(f => f._id === selectedFlag._id ? updatedFlag : f));
                setSelectedFlag(updatedFlag);
                alert("Notes saved successfully!");
            } else {
                alert("Failed to save notes");
            }
        } catch (error) {
            console.error("Error saving notes:", error);
            alert("Error saving notes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveContent = async () => {
        if (!selectedFlag) return;
        if (!confirm("Are you sure you want to delete this content?")) return;

        setIsRemoving(true);
        try {
            const endpoint = selectedFlag.type === "announcement" 
                ? `/api/clubs/announcements/${selectedFlag.contentId}`
                : selectedFlag.type === "event"
                ? `/api/events/${selectedFlag.contentId}`
                : selectedFlag.type === "club"
                ? `/api/clubs/${selectedFlag.contentId}`
                : null;

            if (!endpoint) {
                alert("Cannot delete this content type");
                setIsRemoving(false);
                return;
            }

            const response = await fetch(endpoint, {
                method: "DELETE",
            });

            if (response.ok) {
                await markAsResolved("content_removed");
                alert("Content removed successfully!");
            } else {
                alert("Failed to remove content");
            }
        } catch (error) {
            console.error("Error removing content:", error);
            alert("Error removing content");
        } finally {
            setIsRemoving(false);
        }
    };

    const handleSuspendUser = async () => {
        if (!selectedFlag) return;
        if (!confirm("Are you sure you want to suspend this user?")) return;

        setIsSuspending(true);
        try {
            const response = await fetch(`/api/users/${selectedFlag.flaggedById}/deactivate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                await markAsResolved("user_suspended");
                alert("User suspended successfully!");
            } else {
                alert("Failed to suspend user");
            }
        } catch (error) {
            console.error("Error suspending user:", error);
            alert("Error suspending user");
        } finally {
            setIsSuspending(false);
        }
    };

    const markAsResolved = async (resolution) => {
        try {
            const response = await fetch(`/api/flags/${selectedFlag._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isResolved: true,
                    resolution: resolution,
                    dateResolved: new Date().toISOString(),
                    resolvedBy: parseInt(localStorage.getItem("userId") || "1"),
                    adminNotes: adminNotes,
                }),
            });

            if (response.ok) {
                setFlags(flags.filter(f => f._id !== selectedFlag._id));
                setSelectedFlag(null);
                setAdminNotes("");
            }
        } catch (error) {
            console.error("Error marking as resolved:", error);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <main className="flex-1 min-h-[80vh] bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] text-slate-900">
            <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/dashboard/admin" className="text-sm font-semibold text-[#e05c5c] hover:text-[#c94a4a]">
                        ← Back to Admin
                    </Link>
                </div>

                {/* Title */}
                <section className="relative overflow-hidden rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] sm:p-10 lg:p-12 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-3 rounded-full bg-[#e05c5c]/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-[#a33b3b] shadow-sm shadow-[#e05c5c]/10">
                            Content Moderation
                        </div>
                        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                            Review Flagged Content
                        </h1>
                        <p className="mt-4 max-w-xl text-base leading-8 text-slate-700 sm:text-lg">
                            Review reported content, add notes, and take moderation actions such as removing content or suspending users.
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
                    {/* Flags List */}
                    <div className="space-y-4">
                        {/* Filter */}
                        <div className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-4 shadow-md shadow-[#b9955d]/10">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by Type</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900"
                            >
                                <option value="all">All Types</option>
                                <option value="announcement">📢 Announcements</option>
                                <option value="event">📅 Events</option>
                                <option value="club">🏢 Clubs</option>
                                <option value="user">👤 Users</option>
                            </select>
                        </div>

                        {/* Flags */}
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {filteredFlags.length === 0 ? (
                                <div className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 text-center text-slate-700">
                                    No flagged content to review.
                                </div>
                            ) : (
                                filteredFlags.map((flag) => (
                                    <button
                                        key={flag._id}
                                        onClick={() => handleSelectFlag(flag)}
                                        className={`w-full text-left rounded-[1.8rem] border-2 p-4 transition ${
                                            selectedFlag?._id === flag._id
                                                ? "border-[#e05c5c] bg-[#e05c5c]/10"
                                                : "border-[#d4b18b]/40 bg-[#fff5e4] hover:border-[#e05c5c]/50 hover:bg-[#fff9f0]"
                                        } shadow-md shadow-[#b9955d]/10`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">
                                                        {contentTypeIcons[flag.type]}
                                                    </span>
                                                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${reasonColors[flag.reason]}`}>
                                                        {flag.reason}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm text-slate-600">
                                                    {formatDate(flag.reportedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Flag Details */}
                    {selectedFlag ? (
                        <div className="rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] space-y-6">
                            <div>
                                <h2 className="text-2xl font-semibold text-slate-950">Flag Details</h2>
                            </div>

                            {/* Content Info */}
                            <div className="space-y-4 rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-5">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">Content Type</p>
                                    <p className="mt-2 text-lg font-semibold text-slate-950 capitalize">
                                        {contentTypeIcons[selectedFlag.type]} {selectedFlag.type}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">Reason</p>
                                    <p className="mt-2">
                                        <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${reasonColors[selectedFlag.reason]}`}>
                                            {selectedFlag.reason.charAt(0).toUpperCase() + selectedFlag.reason.slice(1)}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">Reported At</p>
                                    <p className="mt-2 text-slate-700">{formatDate(selectedFlag.reportedAt)}</p>
                                </div>
                                {selectedFlag.description && (
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">Report Description</p>
                                        <p className="mt-2 text-slate-700">{selectedFlag.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Admin Notes */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Admin Notes
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add your review notes here..."
                                    rows="4"
                                    className="w-full rounded-[1.2rem] border border-[#d4b18b] bg-white px-4 py-3 text-slate-900 placeholder-slate-500"
                                />
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={isSaving}
                                    className="w-full rounded-full bg-[#c8a882] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a68963] disabled:opacity-60"
                                >
                                    {isSaving ? "Saving..." : "Save Notes"}
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 border-t border-[#d4b18b]/40 pt-6">
                                <h3 className="font-semibold text-slate-950">Moderation Actions</h3>
                                <button
                                    onClick={handleRemoveContent}
                                    disabled={isRemoving}
                                    className="w-full rounded-full bg-[#e05c5c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a] disabled:opacity-60"
                                >
                                    {isRemoving ? "Removing..." : "🗑️ Remove Content"}
                                </button>
                                <button
                                    onClick={handleSuspendUser}
                                    disabled={isSuspending}
                                    className="w-full rounded-full bg-[#d4975a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b8805f] disabled:opacity-60"
                                >
                                    {isSuspending ? "Suspending..." : "🚫 Suspend Flagged User"}
                                </button>
                                <button
                                    onClick={() => markAsResolved("no_action_needed")}
                                    className="w-full rounded-full bg-[#8fbc8f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7ba77b]"
                                >
                                    ✓ Mark as Resolved (No Action)
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] flex items-center justify-center h-[600px]">
                            <div className="text-center">
                                <p className="text-xl text-slate-600">Select a flagged item to view details and take action</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
