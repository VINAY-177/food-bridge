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

const COLORS = ["#10b981", "#34d399", "#f59e0b", "#fbbf24", "#6ee7b7", "#38bdf8"];

const CHART_TOOLTIP_STYLE = {
  borderRadius: 16,
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  border: "1px solid var(--border-color)",
  backgroundColor: "var(--bg-card)",
  color: "var(--text-primary)",
  backdropFilter: "blur(12px)",
  fontSize: 13,
  fontWeight: 700,
};

function KPICard({ title, value, icon: Icon, gradient = ["#10b981", "#34d399"], subtitle, trend }) {
  return (
    <Card3D
      className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-lg kpi-accent overflow-hidden relative depth-card group"
      intensity={12}
    >
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">{title}</p>
            <p className="stat-3d text-[2.5rem] font-black mt-2 text-[var(--text-primary)] leading-none tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-1.5 font-medium">{subtitle}</p>}
          </div>
          <div
            className="badge-3d w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300"
            style={{ background: `linear-gradient(135deg, ${gradient[0]}20, ${gradient[1]}40)` }}
          >
            <Icon className="w-7 h-7" style={{ color: gradient[0] }} />
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[var(--border-color)]/50">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{trend}</span>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card3D>
  );
}

function ChartCard({ title, icon: Icon, children, className = "" }) {
  return (
    <Card className={`bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-xl depth-card ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-black tracking-tight text-[var(--text-primary)] flex items-center gap-3">
          {Icon && <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 shadow-sm flex items-center justify-center">
            <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
    <div className="mb-10">
      <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight drop-shadow-sm">{title}</h1>
      <p className="text-[var(--text-secondary)] mt-2 text-sm font-semibold tracking-wide">{subtitle}</p>
    </div>
  );
}



const statusBadgeClass = {
  available: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  reserved: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  picked_up: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
  delivered: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
};

function RecentListingsTable({ listings }) {
  if (!listings?.length) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="w-16 h-16 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-inner flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-[var(--text-secondary)] opacity-50" />
        </div>
        <p className="text-[var(--text-secondary)] text-sm font-bold">No active listings</p>
        <p className="text-[var(--text-secondary)] opacity-60 text-xs mt-1">Create your first food donation</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-color)]/50">
            <th className="text-left py-4 px-4 text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">Food Item</th>
            <th className="text-left py-4 px-4 text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">Category</th>
            <th className="text-left py-4 px-4 text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">Qty</th>
            <th className="text-left py-4 px-4 text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
            <th className="text-left py-4 px-4 text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody>
          {listings.slice(0, 5).map((l) => (
            <tr key={l.id} className="border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-secondary)] transition-colors duration-200">
              <td className="py-4 px-4 font-bold text-[var(--text-primary)]">{l.food_name}</td>
              <td className="py-4 px-4">
                <span className="capitalize text-xs font-bold px-3 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl shadow-sm">
                  {l.category}
                </span>
              </td>
              <td className="py-4 px-4 text-[var(--text-secondary)] font-bold">{l.quantity} <span className="opacity-60">kg</span></td>
              <td className="py-4 px-4">
                <Badge variant="outline" className={`text-xs font-bold px-2.5 py-1 ${statusBadgeClass[l.status] || "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)]"}`}>
                  {l.status}
                </Badge>
              </td>
              <td className="py-4 px-4 text-[var(--text-secondary)] font-semibold">{l.created_at?.slice(0, 10)}</td>
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
    <div data-testid="donor-dashboard" className="space-y-8">
      <PageHeader title="Donor Dashboard" subtitle="Track your food donations and environmental impact" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Donated" value={`${kpis.total_donated_kg || 0} kg`} icon={Package} gradient={["#10b981", "#34d399"]} />
        <KPICard title="Completed Pickups" value={kpis.completed_pickups || 0} icon={Truck} gradient={["#f59e0b", "#fbbf24"]} />
        <KPICard title="Meals Served" value={kpis.meals_served || 0} icon={UtensilsCrossed} gradient={["#34d399", "#6ee7b7"]} />
        <KPICard title="CO₂ Avoided" value={`${kpis.co2_avoided_kg || 0} kg`} icon={Wind} gradient={["#0ea5e9", "#7dd3fc"]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ChartCard title="Donations Over Time" icon={TrendingUp} className="lg:col-span-2">
          <div className="h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.donations_over_time?.slice(-14) || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-secondary)", fontWeight: 600 }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ stroke: "var(--border-color)", strokeWidth: 2 }} />
                <Line type="monotone" dataKey="quantity" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "var(--bg-card)" }} activeDot={{ r: 7, strokeWidth: 0, fill:"#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="By Category" icon={Leaf}>
          <div className="h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.category_distribution || []}
                  dataKey="quantity"
                  nameKey="category"
                  cx="50%" cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={5}
                  cornerRadius={8}
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
    <div data-testid="ngo-dashboard" className="space-y-8">
      <PageHeader title="NGO Dashboard" subtitle="Manage pickups and track your community impact" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Pickups Completed" value={kpis.pickups_completed || 0} icon={Truck} gradient={["#10b981", "#34d399"]} />
        <KPICard title="Pending Pickups" value={kpis.pending_pickups || 0} icon={Clock} gradient={["#f59e0b", "#fbbf24"]} />
        <KPICard title="Beneficiaries Served" value={kpis.beneficiaries_served || 0} icon={Users} gradient={["#34d399", "#6ee7b7"]} />
        <KPICard title="CO₂ Avoided" value={`${kpis.co2_avoided_kg || 0} kg`} icon={Wind} gradient={["#0ea5e9", "#7dd3fc"]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ChartCard title="Collection Trend" icon={TrendingUp} className="lg:col-span-2">
          <div className="h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.donations_over_time?.slice(-14) || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-secondary)", fontWeight: 600 }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{fill: 'var(--bg-secondary)', opacity: 0.5}} />
                <Bar dataKey="quantity" fill="url(#colorUv)" radius={[8, 8, 0, 0]} maxBarSize={36}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Recent Pickups" icon={Truck}>
          <div className="space-y-3 mt-4">
            {(dashboard?.recent_pickups || []).length === 0 ? (
              <p className="text-[var(--text-secondary)] text-sm text-center py-10 font-bold opacity-60">No recent pickups</p>
            ) : (
              (dashboard?.recent_pickups || []).slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border-color)] transition-all duration-300">
                  <div>
                    <p className="text-sm font-black text-[var(--text-primary)] leading-none">{p.listing_name}</p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1.5 font-bold tracking-wider uppercase">{p.donor_name}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 shadow-sm ${
                    p.status === "delivered" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" :
                    p.status === "pending" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30" :
                    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
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
    <div data-testid="admin-dashboard" className="space-y-8">
      <PageHeader title="Admin Dashboard" subtitle="Platform-wide overview and monitoring" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard title="Food Recovered" value={`${kpis.total_food_recovered_kg || 0} kg`} icon={Package} gradient={["#10b981", "#34d399"]} />
        <KPICard title="Active Donors" value={kpis.active_donors || 0} icon={Users} gradient={["#f59e0b", "#fbbf24"]} />
        <KPICard title="Active NGOs" value={kpis.active_ngos || 0} icon={Leaf} gradient={["#34d399", "#6ee7b7"]} />
        <KPICard title="Pending Pickups" value={kpis.pending_pickups || 0} icon={Truck} gradient={["#f97316", "#fb923c"]} />
        <KPICard title="CO₂ Saved" value={`${kpis.total_co2_saved_kg || 0} kg`} icon={Wind} gradient={["#0ea5e9", "#7dd3fc"]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Food Recovery Trend" icon={TrendingUp}>
          <div className="h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.donations_over_time?.slice(-14) || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-secondary)", fontWeight: 600 }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ stroke: "var(--border-color)", strokeWidth: 2 }} />
                <Line type="monotone" dataKey="quantity" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "var(--bg-card)" }} activeDot={{ r: 7, strokeWidth: 0, fill:"#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Top Donors by Volume" icon={Users}>
          <div className="h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.top_donors?.slice(0, 5) || []} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} opacity={0.5} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-secondary)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="donor_name" tick={{ fontSize: 11, fill: "var(--text-secondary)", fontWeight: 600 }} width={90} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{fill: 'var(--bg-secondary)', opacity: 0.5}} />
                <Bar dataKey="total_kg" fill="url(#colorBar)" radius={[0, 8, 8, 0]} maxBarSize={28}>
                  <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Category Distribution" icon={Leaf}>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts?.category_distribution || []}
                dataKey="quantity"
                nameKey="category"
                cx="50%" cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                cornerRadius={10}
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
    <div className="space-y-8 animate-pulse p-4">
      <div>
        <div className="h-10 w-64 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl opacity-60" />
        <div className="h-5 w-80 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg opacity-40 mt-3" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-7 space-y-5 depth-card opacity-50">
            <div className="flex justify-between items-center">
              <div className="space-y-3">
                <div className="h-3 w-28 bg-[var(--bg-secondary)] rounded-md" />
                <div className="h-10 w-20 bg-[var(--bg-secondary)] rounded-lg" />
              </div>
              <div className="h-14 w-14 bg-[var(--bg-secondary)] rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-96 w-full bg-[var(--bg-card)] border border-[var(--border-color)] depth-card rounded-3xl opacity-50 shadow-sm" />
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
