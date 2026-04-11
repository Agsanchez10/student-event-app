"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export default function ClubCharterActivityClient({ charters, currentPage, itemsPerPage, currentUserId }) {
    const [activeCharters, setActiveCharters] = useState(charters || []);
    const [isDeletingId, setIsDeletingId] = useState(null);
    const totalPages = Math.max(1, Math.ceil(activeCharters.length / itemsPerPage));

    const displayedCharters = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return activeCharters.slice(start, start + itemsPerPage);
    }, [activeCharters, currentPage, itemsPerPage]);

    const initiatedCharters = displayedCharters.filter((charter) => String(charter.initiatorId) === String(currentUserId));
    const signedCharters = displayedCharters.filter((charter) => String(charter.initiatorId) !== String(currentUserId));

    const handleDelete = async (charterId) => {
        const confirmed = window.confirm("Are you sure you want to cancel this charter? This action cannot be undone.");
        if (!confirmed) return;

        setIsDeletingId(charterId);

        const response = await fetch(`/api/club-charters/${charterId}`, {
            method: "DELETE",
        });

        setIsDeletingId(null);

        if (response.ok) {
            setActiveCharters((current) => current.filter((charter) => String(charter._id) !== String(charterId)));
            
        } else {
            const error = await response.json();
            console.error("Unable to cancel charter:", error);
            window.alert("Failed to cancel charter. Please try again.");
        }
    };

    if (!activeCharters.length) {
        return null;
    }

    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
            <div>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Club charter activity</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Track charters you started or signed and manage ones you own.</p>
            </div>

            <div className="mt-6 space-y-5">
                {initiatedCharters.length > 0 ? (
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Charters you initiated</h3>
                        <div className="mt-4 space-y-4">
                            {initiatedCharters.map((charter) => (
                                <div key={charter._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-950 dark:text-white">{charter.name}</h4>
                                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{charter.description || "No description provided."}</p>
                                        </div>
                                        <div className="flex flex-col items-start gap-3 sm:items-end">
                                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">{charter.status === "submitted" ? "Submitted" : "Collecting"}</span>
                                            <button
                                                type="button"
                                                disabled={isDeletingId === charter._id}
                                                onClick={() => handleDelete(charter._id)}
                                                className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {isDeletingId === charter._id ? "Cancelling..." : "Cancel charter"}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                                        <span>Signatures: {charter.signatures?.length ?? 0}/10</span>
                                        <span>Created: {new Date(charter.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                {signedCharters.length > 0 ? (
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Charters you signed</h3>
                        <div className="mt-4 space-y-4">
                            {signedCharters.map((charter) => (
                                <div key={charter._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-950 dark:text-white">{charter.name}</h4>
                                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{charter.description || "No description provided."}</p>
                                        </div>
                                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">{charter.status === "submitted" ? "Submitted" : "Collecting"}</span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                                        <span>Signatures: {charter.signatures?.length ?? 0}/10</span>
                                        <span>Created: {new Date(charter.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>

            {totalPages > 1 ? (
                <div className="mt-6 flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    <span>Page {currentPage} of {totalPages}</span>
                    <div className="inline-flex items-center gap-3">
                        <button disabled className="rounded-full bg-slate-200 px-4 py-2 text-slate-400" type="button">Previous</button>
                        <button disabled className="rounded-full bg-slate-200 px-4 py-2 text-slate-400" type="button">Next</button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
