import { useState, useEffect } from "react";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const STATUS_COLORS_MAP = {
  available: "#10b981",    // Emerald
  reserved: "#f59e0b",     // Amber
  picked_up: "#3b82f6",    // Blue
  delivered: "#a855f7",    // Purple
  draft: "#94a3b8",        // Slate
};

export default function MapView() {
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const params = {};
        if (filter !== "all") params.status = filter;
        const res = await api.get("/listings", { params });
        setListings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [filter]);

  const validListings = listings.filter(
    (l) => l.location?.lat && l.location?.lng
  );

  const center = validListings.length > 0
    ? [validListings[0].location.lat, validListings[0].location.lng]
    : [28.6139, 77.2090]; // Default: New Delhi

  return (
    <div className="space-y-8 animate-fade-in-up" data-testid="map-view-page">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight drop-shadow-sm">Map View</h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm font-semibold tracking-wide">Visualize active food listings near you</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] h-12 rounded-xl border-[var(--border-color)] bg-[var(--bg-card)] shadow-md btn-3d font-bold text-[var(--text-primary)]" data-testid="map-status-filter">
            <SelectValue placeholder="Select Status"/>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-[var(--border-color)] shadow-xl hidden dark:block bg-[var(--bg-card)] text-[var(--text-primary)] dark:bg-slate-900 border dark:border-slate-800">
            <SelectItem value="all" className="font-semibold cursor-pointer">All Status</SelectItem>
            <SelectItem value="available" className="font-semibold cursor-pointer">Available</SelectItem>
            <SelectItem value="reserved" className="font-semibold cursor-pointer">Reserved</SelectItem>
            <SelectItem value="picked_up" className="font-semibold cursor-pointer">Picked Up</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] shadow-lg depth-card">
        {Object.entries(STATUS_COLORS_MAP).slice(0, 4).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2.5 text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-secondary)] px-4 py-2 rounded-xl shadow-sm border border-[var(--border-color)]/30 hover:-translate-y-1 transition-transform">
            <div className="w-4 h-4 rounded-full shadow-inner border-2 border-white/20" style={{ backgroundColor: color }} />
            <span>{status.replace("_", " ")}</span>
          </div>
        ))}
        <div className="ml-auto text-sm font-black text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-4 py-2 rounded-xl">
          {validListings.length} Location{validListings.length !== 1 ? "s" : ""}
        </div>
      </div>

      <Card className="bg-[var(--bg-card)] rounded-3xl border-[2px] border-[var(--border-color)] shadow-2xl overflow-hidden depth-card relative">
        <CardContent className="p-2 sm:p-3 relative z-10">
          <div className="h-[600px] rounded-2xl overflow-hidden shadow-inner ring-1 ring-[var(--border-color)]/50 bg-[var(--bg-secondary)]" data-testid="leaflet-map">
            {!loading && (
              <MapContainer
                center={center}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
              >
                {/* Standard vibrant OpenStreetMap Tile Layer */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {validListings.map((listing) => (
                  <CircleMarker
                    key={listing.id}
                    center={[listing.location.lat, listing.location.lng]}
                    radius={listing.urgent_flag ? 14 : 9}
                    pathOptions={{
                      color: "white",
                      fillColor: STATUS_COLORS_MAP[listing.status] || STATUS_COLORS_MAP.draft,
                      fillOpacity: 0.9,
                      weight: 3,
                      className: "drop-shadow-lg",
                    }}
                  >
                    <Popup className="custom-popup rounded-2xl">
                      <div className="text-sm min-w-[200px] p-1">
                        <p className="font-black text-[var(--foreground)] text-lg leading-tight mb-2 tracking-tight">{listing.food_name}</p>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                             <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Category</p>
                             <p className="font-bold text-slate-700 dark:text-slate-200 capitalize">{listing.category}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                             <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Quantity</p>
                             <p className="font-bold text-slate-700 dark:text-slate-200">{listing.quantity} kg</p>
                          </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 flex items-start gap-2 mt-2 font-medium bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                          <MapPin className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" /> 
                          <span className="leading-snug">{listing.pickup_address || "No address"}</span>
                        </p>
                        
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                              {listing.donor_name}
                            </p>
                            <span
                                className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-black/5"
                                style={{
                                backgroundColor: `${STATUS_COLORS_MAP[listing.status]}25`,
                                color: STATUS_COLORS_MAP[listing.status]
                                }}
                            >
                                {status.replace("_", " ")}
                            </span>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Dynamic CSS for leaflet popups to match global theme */}
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .dark .leaflet-popup-content-wrapper {
          background-color: #1e293b !important;
          color: #f8fafc !important;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .leaflet-popup-tip {
          box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important;
        }
        .dark .leaflet-popup-tip {
          background-color: #1e293b !important;
        }
      `}</style>
    </div>
  );
}
