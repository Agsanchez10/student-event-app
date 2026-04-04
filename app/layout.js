import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SidebarWrapper from "./components/SidebarWrapper";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { withDB } from "@/lib/mongodb";
import User from "@/models/User";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const getCurrentUser = withDB(async (token) => {
  if (!token || !process.env.JWT_SECRET) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findOne({ _id: Number(decoded.id) });
  } catch (error) {
    return null;
  }
});

export const metadata = {
  title: "Student Event App",
  description: "An application that lets students create clubs, events, and manage their profiles. College admins can also manage students, clubs, and events.",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = await getCurrentUser(token);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {user && <SidebarWrapper />}
        <main className="flex-1 min-h-[80vh] bg-[radial-gradient(circle_at_top_left,_rgba(249,243,229,0.6),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(224,92,92,0.14),_transparent_20%),linear-gradient(180deg,_#f6f0e0_0%,_#e8d7bb_100%)] text-slate-900">
          {children}
        </main>        
        <Footer />

      </body>
    </html>
  );
}
