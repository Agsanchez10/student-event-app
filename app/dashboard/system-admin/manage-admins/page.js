"use client";

import { useState } from "react";
import CreateAdminForm from "@/app/components/SystemAdmin/CreateAdminForm";
import AdminList from "@/app/components/SystemAdmin/AdminList";

export default function ManageAdminsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdminCreated = () => {
    setShowCreateForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <main className="flex-1 min-h-[80vh] bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] text-slate-900">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              Admin Management
            </h1>
            <p className="mt-2 text-lg text-slate-700">
              Create and manage admin accounts
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="rounded-lg bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
          >
            {showCreateForm ? "Cancel" : "+ Create Admin"}
          </button>
        </div>

        {/* Create Admin Form */}
        {showCreateForm && (
          <section className="relative overflow-hidden rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] sm:p-10 lg:p-12 mb-8">
            <h2 className="text-2xl font-semibold text-slate-950 mb-6">Create New Admin</h2>
            <CreateAdminForm onSuccess={handleAdminCreated} />
          </section>
        )}

        {/* Admin List Section */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] sm:p-10 lg:p-12">
          <h2 className="text-2xl font-semibold text-slate-950 mb-6">Admin Accounts</h2>
          <AdminList refreshTrigger={refreshTrigger} />
        </section>
      </div>
    </main>
  );
}
