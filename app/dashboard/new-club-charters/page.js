import { withDB } from "@/lib/mongodb";
import ClubCharter from "@/models/ClubCharter";
import ClubChartersClient from "./ClubChartersClient";

async function getPendingCharters() {
    try {
        const charters = await withDB(async () => {
            return await ClubCharter.find({
                status: "submitted",
                $expr: { $gte: [{ $size: "$signatures" }, 10] }
            }).sort({ createdAt: -1 });
        })();
        
        // Serialize to plain objects
        return JSON.parse(JSON.stringify(charters));
    } catch (error) {
        console.error("Error fetching charters:", error);
        return [];
    }
}

export default async function NewClubChartersPage() {
    const charters = await getPendingCharters();

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] py-10">
            <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <ClubChartersClient initialCharters={charters} />
            </main>
        </div>
    );
}
