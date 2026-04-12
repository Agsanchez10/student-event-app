'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TestingPage() {
    const [expandedCategory, setExpandedCategory] = useState('main');

    const toggleCategory = (category) => {
        setExpandedCategory(expandedCategory === category ? null : category);
    };

    const categories = {
        main: {
            title: 'Main Pages',
            links: [
                { href: '/', label: 'Home' },
                { href: '/public/events', label: 'Public Events' },
                { href: '/public/about', label: 'About' },
                { href: '/public/contact', label: 'Contact' },
            ]
        },
        dashboard: {
            title: 'Dashboard Pages',
            links: [
                { href: '/dashboard', label: 'Main Dashboard' },
                { href: '/dashboard/student', label: 'Student Dashboard' },
                { href: '/dashboard/admin', label: 'College Admin Dashboard' },
                { href: '/system-admin', label: 'System Admin Dashboard' },
                { href: '/dashboard/clubs', label: 'Manage Clubs' },
                { href: '/dashboard/club-charter', label: 'Club Charter' },
                { href: '/dashboard/events', label: 'Events' },
                { href: '/dashboard/flags', label: 'Flagged Content' },
                { href: '/dashboard/new-club-charters', label: 'New Club Charters' },
                { href: '/dashboard/pending-charters', label: 'Pending Charters' },
                { href: '/dashboard/clubOwner', label: 'Club Owner' },
            ]
        },
        clubs: {
            title: 'Club-Related Pages',
            links: [
                { href: '/clubs/1', label: 'Club Detail Page (Example)' },
            ]
        },
        database: {
            title: 'API Endpoints - Database Data',
            links: [
                { href: '/api/users', label: 'Users List' },
                { href: '/api/events', label: 'Events List' },
                { href: '/api/clubs', label: 'Clubs List' },
                { href: '/api/club-charters', label: 'Club Charters List' },                
                { href: '/api/flags', label: 'Flags List' },               
            ]
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-10">
            <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10 rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                    <h1 className="text-4xl font-bold text-slate-950 dark:text-white">Testing Dashboard</h1>
                    <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
                        Quick access to all pages and API endpoints for testing purposes.
                    </p>
                    <Link
                        href="/dashboard"
                        className="mt-6 inline-block rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Categories */}
                <div className="space-y-4">
                    {Object.entries(categories).map(([key, category]) => (
                        <div
                            key={key}
                            className="rounded-2xl bg-white shadow-md ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700 overflow-hidden"
                        >
                            <button
                                onClick={() => toggleCategory(key)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                            >
                                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                                    {category.title}
                                </h2>
                                <span className="text-2xl text-slate-500 dark:text-slate-400">
                                    {expandedCategory === key ? '−' : '+'}
                                </span>
                            </button>

                            {expandedCategory === key && (
                                <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {category.links.map((link, idx) => (
                                            <Link
                                                key={idx}
                                                href={link.href}
                                                target={link.href.startsWith('/api') ? '_blank' : undefined}
                                                className="block rounded-lg bg-slate-50 dark:bg-slate-800 p-3 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-sm"
                                            >
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {link.label}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                                                    {link.href}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-10 rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-6">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                        <span className="font-semibold">💡 Tip:</span> Click on any category to expand/collapse it. API endpoints will open in a new tab.
                    </p>
                </div>
            </main>
        </div>
    );
}
