"use client";

import { useState } from "react";
import Link from "next/link";
import { addClubCharter } from "@/app/actions/clubCharterActions";

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

        const result = await addClubCharter(formData);
        if (result.success) {
            setSubmitted(true);
        } else {
            console.error("Failed to submit charter:", result.error);
            alert("Unable to submit charter. Please try again.");
        }
    };

    return (
        <main className="flex-1 min-h-[80vh] bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] text-slate-900">
            <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
                <section className="relative overflow-hidden rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] sm:p-10 lg:p-12">
                    <div className="absolute left-10 top-6 h-4 w-24 -rotate-3 rounded-b-xl bg-[#d4b18b] shadow-sm shadow-[#9a724b]/20" />
                    <div className="absolute right-10 top-10 h-4 w-16 rotate-2 rounded-b-xl bg-[#c05c5c]/20 shadow-sm shadow-[#c74848]/10" />

                    <div className="mb-8 flex items-center justify-between gap-4">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-3 rounded-full bg-[#e05c5c]/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-[#a33b3b] shadow-sm shadow-[#e05c5c]/10">
                                Club Charter
                            </div>
                            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Create Club Charter</h1>
                            <p className="max-w-xl text-base leading-8 text-slate-700 sm:text-lg">
                                Enter the proposed club details and begin collecting student signatures. The charter owner is taken from your student account automatically.
                            </p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center rounded-3xl border border-[#d4b18b] bg-[#fff5e4] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-[#c1a06e] hover:bg-[#f8e7ce] whitespace-nowrap"
                        >
                            ← Back to dashboard
                        </Link>
                    </div>

                    {submitted ? (
                        <article className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-8 shadow-lg shadow-[#b08f6c]/10 before:absolute before:left-6 before:-top-3 before:h-3 before:w-14 before:rounded-b-xl before:bg-[#e05c5c]/15 before:shadow-sm before:shadow-[#c74848]/10">
                            <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">Submitted</p>
                            <h2 className="mt-4 text-2xl font-semibold text-slate-950">Charter submitted!</h2>
                            <p className="mt-3 text-base leading-7 text-slate-700">
                                Your charter has been submitted for student signature collection. When the charter reaches 10 signatures, it will move to admin review for final approval.
                            </p>
                            <Link
                                href="/dashboard/pending-charters"
                                className="mt-6 inline-flex items-center justify-center rounded-3xl bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
                            >
                                View pending charters
                            </Link>
                        </article>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <article className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-8 shadow-lg shadow-[#b08f6c]/10">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-[#8a5f3a]">Club name</label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="mt-3 w-full rounded-2xl border border-[#d4b18b] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c1a06e] focus:ring-2 focus:ring-[#e05c5c]/20 placeholder-slate-400"
                                            placeholder="e.g. Photography Club"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-[#8a5f3a]">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={4}
                                            required
                                            className="mt-3 w-full rounded-2xl border border-[#d4b18b] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c1a06e] focus:ring-2 focus:ring-[#e05c5c]/20 placeholder-slate-400"
                                            placeholder="Briefly describe the club..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-[#8a5f3a]">Purpose / mission</label>
                                        <textarea
                                            name="purpose"
                                            value={formData.purpose}
                                            onChange={handleChange}
                                            rows={3}
                                            className="mt-3 w-full rounded-2xl border border-[#d4b18b] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c1a06e] focus:ring-2 focus:ring-[#e05c5c]/20 placeholder-slate-400"
                                            placeholder="What is the mission of this club? (optional)"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center justify-center rounded-3xl bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]"
                                    >
                                        Submit charter draft
                                    </button>
                                </div>
                            </article>
                        </form>
                    )}
                </section>
            </div>
        </main>
    );
}