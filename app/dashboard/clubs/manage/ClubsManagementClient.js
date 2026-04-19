"use client";

import { useState } from "react";
import Link from "next/link";
import { approveCharterAction, rejectCharterAction } from "@/app/actions/clubCharterActions";
import { removeClub } from "@/app/actions/clubActions";

export default function ClubsManagementClient({
    clubs,
    pendingCharters,
    currentUserId,
    isAdmin,
}) {
    const [clubsList, setClubsList] = useState(clubs || []);
    const [chartersList, setChartersList] = useState(pendingCharters || []);
    const [activeTab, setActiveTab] = useState("clubs");
    const [isApproving, setIsApproving] = useState(null);
    const [isDeletingClub, setIsDeletingClub] = useState(null);
    const [selectedCharter, setSelectedCharter] = useState(null);
    const [clubSearch, setClubSearch] = useState("");
    const [clubTypeFilter, setClubTypeFilter] = useState("");

    const filteredClubs = clubsList.filter((club) => {
        const matchesSearch =
            !clubSearch ||
            club.name.toLowerCase().includes(clubSearch.toLowerCase()) ||
            (club.description && club.description.toLowerCase().includes(clubSearch.toLowerCase()));
        const matchesType =
            !clubTypeFilter ||
            (clubTypeFilter === "private" ? club.isPrivate : !club.isPrivate);
        return matchesSearch && matchesType;
    });

    const handleDeleteClub = async (clubId, clubName) => {
        if (!confirm(`Are you sure you want to permanently delete "${clubName}"? This will also delete all associated events and announcements.`)) return;

        setIsDeletingClub(clubId);
        try {
            const result = await removeClub(clubId);
            if (result.success) {
                setClubsList(clubsList.filter((c) => String(c._id) !== String(clubId)));
                alert("Club deleted successfully.");
            } else {
                alert(`Failed to delete club: ${result.error}`);
            }
        } catch (error) {
            console.error("Error deleting club:", error);
            alert("Error deleting club.");
        } finally {
            setIsDeletingClub(null);
        }
    };

    const handleApproveCharter = async (charterId) => {
        if (!confirm("Approve this charter?")) return;

        setIsApproving(charterId);
        try {
            const result = await approveCharterAction(charterId);

            if (result.success) {
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
            const result = await rejectCharterAction(charterId);

            if (result.success) {
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

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] py-8">
            <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-[1.8rem] bg-[#f9f2e4] border border-[#d4b18b]/40 p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-semibold text-slate-950">Club Management</h1>
                            <p className="mt-2 text-slate-600">Oversee all clubs, approve charters, and manage club operations.</p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center rounded-3xl border border-[#d4b18b] bg-[#fff5e4] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-[#c1a06e] hover:bg-[#f8e7ce] whitespace-nowrap"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl bg-[#fdfaf5] border border-[#d4b18b]/40 p-4 text-center">
                            <p className="text-2xl font-bold text-slate-950">{clubsList.length}</p>
                            <p className="text-sm text-slate-600">Total Clubs</p>
                        </div>
                        <div className="rounded-2xl bg-[#fdfaf5] border border-[#d4b18b]/40 p-4 text-center">
                            <p className="text-2xl font-bold text-amber-700">{chartersList.length}</p>
                            <p className="text-sm text-slate-600">Pending Charters</p>
                        </div>
                        <div className="rounded-2xl bg-[#fdfaf5] border border-[#d4b18b]/40 p-4 text-center">
                            <p className="text-2xl font-bold text-blue-700">{clubsList.filter(c => !c.isPrivate).length}</p>
                            <p className="text-sm text-slate-600">Public Clubs</p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-0 mt-8 flex flex-wrap gap-3 border-b border-[#d4b18b]/40">
                    {["clubs", "charters"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-1 text-sm font-semibold capitalize transition ${
                                activeTab === tab
                                    ? "border-b-2 border-slate-950 text-slate-950"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            {tab === "clubs" ? `Clubs (${clubsList.length})` : "Pending Charters"}
                            {tab === "charters" && chartersList.length > 0 && (
                                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                                    {chartersList.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Clubs Tab */}
                {activeTab === "clubs" && (
                    <div className="space-y-6 mt-8">
                        {/* Search & Filter */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                                type="text"
                                placeholder="Search clubs by name or description..."
                                value={clubSearch}
                                onChange={(e) => setClubSearch(e.target.value)}
                                className="flex-1 rounded-2xl border border-[#d4b18b]/60 bg-[#fdfaf5] px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                            />
                            <select
                                value={clubTypeFilter}
                                onChange={(e) => setClubTypeFilter(e.target.value)}
                                className="rounded-2xl border border-[#d4b18b]/60 bg-[#fdfaf5] px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
                            >
                                <option value="">All Types</option>
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </select>
                        </div>

                        {filteredClubs.length > 0 ? (
                            <div className="space-y-4">
                                {filteredClubs.map((club) => (
                                    <div
                                        key={club._id}
                                        className="rounded-[1.5rem] bg-[#f9f2e4] border border-[#d4b18b]/40 p-6 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.5)]"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-semibold text-slate-950">{club.name}</h3>
                                                    {club.isPrivate ? (
                                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Private</span>
                                                    ) : (
                                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">Public</span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    {club.description || "No description provided"}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                                                    <span><strong>Members:</strong> {club.memberList?.length || 0}</span>
                                                    <span><strong>Events:</strong> {club.eventList?.length || 0}</span>
                                                    <span><strong>Created:</strong> {formatDate(club.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/dashboard/clubs/${club._id}`}
                                                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteClub(club._id, club.name)}
                                                    disabled={isDeletingClub === club._id}
                                                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
                                                >
                                                    {isDeletingClub === club._id ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[1.5rem] bg-[#f9f2e4] border border-[#d4b18b]/40 p-6 text-slate-600 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.5)]">
                                {clubSearch || clubTypeFilter ? "No clubs match your search." : "No clubs found."}
                            </div>
                        )}
                    </div>
                )}

                {/* Charters Tab */}
                {activeTab === "charters" && (
                    <div className="space-y-6 mt-8">
                        {chartersList.length > 0 ? (
                            <div className="space-y-4">
                                {chartersList.map((charter) => (
                                    <div
                                        key={charter._id}
                                        className="rounded-[1.5rem] bg-[#f9f2e4] border border-[#d4b18b]/40 p-6 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.5)]"
                                    >
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-slate-950">{charter.name}</h3>
                                                        <p className="mt-1 text-sm text-slate-600">{charter.description}</p>
                                                        {charter.purpose && (
                                                            <p className="mt-2 text-sm text-slate-600">
                                                                <strong>Purpose:</strong> {charter.purpose}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                        {charter.status}
                                                    </span>
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-slate-600 sm:grid-cols-4">
                                                    <div><strong>Signatures:</strong> {charter.signatures?.length || 0}/10</div>
                                                    <div><strong>Proposed Owner:</strong> {charter.proposedOwner || "TBD"}</div>
                                                    <div><strong>Submitted:</strong> {formatDate(charter.createdAt)}</div>
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
                                                    {isApproving === charter._id ? "Processing..." : "Approve"}
                                                </button>
                                                <button
                                                    onClick={() => handleRejectCharter(charter._id)}
                                                    disabled={isApproving === charter._id}
                                                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
                                                >
                                                    {isApproving === charter._id ? "Processing..." : "Reject"}
                                                </button>
                                            </div>

                                            {selectedCharter === charter._id && (
                                                <div className="mt-2 rounded-[1.2rem] border border-[#d4b18b]/40 bg-[#fdfaf5] p-4">
                                                    <h4 className="font-semibold text-slate-950 mb-3">Charter Details</h4>
                                                    <div className="space-y-2 text-sm text-slate-700">
                                                        <p><strong>Charter ID:</strong> {charter._id}</p>
                                                        <p><strong>Name:</strong> {charter.name}</p>
                                                        <p><strong>Description:</strong> {charter.description}</p>
                                                        {charter.purpose && <p><strong>Purpose:</strong> {charter.purpose}</p>}
                                                        <p><strong>Proposed Owner:</strong> {charter.proposedOwner || "Not specified"}</p>
                                                        <p><strong>Initiator ID:</strong> {charter.initiatorId}</p>
                                                        <p><strong>Signatures:</strong> {charter.signatures?.length || 0}/10</p>
                                                        <p><strong>Status:</strong> {charter.status}</p>
                                                        <p><strong>Submitted:</strong> {formatDate(charter.createdAt)}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[1.5rem] bg-[#f9f2e4] border border-[#d4b18b]/40 p-6 text-slate-600 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.5)]">
                                No charters awaiting approval.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

// export default function ClubsManagementClient({
//     clubs,
//     pendingCharters,
//     currentUserId,
//     isAdmin,
// }) {
//     const [clustersList, setClubsList] = useState(clubs || []);
//     const [chartersList, setChartersList] = useState(pendingCharters || []);
//     const [activeTab, setActiveTab] = useState("clubs");
//     const [isApproving, setIsApproving] = useState(null);
//     const [selectedCharter, setSelectedCharter] = useState(null);

//     const handleApproveCharter = async (charterId) => {
//         if (!confirm("Approve this charter?")) return;

//         setIsApproving(charterId);
//         try {
//             const result = await approveCharterAction(charterId);

//             if (result.success) {
//                 setChartersList(chartersList.filter((c) => String(c._id) !== String(charterId)));
//                 alert("Charter approved successfully!");
//             } else {
//                 alert("Failed to approve charter");
//             }
//         } catch (error) {
//             console.error("Error approving charter:", error);
//             alert("Error approving charter");
//         } finally {
//             setIsApproving(null);
//         }
//     };

//     const handleRejectCharter = async (charterId) => {
//         if (!confirm("Reject this charter?")) return;

//         setIsApproving(charterId);
//         try {
//             const result = await rejectCharterAction(charterId);

//             if (result.success) {
//                 setChartersList(chartersList.filter((c) => String(c._id) !== String(charterId)));
//                 alert("Charter rejected successfully!");
//             } else {
//                 alert("Failed to reject charter");
//             }
//         } catch (error) {
//             console.error("Error rejecting charter:", error);
//             alert("Error rejecting charter");
//         } finally {
//             setIsApproving(null);
//         }
//     };

//     const formatDate = (date) => {
//         return new Date(date).toLocaleDateString("en-US", {
//             month: "long",
//             day: "numeric",
//             year: "numeric",
//         });
//     };

//     if (!isAdmin) {
//         return (
//             <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] py-16">
//                 <main className="mx-auto w-full max-w-4xl rounded-[1.8rem] bg-[#f9f2e4] border border-[#d4b18b]/40 p-10 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
//                     <h1 className="text-3xl font-semibold text-slate-950">Access Denied</h1>
//                     <p className="mt-4 text-slate-600">
//                         You do not have permission to access this page. Only College Admins can manage clubs.
//                     </p>
//                 </main>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] py-8">
//             <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
//                 <div className="rounded-[1.8rem] bg-[#f9f2e4] border border-[#d4b18b]/40 p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
//                     <h1 className="text-3xl font-semibold text-slate-950">
//                         Club Management Dashboard
//                     </h1>
//                     <p className="mt-2 text-slate-600">
//                         Review clubs, approve charters, and manage club operations
//                     </p>
//                 </div>

//                 {/* Tab Navigation */}
//                 <div className="mb-8 mt-8 flex flex-wrap gap-3 border-b border-[#d4b18b]/40">
//                     {["clubs", "charters"].map((tab) => (
//                         <button
//                             key={tab}
//                             onClick={() => setActiveTab(tab)}
//                             className={`pb-3 px-1 text-sm font-semibold capitalize transition ${
//                                 activeTab === tab
//                                     ? "border-b-2 border-slate-950 text-slate-950"
//                                     : "text-slate-600 hover:text-slate-900"
//                             }`}
//                         >
//                             {tab}
//                             {tab === "charters" && chartersList.length > 0 && (
//                                 <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
//                                     {chartersList.length}
//                                 </span>
//                             )}
//                         </button>
//                     ))}
//                 </div>

//                 {/* Clubs Tab */}
//                 {activeTab === "clubs" && (
//                     <div className="space-y-6 mt-8">
//                         <div>
//                             <h2 className="text-xl font-semibold text-slate-950 mb-4">
//                                 All Clubs ({clustersList.length})
//                             </h2>
//                         </div>

//                         {clustersList.length > 0 ? (
//                             <div className="space-y-4">
//                                 {clustersList.map((club) => (
//                                     <div
//                                         key={club._id}
//                                         className="rounded-[1.5rem] bg-[#f9f2e4] border border-[#d4b18b]/40 p-6 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.5)]"
//                                     >
//                                         <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
//                                             <div className="flex-1">
//                                                 <h3 className="text-lg font-semibold text-slate-950">
//                                                     {club.name}
//                                                 </h3>
//                                                 <p className="mt-2 text-slate-600">
//                                                     {club.description || "No description provided"}
//                                                 </p>
//                                                 <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
//                                                     <span>
//                                                         <strong>Type:</strong>{" "}
//                                                         {club.isPrivate ? (
//                                                             <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
//                                                                 Private
//                                                             </span>
//                                                         ) : (
//                                                             <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
//                                                                 Public
//                                                             </span>
//                                                         )}
//                                                     </span>
//                                                     <span>
//                                                         <strong>Members:</strong> {club.memberList?.length || 0}
//                                                     </span>
//                                                     <span>
//                                                         <strong>Events:</strong> {club.eventList?.length || 0}
//                                                     </span>
//                                                     <span>
//                                                         <strong>Created:</strong> {formatDate(club.createdAt)}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                             <div className="flex gap-2">
//                                                 <Link
//                                                     href={`/dashboard/clubs/${club._id}`}
//                                                     className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
//                                                 >
//                                                     View Details
//                                                 </Link>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <div className="rounded-[1.5rem] bg-[#f9f2e4] border border-[#d4b18b]/40 p-6 text-slate-600 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.5)]">
//                                 No clubs found.
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Charters Tab */}
//                 {activeTab === "charters" && (
//                     <div className="space-y-6 mt-8">
//                         {chartersList.length > 0 ? (
//                             <div className="space-y-4">
//                                 {chartersList.map((charter) => (
//                                     <div
//                                         key={charter._id}
//                                         className="rounded-[1.5rem] bg-[#f9f2e4] border border-[#d4b18b]/40 p-6 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.5)]"
//                                     >
//                                         <div className="flex flex-col gap-4">
//                                             <div>
//                                                 <div className="flex items-start justify-between gap-4">
//                                                     <div className="flex-1">
//                                                         <h3 className="text-lg font-semibold text-slate-950">
//                                                             {charter.name}
//                                                         </h3>
//                                                         <p className="mt-1 text-sm text-slate-600">
//                                                             {charter.description}
//                                                         </p>
//                                                         {charter.purpose && (
//                                                             <p className="mt-2 text-sm text-slate-600">
//                                                                 <strong>Purpose:</strong> {charter.purpose}
//                                                             </p>
//                                                         )}
//                                                     </div>
//                                                     <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
//                                                         {charter.status}
//                                                     </span>
//                                                 </div>
//                                                 <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-slate-600 sm:grid-cols-4">
//                                                     <div>
//                                                         <strong>Signatures:</strong> {charter.signatures?.length || 0}/10
//                                                     </div>
//                                                     <div>
//                                                         <strong>Proposed Owner:</strong> {charter.proposedOwner || "TBD"}
//                                                     </div>
//                                                     <div>
//                                                         <strong>Created:</strong> {formatDate(charter.createdAt)}
//                                                     </div>
//                                                     <div>
//                                                         <strong>Status:</strong> {charter.status}
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             <div className="flex gap-2">
//                                                 <button
//                                                     onClick={() => setSelectedCharter(charter._id === selectedCharter ? null : charter._id)}
//                                                     className="rounded-full bg-slate-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-500"
//                                                 >
//                                                     {selectedCharter === charter._id ? "Hide" : "View"} Details
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleApproveCharter(charter._id)}
//                                                     disabled={isApproving === charter._id}
//                                                     className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
//                                                 >
//                                                     {isApproving === charter._id ? "Approving..." : "Approve"}
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleRejectCharter(charter._id)}
//                                                     disabled={isApproving === charter._id}
//                                                     className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
//                                                 >
//                                                     {isApproving === charter._id ? "Rejecting..." : "Reject"}
//                                                 </button>
//                                             </div>

//                                             {selectedCharter === charter._id && (
//                                                 <div className="mt-4 rounded-[1.2rem] border border-[#d4b18b]/40 bg-[#fdfaf5] p-4">
//                                                     <h4 className="font-semibold text-slate-950 mb-3">
//                                                         Charter Details
//                                                     </h4>
//                                                     <div className="space-y-2 text-sm text-slate-700">
//                                                         <p>
//                                                             <strong>ID:</strong> {charter._id}
//                                                         </p>
//                                                         <p>
//                                                             <strong>Name:</strong> {charter.name}
//                                                         </p>
//                                                         <p>
//                                                             <strong>Description:</strong> {charter.description}
//                                                         </p>
//                                                         {charter.purpose && (
//                                                             <p>
//                                                                 <strong>Purpose:</strong> {charter.purpose}
//                                                             </p>
//                                                         )}
//                                                         <p>
//                                                             <strong>Proposed Owner:</strong> {charter.proposedOwner || "Not specified"}
//                                                         </p>
//                                                         <p>
//                                                             <strong>Initiator ID:</strong> {charter.initiatorId}
//                                                         </p>
//                                                         <p>
//                                                             <strong>Signatures:</strong> {charter.signatures?.length || 0}/10
//                                                         </p>
//                                                         <p>
//                                                             <strong>Status:</strong> {charter.status}
//                                                         </p>
//                                                         <p>
//                                                             <strong>Created:</strong> {formatDate(charter.createdAt)}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <div className="rounded-[1.5rem] bg-[#f9f2e4] border border-[#d4b18b]/40 p-6 text-slate-600 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.5)]">
//                                 No charters awaiting approval.
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 <Link
//                     href="/dashboard"
//                     className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
//                 >
//                     Back to Dashboard
//                 </Link>
//             </main>
//         </div>
//     );
// }
