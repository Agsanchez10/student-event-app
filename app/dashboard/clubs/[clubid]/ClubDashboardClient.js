"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { fetchPublicUserInfo } from "@/app/actions/userActions";
import { leaveClubAction } from "@/app/actions/clubActions";
import { addFlag } from "@/app/actions/flagActions";
import ClubDetailsClient from "./ClubDetailsClient";
import ClubCommunityClient from "./ClubCommunityClient";
import ClubAnnouncementsClient from "./ClubAnnouncementsClient";
import ClubEventsClient from "./ClubEventsClient";

export default function ClubDashboardClient({
    club,
    currentUserId,
    userRole,
    isAdmin,
    isMember,
    announcements,
    events,
    membershipApplications,
}) {
    const [activeTab, setActiveTab] = useState("details");
    const [isLeavingClub, setIsLeavingClub] = useState(false);
    const [ownerNameCache, setOwnerNameCache] = useState({});
    const [showFlagForm, setShowFlagForm] = useState(false);
    const [flagTarget, setFlagTarget] = useState(null);
    const [flagFormData, setFlagFormData] = useState({
        reason: "",
        description: "",
    });
    const [isFlagging, setIsFlagging] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [applications, setApplications] = useState(membershipApplications || []);
     

    
    useEffect(() => {
        // Fetch club admin name
        if (club.admin && !ownerNameCache[club.admin]) {
            getOwnerName(club.admin).then(name => {
                setOwnerNameCache(prevCache => ({
                    ...prevCache,
                    [club.admin]: name
                }));
            });
        }

        // Fetch announcement owner names
        announcements.forEach(announcement => {
            if (announcement.ownerId && !ownerNameCache[announcement.ownerId]) {
                getOwnerName(announcement.ownerId).then(name => {
                    setOwnerNameCache(prevCache => ({
                        ...prevCache,
                        [announcement.ownerId]: name
                    }));
                });
            }
        });
    }, [announcements, club.admin]);

    // Listen for tab switch events from child components
    useEffect(() => {
        const handleSwitchTab = (event) => {
            setActiveTab(event.detail);
        };

        window.addEventListener("switchTab", handleSwitchTab);
        return () => window.removeEventListener("switchTab", handleSwitchTab);
    }, []);

    const getOwnerName = async (ownerId) => {
        try {
            const result = await fetchPublicUserInfo(ownerId);
            if (result.success) {
                const user = result.data;
                const name = `${user.firstName} ${user.lastName}`.trim() || user.email || "Unknown";
                console.log(`Fetched owner name for user ID ${ownerId}: ${name}`);
                return name || "TBD";
            } else {
                throw new Error('Failed to fetch owner name');
            }
        }
         catch (error) {
            console.error('An error occurred while fetching the owner name', error);
            return "TBD";
        }
        
    }

    // Leave club handler
    const handleLeaveClub = async () => {
        if (!confirm("Are you sure you want to leave this club?")) return;

        setIsLeavingClub(true);
        try {
            const result = await leaveClubAction(club._id, currentUserId);

            if (result.success) {
                alert("You have successfully left the club");
                window.location.href = "/dashboard/student";
            } else {
                alert("Failed to leave the club");
            }
        } catch (error) {
            console.error("Error leaving club:", error);
            alert("Error leaving the club");
        } finally {
            setIsLeavingClub(false);
        }
    };

    const handleOpenFlagForm = (item, itemType) => {
        setFlagTarget({ item, type: itemType });
        setFlagFormData({ reason: "", description: "" });
        setShowFlagForm(true);
    };

    const handleSubmitFlag = async (e) => {
        e.preventDefault();
        
        if (!flagFormData.reason.trim()) {
            alert("Please select a reason");
            return;
        }

        setIsFlagging(true);
        try {
            const result = await addFlag({
                flaggedById: currentUserId,
                contentId: flagTarget.item._id,
                type: flagTarget.type,
                reason: flagFormData.reason,
                description: flagFormData.description,
            });

            if (result.success) {
                alert("Thank you for reporting this content. Our team will review it shortly.");
                setShowFlagForm(false);
                setFlagTarget(null);
                setFlagFormData({ reason: "", description: "" });
            } else {
                alert("Failed to submit report");
            }
        } catch (error) {
            console.error("Error submitting flag:", error);
            alert("Error submitting report");
        } finally {
            setIsFlagging(false);
        }
    };

    const handleApproveApplication = async (applicationId, userId) => {
        try {
            const response = await fetch(
                `/api/clubs/${club._id}/membership-applications/${applicationId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "approved", userId }),
                }
            );

            if (response.ok) {
                setApplications(
                    applications.filter((app) => String(app._id) !== String(applicationId))
                );
                alert("Application approved!");
            } else {
                alert("Failed to approve application");
            }
        } catch (error) {
            console.error("Error approving application:", error);
            alert("Error approving application");
        }
    };

    const handleRejectApplication = async (applicationId) => {
        try {
            const response = await fetch(
                `/api/clubs/${club._id}/membership-applications/${applicationId}`,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                setApplications(
                    applications.filter((app) => String(app._id) !== String(applicationId))
                );
                alert("Application rejected!");
            } else {
                alert("Failed to reject application");
            }
        } catch (error) {
            console.error("Error rejecting application:", error);
            alert("Error rejecting application");
        }
    };

    const getBackLink = () => {
        // Determine navigation based on user role
        if (userRole === "CollegeAdmin" || userRole === "SystemAdmin") {
            return "/dashboard";
        } else if (isAdmin) {
            // Club owner (student who owns the club)
            return "/dashboard";
        } else {
            // Regular student member
            return "/dashboard/student";
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "long",
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
                    <Link href={getBackLink()} className="inline-flex items-center justify-center rounded-3xl border border-[#d4b18b] bg-[#fff5e4] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-[#c1a06e] hover:bg-[#f8e7ce]">
                        ← Back
                    </Link>
                    {isMember && !isAdmin && (
                        <button
                            onClick={handleLeaveClub}
                            disabled={isLeavingClub}
                            className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {isLeavingClub ? "Leaving..." : "Leave Club"}
                        </button>
                    )}
                </div>

                {/* Club Hero Section */}
                <section className="relative overflow-hidden rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] sm:p-10 lg:p-12 mb-8">
                    <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr]">
                        <div className="space-y-7">
                            <div className="inline-flex items-center gap-3 rounded-full bg-[#e05c5c]/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-[#a33b3b] shadow-sm shadow-[#e05c5c]/10">
                                Club Dashboard
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                                    {club.name}
                                </h1>
                                <p className="max-w-xl text-base leading-8 text-slate-700 sm:text-lg">
                                    {club.description || "Manage your club activities and members"}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-5">
                            <article className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-lg shadow-[#b08f6c]/10">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">Club Info</p>
                                        <ul className="mt-4 space-y-3 text-slate-700 text-sm">
                                            <li><strong>Type:</strong> {club.isPrivate ? "Private" : "Public"}</li>
                                            <li><strong>Members:</strong> {club.memberList?.length || 0}</li>
                                            <li><strong>Created:</strong> {new Date(club.createdAt).getFullYear()}</li>
                                            <li><strong>Admin:</strong> {club.ownerID ? ownerNameCache[club.ownerID] || "Loading..." : "None"}</li>
                                        </ul>
                                    </div>
                                    <button
                                        onClick={() => handleOpenFlagForm(club, "club")}
                                        className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-yellow-600 whitespace-nowrap"
                                        title="Report this club"
                                    >
                                        🚩 Flag
                                    </button>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Tab Navigation */}
                <div className="mb-8 flex flex-wrap gap-3 border-b border-[#d4b18b]/40">
                    {["details", "announcements", "events", "community", ...(club.isPrivate ? ["applications"] : [])].map(
                        (tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 px-1 text-sm font-semibold capitalize transition ${
                                    activeTab === tab
                                        ? "border-b-2 border-[#e05c5c] text-[#e05c5c]"
                                        : "text-slate-600 hover:text-[#a33b3b]"
                                }`}
                            >
                                {tab}
                            </button>
                        )
                    )}
                </div>

                {/* Content Sections */}
                <div className="space-y-6">
                    {/* Details Tab */}
                    {activeTab === "details" && (
                        <ClubDetailsClient
                            club={club}
                            clubAnnouncements={announcements}
                            clubEvents={events}
                            isAdmin={isAdmin}
                            ownerNameCache={ownerNameCache}
                            setSelectedEvent={setSelectedEvent}
                            handleOpenFlagForm={handleOpenFlagForm}
                            formatDate={formatDate}
                        />
                    )}

                    {/* Community Tab */}
                    {activeTab === "community" && (
                        <ClubCommunityClient
                            club={club}
                            formatDate={formatDate}
                        />
                    )}

                    {/* Announcements Tab */}
                    {activeTab === "announcements" && (
                        <ClubAnnouncementsClient
                            club={club}
                            currentUserId={currentUserId}
                            userRole={userRole}
                            isAdmin={isAdmin}
                            announcements={announcements}
                            clubEvents={events}
                            ownerNameCache={ownerNameCache}
                            setSelectedEvent={setSelectedEvent}
                            handleOpenFlagForm={handleOpenFlagForm}
                            formatDate={formatDate}
                        />
                    )}

                    {/* Events Tab */}
                    {activeTab === "events" && (
                        <ClubEventsClient
                            club={club}
                            currentUserId={currentUserId}
                            userRole={userRole}
                            isAdmin={isAdmin}
                            isMember={isMember}
                            events={events}
                            handleOpenFlagForm={handleOpenFlagForm}
                            setSelectedEvent={setSelectedEvent}
                            formatDate={formatDate}
                        />
                    )}

                    {/* Membership Applications Tab */}
                    {activeTab === "applications" && club.isPrivate && (
                        <div className="space-y-4">
                            {applications.length > 0 ? (
                                applications.map((app) => (
                                    <div
                                        key={app._id}
                                        className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-md shadow-[#b9955d]/10"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-950">
                                                    {app.userName}
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-700">
                                                    {app.userEmail}
                                                </p>
                                                <p className="mt-2 text-xs text-slate-600">
                                                    Applied on {formatDate(app.createdAt)}
                                                </p>
                                            </div>
                                            {isAdmin && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleApproveApplication(app._id, app.userId)
                                                        }
                                                        className="rounded-full bg-[#8fbc8f] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#7ba77b]"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectApplication(app._id)}
                                                        className="rounded-full bg-[#e05c5c] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#c94a4a]"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-700">No pending applications.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Event Details Overlay Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative w-full max-w-2xl rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] sm:p-10">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="absolute right-6 top-6 text-2xl text-[#a33b3b] hover:text-[#e05c5c]"
                        >
                            ✕
                        </button>

                        {/* Event Details */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-semibold text-slate-950">
                                    {selectedEvent.name}
                                </h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    Club: {club.name}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-lg border border-[#d4b18b]/40 bg-white p-4">
                                    <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">Description</p>
                                    <p className="mt-3 text-slate-700">{selectedEvent.description}</p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-lg border border-[#d4b18b]/40 bg-white p-4">
                                        <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">📅 Date & Time</p>
                                        <p className="mt-2 text-lg font-semibold text-slate-950">
                                            {formatDate(selectedEvent.date)}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-[#d4b18b]/40 bg-white p-4">
                                        <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">📍 Location</p>
                                        <p className="mt-2 text-lg font-semibold text-slate-950">
                                            {selectedEvent.location || "TBD"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-lg border border-[#d4b18b]/40 bg-white p-4">
                                        <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">👥 Registrations</p>
                                        <p className="mt-2 text-lg font-semibold text-slate-950">
                                            {selectedEvent.registrationList?.length || 0} registered
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-[#d4b18b]/40 bg-white p-4">
                                        <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">📌 Status</p>
                                        <span className="mt-2 inline-flex rounded-full bg-[#e05c5c]/15 px-3 py-1 text-sm font-semibold text-[#a33b3b]">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="rounded-full border-2 border-[#d4b18b] bg-transparent px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#f0e9d8]"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Flag Form Modal */}
            {showFlagForm && flagTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative w-full max-w-md rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
                        <h2 className="mb-6 text-2xl font-semibold text-slate-950">Report Content</h2>
                        
                        <form onSubmit={handleSubmitFlag} className="space-y-5">
                            {/* Reason Selection */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Reason for Reporting
                                </label>
                                <select
                                    value={flagFormData.reason}
                                    onChange={(e) =>
                                        setFlagFormData({
                                            ...flagFormData,
                                            reason: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900"
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="spam">Spam</option>
                                    <option value="harassment">Harassment</option>
                                    <option value="inappropriate">Inappropriate Content</option>
                                    <option value="misinformation">Misinformation</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Additional Details (Optional)
                                </label>
                                <textarea
                                    value={flagFormData.description}
                                    onChange={(e) =>
                                        setFlagFormData({
                                            ...flagFormData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Please provide more information about why you're reporting this..."
                                    rows="4"
                                    className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowFlagForm(false);
                                        setFlagTarget(null);
                                        setFlagFormData({ reason: "", description: "" });
                                    }}
                                    className="flex-1 rounded-full border-2 border-[#d4b18b] bg-transparent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#f0e9d8]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isFlagging}
                                    className="flex-1 rounded-full bg-[#e05c5c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a] disabled:opacity-60"
                                >
                                    {isFlagging ? "Submitting..." : "Submit Report"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
