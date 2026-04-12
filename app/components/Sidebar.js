"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Sidebar({ isOpen, onToggle }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  
  const allLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠", roles: ["Student", "CollegeAdmin", "ClubOwner"] },
    { href: "/dashboard/events", label: "Events", icon: "📅", roles: ["Student"] },
    { href: "/dashboard/clubs", label: "Clubs", icon: "👥", roles: ["Student", "ClubOwner"] },
    { href: "/dashboard/club-charter", label: "Club Charter", icon: "📝", roles: ["Student"] },
    { href: "/dashboard/pending-charters", label: "Pending Charters", icon: "⏳", roles: ["Student", "CollegeAdmin"] },
    { href: "/system-admin", label: "Dashboard", icon: "🏠", roles: ["SystemAdmin"] },
    { href: "/system-admin/manage-admins", label: "Manage Admins", icon: "👤", roles: ["SystemAdmin"] },
    { href: "/system-admin/manage-users", label: "Manage Users", icon: "🏫", roles: ["SystemAdmin"] },
    { href: "/system-admin/account-security", label: "Account Security", icon: "🔒", roles: ["SystemAdmin"] },
  ];

  useEffect(() => {
    // Fetch user role
    const fetchUserRole = async () => {
      try {
        const res = await fetch("/api/auth/check", { method: "GET" });
        if (res.ok) {
          setIsLoggedIn(true);
          // Get user data from cookie or session
          const userRes = await fetch("/api/users/current", { method: "GET" });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUserRole(userData.role);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  const filteredLinks = allLinks.filter(link => 
    !userRole || link.roles.includes(userRole)
  );

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setIsLoggedIn(false);
        router.push("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>      {/* Toggle button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-4 top-4 z-30 rounded-full bg-[#e12b53] p-3 text-white shadow-lg transition hover:bg-[#c11b3d] "
        >
          ☰
        </button>
      )}
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-slate-900 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-200 dark:border-slate-700">
            <img src="/logos/bullepin_minimal_4pins.svg" alt="Bullepin Logo" className="h-50 w-auto" />
            <button
              onClick={onToggle}
              className="flex h-[15px] w-[15px] items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              {isOpen ? "⟪" : "☰"}
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {filteredLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                    onClick={onToggle} // Close on mobile
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <button onClick={handleLogout} className="w-full rounded-t-lg bg-[#e12b53] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c11b3d]">
              Logout
            </button>
          </div>
        </div>
        
      </div>
    </>
  );
}
