// Logout landing page - can be used for any post-logout actions or messages

export default async function LogoutPage() {
    return (
        <div className="min-h-[75vh] flex items-center justify-center ">
            <div className="bg-white p-8 rounded-3xl shadow-lg ring-1 ring-slate-200">
                <h1 className="text-3xl font-semibold text-slate-950">You have been logged out</h1>
                <p className="mt-4 text-slate-700">Thank you for using the Student Event App. See you next time!</p>
                <a href="/" className="mt-6 inline-block rounded-3xl bg-gray-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-gray-400">
                    Return to Home
                </a>
                &nbsp;&nbsp;&nbsp;
                <a href="/login" className="mt-4 inline-block rounded-3xl border border-[#d4b18b] bg-[#e12b53] px-6 py-3 text-sm font-semibold text-white transition hover:border-[#c1a06e] hover:bg-[#c91f4a]">
                    Login Again
                </a>
            </div>
            
        </div>
    );
}   