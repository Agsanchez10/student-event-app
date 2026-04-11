"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterClient() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Client-side validation
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                    confirmPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (error) {
            console.error("Registration error:", error);
            setError("An error occurred during registration");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[75vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Create Account</h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Join us and start managing your events
                </p>

                {success && (
                    <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                            ✓ Registration successful! Redirecting to login...
                        </p>
                    </div>
                )}

                <form onSubmit={handleRegister} className="mt-6 space-y-4">
                    {/* First Name */}
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            First Name
                        </label>
                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            disabled={isLoading || success}
                            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-[#e12b53] focus:ring-2 focus:ring-[#e12b53]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white disabled:opacity-50"
                            placeholder="John"
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Last Name
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            disabled={isLoading || success}
                            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-[#e12b53] focus:ring-2 focus:ring-[#e12b53]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white disabled:opacity-50"
                            placeholder="Doe"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading || success}
                            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-[#e12b53] focus:ring-2 focus:ring-[#e12b53]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white disabled:opacity-50"
                            placeholder="john@example.com"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading || success}
                            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-[#e12b53] focus:ring-2 focus:ring-[#e12b53]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white disabled:opacity-50"
                            placeholder="••••••• (min 6 characters)"
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            At least 6 characters
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading || success}
                            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-[#e12b53] focus:ring-2 focus:ring-[#e12b53]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white disabled:opacity-50"
                            placeholder="••••••• (must match password)"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                            <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || success}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#e12b53] hover:bg-[#c91f4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e12b53] disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {isLoading ? "Creating account..." : success ? "Redirecting..." : "Create Account"}
                    </button>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-[#e12b53] hover:text-[#c91f4a] transition"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
