import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Card3D from "@/components/ui/Card3D";
import { Badge } from "@/components/ui/badge";
import {
  Package, Truck, UtensilsCrossed, Wind, Users, Clock, Leaf, TrendingUp, ArrowUpRight
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

const COLORS = ["#2E7D32", "#66BB6A", "#FF9800", "#FDD835", "#AED581", "#4FC3F7"];

const CHART_TOOLTIP_STYLE = {
  borderRadius: 12,
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  border: "none",
  fontSize: 13,
  fontWeight: 500,
};

function KPICard({ title, value, icon: Icon, gradient = ["#2E7D32", "#4CAF50"], subtitle, trend }) {
  return (
    <Card3D
      className="bg-card rounded-2xl border border-border shadow-sm kpi-accent overflow-hidden relative"
      intensity={8}
    >
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
            <p className="stat-3d text-[2rem] font-black mt-2 text-foreground leading-none tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1.5 font-medium">{subtitle}</p>}
          </div>
          <div
            className="badge-3d w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, ${gradient[0]}20, ${gradient[1]}40)` }}
          >
            <Icon className="w-5 h-5" style={{ color: gradient[0] }} />
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
            <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs font-semibold text-green-600">{trend}</span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card3D>
  );
}

function ChartCard({ title, icon: Icon, children, className = "" }) {
  return (
    <Card className={`bg-card rounded-2xl border border-border shadow-sm depth-card ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2.5">
          {Icon && <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-black text-foreground tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-1.5 text-sm font-medium">{subtitle}</p>
    </div>
  );
}



const statusBadgeClass = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  reserved: "bg-amber-50 text-amber-700 border-amber-200",
  picked_up: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-purple-50 text-purple-700 border-purple-200",
};

function RecentListingsTable({ listings }) {
  if (!listings?.length) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] flex items-center justify-center mb-4">
          <Package className="w-7 h-7 text-[#2E7D32]" />
        </div>
        <p className="text-gray-500 text-sm font-medium">No listings yet</p>
        <p className="text-gray-400 text-xs mt-1">Create your first food listing to get started</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Food Item</th>
            <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
            <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Qty</th>
            <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
            <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody>
          {listings.slice(0, 5).map((l) => (
            <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
              <td className="py-3.5 px-3 font-semibold text-[#0F172A]">{l.food_name}</td>
              <td className="py-3.5 px-3">
                <span className="capitalize text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg">
                  {l.category}
                </span>
              </td>
              <td className="py-3.5 px-3 text-gray-600 font-medium">{l.quantity} kg</td>
              <td className="py-3.5 px-3">
                <Badge variant="outline" className={`text-xs font-semibold border ${statusBadgeClass[l.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                  {l.status}
                </Badge>
              </td>
              <td className="py-3.5 px-3 text-gray-400 font-medium">{l.created_at?.slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DonorDashboard({ dashboard, charts }) {
  const kpis = dashboard?.kpis || {};
  return (
    <div data-testid="donor-dashboard" className="space-y-7">
      <PageHeader title="Donor Dashboard" subtitle="Track your food donations and environmental impact" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard title="Total Donated" value={`${kpis.total_donated_kg || 0} kg`} icon={Package} gradient={["#2E7D32", "#4CAF50"]} />
        <KPICard title="Completed Pickups" value={kpis.completed_pickups || 0} icon={Truck} gradient={["#FF9800", "#FFB74D"]} />
        <KPICard title="Meals Served" value={kpis.meals_served || 0} icon={UtensilsCrossed} gradient={["#66BB6A", "#A5D6A7"]} />
        <KPICard title="CO₂ Avoided" value={`${kpis.co2_avoided_kg || 0} kg`} icon={Wind} gradient={["#0288D1", "#4FC3F7"]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Donations Over Time" icon={TrendingUp} className="lg:col-span-2">
          <div className="h-[280px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.donations_over_time?.slice(-14) || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ stroke: "#E8F5E9", strokeWidth: 2 }} />
                <Line type="monotone" dataKey="quantity" stroke="#2E7D32" strokeWidth={2.5} dot={{ r: 3, fill: "#2E7D32", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="By Category" icon={Leaf}>
          <div className="h-[280px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.category_distribution || []}
                  dataKey="quantity"
                  nameKey="category"
                  cx="50%" cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {(charts?.category_distribution || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Recent Listings" icon={Package}>
        <RecentListingsTable listings={dashboard?.recent_listings} />
      </ChartCard>
    </div>
  );
}

function NgoDashboard({ dashboard, charts }) {
  const kpis = dashboard?.kpis || {};
  return (
    <div data-testid="ngo-dashboard" className="space-y-7">
      <PageHeader title="NGO Dashboard" subtitle="Manage pickups and track your community impact" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard title="Pickups Completed" value={kpis.pickups_completed || 0} icon={Truck} gradient={["#2E7D32", "#4CAF50"]} />
        <KPICard title="Pending Pickups" value={kpis.pending_pickups || 0} icon={Clock} gradient={["#FF9800", "#FFB74D"]} />
        <KPICard title="Beneficiaries Served" value={kpis.beneficiaries_served || 0} icon={Users} gradient={["#66BB6A", "#A5D6A7"]} />
        <KPICard title="CO₂ Avoided" value={`${kpis.co2_avoided_kg || 0} kg`} icon={Wind} gradient={["#0288D1", "#4FC3F7"]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Collection Trend" icon={TrendingUp} className="lg:col-span-2">
          <div className="h-[280px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.donations_over_time?.slice(-14) || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="quantity" fill="#2E7D32" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Recent Pickups" icon={Truck}>
          <div className="space-y-2 mt-2">
            {(dashboard?.recent_pickups || []).length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No pickups yet</p>
            ) : (
              (dashboard?.recent_pickups || []).slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A] leading-none">{p.listing_name}</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">{p.donor_name}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs font-semibold border ${
                    p.status === "delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    p.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    {p.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function AdminDashboard({ dashboard, charts }) {
  const kpis = dashboard?.kpis || {};
  return (
    <div data-testid="admin-dashboard" className="space-y-7">
      <PageHeader title="Admin Dashboard" subtitle="Platform-wide overview and monitoring" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <KPICard title="Food Recovered" value={`${kpis.total_food_recovered_kg || 0} kg`} icon={Package} gradient={["#2E7D32", "#4CAF50"]} />
        <KPICard title="Active Donors" value={kpis.active_donors || 0} icon={Users} gradient={["#FF9800", "#FFB74D"]} />
        <KPICard title="Active NGOs" value={kpis.active_ngos || 0} icon={Leaf} gradient={["#66BB6A", "#A5D6A7"]} />
        <KPICard title="Pending Pickups" value={kpis.pending_pickups || 0} icon={Truck} gradient={["#F59E0B", "#FCD34D"]} />
        <KPICard title="CO₂ Saved" value={`${kpis.total_co2_saved_kg || 0} kg`} icon={Wind} gradient={["#0288D1", "#4FC3F7"]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Food Recovery Trend" icon={TrendingUp}>
          <div className="h-[280px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.donations_over_time?.slice(-14) || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="quantity" stroke="#2E7D32" strokeWidth={2.5} dot={{ r: 3, fill: "#2E7D32", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Top Donors by Volume" icon={Users}>
          <div className="h-[280px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.top_donors?.slice(0, 5) || []} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="donor_name" tick={{ fontSize: 11, fill: "#6B7280" }} width={90} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="total_kg" fill="#66BB6A" radius={[0, 6, 6, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Category Distribution" icon={Leaf}>
        <div className="h-[250px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts?.category_distribution || []}
                dataKey="quantity"
                nameKey="category"
                cx="50%" cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {(charts?.category_distribution || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => `${v} kg`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-7 animate-pulse">
      <div>
        <div className="skeleton h-9 w-56 mb-2" />
        <div className="skeleton h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-8 w-16" />
              </div>
              <div className="skeleton h-12 w-12 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
      <div className="skeleton h-80 w-full rounded-2xl" />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, chartRes] = await Promise.all([
          api.get("/analytics/dashboard"),
          api.get("/analytics/charts")
        ]);
        setDashboard(dashRes.data);
        setCharts(chartRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (user?.role === "ngo") return <NgoDashboard dashboard={dashboard} charts={charts} />;
  if (user?.role === "admin") return <AdminDashboard dashboard={dashboard} charts={charts} />;
  return <DonorDashboard dashboard={dashboard} charts={charts} />;
}
