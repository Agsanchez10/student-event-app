"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginClient() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                setError(`Login failed: ${errorData.error}`);
                return;
            }

            const data = await res.json();

            if(data.user?.role === "SystemAdmin") {
                router.push("/system-admin");
            return;
            }
                        
            router.push("/dashboard");

            console.log("Login successful:", data);
        } catch (error) {
            console.error("Login error:", error);
            setError("An error occurred during login.");
        }
    };

    
    return (
        <div className="min-h-[75vh] flex items-center justify-center ">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Login</h1>
                <form onSubmit={handleLogin} className="mt-6 space-y-6">
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#e12b53] focus:ring-[#e12b53] dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            placeholder="EMAIL"
                        />
                    </div>
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#e12b53] focus:ring-[#e12b53] dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            placeholder="********"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e12b53] hover:bg-[#c91f4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e12b53]"
                    >
                        Sign In
                    </button>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    
                    {/* Register Link */}
                    <div className="text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Don't have an account?{" "}
                            <Link
                                href="/register"
                                className="font-medium text-[#e12b53] hover:text-[#c91f4a] transition"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}