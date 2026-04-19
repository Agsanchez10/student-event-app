import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using the Resend service
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @returns {Promise<Object>} - Response from Resend API
 */
export async function sendEmail({ to, subject, html }) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'donotreply@bullepin.xyz',
            to: to,
            subject: subject,
            html: html,
        });

        if (error) {
            throw new Error(error.message);
        }

        return { success: true, data };
    } catch (error) {
        console.error("Email send error:", error);
        throw error;
    }
}