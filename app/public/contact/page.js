// Contact page - simple static page with contact info.

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg mb-2">We'd love to hear from you! Whether you have questions, feedback, or just want to say hello, feel free to reach out.</p>
            <ul className="list-disc list-inside text-lg">
                <li>Email: <a href="mailto:contact@example.com">contact@example.com</a></li>
                <li>Phone: <a href="tel:+1234567890">+1 (234) 567-890</a></li>
                <li>Address: 123 Main Street, Anytown, USA</li>
            </ul>
        </div>
    );
}