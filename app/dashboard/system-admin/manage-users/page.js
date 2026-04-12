"use client";

import { useState } from "react";
import UserList from "@/app/components/SystemAdmin/UserList";

export default function ManageUsersPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <main className="flex-1 min-h-[80vh] bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] text-slate-900">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            User Management
          </h1>
          <p className="mt-2 text-lg text-slate-700">
            View and manage all platform users
          </p>
        </div>

        {/* Users List Section */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] sm:p-10 lg:p-12">
          <UserList refreshTrigger={refreshTrigger} />
        </section>
      </div>
    </main>
  );
}
