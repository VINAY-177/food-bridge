import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, CheckCircle2, ArrowRight, Clock, Package, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

const STATUS_FLOW = ["pending", "accepted", "en_route", "collected", "delivered"];
const STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  en_route: "En Route",
  collected: "Collected",
  delivered: "Delivered"
};
const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-blue-50 text-blue-700 border-blue-200",
  en_route: "bg-indigo-50 text-indigo-700 border-indigo-200",
  collected: "bg-teal-50 text-teal-700 border-teal-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function StatusTimeline({ pickup }) {
  const currentIdx = STATUS_FLOW.indexOf(pickup.status);
  return (
    <div className="flex items-start gap-0 mt-4 overflow-x-auto pb-1">
      {STATUS_FLOW.map((s, i) => {
        const done = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={s} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                done
                  ? "bg-[#2E7D32] text-white shadow-sm shadow-green-200"
                  : "bg-gray-100 text-gray-400"
              } ${isCurrent ? "ring-4 ring-[#2E7D32]/15" : ""}`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : <span>{i + 1}</span>}
              </div>
              <span className={`text-[10px] mt-1.5 font-semibold text-center leading-tight whitespace-nowrap ${
                done ? "text-[#2E7D32]" : "text-gray-400"
              }`}>
                {STATUS_LABELS[s]}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className={`h-0.5 flex-1 mt-3.5 mx-1 min-w-[20px] rounded-full transition-colors ${
                i < currentIdx ? "bg-[#2E7D32]" : "bg-gray-200"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PickupCard({ pickup, user, onUpdateStatus, onRedistribution }) {
  const next = STATUS_FLOW[STATUS_FLOW.indexOf(pickup.status) + 1] || null;
  return (
    <Card
      data-testid={`pickup-card-${pickup.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm card-hover"
    >
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-[#2E7D32]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0F172A] text-base leading-tight">{pickup.listing_name}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 font-medium">
                    <Package className="w-3 h-3" /> {pickup.listing_quantity} kg
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" /> {pickup.created_at?.slice(0, 10)}
                  </span>
                  {user?.role !== "ngo" && pickup.ngo_name && (
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="w-3 h-3" /> {pickup.ngo_name}
                    </span>
                  )}
                  {user?.role !== "donor" && pickup.donor_name && (
                    <span className="font-medium text-gray-400">From: {pickup.donor_name}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className={`font-semibold text-xs border ${STATUS_COLORS[pickup.status]}`}>
              {STATUS_LABELS[pickup.status]}
            </Badge>
            {(user?.role === "ngo" || user?.role === "admin") && next && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus(pickup)}
                data-testid={`update-status-btn-${pickup.id}`}
                className="bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] text-white rounded-xl font-semibold shadow-sm gap-1"
              >
                {STATUS_LABELS[next]} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
            {user?.role === "ngo" && pickup.status === "delivered" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRedistribution(pickup)}
                data-testid={`redist-btn-${pickup.id}`}
                className="border-[#2E7D32] text-[#2E7D32] hover:bg-[#E8F5E9] rounded-xl font-semibold"
              >
                Log Redistribution
              </Button>
            )}
          </div>
        </div>

        <StatusTimeline pickup={pickup} />

        {/* Timestamps */}
        {pickup.timestamps && Object.values(pickup.timestamps).some(Boolean) && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400 border-t border-gray-50 pt-3">
            {Object.entries(pickup.timestamps).map(([key, val]) =>
              val ? (
                <span key={key} className="font-medium">
                  <span className="text-gray-300">{STATUS_LABELS[key]}:</span> {val.slice(0, 16).replace("T", " ")}
                </span>
              ) : null
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Pickups() {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateDialog, setUpdateDialog] = useState(null);
  const [redistDialog, setRedistDialog] = useState(null);
  const [notes, setNotes] = useState("");
  const [redistForm, setRedistForm] = useState({ beneficiaries_count: "", portion_size: "0.5", notes: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPickups = async () => {
    try {
      const res = await api.get("/pickups");
      setPickups(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPickups(); }, []);

  const getNextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const handleUpdateStatus = async () => {
    if (!updateDialog) return;
    const next = getNextStatus(updateDialog.status);
    if (!next) return;
    setActionLoading(true);
    try {
      await api.put(`/pickups/${updateDialog.id}/status`, { status: next, notes });
      toast.success(`Status updated to ${STATUS_LABELS[next]}`);
      setUpdateDialog(null);
      setNotes("");
      fetchPickups();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRedistribution = async () => {
    if (!redistDialog) return;
    if (!redistForm.beneficiaries_count || Number(redistForm.beneficiaries_count) <= 0) {
      toast.error("Beneficiaries count is required");
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/pickups/${redistDialog.id}/redistribution`, {
        beneficiaries_count: Number(redistForm.beneficiaries_count),
        portion_size: Number(redistForm.portion_size),
        notes: redistForm.notes
      });
      toast.success("Redistribution logged successfully!");
      setRedistDialog(null);
      setRedistForm({ beneficiaries_count: "", portion_size: "0.5", notes: "" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to log redistribution");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-9 w-48 mb-2" />
        <div className="skeleton h-4 w-64 mb-8" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3 animate-pulse">
            <div className="flex gap-3">
              <div className="skeleton h-9 w-9 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="skeleton h-5 w-1/2" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            </div>
            <div className="skeleton h-10 w-full rounded-xl mt-4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-7" data-testid="pickups-page">
      <div>
        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
          {user?.role === "ngo" ? "My Pickups" : "Pickup Status"}
        </h1>
        <p className="text-gray-500 mt-1.5 text-sm font-medium">
          Track and manage your food pickups in real time
        </p>
      </div>

      {pickups.length === 0 ? (
        <Card className="bg-white rounded-2xl border border-gray-100">
          <CardContent className="flex flex-col items-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-[#E8F5E9] flex items-center justify-center mb-5">
              <Truck className="w-10 h-10 text-[#2E7D32]" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">No pickups yet</p>
            <p className="text-gray-400 text-sm mt-1">
              {user?.role === "ngo" ? "Browse listings to claim a pickup" : "Pickups will appear here once an NGO claims your donation"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pickups.map((pickup) => (
            <PickupCard
              key={pickup.id}
              pickup={pickup}
              user={user}
              onUpdateStatus={setUpdateDialog}
              onRedistribution={setRedistDialog}
            />
          ))}
        </div>
      )}

      {/* Update Status Dialog */}
      <Dialog open={!!updateDialog} onOpenChange={() => { setUpdateDialog(null); setNotes(""); }}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Update Pickup Status</DialogTitle>
          </DialogHeader>
          <div className="bg-[#F1F8E9] rounded-xl p-4 my-1">
            <p className="text-sm text-gray-600">
              Moving <strong className="text-[#0F172A]">{updateDialog?.listing_name}</strong> to{" "}
              <Badge className="bg-[#2E7D32] text-white text-xs font-bold ml-1">
                {STATUS_LABELS[getNextStatus(updateDialog?.status)]}
              </Badge>
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Notes (optional)</Label>
            <Textarea
              data-testid="status-update-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any relevant notes..."
              className="rounded-xl border-gray-200 text-sm"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setUpdateDialog(null); setNotes(""); }} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={actionLoading}
              data-testid="confirm-status-update"
              className="bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] text-white rounded-xl font-semibold"
            >
              {actionLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </span>
              ) : "Confirm Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redistribution Dialog */}
      <Dialog open={!!redistDialog} onOpenChange={() => setRedistDialog(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Log Redistribution</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">Record how this food was distributed to beneficiaries.</p>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Beneficiaries Count <span className="text-red-500">*</span></Label>
              <Input
                data-testid="redist-beneficiaries"
                type="number"
                value={redistForm.beneficiaries_count}
                onChange={(e) => setRedistForm({ ...redistForm, beneficiaries_count: e.target.value })}
                placeholder="Number of people served"
                className="h-11 rounded-xl border-gray-200 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Portion Size (kg per person)</Label>
              <Input
                data-testid="redist-portion"
                type="number"
                step="0.1"
                value={redistForm.portion_size}
                onChange={(e) => setRedistForm({ ...redistForm, portion_size: e.target.value })}
                className="h-11 rounded-xl border-gray-200 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Notes</Label>
              <Textarea
                data-testid="redist-notes"
                value={redistForm.notes}
                onChange={(e) => setRedistForm({ ...redistForm, notes: e.target.value })}
                placeholder="Any additional notes..."
                className="rounded-xl border-gray-200 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRedistDialog(null)} className="rounded-xl">Cancel</Button>
            <Button
              onClick={handleRedistribution}
              disabled={actionLoading}
              data-testid="confirm-redistribution"
              className="bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] text-white rounded-xl font-semibold"
            >
              {actionLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : "Log Redistribution"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
