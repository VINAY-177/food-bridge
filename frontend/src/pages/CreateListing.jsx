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
    <div className="max-w-3xl mx-auto space-y-7" data-testid="create-listing-page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/listings")}
          data-testid="back-to-listings"
          className="shrink-0 rounded-2xl h-11 w-11 hover:bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Create Food Listing</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5 font-medium">Share surplus food with those in need</p>
        </div>
      </div>

      <Card className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] depth-card shadow-sm">
        <CardContent className="p-8 space-y-10">
          {/* Food Details */}
          <FormSection title="Food Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Food Name" required>
                <Input
                  id="food_name"
                  data-testid="listing-food-name"
                  placeholder="e.g. Biryani, Bread Loaves"
                  value={form.food_name}
                  className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/50"
                  onChange={(e) => update("food_name", e.target.value)}
                />
              </FormField>
              <FormField label="Category">
                <Select value={form.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger data-testid="listing-category" className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg-card)] border-[var(--border-color)]">
                    {CATEGORIES.map((c) => (
                      <SelectItem className="text-[var(--text-primary)] focus:bg-[var(--bg-secondary)]" key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Quantity (kg)" required hint="Enter the approximate weight in kilograms">
                <Input
                  id="quantity"
                  data-testid="listing-quantity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g. 10"
                  value={form.quantity}
                  className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/50"
                  onChange={(e) => update("quantity", e.target.value)}
                />
              </FormField>
              <FormField label="Storage Condition">
                <Select value={form.storage_condition} onValueChange={(v) => update("storage_condition", v)}>
                  <SelectTrigger data-testid="listing-storage" className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg-card)] border-[var(--border-color)]">
                    {STORAGE.map((s) => (
                      <SelectItem className="text-[var(--text-primary)] focus:bg-[var(--bg-secondary)]" key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Preparation Time" hint="When was this food prepared?">
                <Input
                  id="prep_time"
                  data-testid="listing-prep-time"
                  type="datetime-local"
                  value={form.preparation_time}
                  className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm [color-scheme:light_dark]"
                  onChange={(e) => update("preparation_time", e.target.value)}
                />
              </FormField>
              <FormField label="Expiry Time" required hint="Food must be picked up before this time">
                <Input
                  id="expiry_time"
                  data-testid="listing-expiry-time"
                  type="datetime-local"
                  value={form.expiry_time}
                  className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm [color-scheme:light_dark]"
                  onChange={(e) => update("expiry_time", e.target.value)}
                />
              </FormField>
            </div>
          </FormSection>

          {/* Pickup Location */}
          <FormSection title="Pickup Location">
            <FormField label="Pickup Address">
              <Textarea
                id="address"
                data-testid="listing-address"
                placeholder="Full address where the food can be collected..."
                value={form.pickup_address}
                className="rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm resize-none focus:ring-2 focus:ring-emerald-500/50 min-h-[80px]"
                onChange={(e) => update("pickup_address", e.target.value)}
                rows={3}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-6">
              <FormField label="Latitude" hint="Default: New Delhi">
                <Input
                  id="lat"
                  data-testid="listing-latitude"
                  type="number"
                  step="0.0001"
                  value={form.latitude}
                  className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/50"
                  onChange={(e) => update("latitude", e.target.value)}
                />
              </FormField>
              <FormField label="Longitude">
                <Input
                  id="lng"
                  data-testid="listing-longitude"
                  type="number"
                  step="0.0001"
                  value={form.longitude}
                  className="h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/50"
                  onChange={(e) => update("longitude", e.target.value)}
                />
              </FormField>
            </div>
          </FormSection>

          {/* Urgent Toggle */}
          <div className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-colors duration-300 ${
            form.urgent_flag ? "bg-orange-500/10 border-orange-500/30" : "bg-[var(--bg-secondary)] border-[var(--border-color)]"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-inner ${
                form.urgent_flag ? "bg-orange-500/20" : "bg-[var(--bg-card)] border border-[var(--border-color)]"
              }`}>
                <Zap className={`w-6 h-6 transition-colors ${form.urgent_flag ? "text-orange-500" : "text-[var(--text-secondary)]"}`} />
              </div>
              <div>
                <p className="font-bold text-[var(--text-primary)] text-base tracking-tight leading-tight">Mark as Urgent</p>
                <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 uppercase tracking-wider">Prioritize for immediate pickup by NGOs</p>
              </div>
            </div>
            <Switch
              data-testid="listing-urgent"
              checked={form.urgent_flag}
              className="data-[state=checked]:bg-orange-500"
              onCheckedChange={(v) => update("urgent_flag", v)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-[var(--border-color)]/50">
            <Button
              variant="outline"
              onClick={() => handleSubmit("draft")}
              disabled={loading}
              data-testid="save-draft-btn"
              className="flex-1 h-12 rounded-xl border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--bg-card)] font-bold hover:bg-[var(--bg-secondary)] transition-all"
            >
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <Button
              onClick={() => handleSubmit("available")}
              disabled={loading}
              data-testid="publish-listing-btn"
              className="flex-1 h-12 btn-3d bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
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
