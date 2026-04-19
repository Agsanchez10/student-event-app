import FlaggedContentClient from "./FlaggedContentClient";
import { withDB } from "@/lib/mongodb";
import Flag from "@/models/Flag";
import Announcement from "@/models/Announcement";
import Event from "@/models/Event";
import Club from "@/models/Club";

async function getUnresolvedFlags() {
    try {
        const flags = await withDB(async () => {
            const rawFlags = await Flag.find({ isResolved: false }).sort({ reportedAt: -1 });

            // Enrich each flag with the owner of the flagged content
            const enriched = await Promise.all(rawFlags.map(async (flag) => {
                const obj = flag.toObject();
                try {
                    if (flag.type === "user") {
                        obj.contentOwnerId = flag.contentId;
                    } else if (flag.type === "announcement") {
                        const item = await Announcement.findById(flag.contentId).select("ownerId clubID").lean();
                        obj.contentOwnerId = item?.ownerId ?? null;
                        obj.contentClubId = item?.clubID ?? null;
                    } else if (flag.type === "event") {
                        const item = await Event.findById(flag.contentId).select("ownerId createdBy").lean();
                        obj.contentOwnerId = item?.ownerId ?? item?.createdBy ?? null;
                    } else if (flag.type === "club") {
                        const item = await Club.findById(flag.contentId).select("ownerID").lean();
                        obj.contentOwnerId = item?.ownerID ?? null;
                    }
                } catch {
                    obj.contentOwnerId = null;
                }
                return obj;
            }));

            return enriched;
        })();
        return flags;
    } catch (error) {
        console.error("Error fetching flags:", error);
        return [];
    }
}

export default async function FlaggedContentPage() {
    const unresolvedFlags = await getUnresolvedFlags();
    
    // Serialize Mongoose documents to plain objects
    const serializedFlags = JSON.parse(JSON.stringify(unresolvedFlags));

    return (
        <FlaggedContentClient initialFlags={serializedFlags} />
    );
}
