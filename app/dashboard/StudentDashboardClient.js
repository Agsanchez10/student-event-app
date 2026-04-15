"use client";

import { useState } from "react";
import RegisteredEventsClient from "./RegisteredEventsClient";
import ClubCharterActivityClient from "./ClubCharterActivityClient";

export default function StudentDashboardClient({
  studentEvents,
  memberClubs,
  userCharters,
  recentAnnouncements,
  clubPage,
  eventPage,
  charterPage,
  currentUser,
  itemsPerPage,
}) {
  const [activeTab, setActiveTab] = useState("events");
  const [announcementPage, setAnnouncementPage] = useState(1);
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [flagTarget, setFlagTarget] = useState(null);
  const [flagFormData, setFlagFormData] = useState({
    reason: "",
    description: "",
  });
  const [isFlagging, setIsFlagging] = useState(false);

  const ANNOUNCEMENTS_PER_PAGE = 5;
  const announcementPageStart = (announcementPage - 1) * ANNOUNCEMENTS_PER_PAGE;
  const announcementPages = Math.max(1, Math.ceil(recentAnnouncements.length / ANNOUNCEMENTS_PER_PAGE));

  const tabs = [
    { id: "events", label: "📅 Events", icon: "📅" },
    { id: "announcements", label: "📢 Announcements", icon: "📢" },
    { id: "clubs", label: "🏢 Clubs", icon: "🏢" },
    { id: "charters", label: "📑 Club Charters", icon: "📑" },
  ];

  // Create a map of club IDs to club names
  const clubMap = memberClubs.reduce((acc, club) => {
    acc[club._id] = club.name;
    return acc;
  }, {});

  // Format announcement date
  const formatAnnouncementDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Flag handlers
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
          flaggedById: currentUser,
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

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="relative rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-2 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
        <div className="flex gap-2 sm:gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-[#e05c5c] text-white shadow-md"
                  : "bg-transparent text-slate-700 hover:bg-[#f0e4d0]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="animate-fade-in">
            <RegisteredEventsClient
              registeredEvents={studentEvents}
              clubPage={clubPage}
              eventPage={eventPage}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div className="space-y-6 animate-fade-in">
            <div className="relative rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
              <h2 className="text-2xl font-semibold text-slate-950">Recent Announcements</h2>
              <p className="mt-2 text-slate-700">Announcements from clubs you belong to (last 2 weeks)</p>

              {recentAnnouncements.length === 0 ? (
                <div className="mt-6 rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 text-center text-slate-700">
                  No recent announcements from your clubs.
                </div>
              ) : (
                <>
                  <div className="mt-6 space-y-4">
                    {recentAnnouncements.slice(announcementPageStart, announcementPageStart + ANNOUNCEMENTS_PER_PAGE).map((announcement) => (
                      <div key={announcement._id} className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-md shadow-[#b9955d]/10">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-slate-950">
                                {announcement.title || "Untitled"}
                              </h3>
                              <span className="text-sm text-slate-500">
                                {formatAnnouncementDate(announcement.createdAt)}
                              </span>
                            </div>
                            <a
                              href={`/dashboard/clubs/${announcement.clubID}`}
                              className="inline-flex w-fit text-sm font-medium text-[#e05c5c] hover:text-[#c94a4a] transition underline"
                            >
                              {clubMap[announcement.clubID] || "Unknown Club"} →
                            </a>
                          </div>
                          <p className="flex justify-between text-slate-700">
                            {announcement.description || "No description available."}
                          
                          
                            <button
                              onClick={() => handleOpenFlagForm(announcement, "announcement")}
                              className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-yellow-600"
                              title="Report this announcement"
                            >
                              🚩 Flag
                            </button>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {announcementPages > 1 && (
                    <div className="mt-6 flex items-center justify-between rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-4 text-sm text-slate-700">
                      <button
                        onClick={() => setAnnouncementPage(Math.max(1, announcementPage - 1))}
                        disabled={announcementPage === 1}
                        className={`rounded-full px-4 py-2 transition ${announcementPage === 1 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-[#e05c5c] text-white hover:bg-[#c94a4a]"}`}
                      >
                        Previous
                      </button>
                      <span className="font-semibold">Page {announcementPage} of {announcementPages}</span>
                      <button
                        onClick={() => setAnnouncementPage(Math.min(announcementPages, announcementPage + 1))}
                        disabled={announcementPage === announcementPages}
                        className={`rounded-full px-4 py-2 transition ${announcementPage === announcementPages ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-[#e05c5c] text-white hover:bg-[#c94a4a]"}`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Clubs Tab */}
        {activeTab === "clubs" && (
          <div className="space-y-6 animate-fade-in">
            <div className="relative rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
              <h2 className="text-2xl font-semibold text-slate-950">Clubs you belong to</h2>
              <p className="mt-2 text-slate-700">View the clubs where you are a member.</p>

              {memberClubs.length === 0 ? (
                <div className="mt-6 rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 text-center text-slate-700">
                  You are not a member of any clubs yet.
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {memberClubs.map((club) => (
                    <div key={club._id} className="rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-md shadow-[#b9955d]/10">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-950">
                            {club.name || "Unnamed Club"}
                          </h3>
                          <p className="mt-3 text-sm text-slate-700">
                            {club.description || "No description available."}
                          </p>
                        </div>
                        <div className="text-right">
                          <a
                            href={`/dashboard/clubs/${club._id}`}
                            className="mt-4 inline-block rounded-full bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
                          >
                            Visit Club Page
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Club Charters Tab */}
        {activeTab === "charters" && (
          <div className="animate-fade-in">
            <ClubCharterActivityClient
              charters={userCharters}
              currentPage={charterPage}
              itemsPerPage={itemsPerPage}
              currentUserId={currentUser}
            />
          </div>
        )}
      </div>

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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
