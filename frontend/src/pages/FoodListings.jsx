import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, MapPin, Clock, AlertTriangle, Package2, Filter } from "lucide-react";
import { toast } from "sonner";

const statusColors = {
  available: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  reserved: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  picked_up: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  delivered: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  draft: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  expired: "bg-red-500/10 text-red-600 border-red-500/20",
};

const categoryIcons = {
  cooked: "🍲",
  raw: "🥦",
  packaged: "📦",
  bakery: "🥐",
  dairy: "🥛",
  fruits_vegetables: "🍎",
  other: "🍽️",
};

export default function FoodListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [claimDialog, setClaimDialog] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);

  // FIX: Stable fetchListings using useCallback, single definition
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (user?.role === "donor") params.donor_id = user.id;
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await api.get("/listings", { params });
      setListings(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, user]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleClaim = async () => {
    if (!claimDialog) return;
    setClaimLoading(true);
    try {
      await api.post("/pickups", { listing_id: claimDialog.id });
      toast.success("Pickup created! Check your pickups page.");
      setClaimDialog(null);
      fetchListings(); // FIX: now properly in scope
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to claim listing");
    } finally {
      setClaimLoading(false);
    }
  };

  const filtered = listings.filter((l) =>
    l.food_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in-up" data-testid="food-listings-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight drop-shadow-sm">
            {user?.role === "donor" ? "My Listings" : "Food Listings"}
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm font-semibold tracking-wide uppercase opacity-70">
            {user?.role === "ngo" ? "Browse available food for pickup" : "Manage your surplus food listings"}
          </p>
        </div>
        {user?.role === "donor" && (
          <Button
            onClick={() => navigate("/listings/create")}
            data-testid="create-listing-btn"
            className="btn-3d bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 gap-2 h-12 px-6"
          >
            <Plus className="w-5 h-5" /> New Listing
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm depth-card">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-secondary)] opacity-50" />
          <Input
            data-testid="listings-search"
            placeholder="Search by food name or category..."
            className="pl-12 h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm shadow-inner transition-all focus:ring-2 focus:ring-emerald-500/50 font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm gap-2 shadow-inner focus:ring-2 focus:ring-emerald-500/50 font-bold" data-testid="listings-status-filter">
            <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--bg-card)] border-[var(--border-color)] rounded-xl shadow-2xl">
            <SelectItem className="font-bold cursor-pointer" value="all">All Status</SelectItem>
            <SelectItem className="font-bold cursor-pointer" value="available">✅ Available</SelectItem>
            <SelectItem className="font-bold cursor-pointer" value="reserved">🔒 Reserved</SelectItem>
            <SelectItem className="font-bold cursor-pointer" value="picked_up">🚛 Picked Up</SelectItem>
            <SelectItem className="font-bold cursor-pointer" value="delivered">✔️ Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Count badge */}
      {!loading && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] shadow-sm font-black uppercase tracking-widest px-4 py-1.5 rounded-lg">
            {filtered.length} {filtered.length === 1 ? "listing found" : "listings found"}
          </Badge>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 space-y-4 animate-pulse opacity-50 depth-card">
              <div className="h-12 w-12 bg-[var(--bg-secondary)] rounded-xl" />
              <div className="h-6 bg-[var(--bg-secondary)] rounded-md w-2/3" />
              <div className="h-4 bg-[var(--bg-secondary)] rounded-md w-1/2" />
              <div className="h-20 bg-[var(--bg-secondary)] rounded-xl w-full" />
              <div className="h-10 bg-[var(--bg-secondary)] rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] depth-card shadow-sm overflow-hidden">
          <CardContent className="flex flex-col items-center py-24">
            <div className="logo-3d w-24 h-24 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center mb-8 shadow-inner ring-4 ring-emerald-500/5">
              <Package2 className="w-12 h-12 text-[var(--text-secondary)] opacity-30" />
            </div>
            <p className="text-[var(--text-primary)] font-black text-2xl tracking-tight">No listings found</p>
            <p className="text-[var(--text-secondary)] text-sm max-w-[280px] text-center mt-3 font-medium leading-relaxed">
              {search ? "Try adjusting your search criteria or status filter." : "The marketplace is currently quiet. Start a new listing to help others."}
            </p>
            {user?.role === "donor" && (
              <Button
                onClick={() => navigate("/listings/create")}
                className="mt-8 btn-3d bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl h-11 px-8 font-black shadow-lg shadow-emerald-500/30 uppercase text-xs tracking-wider"
              >
                <Plus className="w-4 h-4 mr-2" /> New Listing
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => (
            <Card
              key={listing.id}
              data-testid={`listing-card-${listing.id}`}
              className="bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-color)] transition-all card-3d card-hover p-0 overflow-hidden"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                e.currentTarget.style.setProperty('--rx', `${y * -10}deg`);
                e.currentTarget.style.setProperty('--ry', `${x * 10}deg`);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.classList.add('card-3d-reset');
                setTimeout(() => e.currentTarget.classList.remove('card-3d-reset'), 500);
              }}
            >
              <CardContent className="p-7 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="badge-3d w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                      {categoryIcons[listing.category] || "🍽️"}
                    </div>
                    <div>
                      <h3 className="font-black text-[var(--text-primary)] text-lg leading-tight tracking-tight mb-1.5">{listing.food_name}</h3>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px] font-black uppercase tracking-widest px-2 py-0.5">{listing.quantity} kg</Badge>
                    </div>
                  </div>
                </div>

                {/* Status line */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest border px-3 py-1 shadow-sm rounded-lg ${statusColors[listing.status] || statusColors.draft}`}>
                    {listing.status?.replace("_", " ")}
                  </Badge>
                  {listing.urgent_flag && (
                    <Badge className="bg-orange-500 text-white border-0 shadow-lg shadow-orange-500/30 text-[9px] font-black uppercase tracking-widest px-3 py-1 gap-1.5 rounded-lg">
                      <Zap className="w-3 h-3" /> Urgent
                    </Badge>
                  )}
                  <span className="capitalize text-[10px] font-bold px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-lg border border-[var(--border-color)]/30">
                    {listing.category?.replace("_", " ")}
                  </span>
                </div>

                {/* Info Block */}
                <div className="space-y-3 bg-[var(--bg-secondary)]/50 rounded-2xl p-4 border border-[var(--border-color)]/50">
                  {listing.pickup_address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                      <span className="text-xs font-bold text-[var(--text-secondary)] leading-tight">{listing.pickup_address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 shrink-0 text-orange-500" />
                    <span className="text-xs font-bold text-[var(--text-secondary)]">Expires: {listing.expiry_time?.slice(0, 16).replace("T", " ")}</span>
                  </div>
                  {listing.donor_name && user?.role !== "donor" && (
                    <div className="flex items-center gap-3 pt-3 mt-1 border-t border-[var(--border-color)]/30">
                      <div className="w-5 h-5 rounded-lg bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                        {listing.donor_name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-bold text-[var(--text-primary)] text-[11px] uppercase tracking-wide">{listing.donor_name}</p>
                    </div>
                  )}
                </div>

                {/* Action */}
                {user?.role === "ngo" && listing.status === "available" && (
                  <Button
                    onClick={() => setClaimDialog(listing)}
                    data-testid={`claim-btn-${listing.id}`}
                    className="w-full btn-3d bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl font-black shadow-lg shadow-emerald-500/20 h-11 text-xs uppercase tracking-widest"
                  >
                    Claim for Pickup
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Claim Dialog */}
      <Dialog open={!!claimDialog} onOpenChange={() => setClaimDialog(null)}>
        <DialogContent className="rounded-2xl max-w-md bg-[var(--bg-card)] border-[var(--border-color)] p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight text-[var(--text-primary)]">Confirm Pickup</DialogTitle>
          </DialogHeader>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 my-2">
            <p className="text-sm text-[var(--text-primary)] font-medium leading-relaxed">
              You are claiming <strong className="text-emerald-600 bg-white dark:bg-black/20 px-1.5 py-0.5 rounded">{claimDialog?.food_name}</strong> ({claimDialog?.quantity} kg) for pickup.
            </p>
          </div>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setClaimDialog(null)} data-testid="claim-cancel-btn" className="rounded-xl h-10 border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">
              Cancel
            </Button>
            <Button
              onClick={handleClaim}
              disabled={claimLoading}
              data-testid="claim-confirm-btn"
              className="btn-3d bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl font-bold h-10 px-6 shadow-lg shadow-emerald-500/30"
            >
              {claimLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Claiming...
                </span>
              ) : "Confirm Pickup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
