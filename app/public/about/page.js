// About page - simple static page with app description and team info.
export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-8">
<h1 className="text-4xl font-bold mb-4">About Bullepin</h1>
<p className="text-2xl font-bold mb-2">The Campus Club & Events Hub</p>
<p className="text-lg mb-2">Bullepin helps students discover, join, and organize events across campus — from casual hangouts and club meetings to academic workshops and everything in between.</p>

<h2 className="text-2xl font-semibold mt-6 mb-3">Our Mission</h2>
<p className="text-lg mb-2">College is about more than lectures and deadlines. Bullepin exists to bring students together — making it effortless to find clubs, attend events, and build the connections that define your time on campus.</p>
<p className="text-lg mb-2">We're glad you're here. We hope Bullepin helps you make the most of every semester.</p>

<h2 className="text-2xl font-semibold mt-6 mb-3">Tech Stack</h2>
<p className="text-lg mb-2">Bullepin is built with React, Next.js, and MongoDB, with Tailwind CSS for styling, Resend for email notifications, and deployed on Vercel.</p>

<h2 className="text-2xl font-semibold mt-6 mb-3">The Developer</h2>
<p className="text-lg mb-2">Built by a student, for students — this is a class project aimed at making campus life a little more connected.</p>           
        </div>
    )
    };    