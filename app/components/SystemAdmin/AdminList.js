"use client";

import { useState, useEffect } from "react";
import PasswordResetModal from "./PasswordResetModal";

export default function AdminList({ refreshTrigger }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [filter, setFilter] = useState("all"); // all, active, inactive

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/system-admin/admins");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [refreshTrigger]);

  const handleDeactivate = async (adminId) => {
    if (!confirm("Are you sure you want to deactivate this admin?")) return;

    try {
      const res = await fetch("/api/system-admin/account-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deactivate",
          userId: adminId,
        }),
      });

      if (res.ok) {
        alert("Admin deactivated successfully");
        fetchAdmins();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to deactivate admin");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    }
  };

  const handleActivate = async (adminId) => {
    try {
      const res = await fetch("/api/system-admin/account-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "activate",
          userId: adminId,
        }),
      });

      if (res.ok) {
        alert("Admin activated successfully");
        fetchAdmins();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to activate admin");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    }
  };

  const handleResetPassword = (admin) => {
    setSelectedAdmin(admin);
    setShowPasswordReset(true);
  };

  const filteredAdmins = admins.filter((admin) => {
    if (filter === "active") return admin.isActive;
    if (filter === "inactive") return !admin.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Loading admins...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
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
            onClick={() => setFilter("inactive")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === "inactive"
                ? "bg-red-600 text-white"
                : "bg-[#f0e4d4] text-slate-700 hover:bg-[#e8d4c0]"
            }`}
          >
            Inactive
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#d4b18b]">
                <th className="text-left px-4 py-3 font-semibold text-slate-950">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-950">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-950">
                  Type
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-950">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-950">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-600">
                    No admins found
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResetPassword(admin)}
                          className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                          title="Reset password"
                        >
                          🔑 Reset
                        </button>
                        {admin.adminType !== "SystemAdmin" && (
                          <>
                            {admin.isActive ? (
                              <button
                                onClick={() => handleDeactivate(admin._id)}
                                className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                title="Deactivate account"
                              >
                                🚫 Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(admin._id)}
                                className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                                title="Activate account"
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
      </div>

      {/* Password Reset Modal */}
      {showPasswordReset && selectedAdmin && (
        <PasswordResetModal
          userId={selectedAdmin._id}
          userName={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}
          onClose={() => setShowPasswordReset(false)}
          onSuccess={() => {
            setShowPasswordReset(false);
            fetchAdmins();
          }}
        />
      )}
    </>
  );
}
