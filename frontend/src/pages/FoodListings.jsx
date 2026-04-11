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
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  reserved: "bg-amber-50 text-amber-700 border-amber-200",
  picked_up: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-purple-50 text-purple-700 border-purple-200",
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  expired: "bg-red-50 text-red-700 border-red-200",
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
    <div className="space-y-7" data-testid="food-listings-page">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {user?.role === "donor" ? "My Listings" : "Food Listings"}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1.5 text-sm font-medium">
            {user?.role === "ngo" ? "Browse available food for pickup" : "Manage your surplus food listings"}
          </p>
        </div>
        {user?.role === "donor" && (
          <Button
            onClick={() => navigate("/listings/create")}
            data-testid="create-listing-btn"
            className="btn-3d bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 gap-2 h-11 px-5"
          >
            <Plus className="w-5 h-5" /> New Listing
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <Input
            data-testid="listings-search"
            placeholder="Search by food name or category..."
            className="pl-11 h-11 rounded-xl border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm shadow-sm transition-all focus:ring-2 focus:ring-emerald-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[170px] h-11 rounded-xl border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm gap-2 shadow-sm focus:ring-2 focus:ring-emerald-500/50" data-testid="listings-status-filter">
            <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--bg-card)] border-[var(--border-color)]">
            <SelectItem className="text-[var(--text-primary)] focus:bg-[var(--bg-secondary)]" value="all">All Status</SelectItem>
            <SelectItem className="text-[var(--text-primary)] focus:bg-[var(--bg-secondary)]" value="available">✅ Available</SelectItem>
            <SelectItem className="text-[var(--text-primary)] focus:bg-[var(--bg-secondary)]" value="reserved">🔒 Reserved</SelectItem>
            <SelectItem className="text-[var(--text-primary)] focus:bg-[var(--bg-secondary)]" value="picked_up">🚛 Picked Up</SelectItem>
            <SelectItem className="text-[var(--text-primary)] focus:bg-[var(--bg-secondary)]" value="delivered">✔️ Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Count badge */}
      {!loading && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] shadow-sm font-semibold px-3 py-1">
            {filtered.length} {filtered.length === 1 ? "listing found" : "listings found"}
          </Badge>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-5 space-y-3 animate-pulse opacity-50 depth-card">
              <div className="h-6 bg-[var(--bg-secondary)] rounded-md w-2/3" />
              <div className="h-4 bg-[var(--bg-secondary)] rounded-md w-1/2" />
              <div className="h-4 bg-[var(--bg-secondary)] rounded-md w-3/4" />
              <div className="h-10 bg-[var(--bg-secondary)] rounded-xl w-full mt-4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] depth-card shadow-sm">
          <CardContent className="flex flex-col items-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center mb-5 shadow-inner">
              <Package2 className="w-10 h-10 text-[var(--text-secondary)] opacity-50" />
            </div>
            <p className="text-[var(--text-primary)] font-bold text-lg">No listings found</p>
            <p className="text-[var(--text-secondary)] text-sm max-w-[250px] text-center mt-2">
              {search ? "Try adjusting your search filters" : "No listings available yet"}
            </p>
            {user?.role === "donor" && (
              <Button
                onClick={() => navigate("/listings/create")}
                className="mt-6 btn-3d bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/30"
              >
                <Plus className="w-4 h-4 mr-2" /> Create First Listing
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((listing) => (
            <Card
              key={listing.id}
              data-testid={`listing-card-${listing.id}`}
              className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] depth-card transition-all hover:-translate-y-1 hover:shadow-xl group"
            >
              <CardContent className="p-6 relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm flex items-center justify-center text-xl shrink-0">
                      {categoryIcons[listing.category] || "🍽️"}
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)] text-lg leading-tight tracking-tight mb-1">{listing.food_name}</h3>
                      <Badge className="bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border-0 text-[10px] font-bold uppercase tracking-widest">{listing.quantity} kg</Badge>
                    </div>
                  </div>
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="outline" className={`text-xs font-bold border px-2 py-0.5 shadow-sm ${statusColors[listing.status] || statusColors.draft}`}>
                    {listing.status?.replace("_", " ")}
                  </Badge>
                  {listing.urgent_flag && (
                    <Badge className="bg-orange-500/10 text-orange-600 border border-orange-500/20 hover:bg-orange-500/20 text-xs font-bold px-2 py-0.5 gap-1">
                      <AlertTriangle className="w-3 h-3" /> Urgent
                    </Badge>
                  )}
                  <span className="capitalize text-xs font-medium px-2 py-0.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-md">
                    {listing.category?.replace("_", " ")}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2.5 text-sm text-[var(--text-secondary)] bg-[var(--bg-body)] rounded-xl p-3 border border-[var(--border-color)]">
                  {listing.pickup_address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span className="truncate font-medium">{listing.pickup_address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0 text-orange-500" />
                    <span className="font-medium">Expires: {listing.expiry_time?.slice(0, 16).replace("T", " ")}</span>
                  </div>
                  {listing.donor_name && user?.role !== "donor" && (
                    <div className="flex items-center gap-2 pt-1 mt-1 border-t border-[var(--border-color)]/50">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] font-bold text-white">
                        {listing.donor_name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold text-[var(--text-primary)] text-xs">{listing.donor_name}</p>
                    </div>
                  )}
                </div>

                {/* Claim button for NGOs */}
                {user?.role === "ngo" && listing.status === "available" && (
                  <Button
                    onClick={() => setClaimDialog(listing)}
                    data-testid={`claim-btn-${listing.id}`}
                    className="w-full mt-5 btn-3d bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl font-bold shadow-md h-10"
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
