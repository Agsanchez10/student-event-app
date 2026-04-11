import { getClubAnnouncements, createAnnouncement } from "@/services/announcementService";

export async function GET(request, { params }) {
    try {
        const resolve_params = await params;
        const clubID = resolve_params.clubid;
        const announcements = await getClubAnnouncements(clubID);
        return new Response(JSON.stringify(announcements), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const resolve_params = await params;
        const clubID = resolve_params.clubid;
        const data = await request.json();

        const announcement = await createAnnouncement(clubID, data);
        return new Response(JSON.stringify(announcement), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
