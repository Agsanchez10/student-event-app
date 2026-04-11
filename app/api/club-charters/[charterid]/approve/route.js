import { withDB } from "@/lib/mongodb";
import ClubCharter from "@/models/ClubCharter";
import Club from "@/models/Club";

const updateCharterStatus = withDB(async (charterId, status) => {
    const charter = await ClubCharter.findByIdAndUpdate(
        charterId,
        { status },
        { new: true }
    );

    if (!charter) {
        throw new Error("Charter not found");
    }

    // If approved, create the club
    if (status === "approved") {
        const lastID = await Club.findOne().sort({ _id: -1 });
        const newClubId = lastID ? lastID._id + 1 : 1;

        const newClub = await Club.create({
            _id: newClubId,
            name: charter.name,
            description: charter.description,
            ownerID: charter.initiatorId,
            memberList: [charter.initiatorId],
            eventList: [],
            announcements: [],
            createdAt: new Date(),
        });

        charter.clubId = newClubId;
        await charter.save();
    }

    return charter;
});

export async function PUT(request, { params }) {
    try {
        const resolve_params = await params;
        const charterId = resolve_params.charterId;
        const { status } = await request.json();

        if (!["approved", "rejected"].includes(status)) {
            return new Response(
                JSON.stringify({ error: "Invalid status" }),
                { status: 400 }
            );
        }

        const charter = await updateCharterStatus(charterId, status);
        return new Response(JSON.stringify(charter), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
