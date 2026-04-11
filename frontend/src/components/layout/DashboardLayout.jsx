import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-transparent transition-colors duration-300">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-y-auto w-full relative z-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 animate-fade-in-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
