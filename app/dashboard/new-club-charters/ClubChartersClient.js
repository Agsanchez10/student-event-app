"use client";

import { useState } from "react";
import Link from "next/link";
import { approveCharter } from "@/app/actions/clubCharterActions";
import { rejectCharterAction } from "@/app/actions/clubCharterActions";

export default function ClubChartersClient({ initialCharters }) {
    const [charters, setCharters] = useState(initialCharters || []);
    const [selectedCharter, setSelectedCharter] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleApprove = async () => {
        if (!selectedCharter) return;

        setLoading(true);
        setMessage("");
        try {
            const result = await approveCharter(selectedCharter._id, selectedCharter.initiatorId);

            if (result.success) {
                setMessage("Charter approved! Notification sent to club founder.");
                // Remove from list
                setCharters(charters.filter(c => c._id !== selectedCharter._id));
                setShowApprovalModal(false);
                setSelectedCharter(null);
                setTimeout(() => setMessage(""), 3000);
            } else {
                setMessage(`Error: ${result.error || "Failed to approve charter"}`);
            }
        } catch (error) {
            setMessage("An error occurred while approving the charter");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (charter) => {
        if (!confirm(`Reject charter "${charter.name}"?`)) return;

        setLoading(true);
        try {
            const result = await rejectCharterAction(charter._id);

            if (result.success) {
                setCharters(charters.filter(c => c._id !== charter._id));
                setMessage("Charter rejected.");
                setTimeout(() => setMessage(""), 3000);
            } else {
                setMessage(`Failed to reject charter: ${result.error}`);
            }
        } catch (error) {
            setMessage("An error occurred");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-[1.8rem] bg-[#f9f2e4] border border-[#d4b18b]/40 p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-950">New Club Charters</h1>
                        <p className="mt-2 text-slate-600">Review and approve charter requests that have reached 10+ signatures.</p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center rounded-3xl border border-[#d4b18b] bg-[#fff5e4] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-[#c1a06e] hover:bg-[#f8e7ce] whitespace-nowrap"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* Status message */}
            {message && (
                <div className={`rounded-2xl px-5 py-4 text-sm font-medium ${
                    message.toLowerCase().includes("error") || message.toLowerCase().includes("failed")
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-green-100 text-green-700 border border-green-200"
                }`}>
                    {message}
                </div>
            )}

            {/* Charter list */}
            {charters.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-[#d4b18b]/60 bg-[#f9f2e4] p-10 text-center text-slate-500">
                    No club charters pending approval.
                </div>
            ) : (
                <div className="space-y-4">
                    {charters.map((charter) => (
                        <div key={charter._id} className="rounded-[1.5rem] bg-[#f9f2e4] border border-[#d4b18b]/40 p-6 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.5)] transition hover:shadow-[0_15px_40px_-20px_rgba(15,23,42,0.35)]">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-950">{charter.name}</h3>
                                    <p className="mt-1 text-sm text-slate-600">{charter.description}</p>
                                    {charter.purpose && (
                                        <p className="mt-1 text-sm text-slate-600"><strong>Purpose:</strong> {charter.purpose}</p>
                                    )}
                                    <div className="mt-3 flex flex-wrap gap-3">
                                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                                            {charter.signatures?.length || 0} signatures
                                        </span>
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                                            Owner: {charter.proposedOwner || "Not specified"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setSelectedCharter(charter); setShowApprovalModal(true); }}
                                        disabled={loading}
                                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(charter)}
                                        disabled={loading}
                                        className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Approval Modal */}
            {showApprovalModal && selectedCharter && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
                    onClick={() => setShowApprovalModal(false)}
                >
                    <div
                        className="w-full max-w-md overflow-hidden rounded-[1.8rem] bg-[#f9f2e4] shadow-2xl ring-1 ring-[#d4b18b]/40"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="border-b border-[#d4b18b]/40 px-6 py-5">
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Confirm Approval</p>
                            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Approve Club Charter?</h2>
                        </div>
                        <div className="space-y-4 px-6 py-5">
                            <p className="text-sm text-slate-600">
                                This will create a new ClubOwner account and send credentials to the founder.
                            </p>
                            <div className="rounded-2xl bg-[#fdfaf5] border border-[#d4b18b]/40 p-4 space-y-2 text-sm text-slate-700">
                                <p><strong>Club:</strong> {selectedCharter.name}</p>
                                <p><strong>Founder Email:</strong> {selectedCharter.proposedOwner}</p>
                                <p><strong>Signatures:</strong> {selectedCharter.signatures?.length || 0}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 border-t border-[#d4b18b]/40 px-6 py-5">
                            <button
                                onClick={() => setShowApprovalModal(false)}
                                disabled={loading}
                                className="flex-1 rounded-full border border-[#d4b18b] bg-[#fff5e4] px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-[#f8e7ce] disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={loading}
                                className="flex-1 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                            >
                                {loading ? "Processing..." : "Confirm Approve"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
