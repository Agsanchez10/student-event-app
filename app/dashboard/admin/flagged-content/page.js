import FlaggedContentClient from "./FlaggedContentClient";
import { withDB } from "@/lib/mongodb";
import Flag from "@/models/Flag";

async function getUnresolvedFlags() {
    try {
        const flags = await withDB(async () => {
            return await Flag.find({ isResolved: false }).sort({ reportedAt: -1 });
        })();
        return flags;
    } catch (error) {
        console.error("Error fetching flags:", error);
        return [];
    }
}

export default async function FlaggedContentPage() {
    const unresolvedFlags = await getUnresolvedFlags();

    return (
        <FlaggedContentClient initialFlags={unresolvedFlags} />
    );
}
