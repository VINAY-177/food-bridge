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
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
            {user?.role === "donor" ? "My Listings" : "Food Listings"}
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm font-medium">
            {user?.role === "ngo" ? "Browse available food for pickup" : "Manage your surplus food listings"}
          </p>
        </div>
        {user?.role === "donor" && (
          <Button
            onClick={() => navigate("/listings/create")}
            data-testid="create-listing-btn"
            className="bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] text-white rounded-xl font-semibold shadow-md shadow-green-100 gap-2"
          >
            <Plus className="w-4 h-4" /> New Listing
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            data-testid="listings-search"
            placeholder="Search by food name or category..."
            className="pl-10 h-11 rounded-xl border-gray-200 bg-white text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-11 rounded-xl border-gray-200 bg-white text-sm gap-2" data-testid="listings-status-filter">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">✅ Available</SelectItem>
            <SelectItem value="reserved">🔒 Reserved</SelectItem>
            <SelectItem value="picked_up">🚛 Picked Up</SelectItem>
            <SelectItem value="delivered">✔️ Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Count badge */}
      {!loading && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">
            {filtered.length} {filtered.length === 1 ? "listing" : "listings"} found
          </span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse">
              <div className="skeleton h-5 w-2/3" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-9 w-full mt-4 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white rounded-2xl border border-gray-100">
          <CardContent className="flex flex-col items-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-[#E8F5E9] flex items-center justify-center mb-5 shadow-sm">
              <Package2 className="w-10 h-10 text-[#2E7D32]" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">No listings found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search ? "Try adjusting your search filters" : "No listings available yet"}
            </p>
            {user?.role === "donor" && (
              <Button
                onClick={() => navigate("/listings/create")}
                className="mt-6 bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] text-white rounded-xl shadow-md shadow-green-100"
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
              className="bg-white rounded-2xl border border-gray-100 shadow-sm card-hover group"
            >
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-lg shrink-0">
                      {categoryIcons[listing.category] || "🍽️"}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0F172A] leading-tight">{listing.food_name}</h3>
                      <span className="text-xs font-semibold text-gray-400 capitalize">{listing.quantity} kg</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {listing.urgent_flag && (
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center" title="Urgent">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                      </div>
                    )}
                    <Badge variant="outline" className={`text-xs font-semibold border ${statusColors[listing.status] || statusColors.draft}`}>
                      {listing.status?.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                {/* Category tag */}
                <div className="mb-3">
                  <span className="capitalize text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg">
                    {listing.category?.replace("_", " ")}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-gray-500">
                  {listing.pickup_address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate font-medium">{listing.pickup_address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-medium">Expires: {listing.expiry_time?.slice(0, 16).replace("T", " ")}</span>
                  </div>
                  {listing.donor_name && user?.role !== "donor" && (
                    <p className="text-gray-400 font-medium">By {listing.donor_name}</p>
                  )}
                </div>

                {/* Claim button for NGOs */}
                {user?.role === "ngo" && listing.status === "available" && (
                  <Button
                    onClick={() => setClaimDialog(listing)}
                    data-testid={`claim-btn-${listing.id}`}
                    className="w-full mt-4 bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] text-white rounded-xl font-semibold shadow-sm"
                    size="sm"
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
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Confirm Pickup</DialogTitle>
          </DialogHeader>
          <div className="bg-[#F1F8E9] rounded-xl p-4 my-2">
            <p className="text-sm text-gray-600">
              You are claiming <strong className="text-[#2E7D32]">{claimDialog?.food_name}</strong> ({claimDialog?.quantity} kg) for pickup.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setClaimDialog(null)} data-testid="claim-cancel-btn" className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleClaim}
              disabled={claimLoading}
              data-testid="claim-confirm-btn"
              className="bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] text-white rounded-xl font-semibold"
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
