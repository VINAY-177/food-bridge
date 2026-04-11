import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Send, Zap } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "cooked", label: "🍲 Cooked Food" },
  { value: "raw", label: "🥦 Raw Ingredients" },
  { value: "packaged", label: "📦 Packaged" },
  { value: "bakery", label: "🥐 Bakery" },
  { value: "dairy", label: "🥛 Dairy" },
  { value: "fruits_vegetables", label: "🍎 Fruits & Vegetables" },
  { value: "other", label: "🍽️ Other" },
];

const STORAGE = [
  { value: "room_temp", label: "🌡️ Room Temperature" },
  { value: "refrigerated", label: "❄️ Refrigerated" },
  { value: "frozen", label: "🧊 Frozen" },
];

function FormSection({ title, children }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <h3 className="text-base font-black text-[var(--text-primary)] uppercase tracking-wider">{title}</h3>
        <div className="flex-1 h-px bg-[var(--border-color)]" />
      </div>
      {children}
    </div>
  );
}

function FormField({ label, required, children, hint }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1">{hint}</p>}
    </div>
  );
}

export default function CreateListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    food_name: "",
    category: "cooked",
    quantity: "",
    preparation_time: "",
    expiry_time: "",
    storage_condition: "room_temp",
    pickup_address: "",
    latitude: "28.6139",
    longitude: "77.2090",
    urgent_flag: false,
  });

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const validate = () => {
    if (!form.food_name.trim()) return "Food name is required";
    if (!form.quantity || Number(form.quantity) <= 0) return "Quantity must be greater than 0";
    if (!form.expiry_time) return "Expiry time is required";
    const expiry = new Date(form.expiry_time);
    if (expiry <= new Date()) return "Expiry time must be in the future";
    return null;
  };

  const handleSubmit = async (status) => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setLoading(true);
    try {
      await api.post("/listings", {
        ...form,
        quantity: Number(form.quantity),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        status,
      });
      toast.success(status === "draft" ? "Saved as draft" : "🎉 Listing published successfully!");
      navigate("/listings");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade-in-up" data-testid="create-listing-page">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/listings")}
          data-testid="back-to-listings"
          className="shrink-0 rounded-2xl h-12 w-12 hover:bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] shadow-sm transition-all hover:-translate-x-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight drop-shadow-sm">Create Listing</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2 font-semibold tracking-wide uppercase opacity-70">Share surplus food with the community</p>
        </div>
      </div>

      <Card className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] depth-card shadow-2xl overflow-hidden relative">
        <CardContent className="p-10 space-y-12 relative z-10">
          {/* Food Details */}
          <FormSection title="Core Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Food Name" required>
                <Input
                  id="food_name"
                  data-testid="listing-food-name"
                  placeholder="e.g. Freshly Baked Sourdough"
                  value={form.food_name}
                  className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                  onChange={(e) => update("food_name", e.target.value)}
                />
              </FormField>
              <FormField label="Type / Category">
                <Select value={form.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger data-testid="listing-category" className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/30 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg-card)] border-[var(--border-color)] rounded-xl shadow-2xl">
                    {CATEGORIES.map((c) => (
                      <SelectItem className="text-[var(--text-primary)] font-semibold cursor-pointer" key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Mass (Kilograms)" required hint="Approximate total net weight">
                <Input
                  id="quantity"
                  data-testid="listing-quantity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g. 5.5"
                  value={form.quantity}
                  className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/30 font-bold"
                  onChange={(e) => update("quantity", e.target.value)}
                />
              </FormField>
              <FormField label="Stability Environment">
                <Select value={form.storage_condition} onValueChange={(v) => update("storage_condition", v)}>
                  <SelectTrigger data-testid="listing-storage" className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/30 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg-card)] border-[var(--border-color)] rounded-xl shadow-2xl">
                    {STORAGE.map((s) => (
                      <SelectItem className="text-[var(--text-primary)] font-semibold cursor-pointer" key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Prep Timestamp" hint="When was this food finalized?">
                <Input
                  id="prep_time"
                  data-testid="listing-prep-time"
                  type="datetime-local"
                  value={form.preparation_time}
                  className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] text-sm [color-scheme:light_dark] font-medium"
                  onChange={(e) => update("preparation_time", e.target.value)}
                />
              </FormField>
              <FormField label="Expiry Deadline" required hint="Must be picked up before this window closes">
                <Input
                  id="expiry_time"
                  data-testid="listing-expiry-time"
                  type="datetime-local"
                  value={form.expiry_time}
                  className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] text-sm [color-scheme:light_dark] font-bold"
                  onChange={(e) => update("expiry_time", e.target.value)}
                />
              </FormField>
            </div>
          </FormSection>

          {/* Pickup Location */}
          <FormSection title="Logistics & Location">
            <FormField label="Dispatch Address">
              <Textarea
                id="address"
                data-testid="listing-address"
                placeholder="Detailed coordinates or address for collection..."
                value={form.pickup_address}
                className="rounded-2xl border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] text-sm resize-none focus:ring-2 focus:ring-emerald-500/30 min-h-[100px] font-medium p-4"
                onChange={(e) => update("pickup_address", e.target.value)}
                rows={3}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-8">
              <FormField label="Lat Geo-Coord">
                <Input
                  id="lat"
                  data-testid="listing-latitude"
                  type="number"
                  step="0.0001"
                  value={form.latitude}
                  className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] text-xs focus:ring-2 focus:ring-emerald-500/30 opacity-80"
                  onChange={(e) => update("latitude", e.target.value)}
                />
              </FormField>
              <FormField label="Long Geo-Coord">
                <Input
                  id="lng"
                  data-testid="listing-longitude"
                  type="number"
                  step="0.0001"
                  value={form.longitude}
                  className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] text-xs focus:ring-2 focus:ring-emerald-500/30 opacity-80"
                  onChange={(e) => update("longitude", e.target.value)}
                />
              </FormField>
            </div>
          </FormSection>

          {/* Urgent Toggle */}
          <div className={`flex items-center justify-between p-8 rounded-[2rem] border-2 transition-all duration-500 group/urgent ${
            form.urgent_flag 
              ? "bg-orange-500/10 border-orange-500/50 shadow-xl shadow-orange-500/10" 
              : "bg-[var(--bg-secondary)]/30 border-[var(--border-color)]"
          }`}>
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner badge-3d ${
                form.urgent_flag ? "bg-orange-500 shadow-orange-500/40 text-white" : "bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] opacity-60"
              }`}>
                <Zap className={`w-7 h-7 ${form.urgent_flag ? "animate-pulse" : ""}`} />
              </div>
              <div>
                <p className="font-black text-[var(--text-primary)] text-lg tracking-tight leading-none mb-1.5">Priority Dispatch</p>
                <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.1em] opacity-70">Mark as urgent for immediate NGO notification</p>
              </div>
            </div>
            <Switch
              data-testid="listing-urgent"
              checked={form.urgent_flag}
              className="data-[state=checked]:bg-orange-500 scale-125"
              onCheckedChange={(v) => update("urgent_flag", v)}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-5 pt-8 border-t border-[var(--border-color)]/30">
            <Button
              variant="outline"
              onClick={() => handleSubmit("draft")}
              disabled={loading}
              data-testid="save-draft-btn"
              className="flex-1 h-12 rounded-xl border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--bg-card)] font-black uppercase text-[10px] tracking-widest hover:bg-[var(--bg-secondary)] transition-all shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" /> Save to Drafts
            </Button>
            <Button
              onClick={() => handleSubmit("available")}
              disabled={loading}
              data-testid="publish-listing-btn"
              className="flex-1 h-12 btn-3d bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Broadcasting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> Publish Listing
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
