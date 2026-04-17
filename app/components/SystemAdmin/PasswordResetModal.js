"use client";

import { useState } from "react";

export default function PasswordResetModal({ userId, userName, onClose, onSuccess }) {
  const [step, setStep] = useState("confirm"); // confirm, success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        setStep("success");
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 2000);
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
              A one-time password (OTP) will be sent to the user's email address. 
              They can use this OTP to reset their password.
            </p>
            <button
              onClick={handleInitiateReset}
              disabled={loading}
              className="w-full rounded-lg bg-[#e05c5c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a] disabled:bg-gray-400"
            >
              {loading ? "Sending OTP..." : "Send OTP to User Email"}
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-lg border-2 border-[#d4b18b] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-4 text-center">
            <div className="text-4xl">✓</div>
            <p className="text-slate-700 font-semibold">OTP sent successfully!</p>
            <p className="text-sm text-slate-600">
              An OTP has been sent to the user's email. 
              They will have 15 minutes to use it to reset their password.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
