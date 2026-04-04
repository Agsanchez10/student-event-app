"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function SidebarWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return <Sidebar isOpen={isOpen} onToggle={toggleSidebar} />;
}
