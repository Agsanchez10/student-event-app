import { Resend } from "resend";
import { NextResponse } from "next/server";


const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    try {
        const { email, subject, message } = await request.json();

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: ['bullepin.notification@gmail.com'],
            subject: subject,
            html: `<p>${message}</p><p>Reply to: ${email}</p>`,
        });

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }

}