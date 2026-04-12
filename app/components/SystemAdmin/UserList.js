"use client";

import { useState, useEffect } from "react";
import PasswordResetModal from "./PasswordResetModal";

export default function UserList({ refreshTrigger }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [filter, setFilter] = useState("all"); // all, students, admins, clubowners

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
  }, [refreshTrigger]);

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setShowPasswordReset(true);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-[#e05c5c]/20 text-[#a33b3b]";
      case "Student":
        return "bg-blue-100 text-blue-700";
      case "ClubOwner":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "students") return user.role === "Student";
    if (filter === "admins") return user.role === "Admin";
    if (filter === "clubowners") return user.role === "ClubOwner";
    return true;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Loading users...</p>
      </div>
    );
  }

  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === "Student").length,
    admins: users.filter((u) => u.role === "Admin").length,
    clubowners: users.filter((u) => u.role === "ClubOwner").length,
  };

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <p className="text-xs text-blue-700 uppercase font-semibold">Total Users</p>
          <p className="text-2xl font-bold text-blue-900 mt-2">{stats.total}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 border border-green-200">
          <p className="text-xs text-green-700 uppercase font-semibold">Students</p>
          <p className="text-2xl font-bold text-green-900 mt-2">{stats.students}</p>
        </div>
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <p className="text-xs text-red-700 uppercase font-semibold">Admins</p>
          <p className="text-2xl font-bold text-red-900 mt-2">{stats.admins}</p>
        </div>
        <div className="rounded-lg bg-purple-50 p-4 border border-purple-200">
          <p className="text-xs text-purple-700 uppercase font-semibold">Club Owners</p>
          <p className="text-2xl font-bold text-purple-900 mt-2">{stats.clubowners}</p>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            filter === "all"
              ? "bg-[#e05c5c] text-white"
              : "bg-[#f0e4d4] text-slate-700 hover:bg-[#e8d4c0]"
          }`}
        >
          All Users
        </button>
        <button
          onClick={() => setFilter("students")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            filter === "students"
              ? "bg-green-600 text-white"
              : "bg-[#f0e4d4] text-slate-700 hover:bg-[#e8d4c0]"
          }`}
        >
          Students
        </button>
        <button
          onClick={() => setFilter("admins")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            filter === "admins"
              ? "bg-red-600 text-white"
              : "bg-[#f0e4d4] text-slate-700 hover:bg-[#e8d4c0]"
          }`}
        >
          Admins
        </button>
        <button
          onClick={() => setFilter("clubowners")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            filter === "clubowners"
              ? "bg-purple-600 text-white"
              : "bg-[#f0e4d4] text-slate-700 hover:bg-[#e8d4c0]"
          }`}
        >
          Club Owners
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#d4b18b]">
              <th className="text-left px-4 py-3 font-semibold text-slate-950">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-950">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-950">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-950">
                Joined
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-950">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-600">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-[#d4b18b]/30 hover:bg-[#fff5e4]">
                  <td className="px-4 py-3">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleResetPassword(user)}
                      className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                      title="Reset password"
                    >
                      🔑 Reset Pass
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
    </>
  );
}
