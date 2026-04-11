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
      <Card className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] relative">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }} />
        </div>
        <CardContent className="px-7 pb-7 pt-0">
          <div className="flex items-end gap-5 -mt-10 mb-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg border-4 border-white shrink-0"
              style={{ backgroundColor: roleConfig.bg, color: roleConfig.color }}
            >
              {initials}
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-[#0F172A] leading-tight">
                {user?.org_name || user?.email}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge
                  className="text-xs font-bold border-0 px-2.5 py-0.5"
                  style={{ backgroundColor: roleConfig.bg, color: roleConfig.color }}
                >
                  {roleConfig.icon} {roleConfig.label}
                </Badge>
                <span className="text-sm text-gray-400 font-medium">{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <ProfileField icon={Building} label="Organization Name">
              <Input
                data-testid="profile-org-name"
                value={form.org_name}
                className="h-11 rounded-xl border-gray-200 text-sm"
                onChange={(e) => setForm({ ...form, org_name: e.target.value })}
                placeholder="Enter your organization name"
              />
            </ProfileField>

            <ProfileField icon={MapPin} label="Service Area">
              <Input
                data-testid="profile-service-area"
                value={form.service_area}
                className="h-11 rounded-xl border-gray-200 text-sm"
                onChange={(e) => setForm({ ...form, service_area: e.target.value })}
                placeholder="e.g. New Delhi, Mumbai"
              />
            </ProfileField>

            <ProfileField icon={Phone} label="Phone Number">
              <Input
                data-testid="profile-phone"
                value={form.phone}
                className="h-11 rounded-xl border-gray-200 text-sm"
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
              />
            </ProfileField>

            <ProfileField icon={Mail} label="Email Address">
              <div className="relative">
                <Input
                  value={user?.email || ""}
                  disabled
                  className="h-11 rounded-xl border-gray-200 text-sm bg-gray-50 text-gray-500 pr-20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Badge className="bg-gray-100 text-gray-500 text-xs font-semibold border-0">Locked</Badge>
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium">Your email address cannot be changed.</p>
            </ProfileField>

            <div className="pt-2 border-t border-gray-100">
              <Button
                onClick={handleSave}
                disabled={loading}
                data-testid="save-profile-btn"
                className="w-full h-11 bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] text-white rounded-xl font-semibold shadow-md shadow-green-100"
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
      <Card className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-gray-500" />
            </div>
            <h3 className="font-bold text-[#0F172A] text-sm">Account Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Account Type</p>
              <p className="font-bold text-[#0F172A]">{roleConfig.label}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">User ID</p>
              <p className="font-bold text-[#0F172A] font-mono text-xs truncate">{user?.id || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
