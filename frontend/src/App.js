import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import FoodListings from "@/pages/FoodListings";
import CreateListing from "@/pages/CreateListing";
import Pickups from "@/pages/Pickups";
import MapView from "@/pages/MapView";
import Evaluation from "@/pages/Evaluation";
import Profile from "@/pages/Profile";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 8C8 10 5.9 16.17 3.82 19.63 2.9 21.1 2 22 2 22c3.28-1.83 6.95-3.89 12-4s5.12 1.23 8 4c0 0-1.94-5.24-5-14z"/>
            </svg>
          </div>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="listings" element={<FoodListings />} />
        <Route path="listings/create" element={<CreateListing />} />
        <Route path="pickups" element={<Pickups />} />
        <Route path="map" element={<MapView />} />
        <Route path="evaluation" element={<Evaluation />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

const BG_ORBS = [
  { size: 520, top: "-8%",  left: "-6%",  color: "hsl(142 60% 55% / 0.45)", dur: "22s", delay: "0s"   },
  { size: 420, top: "8%",   right: "-8%", color: "hsl(36 100% 65% / 0.35)", dur: "28s", delay: "-7s"  },
  { size: 580, bottom:"-10%",left:"20%",  color: "hsl(142 55% 40% / 0.40)", dur: "34s", delay: "-14s" },
  { size: 350, top: "42%",  right:"15%",  color: "hsl(88 50% 55% / 0.38)",  dur: "26s", delay: "-5s"  },
  { size: 300, top: "30%",  left: "40%",  color: "hsl(50 95% 65% / 0.28)",  dur: "30s", delay: "-20s" },
];

export default function App() {
  return (
    <ThemeProvider>
      {/* ── Animated background orbs ── */}
      <div id="bg-orbs" aria-hidden="true">
        {BG_ORBS.map((orb, i) => (
          <div
            key={i}
            className="bg-orb"
            style={{
              width:  orb.size,
              height: orb.size,
              top:    orb.top    ?? "auto",
              left:   orb.left   ?? "auto",
              right:  orb.right  ?? "auto",
              bottom: orb.bottom ?? "auto",
              background: `radial-gradient(circle at 40% 40%, ${orb.color}, transparent 70%)`,
              animationDuration: orb.dur,
              animationDelay:    orb.delay,
            }}
          />
        ))}
      </div>

      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
