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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-base font-bold text-[#0F172A]">{title}</h3>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {children}
    </div>
  );
}

function FormField({ label, required, children, hint }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-gray-400 font-medium">{hint}</p>}
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
    <div className="max-w-2xl mx-auto space-y-7" data-testid="create-listing-page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/listings")}
          data-testid="back-to-listings"
          className="shrink-0 rounded-xl h-10 w-10 hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Create Food Listing</h1>
          <p className="text-gray-500 text-sm mt-0.5 font-medium">Share surplus food with those in need</p>
        </div>
      </div>

      <Card className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <CardContent className="p-7 space-y-8">
          {/* Food Details */}
          <FormSection title="Food Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Food Name" required>
                <Input
                  id="food_name"
                  data-testid="listing-food-name"
                  placeholder="e.g. Biryani, Bread Loaves"
                  value={form.food_name}
                  className="h-11 rounded-xl border-gray-200 text-sm"
                  onChange={(e) => update("food_name", e.target.value)}
                />
              </FormField>
              <FormField label="Category">
                <Select value={form.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger data-testid="listing-category" className="h-11 rounded-xl border-gray-200 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Quantity (kg)" required hint="Enter the approximate weight in kilograms">
                <Input
                  id="quantity"
                  data-testid="listing-quantity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g. 10"
                  value={form.quantity}
                  className="h-11 rounded-xl border-gray-200 text-sm"
                  onChange={(e) => update("quantity", e.target.value)}
                />
              </FormField>
              <FormField label="Storage Condition">
                <Select value={form.storage_condition} onValueChange={(v) => update("storage_condition", v)}>
                  <SelectTrigger data-testid="listing-storage" className="h-11 rounded-xl border-gray-200 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STORAGE.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Preparation Time" hint="When was this food prepared?">
                <Input
                  id="prep_time"
                  data-testid="listing-prep-time"
                  type="datetime-local"
                  value={form.preparation_time}
                  className="h-11 rounded-xl border-gray-200 text-sm"
                  onChange={(e) => update("preparation_time", e.target.value)}
                />
              </FormField>
              <FormField label="Expiry Time" required hint="Food must be picked up before this time">
                <Input
                  id="expiry_time"
                  data-testid="listing-expiry-time"
                  type="datetime-local"
                  value={form.expiry_time}
                  className="h-11 rounded-xl border-gray-200 text-sm"
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
                className="rounded-xl border-gray-200 text-sm resize-none"
                onChange={(e) => update("pickup_address", e.target.value)}
                rows={2}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-5">
              <FormField label="Latitude" hint="Default: New Delhi">
                <Input
                  id="lat"
                  data-testid="listing-latitude"
                  type="number"
                  step="0.0001"
                  value={form.latitude}
                  className="h-11 rounded-xl border-gray-200 text-sm"
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
                  className="h-11 rounded-xl border-gray-200 text-sm"
                  onChange={(e) => update("longitude", e.target.value)}
                />
              </FormField>
            </div>
          </FormSection>

          {/* Urgent Toggle */}
          <div className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-colors duration-200 ${
            form.urgent_flag ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-100"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                form.urgent_flag ? "bg-orange-100" : "bg-gray-100"
              }`}>
                <Zap className={`w-5 h-5 transition-colors ${form.urgent_flag ? "text-orange-500" : "text-gray-400"}`} />
              </div>
              <div>
                <p className="font-bold text-[#0F172A] text-sm">Mark as Urgent</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Prioritize for immediate pickup by NGOs</p>
              </div>
            </div>
            <Switch
              data-testid="listing-urgent"
              checked={form.urgent_flag}
              onCheckedChange={(v) => update("urgent_flag", v)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => handleSubmit("draft")}
              disabled={loading}
              data-testid="save-draft-btn"
              className="flex-1 h-11 rounded-xl border-gray-200 font-semibold hover:bg-gray-50"
            >
              <Save className="w-4 h-4 mr-2 text-gray-500" /> Save Draft
            </Button>
            <Button
              onClick={() => handleSubmit("available")}
              disabled={loading}
              data-testid="publish-listing-btn"
              className="flex-1 h-11 bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] text-white rounded-xl font-semibold shadow-md shadow-green-100"
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
