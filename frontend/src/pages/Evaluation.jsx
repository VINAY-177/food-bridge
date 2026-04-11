import { useState, useEffect } from "react";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Leaf, DollarSign, Users, BarChart3, AlertCircle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

const METRIC_ICONS = {
  feasibility: BarChart3,
  cost: DollarSign,
  environmental: Leaf,
  social: Users,
};
const METRIC_COLORS = {
  feasibility: "var(--primary)",
  cost: "#FF9800",
  environmental: "#4CAF50",
  social: "#0288D1",
};

export default function Evaluation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const res = await api.get("/evaluation");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluation();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin shadow-lg shadow-emerald-500/10" />
        <p className="text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Running Analytics</p>
      </div>
    );
  }

  if (!data?.data_sufficient) {
    return (
      <div className="space-y-10 animate-fade-in-up" data-testid="evaluation-page">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight drop-shadow-sm">Evaluation Engine</h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm font-semibold tracking-wide uppercase opacity-70">Model performance & impact assessment</p>
        </div>
        <Card className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden relative depth-card">
          <CardContent className="flex flex-col items-center py-24 relative z-10">
            <div className="logo-3d w-24 h-24 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center mb-8 shadow-inner ring-4 ring-emerald-500/5">
              <AlertCircle className="w-12 h-12 text-[var(--text-secondary)] opacity-30" />
            </div>
            <p className="text-[var(--text-primary)] font-black text-2xl tracking-tight">Insufficient Data</p>
            <p className="text-[var(--text-secondary)] text-sm max-w-[320px] text-center mt-3 font-medium leading-relaxed opacity-70">
              Complete more pickups and manage listings to generate a comprehensive evaluation of your redistribution models.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = (data?.models || []).map((m) => ({
    name: m.name,
    overall: m.overall,
    feasibility: m.feasibility,
    cost: m.cost,
    environmental: m.environmental,
    social: m.social,
  }));

  return (
    <div className="space-y-10 animate-fade-in-up" data-testid="evaluation-page">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight drop-shadow-sm">Evaluation Engine</h1>
          <p className="text-[var(--text-secondary)] mt-3 text-sm font-medium leading-relaxed max-w-2xl">
            Analyzing redistribution models using weighted scoring:
            <span className="block mt-1 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest">
              Feasibility(0.3) + Environmental(0.3) + Cost(0.2) + Social(0.2)
            </span>
          </p>
        </div>
        <div className="badge-3d px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
          <BarChart3 className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--text-primary)] shadow-sm">Real-time Analytics Active</span>
        </div>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(data?.models || []).map((model) => {
          const isRecommended = model.name === data?.recommended;
          return (
            <Card
              key={model.name}
              data-testid={`eval-model-${model.name.replace(/\s+/g, '-').toLowerCase()}`}
              className={`bg-[var(--bg-card)] rounded-[2.5rem] border transition-all duration-500 card-3d card-hover group p-0 overflow-hidden ${
                isRecommended
                  ? "border-emerald-500/50 shadow-2xl shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                  : "border-[var(--border-color)]"
              }`}
            >
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{model.name}</CardTitle>
                  {isRecommended && (
                    <div className="badge-3d bg-emerald-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/30">
                      <Award className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Top Model</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed opacity-70">{model.description}</p>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="space-y-4 bg-[var(--bg-secondary)]/30 rounded-3xl p-6 border border-[var(--border-color)]/30">
                  {["feasibility", "cost", "environmental", "social"].map((metric) => {
                    const Icon = METRIC_ICONS[metric];
                    const color = METRIC_COLORS[metric];
                    const value = model[metric];
                    return (
                      <div key={metric} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]/50 flex items-center justify-center shadow-sm">
                              <Icon className="w-4 h-4" style={{ color }} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{metric}</span>
                          </div>
                          <span className="text-sm font-black" style={{ color }}>{value}%</span>
                        </div>
                        <div className="h-2 w-full bg-[var(--bg-card)] rounded-full overflow-hidden shadow-inner border border-[var(--border-color)]/20">
                          <div 
                            className="h-full transition-all duration-1000 ease-out rounded-full shadow-sm" 
                            style={{ width: `${value}%`, backgroundColor: color }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-6 border-t border-[var(--border-color)]/30">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1">Efficiency Level</p>
                      <span className="font-semibold text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md">Tier 1 Rating</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 uppercase tracking-widest">Aggregate Score</p>
                      <span className="text-4xl font-black text-[var(--text-primary)] stat-3d">{model.overall}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Chart */}
      <Card className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl overflow-hidden depth-card relative">
        <div className="absolute top-0 right-0 p-10 pointer-events-none opacity-5 dark:opacity-10">
          <BarChart3 className="w-48 h-48" />
        </div>
        <CardHeader className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-[var(--text-primary)] tracking-tight leading-none mb-1.5">Model Comparison</CardTitle>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest opacity-60">Cross-metric Performance Analysis</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="6 6" stroke="currentColor" className="text-[var(--border-color)] opacity-20" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fontWeight: 800, fill: "var(--text-secondary)" }} 
                  axisLine={false}
                  tickLine={false}
                  dy={15}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: "var(--text-secondary)" }} 
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: 'var(--bg-secondary)', opacity: 0.2 }}
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    borderRadius: "20px",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                    border: "1px solid var(--border-color)",
                    backdropFilter: "blur(12px)",
                    padding: "16px"
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: "700", padding: "4px 0" }}
                  labelStyle={{ fontSize: "14px", fontWeight: "900", color: "var(--text-primary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}
                />
                <Bar dataKey="feasibility" name="Feasibility" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="environmental" name="Environmental" fill="#4CAF50" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="cost" name="Cost" fill="#FF9800" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="social" name="Social" fill="#0288D1" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
