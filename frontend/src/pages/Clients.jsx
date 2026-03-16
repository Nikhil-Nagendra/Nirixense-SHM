import React, { useState, useEffect } from "react";
import TopBar from "../layout/TopBar";
import { Users, FolderOpen, CreditCard, ChevronDown, ChevronUp, Mail, Phone, MapPin, X, Check } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "./Clients.css";

// Fix leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TIER_COLOR = {
  BASIC:   { color: "var(--text-muted)",   bg: "rgba(255,255,255,0.05)" },
  PLUS:    { color: "var(--brand-yellow)", bg: "var(--brand-yellow-dim)" },
  PRO:     { color: "var(--brand-purple)", bg: "var(--brand-purple-dim)" },
  PREMIUM: { color: "var(--brand-red)",    bg: "var(--brand-red-dim)" },
};

// Hardcoded geo coords per client name (since DB has no lat/lng)
const CLIENT_GEO = {
  "Acme Corp":   { lat: 18.5204, lng: 73.8567, city: "Pune, Maharashtra" },
  "Globex Labs": { lat: 19.0760, lng: 72.8777, city: "Mumbai, Maharashtra" },
};

const TIER_DETAILS = {
  PRO: {
    price: "₹41,500 / month",
    features: [
      "Up to 50 sensor nodes",
      "Advanced vibration analytics",
      "Historical trend reports (90 days)",
      "Priority email support",
      "API access",
      "Custom alert thresholds",
    ],
  },
  PREMIUM: {
    price: "₹99,900 / month",
    features: [
      "Unlimited sensor nodes",
      "Full AI-powered structural analysis",
      "Historical trend reports (unlimited)",
      "24/7 dedicated support",
      "White-label dashboard",
      "SLA guarantee (99.9% uptime)",
      "On-site engineer visits (2/year)",
    ],
  },
};

function maskPhone(phone) {
  if (!phone) return "—";
  // Show only last 4 digits, mask everything else with *
  const digits = phone.replace(/\D/g, "");
  const masked = digits.slice(0, -4).replace(/\d/g, "*") + digits.slice(-4);
  // Re-insert non-digit characters at their original positions
  let di = 0;
  return phone.split("").map((ch) => {
    if (/\D/.test(ch)) return ch;
    return masked[di++];
  }).join("");
}

function TierPopup({ tier, onClose }) {
  const info = TIER_DETAILS[tier];
  if (!info) return null;
  const style = TIER_COLOR[tier];
  return (
    <div className="tier-popup-overlay" onClick={onClose}>
      <div className="tier-popup glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="tier-popup-header">
          <div>
            <span className="tier-popup-badge" style={{ color: style.color, background: style.bg, border: `1px solid ${style.color}40` }}>
              {tier}
            </span>
            <h3 className="tier-popup-title">{tier} Plan</h3>
            <span className="tier-popup-price">{info.price}</span>
          </div>
          <button className="tier-popup-close" onClick={onClose}><X size={18} /></button>
        </div>
        <ul className="tier-popup-features">
          {info.features.map((f, i) => (
            <li key={i}>
              <Check size={14} color={style.color} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [tierPopup, setTierPopup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/api/clients/").then((r) => r.json()),
      fetch("http://localhost:8000/api/projects/").then((r) => r.json()),
      fetch("http://localhost:8000/api/subscriptions/").then((r) => r.json()),
    ])
      .then(([c, p, s]) => {
        setClients(c);
        setProjects(p);
        setSubscriptions(s);
        setLoading(false);
        if (c.length > 0) setExpanded(c[0].id);
      })
      .catch(() => setLoading(false));
  }, []);

  const getClientProjects = (id) => projects.filter((p) => p.client_id === id);
  const getClientSub = (id) => subscriptions.filter((s) => s.client_id === id).at(-1);

  const proCount = subscriptions.filter((s) => s.tier === "PREMIUM" || s.tier === "PRO").length;

  // Build map markers from all clients
  const mapMarkers = clients
    .map((c) => ({ ...c, geo: CLIENT_GEO[c.name] }))
    .filter((c) => c.geo);

  const mapCenter = mapMarkers.length > 0
    ? [mapMarkers[0].geo.lat, mapMarkers[0].geo.lng]
    : [20, 0];

  return (
    <div className="clients-page">
      <TopBar title="Clients" subtitle="Manage client accounts, projects and subscriptions" />

      {tierPopup && <TierPopup tier={tierPopup} onClose={() => setTierPopup(null)} />}

      {loading ? (
        <div className="clients-loading">Loading client data...</div>
      ) : (
        <>
          {/* Top panel: stats left, map right */}
          <div className="clients-top-panel">
            {/* Stats stacked on the left */}
            <div className="clients-stats-col">
              <div className="glass-panel clients-summary-card">
                <Users size={20} color="var(--brand-red)" />
                <div>
                  <span className="clients-summary-value">{clients.length}</span>
                  <span className="clients-summary-label">Total Clients</span>
                </div>
              </div>
              <div className="glass-panel clients-summary-card">
                <FolderOpen size={20} color="var(--brand-purple)" />
                <div>
                  <span className="clients-summary-value">{projects.length}</span>
                  <span className="clients-summary-label">Active Projects</span>
                </div>
              </div>
              <div className="glass-panel clients-summary-card">
                <CreditCard size={20} color="var(--brand-emerald)" />
                <div>
                  <span className="clients-summary-value">{proCount}</span>
                  <span className="clients-summary-label">Pro / Premium</span>
                </div>
              </div>
            </div>

            {/* Square map on the right */}
            {mapMarkers.length > 0 && (
              <div className="glass-panel clients-map-card">
                <div className="clients-map-header">
                  <MapPin size={14} color="var(--brand-red)" />
                  <span>Client Locations</span>
                </div>
                <div className="clients-map-wrapper">
                  <MapContainer
                    center={[18.8, 73.3]}
                    zoom={7}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                    zoomControl={true}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    />
                    {mapMarkers.map((c) => (
                      <Marker key={c.id} position={[c.geo.lat, c.geo.lng]}>
                        <Popup>
                          <div style={{ fontFamily: "Outfit, sans-serif", minWidth: 130 }}>
                            <strong style={{ fontSize: "0.88rem" }}>{c.name}</strong>
                            <br />
                            <span style={{ fontSize: "0.75rem", color: "#aaa" }}>{c.geo.city}</span>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            )}
          </div>

          {/* Client accordion */}
          <div className="clients-list">
            {clients.length === 0 && (
              <div className="clients-empty glass-panel">No clients found.</div>
            )}
            {clients.map((client) => {
              const sub = getClientSub(client.id);
              const clientProjects = getClientProjects(client.id);
              const tier = sub?.tier || "BASIC";
              const tierStyle = TIER_COLOR[tier] || TIER_COLOR.BASIC;
              const isOpen = expanded === client.id;
              const geo = CLIENT_GEO[client.name];
              const canShowTierDetail = tier === "PRO" || tier === "PREMIUM";

              return (
                <div key={client.id} className={`glass-panel clients-row ${isOpen ? "open" : ""}`}>
                  {/* Header */}
                  <div className="clients-row-header" onClick={() => setExpanded(isOpen ? null : client.id)}>
                    <div className="clients-row-left">
                      <div className="clients-avatar">{client.name.charAt(0).toUpperCase()}</div>
                      <div className="clients-name-block">
                        <span className="clients-name">{client.name}</span>
                        {client.email && (
                          <span className="clients-email"><Mail size={11} /> {client.email}</span>
                        )}
                      </div>
                    </div>
                    <div className="clients-row-right">
                      <span
                        className={`clients-tier-badge ${canShowTierDetail ? "clickable" : ""}`}
                        style={{ color: tierStyle.color, background: tierStyle.bg, border: `1px solid ${tierStyle.color}40` }}
                        onClick={(e) => { if (canShowTierDetail) { e.stopPropagation(); setTierPopup(tier); } }}
                        title={canShowTierDetail ? `View ${tier} plan details` : ""}
                      >
                        {tier}
                      </span>
                      <span className="clients-project-count">
                        <FolderOpen size={13} /> {clientProjects.length} project{clientProjects.length !== 1 ? "s" : ""}
                      </span>
                      {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                    </div>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div className="clients-detail">
                      <div className="clients-detail-grid">
                        {/* Contact */}
                        <div className="clients-info-block">
                          <p className="clients-info-title">Contact</p>
                          <div className="clients-info-row">
                            <Mail size={13} color="var(--text-muted)" />
                            <span>{client.email || "—"}</span>
                          </div>
                          <div className="clients-info-row">
                            <Phone size={13} color="var(--text-muted)" />
                            <span className="masked-phone">{maskPhone(client.phone)}</span>
                          </div>
                          {geo && (
                            <div className="clients-info-row">
                              <MapPin size={13} color="var(--text-muted)" />
                              <span>{geo.city}</span>
                            </div>
                          )}
                          <div className="clients-info-row">
                            <span className="clients-info-label">Member since</span>
                            <span>{new Date(client.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                          </div>
                        </div>

                        {/* Subscription */}
                        <div className="clients-info-block">
                          <p className="clients-info-title">Subscription</p>
                          {sub ? (
                            <>
                              <div className="clients-info-row">
                                <span className="clients-info-label">Tier</span>
                                <span
                                  style={{ color: tierStyle.color, fontWeight: 700, cursor: canShowTierDetail ? "pointer" : "default", textDecoration: canShowTierDetail ? "underline dotted" : "none" }}
                                  onClick={() => canShowTierDetail && setTierPopup(tier)}
                                >
                                  {sub.tier}
                                </span>
                              </div>
                              <div className="clients-info-row">
                                <span className="clients-info-label">Started</span>
                                <span>{new Date(sub.starts_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                              </div>
                              <div className="clients-info-row">
                                <span className="clients-info-label">Expires</span>
                                <span>{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "No expiry"}</span>
                              </div>
                              <div className="clients-info-row">
                                <span className="clients-info-label">Status</span>
                                <span style={{ color: sub.expires_at && new Date(sub.expires_at) < new Date() ? "var(--brand-crimson)" : "var(--brand-emerald)" }}>
                                  {sub.expires_at && new Date(sub.expires_at) < new Date() ? "Expired" : "Active"}
                                </span>
                              </div>
                            </>
                          ) : (
                            <span className="clients-no-sub">No active subscription</span>
                          )}
                        </div>
                      </div>

                      {/* Projects table */}
                      {clientProjects.length > 0 && (
                        <div className="clients-projects-section">
                          <p className="clients-info-title">Projects</p>
                          <table className="clients-projects-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Location</th>
                                <th>Created</th>
                              </tr>
                            </thead>
                            <tbody>
                              {clientProjects.map((p) => (
                                <tr key={p.id}>
                                  <td className="clients-project-name">{p.name}</td>
                                  <td>{p.description || "—"}</td>
                                  <td>{p.location || "—"}</td>
                                  <td>{new Date(p.created_at).toLocaleDateString("en-GB")}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
