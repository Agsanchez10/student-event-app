// Reset password page
"use client";

import Link from "next/link";
import { useState } from "react";

const sendResetInstructions = async (email) => {
    try {
        const res = await fetch("/api/auth/password-reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        if (!res.ok) {
            throw new Error("Failed to send reset instructions");
        }
        return await res.json();
    } catch (error) {
        console.error("Error sending reset instructions:", error);
        throw error;
    }
};


export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");

    return (
        <div className="flex items-center min-h-[80vh] justify-center  from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-10">
            <main className="w-full max-w-md p-8 rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                <h1 className="text-2xl font-bold text-slate-950 dark:text-white mb-6">Reset Your Password</h1>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                    Enter your email address below to receive a one-time password (OTP) and instructions to reset your password.
                </p>
                
                <form className="space-y-6" onSubmit={async (e) => {
                    e.preventDefault();
                    const email = e.target.email.value;
                    try {
                        await sendResetInstructions(email);
                        alert("Reset instructions sent to your email.");
                    } catch (error) {
                        alert("Failed to send reset instructions.");
                    }
                }}>

                    <div>
                        <label 
                            htmlFor="email" 
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e12b53] focus:border-[#e12b53]"
                            placeholder="EMAIL"
                            required
                        />
                    </div>
                    <div>
                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e12b53] hover:bg-[#c91f4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e12b53]">
                            Send Reset Instructions
                        </button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
                    Remembered your password?{" "}
                    <Link href="/login"
                        className="font-medium text-[#e12b53] hover:text-[#c91f4a]">
                        Login here
                    </Link>
                    .
                </p>
                
            </main>
        </div>
    );
}