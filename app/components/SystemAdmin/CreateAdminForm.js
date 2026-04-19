"use client";

import { useState } from "react";

export default function CreateAdminForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "CollegeAdmin",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/system-admin/admins/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Admin created successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          role: "CollegeAdmin",
        });
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 1500);
      } else {
        setError(data.message || "Failed to create admin");
      }
    } catch (err) {
      setError("An error occurred while creating admin");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="rounded-lg border border-[#d4b18b] bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c]"
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="rounded-lg border border-[#d4b18b] bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c]"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="rounded-lg border border-[#d4b18b] bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c] sm:col-span-2"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="rounded-lg border border-[#d4b18b] bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c] sm:col-span-2"
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="rounded-lg border border-[#d4b18b] bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e05c5c] sm:col-span-2"
        >
          <option value="CollegeAdmin">College Admin</option>
          <option value="SystemAdmin">System Admin</option>
        </select>
      </div>

      {message && (
        <div className="rounded-lg bg-green-100 p-4 text-green-700">{message}</div>
      )}
      {error && (
        <div className="rounded-lg bg-red-100 p-4 text-red-700">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a] disabled:bg-gray-400"
      >
        {loading ? "Creating..." : "Create Admin"}
      </button>
    </form>
  );
}
