import { useState, useEffect, useMemo } from "react";
import TopBar from "../layout/TopBar";
import {
  Activity, AlertTriangle, Clock, Zap, Shield, Wifi,
  TrendingUp, TrendingDown, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, LineChart, Line,
} from "recharts";
import "./Analytics.css";

// ── Seeded RNG ───────────────────────────────────────────────────────────────
function lcg(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}
function nodeMetrics(id) {
  const r = lcg(id * 7919);
  return {
    uptime:      parseFloat((92 + r() * 8).toFixed(1)),
    failureRate: parseFloat((r() * 8).toFixed(1)),
    latency:     Math.floor(20 + r() * 80),
    alerts:      Math.floor(r() * 200),
    reliability: parseFloat((88 + r() * 12).toFixed(1)),
    vibration:   parseFloat((0.1 + r() * 1.4).toFixed(2)),
    peak:        parseFloat((0.5 + r() * 4.0).toFixed(2)),
    tempDrift:   parseFloat((0.01 + r() * 0.14).toFixed(3)),
    lifespan:    Math.floor(120 + r() * 1080),
  };
}

// ── Static chart data ────────────────────────────────────────────────────────
const FAILURE_REASONS = [
  { name: "Battery Depletion", value: 38, color: "#ef4444" },
  { name: "Signal Loss",       value: 27, color: "#f97316" },
  { name: "Firmware Crash",    value: 18, color: "#eab308" },
  { name: "Sensor Fault",      value: 11, color: "#a78bfa" },
  { name: "Other",             value:  6, color: "#6b7280" },
];
const HW_FAILURE = [
  { model: "NRX-A1", rate: 1.2 }, { model: "NRX-B2", rate: 3.4 },
  { model: "NRX-C3", rate: 2.1 }, { model: "NRX-D4", rate: 5.8 },
  { model: "NRX-E5", rate: 0.9 },
];
const FW_FAILURE = [
  { version: "v1.0", rate: 7.2 }, { version: "v1.5", rate: 4.1 },
  { version: "v2.0", rate: 2.8 }, { version: "v2.3", rate: 1.4 },
  { version: "v3.0", rate: 0.6 },
];
const SITE_FAILURE = [
  { site: "Pune-A",     rate: 2.3 }, { site: "Pune-B",     rate: 3.1 },
  { site: "Mumbai-A",   rate: 1.8 }, { site: "Mumbai-B",   rate: 4.2 },
];

// ── Filter options ───────────────────────────────────────────────────────────
const DATE_RANGES  = ["1 Day", "7 Days", "30 Days", "Custom"];
const SITES        = ["All", "Pune", "Mumbai"];
const CLIENTS      = ["All", "Acme Corp", "Globex Labs"];
const NODE_TYPES   = ["All", "Vibration Sensor", "Displacement", "Strain Gauge", "Accelerometer"];
const HW_MODELS    = ["All", "NRX-A1", "NRX-B2", "NRX-C3", "NRX-D4", "NRX-E5"];
const FW_VERSIONS  = ["All", "v1.0", "v1.5", "v2.0", "v2.3", "v3.0"];
const SENSOR_TYPES = ["All", "MEMS", "Piezoelectric", "Capacitive", "Optical"];

// ── Reusable pieces ──────────────────────────────────────────────────────────
const AnTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="an-tooltip">
      <p className="an-tt-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "2px 0", fontSize: "0.82rem", fontWeight: 700 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const KpiCard = ({ icon, label, value, unit, color, sub, trend }) => (
  <div className="an-kpi-card glass-panel" style={{ "--kc": color }}>
    <div className="an-kpi-bar" />
    <div className="an-kpi-body">
      <div className="an-kpi-icon">{icon}</div>
      <div className="an-kpi-info">
        <span className="an-kpi-label">{label}</span>
        <span className="an-kpi-value">{value}<em>{unit}</em></span>
        {sub && <span className="an-kpi-sub">{sub}</span>}
      </div>
      {trend !== undefined && (
        <span className={`an-kpi-trend ${trend >= 0 ? "up" : "dn"}`}>
          {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
  </div>
);

const FilterSelect = ({ label, value, options, onChange }) => (
  <div className="an-filter-item">
    <span className="an-filter-label">{label}</span>
    <select className="an-filter-select" value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [nodes, setNodes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("health");
  const [expanded, setExpanded] = useState(null);

  const [dateRange,   setDateRange]   = useState("30 Days");
  const [site,        setSite]        = useState("All");
  const [client,      setClient]      = useState("All");
  const [nodeType,    setNodeType]    = useState("All");
  const [hwModel,     setHwModel]     = useState("All");
  const [fwVersion,   setFwVersion]   = useState("All");
  const [sensorType,  setSensorType]  = useState("All");

  useEffect(() => {
    fetch("http://localhost:8000/api/nodes/")
      .then(r => r.json())
      .then(data => {
        setNodes(data);
        setLoading(false);
        if (data[0]) setExpanded(data[0].id);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredNodes = useMemo(() => {
    let n = [...nodes];
    if (site !== "All")   n = n.filter(x => (x.id <= 15 ? "Pune" : "Mumbai") === site);
    if (client !== "All") n = n.filter(x => (x.id <= 15 ? "Acme Corp" : "Globex Labs") === client);
    if (hwModel !== "All") {
      const models = ["NRX-A1","NRX-B2","NRX-C3","NRX-D4","NRX-E5"];
      n = n.filter(x => models[x.id % 5] === hwModel);
    }
    return n;
  }, [nodes, site, client, hwModel]);

  const kpis = useMemo(() => {
    if (!filteredNodes.length) return { uptime: 0, failureRate: 0, latency: 0, alerts: 0, maintenance: 0, reliability: 0 };
    const m = filteredNodes.map(n => nodeMetrics(n.id));
    return {
      uptime:      (m.reduce((s, x) => s + x.uptime, 0) / m.length).toFixed(1),
      failureRate: (m.reduce((s, x) => s + x.failureRate, 0) / m.length).toFixed(1),
      latency:     Math.round(m.reduce((s, x) => s + x.latency, 0) / m.length),
      alerts:      m.reduce((s, x) => s + x.alerts, 0),
      maintenance: filteredNodes.filter(n => n.battery_level < 30 || n.signal_strength < -85).length,
      reliability: (m.reduce((s, x) => s + x.reliability, 0) / m.length).toFixed(1),
    };
  }, [filteredNodes]);

  const trendData = useMemo(() => {
    const days = dateRange === "1 Day" ? 1 : dateRange === "7 Days" ? 7 : 30;
    const pts   = Math.min(days, 10);
    return Array.from({ length: pts }, (_, i) => {
      const r = lcg((i + 1) * 4567 + filteredNodes.length);
      return {
        day:      i === pts - 1 ? "Today" : `D-${pts - 1 - i}`,
        uptime:   parseFloat((92 + r() * 7).toFixed(1)),
        latency:  Math.floor(22 + r() * 60),
        alerts:   Math.floor(r() * 35),
      };
    });
  }, [filteredNodes, dateRange]);

  const batteryData = filteredNodes.map(n => ({
    name: n.serial_number || `NRX-${n.id}`,
    battery: Math.round(n.battery_level),
  }));

  const batColor = v => v < 20 ? "#ef4444" : v < 60 ? "#eab308" : "#10b981";

  const TABS = [
    { id: "health",  label: "System Health" },
    { id: "trends",  label: "Node Trends"   },
    { id: "failure", label: "Failure Analysis" },
    { id: "nodes",   label: "Per-Node Detail" },
  ];

  return (
    <div className="analytics-page">
      <TopBar title="Analytics" subtitle="Fleet performance, health and failure intelligence" />

      {/* ── Global Filters ── */}
      <div className="an-filters glass-panel">
        <div className="an-filters-row">
          <FilterSelect label="Date Range"      value={dateRange}   options={DATE_RANGES}  onChange={setDateRange} />
          <FilterSelect label="Site"            value={site}        options={SITES}        onChange={setSite} />
          <FilterSelect label="Client"          value={client}      options={CLIENTS}      onChange={setClient} />
          <FilterSelect label="Node Type"       value={nodeType}    options={NODE_TYPES}   onChange={setNodeType} />
          <FilterSelect label="Hardware Model"  value={hwModel}     options={HW_MODELS}    onChange={setHwModel} />
          <FilterSelect label="Firmware"        value={fwVersion}   options={FW_VERSIONS}  onChange={setFwVersion} />
          <FilterSelect label="Sensor Type"     value={sensorType}  options={SENSOR_TYPES} onChange={setSensorType} />
        </div>
        <div className="an-filter-summary">
          {[dateRange, site !== "All" && site, client !== "All" && client,
            nodeType !== "All" && nodeType, hwModel !== "All" && hwModel,
            fwVersion !== "All" && fwVersion, sensorType !== "All" && sensorType]
            .filter(Boolean).join(" · ")}
          {" "}· <span style={{ color: "var(--brand-emerald)" }}>{filteredNodes.length} nodes</span>
        </div>
      </div>

      {loading ? (
        <div className="an-loading">Loading analytics...</div>
      ) : (
        <>
          {/* ── Tab bar ── */}
          <div className="an-tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`an-tab ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ══ TAB: System Health ══ */}
          {activeTab === "health" && (
            <div className="an-tab-content">
              <div className="an-kpi-grid">
                <KpiCard icon={<Activity size={18}/>}      label="Avg Node Uptime"       value={kpis.uptime}      unit="%" color="var(--brand-emerald)" trend={1.2} />
                <KpiCard icon={<AlertTriangle size={18}/>} label="Failure Rate"           value={kpis.failureRate} unit="%" color="#ef4444"              trend={-0.4} />
                <KpiCard icon={<Clock size={18}/>}         label="Avg Response Latency"   value={kpis.latency}     unit=" ms" color="#60a5fa"            />
                <KpiCard icon={<Zap size={18}/>}           label="Total Alerts Generated" value={kpis.alerts}      unit=""  color="#eab308"              sub="This period" />
                <KpiCard icon={<Shield size={18}/>}        label="Nodes Need Maintenance" value={kpis.maintenance} unit=""  color="#f97316"              sub="Battery or signal" />
                <KpiCard icon={<Wifi size={18}/>}          label="Data Reliability"       value={kpis.reliability} unit="%" color="#a78bfa"              trend={0.8} />
              </div>

              <div className="an-two-col">
                <div className="glass-panel an-chart-panel">
                  <p className="an-chart-title">Fleet Battery Levels</p>
                  <div className="an-chart-body">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={batteryData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} />
                        <Tooltip content={<AnTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                        <Bar dataKey="battery" name="Battery" radius={[4,4,0,0]}>
                          {batteryData.map((e, i) => <Cell key={i} fill={batColor(e.battery)} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-panel an-chart-panel">
                  <p className="an-chart-title">Alert Volume · {dateRange}</p>
                  <div className="an-chart-body">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#eab308" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                        <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip content={<AnTooltip />} />
                        <Area type="monotone" dataKey="alerts" name="Alerts" stroke="#eab308" strokeWidth={2} fill="url(#alertGrad)" isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ TAB: Node Trends ══ */}
          {activeTab === "trends" && (
            <div className="an-tab-content">
              <div className="an-two-col">
                <div className="glass-panel an-chart-panel">
                  <p className="an-chart-title">Avg Uptime Trend · {dateRange}</p>
                  <div className="an-chart-body">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                        <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={10} domain={[85, 100]} tickLine={false} axisLine={false} />
                        <Tooltip content={<AnTooltip />} />
                        <Line type="monotone" dataKey="uptime" name="Uptime %" stroke="var(--brand-emerald)" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-panel an-chart-panel">
                  <p className="an-chart-title">Avg Response Latency · {dateRange}</p>
                  <div className="an-chart-body">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                        <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip content={<AnTooltip />} />
                        <Line type="monotone" dataKey="latency" name="Latency ms" stroke="#60a5fa" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Per-node vibration metrics */}
              <div className="glass-panel an-chart-panel an-chart-panel--tall">
                <p className="an-chart-title">Per-Node Vibration RMS</p>
                <div className="an-chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredNodes.map(n => ({ name: n.serial_number || `NRX-${n.id}`, vib: nodeMetrics(n.id).vibration }))}
                      margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip content={<AnTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="vib" name="Vibration g" fill="#a78bfa" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ══ TAB: Failure Analysis ══ */}
          {activeTab === "failure" && (
            <div className="an-tab-content">
              <div className="an-three-col">
                {/* Pie */}
                <div className="glass-panel an-chart-panel">
                  <p className="an-chart-title">Failure Reason Distribution</p>
                  <div className="an-chart-body">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={FAILURE_REASONS} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                          {FAILURE_REASONS.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid var(--border-subtle)", borderRadius: 8, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* By HW model */}
                <div className="glass-panel an-chart-panel">
                  <p className="an-chart-title">Failure Rate by Hardware Model</p>
                  <div className="an-chart-body">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={HW_FAILURE} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                        <XAxis type="number" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                        <YAxis type="category" dataKey="model" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} width={50} />
                        <Tooltip content={<AnTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                        <Bar dataKey="rate" name="Failure %" fill="#f97316" radius={[0,4,4,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* By firmware */}
                <div className="glass-panel an-chart-panel">
                  <p className="an-chart-title">Failure Rate by Firmware Version</p>
                  <div className="an-chart-body">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={FW_FAILURE} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                        <XAxis type="number" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                        <YAxis type="category" dataKey="version" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} width={40} />
                        <Tooltip content={<AnTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                        <Bar dataKey="rate" name="Failure %" fill="#eab308" radius={[0,4,4,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* By site */}
              <div className="glass-panel an-chart-panel">
                <p className="an-chart-title">Failure Rate by Site</p>
                <div className="an-chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SITE_FAILURE} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                      <XAxis dataKey="site" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip content={<AnTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="rate" name="Failure %" fill="#ef4444" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ══ TAB: Per-Node Detail ══ */}
          {activeTab === "nodes" && (
            <div className="an-tab-content an-node-list">
              {filteredNodes.map(node => {
                const isOpen = expanded === node.id;
                const m = nodeMetrics(node.id);
                const statusColors = { MONITOR: "var(--status-monitor)", CONFIGURED: "var(--status-configured)", SLEEP: "var(--status-sleep)", NOT_CONFIGURED: "var(--status-unconfigured)" };
                const sc = statusColors[node.status] || "var(--text-muted)";
                return (
                  <div key={node.id} className={`glass-panel an-node-row ${isOpen ? "open" : ""}`}>
                    <div className="an-node-header" onClick={() => setExpanded(isOpen ? null : node.id)}>
                      <div className="an-node-left">
                        <span className="an-node-serial">{node.serial_number || `NRX-000${node.id}`}</span>
                        <span className="an-node-name">{node.name || `Node-${node.id}`}</span>
                        <span className="an-node-pill" style={{ color: sc, border: `1px solid ${sc}40`, background: `${sc}15` }}>{node.status}</span>
                      </div>
                      <div className="an-node-right">
                        <div className="an-mini"><span>Battery</span><span style={{ color: node.battery_level < 20 ? "#ef4444" : "#10b981" }}>{Math.round(node.battery_level)}%</span></div>
                        <div className="an-mini"><span>Signal</span><span style={{ color: "var(--brand-red)" }}>{node.signal_strength === 0 ? "—" : `${Math.round(node.signal_strength)} dBm`}</span></div>
                        <div className="an-mini"><span>Uptime</span><span style={{ color: "var(--brand-emerald)" }}>{m.uptime}%</span></div>
                        {isOpen ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
                      </div>
                    </div>
                    {isOpen && (
                      <div className="an-node-detail">
                        <div className="an-node-metrics">
                          {[
                            { label: "Vibration RMS",    value: m.vibration,   unit: "g"      },
                            { label: "Peak Accel",       value: m.peak,        unit: "m/s²"   },
                            { label: "Temp Drift",       value: m.tempDrift,   unit: "°C/hr"  },
                            { label: "Est. Lifespan",    value: m.lifespan,    unit: "days"   },
                            { label: "Failure Rate",     value: m.failureRate, unit: "%"      },
                            { label: "Reliability",      value: m.reliability, unit: "%"      },
                          ].map(({ label, value, unit }) => (
                            <div key={label} className="an-node-metric-card">
                              <span className="an-nm-label">{label}</span>
                              <span className="an-nm-value">{value}<em>{unit}</em></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
