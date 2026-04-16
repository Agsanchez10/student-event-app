// password reset api route
import User from "@/models/User";
import { withDB } from "@/lib/mongodb";
import { Resend } from "resend";

const ResendInstance = new Resend(process.env.RESEND_API_KEY);


// generate an OTP and send reset instructions
const sendResetInstructions = withDB(async (email) => {
    const user = await User.findOne({ email });
    
    if (!user) {
        throw new Error("No user found with that email");
    }

    // Generate 10 character OTP and send reset instructions here
    const otp = Math.random().toString(36).substring(2, 12).toUpperCase();
    user.otp = otp;
    user.otpExpiry = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes
    await user.save();
    console.log(`OTP for ${email}: ${otp}`);

    const {data, error} = await ResendInstance.emails.send({
        from: "bullepin.xyz "+ "<no-reply@bullepin.xyz>",
        to: email,
        subject: "Password Reset Instructions",
        html: `<p>You requested a password reset. Use the following one-time password (OTP) to reset your password:</p>
               <h2>${otp}</h2>
               <p>This OTP is valid for 15 minutes. If you did not request a password reset, please ignore this email.</p>`,
    });

    if (error) {
        console.error("Error sending reset instructions:", error);
        throw new Error("Failed to send reset instructions");

    }


    return { message: "Reset instructions sent to your email." };
}); 

export async function POST(request) {
    try {
        const { email } = await request.json();
        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
        }

        const result = await sendResetInstructions(email);
        return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
        console.error("Error in password reset route:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }   
}
