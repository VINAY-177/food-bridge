import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, ArrowRight, Heart, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const stats = [
  { icon: Heart, value: "12,000+", label: "Meals Delivered" },
  { icon: Users, value: "150+", label: "NGO Partners" },
  { icon: TrendingUp, value: "5,400 kg", label: "CO₂ Avoided" },
];

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({
    email: "", password: "", role: "donor", org_name: "", service_area: "", phone: ""
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.email || !regForm.password || !regForm.org_name) {
      toast.error("Please fill required fields");
      return;
    }
    if (regForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(regForm);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-emerald-500/30" data-testid="login-page">
      {/* Left - Form Panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[var(--mesh-color-1)] transition-colors duration-500">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 opacity-40 dark:opacity-60 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--mesh-color-2)] via-transparent to-transparent blur-[100px] animate-pulse-slow" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--mesh-color-3)] to-transparent blur-[100px]" />
          <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-transparent to-[var(--mesh-color-4)] blur-[100px] animate-pulse" />
        </div>
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50" />

        <div className="w-full max-w-md relative z-10 animate-fade-in-up glass rounded-[2.5rem] p-10 border border-[var(--border-color)] shadow-2xl depth-card">
          {/* Logo */}
          <div className="flex items-center gap-3.5 mb-10">
            <div className="logo-3d w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight leading-none drop-shadow-sm">MealBridge</h1>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold tracking-[0.2em] uppercase mt-1">Nourishing Future</p>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-10 bg-[var(--bg-secondary)]/50 p-1.5 rounded-2xl h-12 border border-[var(--border-color)]/30">
              <TabsTrigger
                value="login"
                data-testid="login-tab"
                className="rounded-xl text-xs font-bold uppercase tracking-wider data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-emerald-600 data-[state=active]:shadow-md transition-all duration-300"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                data-testid="register-tab"
                className="rounded-xl text-xs font-bold uppercase tracking-wider data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-emerald-600 data-[state=active]:shadow-md transition-all duration-300"
              >
                Join Us
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="animate-fade-in-up space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Welcome back</h2>
                <p className="text-[var(--text-secondary)] text-sm mt-2 font-medium">Continue your mission of redistribution</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2.5">
                  <Label htmlFor="login-email" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Email Address</Label>
                  <Input
                    id="login-email"
                    data-testid="login-email"
                    type="email"
                    placeholder="you@mealbridge.org"
                    value={loginForm.email}
                    className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="login-password" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Security Key</Label>
                  <Input
                    id="login-password"
                    data-testid="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </div>
                <Button
                  type="submit"
                  data-testid="login-submit"
                  disabled={loading}
                  className="w-full btn-3d bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white h-12 rounded-xl font-bold shadow-xl shadow-emerald-500/20 transition-all duration-300 transform active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Initializing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 tracking-wide uppercase text-xs">
                      Enter Dashboard <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="animate-fade-in-up space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Create Identity</h2>
                <p className="text-[var(--text-secondary)] text-sm mt-2 font-medium">Join the global network for good</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Organization Type</Label>
                  <Select value={regForm.role} onValueChange={(v) => setRegForm({ ...regForm, role: v })}>
                    <SelectTrigger data-testid="register-role" className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--bg-card)] border-[var(--border-color)] rounded-xl shadow-2xl">
                      <SelectItem value="donor" className="font-semibold text-sm">🍽️ Food Donor (Official)</SelectItem>
                      <SelectItem value="ngo" className="font-semibold text-sm">🤝 NGO / Global Charity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Entity Name</Label>
                  <Input
                    data-testid="register-org"
                    placeholder="Full legal name"
                    value={regForm.org_name}
                    className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/50 font-medium"
                    onChange={(e) => setRegForm({ ...regForm, org_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Contact Email</Label>
                    <Input
                      data-testid="register-email"
                      type="email"
                      placeholder="mail@org.com"
                      value={regForm.email}
                      className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/50 font-medium"
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Secure Pass</Label>
                    <Input
                      data-testid="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={regForm.password}
                      className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/50 font-medium"
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  data-testid="register-submit"
                  disabled={loading}
                  className="w-full btn-3d bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white h-12 rounded-xl font-bold shadow-xl shadow-emerald-500/20 mt-4 tracking-wide uppercase text-xs"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Synchronizing...
                    </span>
                  ) : "Register Entity"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right - Hero Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden group">
        <img
          src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1400&q=95&auto=format&fit=crop"
          alt="Community outreach"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 ease-out"
        />
        {/* Multilayered ambient overlays for premium depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {/* Floating background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-16 text-white h-full max-w-2xl">
          {/* Status Badge */}
          <div className="badge-3d inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 w-fit shadow-2xl">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ring-4 ring-emerald-500/20" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-50 shadow-sm">Global Network Live</span>
          </div>

          {/* Core Content */}
          <div className="space-y-8 animate-fade-in-up">
            <h2 className="text-7xl font-black leading-[1.05] tracking-tight drop-shadow-2xl">
              Solve Hunger.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-green-100">
                End Waste.
              </span>
            </h2>
            <p className="text-xl text-emerald-50/80 leading-relaxed max-w-lg font-medium">
              Join the most advanced platform for surplus food redistribution. 
              Efficiency powered by technology, compassion driven by community.
            </p>

            {/* Stats matrix */}
            <div className="grid grid-cols-3 gap-6 pt-10">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="group/stat bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 transition-all duration-500 hover:bg-white/10 hover:-translate-y-2 hover:shadow-2xl hover:border-white/20 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/stat:scale-150 transition-transform duration-500">
                    <Icon className="w-12 h-12" />
                  </div>
                  <Icon className="badge-3d w-6 h-6 text-emerald-300 mb-4" />
                  <p className="text-3xl font-black text-white leading-none stat-3d">{value}</p>
                  <p className="text-[10px] text-emerald-100/60 mt-3 font-bold uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
