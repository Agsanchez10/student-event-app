"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchUsers } from "@/app/actions/userActions";
import { createAdminUser, deactivateUserAccount } from "@/app/actions/userActions";

export default function SystemAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalAdmins: 0,
    activeAdmins: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetchUsers();
      if (res.success) {
        const data = res.data;
        setUsers(data);
        
        const totalStudents = data.filter(u => u.role === "Student").length;
        const totalAdmins = data.filter(u => u.role === "Admin").length;
        const activeAdmins = data.filter(u => u.role === "Admin" && u.isActive).length;
        
        setStats({
          totalUsers: data.length,
          totalStudents,
          totalAdmins,
          activeAdmins,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await createAdminUser(formData);
      
      if (res.success) {
        alert("College Admin created successfully!");
        setFormData({ firstName: "", lastName: "", email: "", password: "" });
        setShowCreateForm(false);
        fetchStats();
      } else {
        alert(`Error: ${res.error}`);
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      alert("Failed to create admin");
    }
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      const res = await deactivateUserAccount(userId);
      
      if (res.success) {
        fetchStats();
      } else {
        alert("Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  return (
    <main className="flex-1 min-h-[80vh] bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] text-slate-900">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              System Admin Dashboard
            </h1>
            <p className="mt-2 text-lg text-slate-700">Manage users and administrators</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="rounded-lg bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
          >
            {showCreateForm ? "Cancel" : "Create College Admin"}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <article className="relative rounded-[1.8rem] border border-[#c8884a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a] font-semibold">Total Users</p>
            <p className="mt-4 text-5xl font-bold text-[#e05c5c]">{stats.totalUsers}</p>
          </article>

          <article className="relative rounded-[1.8rem] border border-[#d4975a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a] font-semibold">Students</p>
            <p className="mt-4 text-5xl font-bold text-[#e05c5c]">{stats.totalStudents}</p>
          </article>

          <article className="relative rounded-[1.8rem] border border-[#d4975a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a] font-semibold">Total Admins</p>
            <p className="mt-4 text-5xl font-bold text-[#e05c5c]">{stats.totalAdmins}</p>
          </article>

          <article className="relative rounded-[1.8rem] border border-[#d4975a]/30 bg-[#fff7e4] p-8 shadow-md shadow-[#b9955d]/10">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a] font-semibold">Active Admins</p>
            <p className="mt-4 text-5xl font-bold text-[#e05c5c]">{stats.activeAdmins}</p>
          </article>
        </div>

        {/* Create College Admin Form */}
        {showCreateForm && (
          <section className="relative overflow-hidden rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] sm:p-10 lg:p-12 mb-8">
            <h2 className="text-2xl font-semibold text-slate-950 mb-6">Create New College Admin</h2>
            <form onSubmit={handleCreateAdmin} className="grid gap-6 sm:grid-cols-2">
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="rounded-lg border border-[#d4b18b] bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c]"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="rounded-lg border border-[#d4b18b] bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c]"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="rounded-lg border border-[#d4b18b] bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c] sm:col-span-2"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="rounded-lg border border-[#d4b18b] bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c] sm:col-span-2"
                required
              />
              <button
                type="submit"
                className="rounded-lg bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a] sm:col-span-2"
              >
                Create Admin
              </button>
            </form>
          </section>
        )}

        {/* Users Management Table */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] sm:p-10 lg:p-12">
          <h2 className="text-2xl font-semibold text-slate-950 mb-6">Admin Accounts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#d4b18b]">
                  <th className="text-left px-4 py-3 font-semibold text-slate-950">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-950">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-950">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-950">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-950">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(u => u.role === "Admin")
                  .map((user) => (
                    <tr key={user._id} className="border-b border-[#d4b18b]/30 hover:bg-[#fff5e4]">
                      <td className="px-4 py-3">{user.firstName} {user.lastName}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          user.adminType === "SystemAdmin" 
                            ? "bg-[#e05c5c]/20 text-[#a33b3b]" 
                            : "bg-[#d4b18b]/20 text-[#8a5f3a]"
                        }`}>
                          {user.adminType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.adminType !== "SystemAdmin" && (
                          <button
                            onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                            className="text-sm font-semibold px-3 py-1 rounded-lg bg-[#e05c5c]/20 text-[#a33b3b] hover:bg-[#e05c5c]/30"
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
