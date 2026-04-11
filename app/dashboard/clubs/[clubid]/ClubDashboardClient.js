"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function ClubDashboardClient({
    club,
    currentUserId,
    isAdmin,
    isMember,
    announcements,
    events,
    membershipApplications,
}) {
    const [activeTab, setActiveTab] = useState("details");
    const [clubAnnouncements, setClubAnnouncements] = useState(announcements || []);
    const [clubEvents, setClubEvents] = useState(events || []);
    const [applications, setApplications] = useState(membershipApplications || []);
    const [isDeleting, setIsDeleting] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
    const [showEventForm, setShowEventForm] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isLeavingClub, setIsLeavingClub] = useState(false);
    const [ownerNameCache, setOwnerNameCache] = useState({});
    const [showFlagForm, setShowFlagForm] = useState(false);
    const [flagTarget, setFlagTarget] = useState(null);
    const [flagFormData, setFlagFormData] = useState({
        reason: "",
        description: "",
    });
    const [isFlagging, setIsFlagging] = useState(false);
    const [announcementFormData, setAnnouncementFormData] = useState({
        title: "",
        description: "",
        eventId: "",
    });
    const [eventFormData, setEventFormData] = useState({
        name: "",
        description: "",
        date: "",
        location: "",
    });
     

    
    useEffect(() => {
        clubAnnouncements.forEach(announcement => {
            if (announcement.ownerId && !ownerNameCache[announcement.ownerId]) {
                getOwnerName(announcement.ownerId).then(name => {
                    setOwnerNameCache(prevCache => ({
                        ...prevCache,
                        [announcement.ownerId]: name
                    }));
                });
            }
        });
    }, [clubAnnouncements]);

    const getOwnerName = async (ownerId) => {
        try {
            const response = await fetch(`/api/users/${ownerId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if(!response.ok) {
                throw new Error('Failed to fetch owner name');
            }

            const user = await response.json();
            const name = `${user.firstName} ${user.lastName}`.trim() || user.email || "Unknown";
            console.log(`Fetched owner name for user ID ${ownerId}: ${name}`);
            return name || "TBD";
        }
         catch (error) {
            console.error('An error occurred while fetching the owner name', error);
            return "TBD";
        }
        
    }


    // Announcement handlers
    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        if (!announcementFormData.title.trim() || !announcementFormData.description.trim()) {
            alert("Please fill in all fields");
            return;
        }

        setIsPosting(true);
        try {
            const response = await fetch(`/api/clubs/${club._id}/announcements`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: announcementFormData.title,
                    description: announcementFormData.description,
                    ownerId: currentUserId,
                    clubID: club._id,
                    eventId: announcementFormData.eventId || null,
                }),
            });

            if (response.ok) {
                const newAnnouncement = await response.json();
                setClubAnnouncements([newAnnouncement, ...clubAnnouncements]);
                setAnnouncementFormData({ title: "", description: "", eventId: "" });
                setShowAnnouncementForm(false);
                alert("Announcement posted successfully!");
            } else {
                alert("Failed to post announcement");
            }
        } catch (error) {
            console.error("Error posting announcement:", error);
            alert("Error posting announcement");
        } finally {
            setIsPosting(false);
        }
    };

    const handleDeleteAnnouncement = async (announcementId) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;

        setIsDeleting(announcementId);
        try {
            const response = await fetch(`/api/clubs/${club._id}/announcements/${announcementId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setClubAnnouncements(clubAnnouncements.filter((a) => String(a._id) !== String(announcementId)));
                alert("Announcement deleted successfully!");
            } else {
                alert("Failed to delete announcement");
            }
        } catch (error) {
            console.error("Error deleting announcement:", error);
            alert("Error deleting announcement");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleEditAnnouncement = async (announcementId, updatedData) => {
        try {
            const response = await fetch(`/api/clubs/${club._id}/announcements/${announcementId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                const updatedAnnouncement = await response.json();
                setClubAnnouncements(
                    clubAnnouncements.map((a) =>
                        String(a._id) === String(announcementId) ? updatedAnnouncement : a
                    )
                );
                alert("Announcement updated successfully!");
            } else {
                alert("Failed to update announcement");
            }
        } catch (error) {
            console.error("Error updating announcement:", error);
            alert("Error updating announcement");
        }
    };

    // Event handlers
    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (
            !eventFormData.name.trim() ||
            !eventFormData.description.trim() ||
            !eventFormData.date
        ) {
            alert("Please fill in all required fields");
            return;
        }

        setIsPosting(true);
        try {
            const response = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: eventFormData.name,
                    description: eventFormData.description,
                    date: new Date(eventFormData.date).toISOString(),
                    location: eventFormData.location || "TBD",
                    club: club.name,
                    ownerId: currentUserId,
                    visibility: "private",
                }),
            });

            if (response.ok) {
                const newEvent = await response.json();
                setClubEvents([newEvent, ...clubEvents]);
                setEventFormData({
                    name: "",
                    description: "",
                    date: "",
                    location: "",
                });
                setShowEventForm(false);
                alert("Event created successfully!");
            } else {
                alert("Failed to create event");
            }
        } catch (error) {
            console.error("Error creating event:", error);
            alert("Error creating event");
        } finally {
            setIsPosting(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        setIsDeleting(eventId);
        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setClubEvents(clubEvents.filter((e) => String(e._id) !== String(eventId)));
                alert("Event deleted successfully!");
            } else {
                alert("Failed to delete event");
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Error deleting event");
        } finally {
            setIsDeleting(null);
        }
    };

    // Leave club handler
    const handleLeaveClub = async () => {
        if (!confirm("Are you sure you want to leave this club?")) return;

        setIsLeavingClub(true);
        try {
            const response = await fetch(`/api/clubs/${club._id}/leave`, {
                method: "POST",
            });

            if (response.ok) {
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

    const handleRegisterEvent = async (eventId) => {
        try {
            const response = await fetch(`/api/events/${eventId}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                alert("Successfully registered for the event!");
                window.location.reload();
            } else {
                alert("Failed to register for the event");
            }
        } catch (error) {
            console.error("Error registering for event:", error);
            alert("Error registering for event");
        }
    };

    const handleUnregisterEvent = async (eventId) => {
        if (!confirm("Are you sure you want to unregister from this event?")) return;

        try {
            const response = await fetch(`/api/events/${eventId}/register`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                alert("Successfully unregistered from the event!");
                window.location.reload();
            } else {
                alert("Failed to unregister from the event");
            }
        } catch (error) {
            console.error("Error unregistering from event:", error);
            alert("Error unregistering from event");
        }
    };

    const isUserRegisteredForEvent = (event) => {
        if (!currentUserId || !event.registrationList) return false;
        return event.registrationList.some(id => String(id) === String(currentUserId));
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
            const response = await fetch("/api/flags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    flaggedById: currentUserId,
                    contentId: flagTarget.item._id,
                    type: flagTarget.type,
                    reason: flagFormData.reason,
                    description: flagFormData.description,
                }),
            });

            if (response.ok) {
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
                    <Link href="/dashboard/clubs" className="text-sm font-semibold text-[#e05c5c] hover:text-[#c94a4a]">
                        ← Back to clubs
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
                                            <li><strong>Admin:</strong> {club.admin ? club.admin.name || club.admin.email || "Unknown" : "None"}</li>
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
                    {["details", "community", "announcements", "events", ...(club.isPrivate ? ["applications"] : [])].map(
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
                        <div className="space-y-8">
                            {/* Info Cards */}
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <button
                                    onClick={() => setActiveTab("announcements")}
                                    className="relative rounded-[1.8rem] border border-[#c8884a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10 transition hover:shadow-lg hover:shadow-[#b9955d]/20 hover:border-[#c8884a]/50 cursor-pointer"
                                >
                                    <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">📢 Announcements</p>
                                    <p className="mt-4 text-2xl font-semibold text-slate-950">{clubAnnouncements.length}</p>
                                    <p className="mt-2 text-xs text-slate-600">Click to view all</p>
                                </button>

                                <button
                                    onClick={() => setActiveTab("events")}
                                    className="relative rounded-[1.8rem] border border-[#d4975a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10 transition hover:shadow-lg hover:shadow-[#b9955d]/20 hover:border-[#d4975a]/50 cursor-pointer"
                                >
                                    <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">📅 Events</p>
                                    <p className="mt-4 text-2xl font-semibold text-slate-950">{clubEvents.length}</p>
                                    <p className="mt-2 text-xs text-slate-600">Click to view all</p>
                                </button>

                                <button
                                    onClick={() => setActiveTab("community")}
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
                                            onClick={() => setActiveTab("announcements")}
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
                                                onClick={() => setActiveTab("announcements")}
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
                                                onClick={() => setActiveTab("announcements")}
                                                className="mt-3 text-sm font-semibold text-[#e05c5c] hover:text-[#c94a4a]"
                                            >
                                                Post the first announcement →
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Community Tab */}
                    {activeTab === "community" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-semibold text-slate-950">Club Members</h2>
                                <p className="text-sm text-slate-600">{club.memberList?.length || 0} members</p>
                            </div>

                            {club.memberList && club.memberList.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {club.memberList.map((member, index) => (
                                        
                                        <div
                                            
                                            key={index}
                                            className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-md shadow-[#b9955d]/10"
                                        >
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">Member</p>
                                                    <p className="mt-2 text-lg font-semibold text-slate-950">
                                                        {typeof member === 'object' ? member.firstName || member.email || 'Unknown' : member}
                                                    </p>
                                                </div>
                                                {typeof member === 'object' && member.email && (
                                                    <p className="text-sm text-slate-700">
                                                        {member.email}
                                                    </p>
                                                )}
                                                {typeof member === 'object' && member.joinedAt && (
                                                    <p className="text-xs text-slate-600">
                                                        Joined {formatDate(member.joinedAt)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-8 text-center">
                                    <p className="text-slate-700">No members yet. Be the first to join!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Announcements Tab */}
                    {activeTab === "announcements" && (
                        <div className="space-y-6">
                            {isAdmin && (
                                <div className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-8 shadow-md shadow-[#b9955d]/10">
                                    <button
                                        onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                                        className="rounded-full bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
                                    >
                                        {showAnnouncementForm ? "Cancel" : "Post Announcement"}
                                    </button>

                                    {showAnnouncementForm && (
                                        <form onSubmit={handlePostAnnouncement} className="mt-6 space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Announcement Title"
                                                value={announcementFormData.title}
                                                onChange={(e) =>
                                                    setAnnouncementFormData({
                                                        ...announcementFormData,
                                                        title: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                                            />
                                            <textarea
                                                placeholder="Announcement Description"
                                                value={announcementFormData.description}
                                                onChange={(e) =>
                                                    setAnnouncementFormData({
                                                        ...announcementFormData,
                                                        description: e.target.value,
                                                    })
                                                }
                                                rows="4"
                                                className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                                            />
                                            <select
                                                value={announcementFormData.eventId}
                                                onChange={(e) =>
                                                    setAnnouncementFormData({
                                                        ...announcementFormData,
                                                        eventId: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900"
                                            >
                                                <option value="">Select an event (optional)</option>
                                                {clubEvents.map((event) => (
                                                    <option key={event._id} value={event._id}>
                                                        {event.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="submit"
                                                disabled={isPosting}
                                                className="rounded-full bg-[#e05c5c] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a] disabled:opacity-60"
                                            >
                                                {isPosting ? "Posting..." : "Post"}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {clubAnnouncements.length > 0 ? (
                                <div className="space-y-4">
                                    {clubAnnouncements.map((announcement) => {
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
                                                <div className="flex flex-col items-end gap-3">
                                                    <div className="text-right whitespace-nowrap">
                                                        <p className="text-xs font-semibold text-slate-600">
                                                            {ownerNameCache[announcement.ownerId] || "Unknown"}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {formatDate(announcement.createdAt)}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 flex-wrap justify-end">
                                                        <button
                                                            onClick={() => handleOpenFlagForm(announcement, "announcement")}
                                                            className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-yellow-600"
                                                            title="Report this announcement"
                                                        >
                                                            🚩 Flag
                                                        </button>
                                                        {isAdmin && (
                                                            <>
                                                                <button
                                                                    onClick={() =>
                                                                        handleEditAnnouncement(announcement._id, {
                                                                            title: prompt("Edit title", announcement.title),
                                                                            description: prompt("Edit description", announcement.description),
                                                                        })
                                                                    }
                                                                    className="rounded-full bg-[#c8a882] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#a68963]"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteAnnouncement(announcement._id)}
                                                                    disabled={isDeleting === announcement._id}
                                                                    className="rounded-full bg-[#e05c5c] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#c94a4a] disabled:opacity-60"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-slate-700">No announcements yet.</p>
                            )}
                        </div>
                    )}

                    {/* Events Tab */}
                    {activeTab === "events" && (
                        <div className="space-y-6">
                            {isAdmin && (
                                <div className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-8 shadow-md shadow-[#b9955d]/10">
                                    <button
                                        onClick={() => setShowEventForm(!showEventForm)}
                                        className="rounded-full bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
                                    >
                                        {showEventForm ? "Cancel" : "Create Event"}
                                    </button>

                                    {showEventForm && (
                                        <form onSubmit={handleCreateEvent} className="mt-6 space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Event Name"
                                                value={eventFormData.name}
                                                onChange={(e) =>
                                                    setEventFormData({
                                                        ...eventFormData,
                                                        name: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                                            />
                                            <textarea
                                                placeholder="Event Description"
                                                value={eventFormData.description}
                                                onChange={(e) =>
                                                    setEventFormData({
                                                        ...eventFormData,
                                                        description: e.target.value,
                                                    })
                                                }
                                                rows="3"
                                                className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                                            />
                                            <input
                                                type="datetime-local"
                                                value={eventFormData.date}
                                                onChange={(e) =>
                                                    setEventFormData({
                                                        ...eventFormData,
                                                        date: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Location (optional)"
                                                value={eventFormData.location}
                                                onChange={(e) =>
                                                    setEventFormData({
                                                        ...eventFormData,
                                                        location: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-2 text-slate-900 placeholder-slate-500"
                                            />
                                            <button
                                                type="submit"
                                                disabled={isPosting}
                                                className="rounded-full bg-[#e05c5c] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a] disabled:opacity-60"
                                            >
                                                {isPosting ? "Creating..." : "Create Event"}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {clubEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {clubEvents.map((event) => (
                                        <div
                                            key={event._id}
                                            className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-md shadow-[#b9955d]/10"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-slate-950">
                                                        {event.name}
                                                    </h3>
                                                    <p className="mt-2 text-slate-700">
                                                        {event.description}
                                                    </p>
                                                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                                                        <p><strong>Date:</strong> {formatDate(event.date)}</p>
                                                        <p><strong>Location:</strong> {event.location || "TBD"}</p>
                                                        <p><strong>Registrations:</strong> {event.registrationList?.length || 0}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {/* Details Button */}
                                                    <button
                                                        onClick={() => setSelectedEvent(event)}
                                                        className="rounded-full bg-[#d4975a] px-3 py-1 text-center text-xs font-semibold text-white transition hover:bg-[#b8805f]"
                                                    >
                                                        Details
                                                    </button>

                                                    {/* Flag Button */}
                                                    <button
                                                        onClick={() => handleOpenFlagForm(event, "event")}
                                                        className="rounded-full bg-yellow-500 px-3 py-1 text-center text-xs font-semibold text-white transition hover:bg-yellow-600"
                                                        title="Report this event"
                                                    >
                                                        🚩 Flag
                                                    </button>

                                                    {/* Register/Leave Button for Students */}
                                                    {!isAdmin && (
                                                        isMember ? (
                                                            <button
                                                                onClick={() => {
                                                                    if (isUserRegisteredForEvent(event)) {
                                                                        handleUnregisterEvent(event._id);
                                                                    } else {
                                                                        handleRegisterEvent(event._id);
                                                                    }
                                                                }}
                                                                className={`rounded-full px-3 py-1 text-center text-xs font-semibold text-white transition ${
                                                                    isUserRegisteredForEvent(event)
                                                                        ? "bg-red-500 hover:bg-red-600"
                                                                        : "bg-[#8fbc8f] hover:bg-[#7ba77b]"
                                                                }`}
                                                            >
                                                                {isUserRegisteredForEvent(event) ? "Leave" : "Register"}
                                                            </button>
                                                        ) : null
                                                    )}

                                                    {/* Edit/Delete Buttons for Admin */}
                                                    {isAdmin && (
                                                        <>
                                                            <Link
                                                                href={`/dashboard/events/${event._id}`}
                                                                className="rounded-full bg-[#c8a882] px-3 py-1 text-center text-xs font-semibold text-white transition hover:bg-[#a68963]"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDeleteEvent(event._id)}
                                                                disabled={isDeleting === event._id}
                                                                className="rounded-full bg-[#e05c5c] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#c94a4a] disabled:opacity-60"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-700">No events yet.</p>
                            )}
                        </div>
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
