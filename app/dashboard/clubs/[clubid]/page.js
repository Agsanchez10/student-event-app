import Link from "next/link";

export default function ClubOwnerManagement({ params }) {
    return (
        <div className="min-h-screen bg-slate-50 py-16 dark:bg-slate-950">
            <main className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Club Management</h1>
                        <p className="mt-4 text-slate-600 dark:text-slate-300">Manage club ID {params.clubid} from here.</p>
                    </div>
                    <Link href="/dashboard/clubs" className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200">Back to club management</Link>
                </div>
            </main>
        </div>
    );
}
