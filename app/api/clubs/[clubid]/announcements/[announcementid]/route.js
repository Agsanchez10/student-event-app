import { updateAnnouncement, deleteAnnouncement } from "@/services/announcementService";

export async function PUT(request, { params }) {
    try {
        const resolve_params = await params;
        const announcementID = resolve_params.announcementid;
        const data = await request.json();

        const announcement = await updateAnnouncement(announcementID, data);
        return new Response(JSON.stringify(announcement), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const resolve_params = await params;
        const announcementID = resolve_params.announcementid;
        const clubID = resolve_params.clubid;

        await deleteAnnouncement(announcementID, clubID);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
