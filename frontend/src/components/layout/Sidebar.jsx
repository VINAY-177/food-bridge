import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, UtensilsCrossed, Plus, Truck, Map, Brain,
  User, LogOut, Leaf, ChevronLeft, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const donorLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/listings", icon: UtensilsCrossed, label: "My Listings" },
  { to: "/listings/create", icon: Plus, label: "Create Listing" },
  { to: "/pickups", icon: Truck, label: "Pickup Status" },
  { to: "/profile", icon: User, label: "Profile" },
];

const ngoLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/listings", icon: UtensilsCrossed, label: "Available Listings" },
  { to: "/pickups", icon: Truck, label: "My Pickups" },
  { to: "/map", icon: Map, label: "Map View" },
  { to: "/profile", icon: User, label: "Profile" },
];

const adminLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/listings", icon: UtensilsCrossed, label: "All Listings" },
  { to: "/pickups", icon: Truck, label: "All Pickups" },
  { to: "/map", icon: Map, label: "Map View" },
  { to: "/evaluation", icon: Brain, label: "Evaluation" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === "admin" ? adminLinks
    : user?.role === "ngo" ? ngoLinks
    : donorLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleBadgeStyle = {
    donor: { bg: "#E8F5E9", color: "#2E7D32", label: "Donor" },
    ngo: { bg: "#E3F2FD", color: "#1565C0", label: "NGO" },
    admin: { bg: "#FFF3E0", color: "#E65100", label: "Admin" },
  };
  const roleInfo = roleBadgeStyle[user?.role] || roleBadgeStyle.donor;

  return (
    <aside
      data-testid="sidebar"
      className={`${collapsed ? "w-[72px]" : "w-[260px]"} sidebar-gradient border-r flex flex-col h-screen transition-all duration-300 shrink-0 shadow-sm`}
      style={{ borderColor: "hsl(220, 15%, 92%)" }}
    >
      {/* Header */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-4"} h-16 border-b`} style={{ borderColor: "hsl(220, 15%, 92%)" }}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] flex items-center justify-center shrink-0 shadow-sm">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span className="font-bold text-[#0F172A] text-[17px] tracking-tight truncate block">
              MealBridge
            </span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Food Redistribution</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={`${collapsed ? "mt-0" : "ml-auto"} h-8 w-8 shrink-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100`}
          data-testid="sidebar-toggle"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-3 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest px-2 mb-3">
            Navigation
          </p>
        )}
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] text-[#2E7D32] shadow-sm"
                  : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-900"
              }`
            }
            title={collapsed ? link.label : undefined}
          >
            {({ isActive }) => (
              <>
                <link.icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${isActive ? "text-[#2E7D32]" : "text-gray-400 group-hover:text-gray-600"}`} />
                {!collapsed && (
                  <span className="truncate">{link.label}</span>
                )}
                {!collapsed && isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t p-3 space-y-1" style={{ borderColor: "hsl(220, 15%, 92%)" }}>
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2.5 mb-1 rounded-xl bg-gray-50/60">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
              style={{ backgroundColor: roleInfo.bg, color: roleInfo.color }}
            >
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.org_name || user?.email}
              </p>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{ backgroundColor: roleInfo.bg, color: roleInfo.color }}
              >
                {roleInfo.label}
              </span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          data-testid="logout-btn"
          className={`w-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-150 rounded-xl ${
            collapsed ? "px-0 justify-center" : "justify-start gap-2"
          }`}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
