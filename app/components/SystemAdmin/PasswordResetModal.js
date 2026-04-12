"use client";

import { useState } from "react";

export default function PasswordResetModal({ userId, userName, onClose, onSuccess }) {
  const [step, setStep] = useState("confirm"); // confirm, otp-entry, password-reset, success
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  const handleInitiateReset = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/system-admin/account-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-password",
          userId: userId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // In a real app, the OTP would be sent via email
        setGeneratedOtp(data.result.otp);
        setStep("otp-entry");
      } else {
        setError(data.message || "Failed to initiate password reset");
      }
    } catch (err) {
      setError("An error occurred");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users/password-reset/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          otp: otp,
          newPassword: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep("success");
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("An error occurred");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative rounded-[1.5rem] border border-[#d4b18b]/40 bg-white p-8 shadow-lg w-full max-w-sm mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-slate-950 mb-2">
          Reset Password
        </h2>
        <p className="text-slate-600 mb-6">For: {userName}</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <p className="text-slate-700">
              A one-time password (OTP) will be generated and displayed. The user
              can use this OTP to reset their password.
            </p>
            <button
              onClick={handleInitiateReset}
              disabled={loading}
              className="w-full rounded-lg bg-[#e05c5c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a] disabled:bg-gray-400"
            >
              {loading ? "Generating OTP..." : "Generate OTP"}
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-lg border-2 border-[#d4b18b] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}

        {step === "otp-entry" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>OTP for user:</strong> {generatedOtp}
              </p>
              <p className="text-xs text-blue-700 mt-2">
                Share this OTP with the user. It will expire in 15 minutes.
              </p>
            </div>

            <input
              type="text"
              placeholder="Enter OTP (for verification)"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c]"
              required
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c]"
              required
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-[#d4b18b] bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e05c5c]"
              required
            />

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full rounded-lg bg-[#e05c5c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a] disabled:bg-gray-400"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-4 text-center">
            <div className="text-4xl">✓</div>
            <p className="text-slate-700 font-semibold">Password reset successfully!</p>
            <p className="text-sm text-slate-600">
              The user can now log in with their new password.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
