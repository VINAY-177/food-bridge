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
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left - Form Panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden bg-background">
        {/* Animated background decoration grids & ambient blobs */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-green-400/10 dark:bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-fade-in-up bg-card/80 backdrop-blur-xl rounded-[2rem] p-8 border border-border/50 shadow-2xl shadow-green-900/5">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="logo-3d w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] flex items-center justify-center shadow-lg shadow-green-500/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none">MealBridge</h1>
              <p className="text-[11px] text-muted-foreground font-medium tracking-widest uppercase mt-0.5">For Good</p>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/60 p-1 rounded-xl h-11">
              <TabsTrigger
                value="login"
                data-testid="login-tab"
                className="rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-[#2E7D32] data-[state=active]:shadow-sm transition-all"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                data-testid="register-tab"
                className="rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-[#2E7D32] data-[state=active]:shadow-sm transition-all"
              >
                Register
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="animate-fade-in-up">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h2>
                <p className="text-muted-foreground text-sm mt-1">Sign in to continue managing food redistribution</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-semibold text-gray-700">Email address</Label>
                  <Input
                    id="login-email"
                    data-testid="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    className="h-11 rounded-xl border-gray-200 focus:border-[#2E7D32] text-sm"
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-semibold text-gray-700">Password</Label>
                  <Input
                    id="login-password"
                    data-testid="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    className="h-11 rounded-xl border-gray-200 focus:border-[#2E7D32] text-sm"
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </div>
                <Button
                  type="submit"
                  data-testid="login-submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] text-white h-11 rounded-xl font-semibold shadow-md shadow-green-100 transition-all duration-200 btn-3d"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="animate-fade-in-up">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Create account</h2>
                <p className="text-muted-foreground text-sm mt-1">Join the food redistribution network</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-role" className="text-sm font-semibold text-gray-700">I represent a</Label>
                  <Select value={regForm.role} onValueChange={(v) => setRegForm({ ...regForm, role: v })}>
                    <SelectTrigger data-testid="register-role" className="h-11 rounded-xl border-gray-200 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donor">🍽️ Food Donor (Restaurant, Hotel, etc.)</SelectItem>
                      <SelectItem value="ngo">🤝 NGO / Charity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-org" className="text-sm font-semibold text-gray-700">Organization Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="reg-org"
                    data-testid="register-org"
                    placeholder="Your organization"
                    value={regForm.org_name}
                    className="h-11 rounded-xl border-gray-200 text-sm"
                    onChange={(e) => setRegForm({ ...regForm, org_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-sm font-semibold text-gray-700">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="reg-email"
                      data-testid="register-email"
                      type="email"
                      placeholder="you@org.com"
                      value={regForm.email}
                      className="h-11 rounded-xl border-gray-200 text-sm"
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone" className="text-sm font-semibold text-gray-700">Phone</Label>
                    <Input
                      id="reg-phone"
                      data-testid="register-phone"
                      placeholder="+91..."
                      value={regForm.phone}
                      className="h-11 rounded-xl border-gray-200 text-sm"
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-sm font-semibold text-gray-700">Password <span className="text-red-500">*</span></Label>
                  <Input
                    id="reg-password"
                    data-testid="register-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={regForm.password}
                    className="h-11 rounded-xl border-gray-200 text-sm"
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-area" className="text-sm font-semibold text-gray-700">Service Area</Label>
                  <Input
                    id="reg-area"
                    data-testid="register-area"
                    placeholder="e.g. New Delhi, Mumbai"
                    value={regForm.service_area}
                    className="h-11 rounded-xl border-gray-200 text-sm"
                    onChange={(e) => setRegForm({ ...regForm, service_area: e.target.value })}
                  />
                </div>
                <Button
                  type="submit"
                  data-testid="register-submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] text-white h-11 rounded-xl font-semibold shadow-md shadow-green-100 transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right - Hero Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1400&q=85&auto=format&fit=crop"
          alt="Fresh organic vegetables"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Layered gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 w-fit">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-semibold text-white">Live Network</span>
          </div>

          {/* Bottom content */}
          <div>
            <h2 className="text-5xl font-black mb-5 leading-tight tracking-tight">
              Reduce Waste.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200">
                Feed Communities.
              </span>
            </h2>
            <p className="text-lg text-white/75 max-w-sm leading-relaxed mb-10">
              Connect surplus food with those in need. Track donations, manage pickups,
              and measure your environmental impact in real time.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
                  <Icon className="w-5 h-5 text-green-300 mb-2" />
                  <p className="text-2xl font-bold text-white leading-none">{value}</p>
                  <p className="text-xs text-white/60 mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
