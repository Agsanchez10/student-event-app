"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function SidebarWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch("/api/auth/check");
        if (!res.ok) return;
        const userRes = await fetch("/api/users/current");
        if (!userRes.ok) return;
        const userData = await userRes.json();
        setUserRole(userData.role);
      } catch {
        // not authenticated
      }
    };
    fetchRole();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return <Sidebar isOpen={isOpen} onToggle={toggleSidebar} userRole={userRole} />;
}

