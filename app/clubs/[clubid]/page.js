"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ClubLandingPage() {
  const params = useParams();
  const clubId = params.clubid;
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await fetch(`/api/clubs/${clubId}`);
        if (res.ok) {
          const data = await res.json();
          setClub(data);
        }
      } catch (error) {
        console.error("Failed to fetch club:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [clubId]);

  if (loading) {
    return (
      <main className="flex-1 min-h-[80vh] bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] text-slate-900">
        <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
          <p className="text-center text-lg text-slate-700">Loading club...</p>
        </div>
      </main>
    );
  }

  if (!club) {
    return (
      <main className="flex-1 min-h-[80vh] bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] text-slate-900">
        <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
          <p className="text-center text-lg text-slate-700">Club not found</p>
          <Link href="/dashboard/clubs" className="mt-4 text-center text-[#e05c5c] hover:text-[#c94a4a]">
            Back to clubs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-[80vh] bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] text-slate-900">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/dashboard/clubs" className="text-sm font-semibold text-[#e05c5c] hover:text-[#c94a4a]">
            ← Back to clubs
          </Link>
        </div>

        {/* Club Hero Section */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] sm:p-10 lg:p-12 mb-8">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-3 rounded-full bg-[#e05c5c]/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-[#a33b3b] shadow-sm shadow-[#e05c5c]/10">
                Club Profile
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {club.name}
                </h1>
                <p className="max-w-xl text-base leading-8 text-slate-700 sm:text-lg">
                  {club.description || "Join us and be part of an amazing student community!"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <button className="inline-flex items-center justify-center rounded-3xl bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]">
                  Join Club
                </button>
                <Link href="/dashboard/events" className="inline-flex items-center justify-center rounded-3xl border border-[#d4b18b] bg-[#fff5e4] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-[#c1a06e] hover:bg-[#f8e7ce]">
                  View Events
                </Link>
              </div>
            </div>

            <div className="grid gap-5">
              <article className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-lg shadow-[#b08f6c]/10">
                <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">Club Info</p>
                <ul className="mt-4 space-y-3 text-slate-700 text-sm">
                  <li><strong>Status:</strong> {club.status || "Active"}</li>
                  <li><strong>Members:</strong> {club.members?.length || 0}</li>
                  <li><strong>Since:</strong> {club.createdAt ? new Date(club.createdAt).getFullYear() : "N/A"}</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <article className="relative rounded-[1.8rem] border border-[#c8884a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10">
            <p className="text-3xl font-bold text-[#e05c5c]">👥</p>
            <p className="mt-4 text-xl font-semibold text-slate-950">Community</p>
            <p className="mt-2 text-sm text-slate-700">Connect with fellow members and build lasting friendships.</p>
          </article>

          <article className="relative rounded-[1.8rem] border border-[#d4975a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10">
            <p className="text-3xl font-bold text-[#e05c5c]">📅</p>
            <p className="mt-4 text-xl font-semibold text-slate-950">Events</p>
            <p className="mt-2 text-sm text-slate-700">Participate in club-organized activities and meetings.</p>
          </article>

          <article className="relative rounded-[1.8rem] border border-[#d4975a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10">
            <p className="text-3xl font-bold text-[#e05c5c]">🎯</p>
            <p className="mt-4 text-xl font-semibold text-slate-950">Mission</p>
            <p className="mt-2 text-sm text-slate-700">Support our club's vision and make an impact on campus.</p>
          </article>
        </div>
      </div>
    </main>
  );
}
