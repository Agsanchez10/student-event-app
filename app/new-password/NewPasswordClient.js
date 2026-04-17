"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPasswordClient() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    if (!newPassword) {
      setError("Password is required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/set-new-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: otp.trim(),
          newPassword: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to set password");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred while setting your password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center min-h-[80vh] justify-center from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-10">
        <main className="w-full max-w-md p-8 rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700 text-center">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">Password Set Successfully!</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Your password has been set. Redirecting to dashboard...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex items-center min-h-[80vh] justify-center from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-10">
      <main className="w-full max-w-md p-8 rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white mb-2">Create New Password</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
          Enter the one-time password (OTP) sent to your email and create a new password.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700 text-sm border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              One-Time Password (OTP)
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP from your email"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e12b53] focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e12b53] focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e12b53] focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#e12b53] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c91f4a] disabled:bg-gray-400 dark:hover:bg-[#d01c42]"
          >
            {loading ? "Setting Password..." : "Set Password"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>
            Didn't receive the OTP?{" "}
            <Link
              href="/reset-password"
              className="font-medium text-[#e12b53] hover:text-[#c91f4a]"
            >
              Request a new one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
