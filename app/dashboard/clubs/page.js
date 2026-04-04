import Link from "next/link";

export default function ClubsManagementPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-16 dark:bg-slate-950">
            <main className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Club Management</h1>
                        <p className="mt-4 text-slate-600 dark:text-slate-300">Browse and manage clubs from one place.</p>
                    </div>
                    <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-slate-500 dark:text-slate-400">This page is a central hub for club review, approvals, and management actions.</p>
                        <Link href="/dashboard/events" className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200">Back to all events</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
