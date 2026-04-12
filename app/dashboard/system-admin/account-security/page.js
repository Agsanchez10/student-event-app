"use client";

import { useState, useEffect } from "react";
import PasswordResetModal from "@/app/components/SystemAdmin/PasswordResetModal";

export default function AccountSecurityPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [filter, setFilter] = useState("all"); // all, active, deactivated

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/system-admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeactivateAccount = async (userId, userName) => {
    if (
      !confirm(
        `Are you sure you want to deactivate the account for ${userName}? This action can be reversed.`
      )
    )
      return;

    try {
      const res = await fetch("/api/system-admin/account-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deactivate",
          userId: userId,
        }),
      });

      if (res.ok) {
        alert("Account deactivated successfully");
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to deactivate account");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    }
  };

  const handleActivateAccount = async (userId, userName) => {
    try {
      const res = await fetch("/api/system-admin/account-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "activate",
          userId: userId,
        }),
      });

      if (res.ok) {
        alert("Account activated successfully");
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to activate account");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    }
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setShowPasswordReset(true);
  };

  const admins = users.filter((u) => u.role === "Admin");
  const activeAdmins = admins.filter((u) => u.isActive);
  const deactivatedAdmins = admins.filter((u) => !u.isActive);

  const filteredAdmins = admins.filter((admin) => {
    if (filter === "active") return admin.isActive;
    if (filter === "deactivated") return !admin.isActive;
    return true;
  });

  if (loading) {
    return (
      <main className="flex-1 min-h-[80vh] bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] text-slate-900">
        <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
          <p className="text-slate-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-[80vh] bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] text-slate-900">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            Account Security
          </h1>
          <p className="mt-2 text-lg text-slate-700">
            Manage account status and password resets
          </p>
        </div>

        {/* Security Stats */}
        <div className="grid gap-6 sm:grid-cols-3 mb-8">
          <article className="relative rounded-[1.8rem] border border-[#c8884a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a] font-semibold">
              Total Admin Accounts
            </p>
            <p className="mt-4 text-5xl font-bold text-[#e05c5c]">{admins.length}</p>
          </article>

          <article className="relative rounded-[1.8rem] border border-[#d4975a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a] font-semibold">
              Active
            </p>
            <p className="mt-4 text-5xl font-bold text-green-600">{activeAdmins.length}</p>
          </article>

          <article className="relative rounded-[1.8rem] border border-[#d4975a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a] font-semibold">
              Deactivated
            </p>
            <p className="mt-4 text-5xl font-bold text-red-600">{deactivatedAdmins.length}</p>
          </article>
        </div>

        {/* Account Management Section */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] sm:p-10 lg:p-12">
          <h2 className="text-2xl font-semibold text-slate-950 mb-6">Account Controls</h2>

          {/* Filter buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === "all"
                  ? "bg-[#e05c5c] text-white"
                  : "bg-[#f0e4d4] text-slate-700 hover:bg-[#e8d4c0]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === "active"
                  ? "bg-green-600 text-white"
                  : "bg-[#f0e4d4] text-slate-700 hover:bg-[#e8d4c0]"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("deactivated")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === "deactivated"
                  ? "bg-red-600 text-white"
                  : "bg-[#f0e4d4] text-slate-700 hover:bg-[#e8d4c0]"
              }`}
            >
              Deactivated
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#d4b18b]">
                  <th className="text-left px-4 py-3 font-semibold text-slate-950">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-950">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-950">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-950">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-950">
                    Security Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-600">
                      No admins found in this category
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr
                      key={admin._id}
                      className="border-b border-[#d4b18b]/30 hover:bg-[#fff5e4]"
                    >
                      <td className="px-4 py-3">
                        {admin.firstName} {admin.lastName}
                      </td>
                      <td className="px-4 py-3">{admin.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            admin.adminType === "SystemAdmin"
                              ? "bg-[#e05c5c]/20 text-[#a33b3b]"
                              : "bg-[#d4b18b]/20 text-[#8a5f3a]"
                          }`}
                        >
                          {admin.adminType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            admin.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {admin.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleResetPassword(admin)}
                            className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                            title="Reset password"
                          >
                            🔑 Reset Pass
                          </button>
                          {admin.adminType !== "SystemAdmin" && (
                            <>
                              {admin.isActive ? (
                                <button
                                  onClick={() =>
                                    handleDeactivateAccount(
                                      admin._id,
                                      `${admin.firstName} ${admin.lastName}`
                                    )
                                  }
                                  className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                  🚫 Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleActivateAccount(
                                      admin._id,
                                      `${admin.firstName} ${admin.lastName}`
                                    )
                                  }
                                  className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                                >
                                  ✓ Activate
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Information Card */}
        <section className="mt-8 relative overflow-hidden rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)]">
          <h3 className="text-lg font-semibold text-slate-950 mb-4">Security Best Practices</h3>
          <ul className="space-y-2 text-slate-700">
            <li>✓ Deactivate accounts for admins who no longer need access</li>
            <li>✓ Use password resets for lost or compromised credentials</li>
            <li>✓ SystemAdmin accounts cannot be deactivated directly - protect them carefully</li>
            <li>✓ All password resets generate a one-time password (OTP) valid for 15 minutes</li>
          </ul>
        </section>
      </div>

      {/* Password Reset Modal */}
      {showPasswordReset && selectedUser && (
        <PasswordResetModal
          userId={selectedUser._id}
          userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
          onClose={() => setShowPasswordReset(false)}
          onSuccess={() => {
            setShowPasswordReset(false);
            fetchUsers();
          }}
        />
      )}
    </main>
  );
}
