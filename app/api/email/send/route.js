import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    try {
        const { email, subject, message, html } = await request.json();

        // Validate required fields
        if (!email || !subject || (!message && !html)) {
            return NextResponse.json(
                { error: "Missing required fields: email, subject, and message/html" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: ['agsanc10@asu.edu'],
            subject: subject,
            html: html || `<p>${message}</p><p>Reply to: ${email}</p>`,
            // Optional: Add reply-to header
            reply_to: email,
        });

        if (error) {
            console.error("Resend API error:", error);
            return NextResponse.json(
                { error: "Failed to send email" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data }, { status: 200 });

    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}