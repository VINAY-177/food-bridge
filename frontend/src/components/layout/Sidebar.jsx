import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard, UtensilsCrossed, Plus, Truck, Map, Brain,
  User, LogOut, Leaf, ChevronLeft, Menu, Sun, Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

const roleConfig = {
  donor: { bg: "#E8F5E9", color: "#2E7D32", label: "Donor", darkBg: "rgba(46,125,50,0.2)" },
  ngo:   { bg: "#E3F2FD", color: "#1565C0", label: "NGO",   darkBg: "rgba(21,101,192,0.2)" },
  admin: { bg: "#FFF3E0", color: "#E65100", label: "Admin", darkBg: "rgba(230,81,0,0.2)" },
};

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const links = user?.role === "admin" ? adminLinks
    : user?.role === "ngo" ? ngoLinks
    : donorLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = roleConfig[user?.role] || roleConfig.donor;

  return (
    <aside
      data-testid="sidebar"
      className={`${
        collapsed ? "w-[72px]" : "w-[260px]"
      } sidebar-gradient border-r flex flex-col h-screen transition-all duration-300 shrink-0 shadow-sm`}
      style={{ borderColor: isDark ? "hsl(224, 20%, 22%)" : "hsl(220, 15%, 92%)" }}
    >
      {/* ── Header ── */}
      <div
        className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-4"} h-16 border-b`}
        style={{ borderColor: isDark ? "hsl(224, 20%, 22%)" : "hsl(220, 15%, 92%)" }}
      >
        <div className="logo-3d w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] flex items-center justify-center shrink-0 shadow-sm">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span className="font-bold text-[17px] tracking-tight truncate block text-foreground">
              MealBridge
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
              Food Redistribution
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={`${collapsed ? "" : "ml-auto"} h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground`}
          data-testid="sidebar-toggle"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-5 px-3 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest px-2 mb-3">
            Navigation
          </p>
        )}
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            title={collapsed ? link.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? isDark
                    ? "bg-primary/20 text-primary"
                    : "bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] text-[#2E7D32] shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon
                  className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                {!collapsed && <span className="truncate">{link.label}</span>}
                {!collapsed && isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div
        className="border-t p-3 space-y-1"
        style={{ borderColor: isDark ? "hsl(224, 20%, 22%)" : "hsl(220, 15%, 92%)" }}
      >
        {/* User info */}
        {!collapsed && user && (
          <div
            className="flex items-center gap-3 px-2 py-2.5 mb-1 rounded-xl"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F9FAF9" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
              style={{
                backgroundColor: isDark ? role.darkBg : role.bg,
                color: role.color,
              }}
            >
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.org_name || user?.email}
              </p>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                style={{
                  backgroundColor: isDark ? role.darkBg : role.bg,
                  color: role.color,
                }}
              >
                {role.label}
              </span>
            </div>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`w-full flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          {isDark ? (
            <Sun className="w-[18px] h-[18px] shrink-0 text-amber-400 animate-theme-spin" key="sun" />
          ) : (
            <Moon className="w-[18px] h-[18px] shrink-0 animate-theme-spin" key="moon" />
          )}
          {!collapsed && (
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>

        {/* Logout */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          data-testid="logout-btn"
          className={`w-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors duration-150 rounded-xl ${
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
