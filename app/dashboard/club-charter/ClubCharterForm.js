"use client";

import { useState } from "react";
import Link from "next/link";

export default function ClubCharterForm({ user }) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        purpose: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const response = await fetch("/api/club-charters", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            setSubmitted(true);
        } else {
            const error = await response.json();
            console.error("Failed to submit charter:", error);
            alert("Unable to submit charter. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-16 dark:bg-slate-950">
            <main className="mx-auto w-full max-w-3xl rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Create Club Charter</h1>
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                            Enter the proposed club details and begin collecting student signatures. The charter owner is taken from your student account automatically, so no owner field is required.
                        </p>
                    </div>
                    <Link href="/dashboard" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200">
                        Back to dashboard
                    </Link>
                </div>

                <div className="mt-8 space-y-6">
                    {submitted ? (
                        <div className="rounded-3xl border border-emerald-500 bg-emerald-50 p-6 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-900/10 dark:text-emerald-200">
                            <h2 className="text-xl font-semibold">Charter submitted</h2>
                            <p className="mt-2 text-sm">
                                Your charter has been submitted for student signature collection. When the charter reaches 10 signatures, it should move to admin review for final approval.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Club name</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-200 dark:focus:ring-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    required
                                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-200 dark:focus:ring-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Purpose / mission</label>
                                <textarea
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    rows={3}
                                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-200 dark:focus:ring-slate-700"
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                            >
                                Submit charter draft
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}