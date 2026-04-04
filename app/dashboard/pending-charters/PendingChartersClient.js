"use client";

import { useState, useMemo } from "react";

const formatDate = (value) => {
    if (!value) return "TBD";
    return new Date(value).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

const getStatusColor = (status) => {
    switch (status) {
        case "draft":
            return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        case "collecting":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        case "submitted":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        default:
            return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200";
    }
};

const ITEMS_PER_PAGE = 10;

export default function PendingChartersClient({ charters = [], currentUser }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("newest");
    const [selectedCharter, setSelectedCharter] = useState(null);
    const [isSigningId, setIsSigningId] = useState(null);
    const [isRemovingSignatureId, setIsRemovingSignatureId] = useState(null);
    const [chartersState, setChartersState] = useState(charters);

    const sortedCharters = useMemo(() => {
        const sorted = [...chartersState];
        if (sortBy === "newest") {
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === "oldest") {
            sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortBy === "signatures") {
            sorted.sort((a, b) => (b.signatures?.length || 0) - (a.signatures?.length || 0));
        }
        return sorted;
    }, [chartersState, sortBy]);

    const userHasSigned = (charter) => {
        if (!currentUser) return false;
        return charter.signatures?.includes(currentUser._id);
    };

    const handleSignCharter = async (charterId) => {
        if (!currentUser) return;

        setIsSigningId(charterId);

        try {
            const response = await fetch(`/api/club-charters/${charterId}/sign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const updatedCharter = await response.json();
                setChartersState(chartersState.map(c => c._id === charterId ? updatedCharter : c));
                if (selectedCharter?._id === charterId) {
                    setSelectedCharter(updatedCharter);
                }
            } else {
                const error = await response.json();
                alert(`Failed to sign charter: ${error.error}`);
            }
        } catch (error) {
            alert('An error occurred while signing the charter');
            console.error(error);
        } finally {
            setIsSigningId(null);
        }
    };

    const handleRemoveSignature = async (charterId) => {
        if (!currentUser) return;

        setIsRemovingSignatureId(charterId);

        try {
            const response = await fetch(`/api/club-charters/${charterId}/remove-signature`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const updatedCharter = await response.json();
                setChartersState(chartersState.map(c => c._id === charterId ? updatedCharter : c));
                if (selectedCharter?._id === charterId) {
                    setSelectedCharter(updatedCharter);
                }
            } else {
                const error = await response.json();
                alert(`Failed to remove signature: ${error.error}`);
            }
        } catch (error) {
            alert('An error occurred while removing your signature');
            console.error(error);
        } finally {
            setIsRemovingSignatureId(null);
        }
    };

    const totalPages = Math.max(1, Math.ceil(sortedCharters.length / ITEMS_PER_PAGE));
    const displayedCharters = sortedCharters.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] py-10 text-slate-900">
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 rounded-3xl border border-[#d4b18b]/40 bg-[#fff5e4] p-8 shadow-sm ring-1 ring-[#d4b18b]/20">
                    <h1 className="text-3xl font-semibold text-slate-950">Pending Club Charters</h1>
                    <p className="mt-3 text-sm text-[#a33b3b]">Review charters that are still being collected, drafted, or submitted for approval.</p>
                    
                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                            <label htmlFor="sort" className="block text-sm font-medium text-slate-700 mb-2">
                                Sort by:
                            </label>
                            <select
                                id="sort"
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="rounded-2xl border border-[#d4b18b] bg-[#fff7e4] px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-[#c1a06e] focus:ring-2 focus:ring-[#e05c5c]/20"
                            >
                                <option value="newest">Newest first</option>
                                <option value="oldest">Oldest first</option>
                                <option value="signatures">Most signatures</option>
                            </select>
                        </div>
                        <div className="text-sm text-slate-600">
                            Showing {chartersState.length} total charter{chartersState.length !== 1 ? "s" : ""}
                        </div>
                    </div>
                </div>

                {displayedCharters.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {displayedCharters.map((charter) => (
                                <div
                                    key={charter._id}
                                    className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff7e4] p-6 shadow-lg shadow-[#b08f6c]/10 transition hover:shadow-xl"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <h2 className="text-lg font-semibold text-slate-950 flex-1">{charter.name}</h2>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${getStatusColor(charter.status)}`}>
                                            {charter.status.charAt(0).toUpperCase() + charter.status.slice(1)}
                                        </span>
                                    </div>
                                    
                                    <p className="text-sm text-slate-700 mb-4 line-clamp-2">{charter.description}</p>
                                    
                                    <div className="space-y-2 text-xs text-slate-600 mb-4">
                                        <p><span className="font-semibold">Created:</span> {formatDate(charter.createdAt)}</p>
                                        <p><span className="font-semibold">Signatures:</span> {charter.signatures?.length || 0}</p>
                                        <p><span className="font-semibold">Proposed Owner:</span> {charter.proposedOwner || "TBD"}</p>
                                    </div>
                                    
                                    <button
                                        onClick={() => setSelectedCharter(charter)}
                                        className="inline-flex items-center justify-center rounded-full bg-[#e05c5c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a] w-full"
                                    >
                                        View details
                                    </button>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-between rounded-3xl border border-[#d4b18b]/40 bg-[#fff5e4] p-4">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-full bg-[#e05c5c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-sm font-semibold text-slate-700">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-full bg-[#e05c5c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="rounded-3xl border border-dashed border-[#d4b18b] bg-[#fff5e4] p-12 text-center">
                        <p className="text-lg font-semibold text-slate-700 mb-2">No pending charters</p>
                        <p className="text-sm text-slate-600">All club charters have been approved or rejected.</p>
                    </div>
                )}
            </main>

            {selectedCharter && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
                    onClick={() => setSelectedCharter(null)}
                >
                    <div
                        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-[#fff5e4] shadow-2xl border border-[#d4b18b]/40"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-[#d4b18b]/40 px-6 py-5">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#a33b3b]">Charter details</p>
                                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selectedCharter.name}</h2>
                            </div>
                            <button
                                onClick={() => setSelectedCharter(null)}
                                className="rounded-full bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-300"
                            >
                                Close
                            </button>
                        </div>
                        <div className="space-y-6 px-6 py-6">
                            <div>
                                <p className="text-sm font-semibold text-[#8a5f3a] mb-2">Status</p>
                                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(selectedCharter.status)}`}>
                                    {selectedCharter.status.charAt(0).toUpperCase() + selectedCharter.status.slice(1)}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#8a5f3a]">Description</p>
                                <p className="mt-2 text-base leading-7 text-slate-700">{selectedCharter.description}</p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-3xl bg-[#fff7e4] p-5 text-sm text-slate-700">
                                    <p className="font-semibold text-slate-900">Created</p>
                                    <p className="mt-2">{formatDate(selectedCharter.createdAt)}</p>
                                </div>
                                <div className="rounded-3xl bg-[#fff7e4] p-5 text-sm text-slate-700">
                                    <p className="font-semibold text-slate-900">Proposed Owner</p>
                                    <p className="mt-2">{selectedCharter.proposedOwner || "TBD"}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#8a5f3a] mb-2">Signatures</p>
                                <p className="text-lg font-semibold text-slate-950">{selectedCharter.signatures?.length || 0} signature{(selectedCharter.signatures?.length || 0) !== 1 ? "s" : ""}</p>
                                <p className="text-xs text-slate-600 mt-1">(10 signatures required for submission)</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#8a5f3a] mb-3">Actions</p>
                                <div className="flex flex-col gap-3">
                                    {!userHasSigned(selectedCharter) ? (
                                        <button
                                            onClick={() => handleSignCharter(selectedCharter._id)}
                                            disabled={isSigningId === selectedCharter._id}
                                            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSigningId === selectedCharter._id ? 'Signing...' : '✓ Sign Charter'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleRemoveSignature(selectedCharter._id)}
                                            disabled={isRemovingSignatureId === selectedCharter._id}
                                            className="inline-flex items-center justify-center rounded-full bg-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isRemovingSignatureId === selectedCharter._id ? 'Removing...' : '✕ Remove Signature'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
