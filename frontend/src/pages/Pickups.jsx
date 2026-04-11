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
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  accepted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  en_route: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  collected: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

 function StatusTimeline({ pickup }) {
  const currentIdx = STATUS_FLOW.indexOf(pickup.status);
  return (
    <div className="flex items-start gap-0 mt-8 overflow-x-auto pb-4 scrollbar-none snap-x active:cursor-grabbing">
      {STATUS_FLOW.map((s, i) => {
        const done = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={s} className="flex items-start flex-1 min-w-[100px] snap-start">
            <div className="flex flex-col items-center flex-1">
              <div className={`badge-3d w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 transition-all duration-500 z-10 ${
                done
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/10"
                  : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] shadow-inner"
              } ${isCurrent ? "scale-125 -translate-y-1" : "scale-100 opacity-60"}`}>
                {done ? <CheckCircle2 className="w-5 h-5 drop-shadow-sm" /> : <span>{i + 1}</span>}
              </div>
              <span className={`text-[9px] mt-4 font-black text-center leading-tight whitespace-nowrap uppercase tracking-[0.1em] transition-colors duration-300 ${
                done ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--text-secondary)] opacity-40"
              }`}>
                {STATUS_LABELS[s]}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className={`h-1.5 flex-1 mt-4.5 -mx-1 rounded-full transition-all duration-700 ${
                i < currentIdx ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm" : "bg-[var(--bg-secondary)] border border-[var(--border-color)]/30"
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
      className="bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-color)] transition-all card-3d card-hover p-0 overflow-hidden"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        e.currentTarget.style.setProperty('--rx', `${y * -5}deg`);
        e.currentTarget.style.setProperty('--ry', `${x * 5}deg`);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.classList.add('card-3d-reset');
        setTimeout(() => e.currentTarget.classList.remove('card-3d-reset'), 500);
      }}
    >
      <CardContent className="p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-5 flex-wrap">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 shadow-inner flex items-center justify-center shrink-0 logo-3d">
                <Truck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-black text-[var(--text-primary)] text-2xl leading-tight tracking-tight mb-2">{pickup.listing_name}</h3>
                <div className="flex items-center gap-4 text-[10px] text-[var(--text-secondary)] flex-wrap">
                  <span className="flex items-center gap-2 font-black bg-[var(--bg-secondary)] px-3 py-1 rounded-lg border border-[var(--border-color)]/30 shadow-sm">
                    <Package className="w-3.5 h-3.5 text-emerald-500" /> {pickup.listing_quantity} KG
                  </span>
                  <span className="flex items-center gap-2 font-bold opacity-80 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5 text-orange-500" /> {pickup.created_at?.slice(0, 10)}
                  </span>
                  {user?.role !== "ngo" && pickup.ngo_name && (
                    <span className="flex items-center gap-2 font-black bg-[var(--bg-secondary)] px-3 py-1 rounded-lg border border-[var(--border-color)]/30 shadow-sm text-blue-500">
                      <Users className="w-3.5 h-3.5" /> {pickup.ngo_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="outline" className={`font-black text-[10px] uppercase tracking-widest px-3 py-1.5 shadow-sm border-2 rounded-xl h-9 ${STATUS_COLORS[pickup.status]}`}>
              {STATUS_LABELS[pickup.status]}
            </Badge>
            {(user?.role === "ngo" || user?.role === "admin") && next && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus(pickup)}
                data-testid={`update-status-btn-${pickup.id}`}
                className="btn-3d bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 gap-2 h-9 px-4"
              >
                {STATUS_LABELS[next]} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
            {user?.role === "ngo" && pickup.status === "delivered" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRedistribution(pickup)}
                data-testid={`redist-btn-${pickup.id}`}
                className="rounded-xl font-black uppercase tracking-widest text-[10px] h-9 px-4 border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/5 transition-all shadow-sm"
              >
                Log Distribution
              </Button>
            )}
          </div>
        </div>

        <StatusTimeline pickup={pickup} />

        {/* Timestamps */}
        {pickup.timestamps && Object.values(pickup.timestamps).some(Boolean) && (
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[10px] text-[var(--text-secondary)] border-t border-[var(--border-color)]/30 pt-6 bg-[var(--bg-secondary)]/30 -mx-8 -mb-8 px-8 pb-6 rounded-b-[2rem]">
            {Object.entries(pickup.timestamps).map(([key, val]) =>
              val ? (
                <div key={key} className="font-bold flex flex-col gap-1">
                  <span className="uppercase tracking-[0.2em] text-[8px] opacity-40">{STATUS_LABELS[key]}</span> 
                  <span className="text-[var(--text-primary)] opacity-80">{val.slice(0, 16).replace("T", " ")}</span>
                </div>
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
        <div className="h-9 w-48 mb-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl opacity-50 animate-pulse" />
        <div className="h-4 w-64 mb-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md opacity-50 animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 space-y-3 animate-pulse depth-card opacity-50">
            <div className="flex gap-3">
              <div className="h-12 w-12 bg-[var(--bg-secondary)] rounded-xl" />
              <div className="space-y-2 flex-1 pt-1">
                <div className="h-6 bg-[var(--bg-secondary)] rounded-md w-1/2" />
                <div className="h-3 bg-[var(--bg-secondary)] rounded-md w-1/3" />
              </div>
            </div>
            <div className="h-14 bg-[var(--bg-secondary)] w-full rounded-xl mt-6" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-7" data-testid="pickups-page">
      <div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
          {user?.role === "ngo" ? "My Pickups" : "Pickup Status"}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1.5 text-sm font-medium">
          Track and manage your food pickups in real time
        </p>
      </div>

      {pickups.length === 0 ? (
        <Card className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] depth-card shadow-sm">
          <CardContent className="flex flex-col items-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center mb-5 shadow-inner">
              <Truck className="w-10 h-10 text-[var(--text-secondary)] opacity-50" />
            </div>
            <p className="text-[var(--text-primary)] font-bold text-lg">No pickups yet</p>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              {user?.role === "ngo" ? "Browse listings to claim a pickup" : "Pickups will appear here once an NGO claims your donation"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
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
        <DialogContent className="rounded-2xl max-w-md bg-[var(--bg-card)] border-[var(--border-color)] p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight text-[var(--text-primary)]">Update Pickup</DialogTitle>
          </DialogHeader>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 my-2">
            <p className="text-sm text-[var(--text-primary)] font-medium leading-relaxed">
              Moving <strong className="text-[var(--text-primary)]">{updateDialog?.listing_name}</strong> to{" "}
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-xs font-bold ml-1 px-2 py-0.5 shadow-sm">
                {STATUS_LABELS[getNextStatus(updateDialog?.status)]}
              </Badge>
            </p>
          </div>
          <div className="space-y-2 mt-2">
            <Label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Notes (optional)</Label>
            <Textarea
              data-testid="status-update-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any relevant notes..."
              className="rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm min-h-[100px] focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => { setUpdateDialog(null); setNotes(""); }} className="rounded-xl h-10 border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={actionLoading}
              data-testid="confirm-status-update"
              className="btn-3d bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl font-bold h-10 px-6 shadow-lg shadow-emerald-500/30"
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
        <DialogContent className="rounded-2xl max-w-md bg-[var(--bg-card)] border-[var(--border-color)] p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight text-[var(--text-primary)]">Log Redistribution</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--text-secondary)] font-medium -mt-2">Record how this food was distributed to beneficiaries.</p>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Beneficiaries Count <span className="text-red-500">*</span></Label>
              <Input
                data-testid="redist-beneficiaries"
                type="number"
                value={redistForm.beneficiaries_count}
                onChange={(e) => setRedistForm({ ...redistForm, beneficiaries_count: e.target.value })}
                placeholder="Number of people served"
                className="h-11 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Portion Size (kg per pt)</Label>
              <Input
                data-testid="redist-portion"
                type="number"
                step="0.1"
                value={redistForm.portion_size}
                onChange={(e) => setRedistForm({ ...redistForm, portion_size: e.target.value })}
                className="h-11 rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Notes</Label>
              <Textarea
                data-testid="redist-notes"
                value={redistForm.notes}
                onChange={(e) => setRedistForm({ ...redistForm, notes: e.target.value })}
                placeholder="Any additional notes..."
                className="rounded-xl border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm min-h-[80px] focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setRedistDialog(null)} className="rounded-xl h-10 border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">Cancel</Button>
            <Button
              onClick={handleRedistribution}
              disabled={actionLoading}
              data-testid="confirm-redistribution"
              className="btn-3d bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl font-bold h-10 px-6 shadow-lg shadow-emerald-500/30"
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
