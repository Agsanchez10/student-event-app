import { approveMembershipApplication, rejectMembershipApplication } from "@/services/membershipApplicationService";

export async function PUT(request, { params }) {
    try {
        const resolve_params = await params;
        const applicationID = resolve_params.appid;
        const clubID = resolve_params.clubid;
        const { userId } = await request.json();

        const application = await approveMembershipApplication(applicationID, userId, clubID);
        return new Response(JSON.stringify(application), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const resolve_params = await params;
        const applicationID = resolve_params.appid;
        const clubID = resolve_params.clubid;

        await rejectMembershipApplication(applicationID, clubID);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
