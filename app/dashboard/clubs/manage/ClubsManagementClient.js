"use client";

import { useState } from "react";
import Link from "next/link";

export default function ClubsManagementClient({
    clubs,
    pendingCharters,
    currentUserId,
    isAdmin,
}) {
    const [clustersList, setClubsList] = useState(clubs || []);
    const [chartersList, setChartersList] = useState(pendingCharters || []);
    const [activeTab, setActiveTab] = useState("clubs");
    const [isApproving, setIsApproving] = useState(null);
    const [selectedCharter, setSelectedCharter] = useState(null);

    const handleApproveCharter = async (charterId) => {
        if (!confirm("Approve this charter?")) return;

        setIsApproving(charterId);
        try {
            const response = await fetch(`/api/club-charters/${charterId}/approve`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "approved" }),
            });

            if (response.ok) {
                setChartersList(chartersList.filter((c) => String(c._id) !== String(charterId)));
                alert("Charter approved successfully!");
            } else {
                alert("Failed to approve charter");
            }
        } catch (error) {
            console.error("Error approving charter:", error);
            alert("Error approving charter");
        } finally {
            setIsApproving(null);
        }
    };

    const handleRejectCharter = async (charterId) => {
        if (!confirm("Reject this charter?")) return;

        setIsApproving(charterId);
        try {
            const response = await fetch(`/api/club-charters/${charterId}/approve`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "rejected" }),
            });

            if (response.ok) {
                setChartersList(chartersList.filter((c) => String(c._id) !== String(charterId)));
                alert("Charter rejected successfully!");
            } else {
                alert("Failed to reject charter");
            }
        } catch (error) {
            console.error("Error rejecting charter:", error);
            alert("Error rejecting charter");
        } finally {
            setIsApproving(null);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-slate-50 py-16 dark:bg-slate-950">
                <main className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Access Denied</h1>
                    <p className="mt-4 text-slate-600 dark:text-slate-300">
                        You do not have permission to access this page. Only College Admins can manage clubs.
                    </p>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 dark:bg-slate-950">
            <main className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
                        Club Management Dashboard
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                        Review clubs, approve charters, and manage club operations
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="mb-8 flex flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800">
                    {["clubs", "charters"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-1 text-sm font-semibold capitalize transition ${
                                activeTab === tab
                                    ? "border-b-2 border-slate-950 text-slate-950 dark:border-white dark:text-white"
                                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            {tab}
                            {tab === "charters" && chartersList.length > 0 && (
                                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                    {chartersList.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Clubs Tab */}
                {activeTab === "clubs" && (
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">
                                All Clubs ({clustersList.length})
                            </h2>
                        </div>

                        {clustersList.length > 0 ? (
                            <div className="space-y-4">
                                {clustersList.map((club) => (
                                    <div
                                        key={club._id}
                                        className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                                                    {club.name}
                                                </h3>
                                                <p className="mt-2 text-slate-600 dark:text-slate-300">
                                                    {club.description || "No description provided"}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                    <span>
                                                        <strong>Type:</strong>{" "}
                                                        {club.isPrivate ? (
                                                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                                                Private
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                                                Public
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span>
                                                        <strong>Members:</strong> {club.memberList?.length || 0}
                                                    </span>
                                                    <span>
                                                        <strong>Events:</strong> {club.eventList?.length || 0}
                                                    </span>
                                                    <span>
                                                        <strong>Created:</strong> {formatDate(club.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/dashboard/clubs/${club._id}`}
                                                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                No clubs found.
                            </div>
                        )}
                    </div>
                )}

                {/* Charters Tab */}
                {activeTab === "charters" && (
                    <div className="space-y-6">
                        {chartersList.length > 0 ? (
                            <div className="space-y-4">
                                {chartersList.map((charter) => (
                                    <div
                                        key={charter._id}
                                        className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900"
                                    >
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                                                            {charter.name}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                                            {charter.description}
                                                        </p>
                                                        {charter.purpose && (
                                                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                                <strong>Purpose:</strong> {charter.purpose}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                                        {charter.status}
                                                    </span>
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-slate-500 dark:text-slate-400 sm:grid-cols-4">
                                                    <div>
                                                        <strong>Signatures:</strong> {charter.signatures?.length || 0}/10
                                                    </div>
                                                    <div>
                                                        <strong>Proposed Owner:</strong> {charter.proposedOwner || "TBD"}
                                                    </div>
                                                    <div>
                                                        <strong>Created:</strong> {formatDate(charter.createdAt)}
                                                    </div>
                                                    <div>
                                                        <strong>Status:</strong> {charter.status}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedCharter(charter._id === selectedCharter ? null : charter._id)}
                                                    className="rounded-full bg-slate-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-500"
                                                >
                                                    {selectedCharter === charter._id ? "Hide" : "View"} Details
                                                </button>
                                                <button
                                                    onClick={() => handleApproveCharter(charter._id)}
                                                    disabled={isApproving === charter._id}
                                                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                                                >
                                                    {isApproving === charter._id ? "Approving..." : "Approve"}
                                                </button>
                                                <button
                                                    onClick={() => handleRejectCharter(charter._id)}
                                                    disabled={isApproving === charter._id}
                                                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
                                                >
                                                    {isApproving === charter._id ? "Rejecting..." : "Reject"}
                                                </button>
                                            </div>

                                            {selectedCharter === charter._id && (
                                                <div className="mt-4 rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-800">
                                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                                                        Charter Details
                                                    </h4>
                                                    <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                                        <p>
                                                            <strong>ID:</strong> {charter._id}
                                                        </p>
                                                        <p>
                                                            <strong>Name:</strong> {charter.name}
                                                        </p>
                                                        <p>
                                                            <strong>Description:</strong> {charter.description}
                                                        </p>
                                                        {charter.purpose && (
                                                            <p>
                                                                <strong>Purpose:</strong> {charter.purpose}
                                                            </p>
                                                        )}
                                                        <p>
                                                            <strong>Proposed Owner:</strong> {charter.proposedOwner || "Not specified"}
                                                        </p>
                                                        <p>
                                                            <strong>Initiator ID:</strong> {charter.initiatorId}
                                                        </p>
                                                        <p>
                                                            <strong>Signatures:</strong> {charter.signatures?.length || 0}/10
                                                        </p>
                                                        <p>
                                                            <strong>Status:</strong> {charter.status}
                                                        </p>
                                                        <p>
                                                            <strong>Created:</strong> {formatDate(charter.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                No charters awaiting approval.
                            </div>
                        )}
                    </div>
                )}

                <Link
                    href="/dashboard"
                    className="mt-8 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                >
                    Back to Dashboard
                </Link>
            </main>
        </div>
    );
}
