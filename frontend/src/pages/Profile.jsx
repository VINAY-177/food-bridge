import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Building, Save, Shield } from "lucide-react";
import { toast } from "sonner";

const ROLE_CONFIG = {
  donor: { label: "Food Donor", bg: "#E8F5E9", color: "#2E7D32", icon: "🍽️" },
  ngo: { label: "NGO / Charity", bg: "#E3F2FD", color: "#1565C0", icon: "🤝" },
  admin: { label: "Administrator", bg: "#FFF3E0", color: "#E65100", icon: "🛡️" },
};

function ProfileField({ icon: Icon, label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Icon className="w-4 h-4 text-gray-400" /> {label}
      </Label>
      {children}
    </div>
  );
}

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    org_name: user?.org_name || "",
    service_area: user?.service_area || "",
    phone: user?.phone || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.donor;
  const initials = (user?.org_name || user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-7" data-testid="profile-page">
      <div>
        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Profile</h1>
        <p className="text-gray-500 mt-1.5 text-sm font-medium">Manage your account information</p>
      </div>

      {/* Profile Header Card */}
      <Card className="bg-[var(--bg-card)] border-[var(--border-color)] rounded-2xl shadow-sm overflow-hidden depth-card">
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-500 relative z-0">
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINFY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
        </div>
        <CardContent className="px-7 pb-7 pt-0 relative z-10">
          <div className="flex items-end gap-5 -mt-12 mb-5">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl border-[6px] border-[var(--bg-card)] shrink-0 transform transition-transform hover:scale-105 duration-300"
              style={{ backgroundColor: roleConfig.bg, color: roleConfig.color }}
            >
              {initials}
            </div>
            <div className="pb-2">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] leading-tight tracking-tight">
                {user?.org_name || user?.email}
              </h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge
                  className="text-xs font-bold border-0 px-3 py-1 shadow-sm"
                  style={{ backgroundColor: roleConfig.bg, color: roleConfig.color }}
                >
                  {roleConfig.icon} {roleConfig.label}
                </Badge>
                <span className="text-sm text-[var(--text-secondary)] font-medium ml-1">{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <ProfileField icon={Building} label="Organization Name">
              <Input
                data-testid="profile-org-name"
                value={form.org_name}
                className="h-11 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm transition-all focus:ring-2 focus:ring-emerald-500/50"
                onChange={(e) => setForm({ ...form, org_name: e.target.value })}
                placeholder="Enter your organization name"
              />
            </ProfileField>

            <ProfileField icon={MapPin} label="Service Area">
              <Input
                data-testid="profile-service-area"
                value={form.service_area}
                className="h-11 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm transition-all focus:ring-2 focus:ring-emerald-500/50"
                onChange={(e) => setForm({ ...form, service_area: e.target.value })}
                placeholder="e.g. New Delhi, Mumbai"
              />
            </ProfileField>

            <ProfileField icon={Phone} label="Phone Number">
              <Input
                data-testid="profile-phone"
                value={form.phone}
                className="h-11 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm transition-all focus:ring-2 focus:ring-emerald-500/50"
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
              />
            </ProfileField>

            <ProfileField icon={Mail} label="Email Address">
              <div className="relative">
                <Input
                  value={user?.email || ""}
                  disabled
                  className="h-11 rounded-xl border-[var(--border-color)] text-sm bg-[var(--bg-secondary)] opacity-70 text-[var(--text-primary)] pr-20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Badge className="bg-[var(--bg-card)] text-[var(--text-secondary)] shadow-sm text-xs font-semibold border border-[var(--border-color)]">Locked</Badge>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Your email address cannot be changed.</p>
            </ProfileField>

            <div className="pt-2 border-t border-[var(--border-color)]">
              <Button
                onClick={handleSave}
                disabled={loading}
                data-testid="save-profile-btn"
                className="w-full h-11 btn-3d bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                  </span>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Info Card */}
      <Card className="bg-[var(--bg-card)] depth-card rounded-2xl border border-[var(--border-color)] shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="font-bold text-[var(--text-primary)] text-sm">Account Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Account Type</p>
              <p className="font-bold text-[var(--text-primary)]">{roleConfig.label}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">User ID</p>
              <p className="font-bold text-[var(--text-primary)] font-mono text-[10px] sm:text-xs truncate">{user?.id || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
