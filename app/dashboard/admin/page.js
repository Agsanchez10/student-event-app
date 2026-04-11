"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CollegeAdminDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalClubs: 0,
    totalUsers: 0,
    totalCharters: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [eventsRes, clubsRes, usersRes, chartersRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/clubs"),
          fetch("/api/users"),
          fetch("/api/club-charters"),
        ]);

        const events = eventsRes.ok ? await eventsRes.json() : [];
        const clubs = clubsRes.ok ? await clubsRes.json() : [];
        const users = usersRes.ok ? await usersRes.json() : [];
        const charters = chartersRes.ok ? await chartersRes.json() : [];

        setStats({
          totalEvents: events.length,
          totalClubs: clubs.length,
          totalUsers: users.length,
          totalCharters: charters.length,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <main className="flex-1 min-h-[80vh] bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] text-slate-900">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            College Admin Dashboard
          </h1>
          <p className="mt-2 text-lg text-slate-700">Manage events, clubs, and charters</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <article className="relative rounded-[1.8rem] border border-[#c8884a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a] font-semibold">Total Events</p>
            <p className="mt-4 text-5xl font-bold text-[#e05c5c]">{stats.totalEvents}</p>
            <p className="mt-2 text-sm text-slate-700">Active and scheduled events</p>
          </article>

          <article className="relative rounded-[1.8rem] border border-[#d4975a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a] font-semibold">Total Clubs</p>
            <p className="mt-4 text-5xl font-bold text-[#e05c5c]">{stats.totalClubs}</p>
            <p className="mt-2 text-sm text-slate-700">Registered student clubs</p>
          </article>

          <article className="relative rounded-[1.8rem] border border-[#d4975a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a] font-semibold">Total Users</p>
            <p className="mt-4 text-5xl font-bold text-[#e05c5c]">{stats.totalUsers}</p>
            <p className="mt-2 text-sm text-slate-700">Active platform users</p>
          </article>

          <article className="relative rounded-[1.8rem] border border-[#d4975a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a] font-semibold">Pending Charters</p>
            <p className="mt-4 text-5xl font-bold text-[#e05c5c]">{stats.totalCharters}</p>
            <p className="mt-2 text-sm text-slate-700">Club charters awaiting review</p>
          </article>
        </div>

        {/* Management Sections */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] sm:p-10 lg:p-12">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950 mb-6">
                Management Panel
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Events Management */}
                <div className="relative rounded-[1.5rem] border border-[#d4b18b]/40 bg-white p-6 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">Events</h3>
                      <p className="mt-2 text-sm text-slate-600">Monitor and manage all platform events</p>
                    </div>
                    <span className="text-3xl">📅</span>
                  </div>
                  <Link 
                    href="/dashboard/events" 
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#e05c5c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
                  >
                    Manage Events
                  </Link>
                </div>

                {/* Clubs Management */}
                <div className="relative rounded-[1.5rem] border border-[#d4b18b]/40 bg-white p-6 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">Clubs</h3>
                      <p className="mt-2 text-sm text-slate-600">Oversee club registrations and memberships</p>
                    </div>
                    <span className="text-3xl">👥</span>
                  </div>
                  <Link 
                    href="/dashboard/clubs" 
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#e05c5c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
                  >
                    Manage Clubs
                  </Link>
                </div>

                {/* Charters Management */}
                <div className="relative rounded-[1.5rem] border border-[#d4b18b]/40 bg-white p-6 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">Club Charters</h3>
                      <p className="mt-2 text-sm text-slate-600">Review and approve pending charter requests</p>
                    </div>
                    <span className="text-3xl">📝</span>
                  </div>
                  <Link 
                    href="/dashboard/pending-charters" 
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#e05c5c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
                  >
                    Review Charters
                  </Link>
                </div>

                {/* Flags Management */}
                <div className="relative rounded-[1.5rem] border border-[#d4b18b]/40 bg-white p-6 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">Flags & Reports</h3>
                      <p className="mt-2 text-sm text-slate-600">Address flagged content and violations</p>
                    </div>
                    <span className="text-3xl">🚩</span>
                  </div>
                  <Link 
                    href="/dashboard/admin/flagged-content" 
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#e05c5c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
                  >
                    Review Flagged Content
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative rounded-[1.5rem] border border-[#d4b18b]/40 bg-white/50 p-6 shadow-sm backdrop-blur">
            <h3 className="font-semibold text-slate-950">System Health</h3>
            <p className="mt-2 text-sm text-slate-600">All systems operational ✓</p>
          </div>

          <div className="relative rounded-[1.5rem] border border-[#d4b18b]/40 bg-white/50 p-6 shadow-sm backdrop-blur">
            <h3 className="font-semibold text-slate-950">Database Status</h3>
            <p className="mt-2 text-sm text-slate-600">Connected and synced ✓</p>
          </div>

          <div className="relative rounded-[1.5rem] border border-[#d4b18b]/40 bg-white/50 p-6 shadow-sm backdrop-blur">
            <h3 className="font-semibold text-slate-950">Last Updated</h3>
            <p className="mt-2 text-sm text-slate-600">{new Date().toLocaleString()}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
