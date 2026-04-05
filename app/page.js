import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 min-h-[80vh] bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] text-slate-900">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#d4b18b]/40 bg-[#f9f2e4] p-8 shadow-[0_25px_65px_-30px_rgba(15,23,42,0.75)] sm:p-10 lg:p-12">
          <div className="absolute left-10 top-6 h-4 w-24 -rotate-3 rounded-b-xl bg-[#d4b18b] shadow-sm shadow-[#9a724b]/20" />
          <div className="absolute right-10 top-10 h-4 w-16 rotate-2 rounded-b-xl bg-[#c05c5c]/20 shadow-sm shadow-[#c74848]/10" />
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-3 rounded-full bg-[#e05c5c]/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-[#a33b3b] shadow-sm shadow-[#e05c5c]/10">
                Bulletin board
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Campus events and clubs pinned just for you.
                </h1>
                <p className="max-w-xl text-base leading-8 text-slate-700 sm:text-lg">
                  Browse, join, and manage student activities in a friendly bulletin-board style experience with your logo’s warm tones.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Link href="/public/events" className="inline-flex items-center justify-center rounded-3xl bg-[#e05c5c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c94a4a]">
                  Browse events
                </Link>
                <Link href="/public/about" className="inline-flex items-center justify-center rounded-3xl border border-[#d4b18b] bg-[#fff5e4] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-[#c1a06e] hover:bg-[#f8e7ce]">
                  Learn more
                </Link>
                <Link href="/testing" className="inline-flex items-center justify-center rounded-3xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700">
                  🧪 Testing
                </Link>
              </div>
            </div>

            <div className="grid gap-5">
              <article className="relative rounded-[1.8rem] border border-[#d4b18b]/40 bg-[#fff5e4] p-6 shadow-lg shadow-[#b08f6c]/10 before:absolute before:left-6 before:-top-3 before:h-3 before:w-14 before:rounded-b-xl before:bg-[#e05c5c]/15 before:shadow-sm before:shadow-[#c74848]/10">
                <p className="text-sm uppercase tracking-[0.2em] text-[#8a5f3a]">Pinned note</p>
                <h2 className="mt-4 text-2xl font-semibold text-slate-950">What you can do</h2>
                <ul className="mt-4 space-y-3 text-slate-700">
                  <li>• Explore upcoming events and club meetings.</li>
                  <li>• Join student groups and manage memberships.</li>
                  <li>• Keep your event schedule organized.</li>
                </ul>
              </article>
              <div className="grid gap-4 sm:grid-cols-2">
                <article className="relative rounded-[1.8rem] border border-[#c8884a]/30 bg-[#fff7e4] p-5 shadow-md shadow-[#b9955d]/10">
                  <p className="text-2xl font-semibold text-slate-950">Events</p>
                  <p className="mt-2 text-sm text-slate-700">Quickly discover the latest campus happenings.</p>
                </article>
                <article className="relative rounded-[1.8rem] border border-[#d4975a]/30 bg-[#fff7e4] p-5 shadow-md shadow-[#b9955d]/10">
                  <p className="text-2xl font-semibold text-slate-950">Clubs</p>
                  <p className="mt-2 text-sm text-slate-700">Connect with groups that match your interests.</p>
                </article>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
