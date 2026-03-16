import { useState, useEffect } from "react";
import TopBar from "../layout/TopBar";
import { useWebSocket } from "../hooks/useWebSocket";
import { ShieldAlert, BatteryLow, WifiOff, AlertTriangle, Settings2, CheckCircle, Activity, RefreshCw, Wrench, Bell, RotateCcw, FileText, UserCheck, ChevronRight, Calendar } from "lucide-react";
import { buildAlerts, getDiag, getSvc, timeAgo, SEV_CFG, DIAG_COLOR, DIAG_LABEL } from "./alertsHelpers";
import "./Alerts.css";

const ICON_MAP = { battery: BatteryLow, wifi: WifiOff, settings: Settings2 };

const TABS = [
  { id: "alerts",      label: "Active Alerts" },
  { id: "diagnostics", label: "Diagnostics"   },
  { id: "maintenance", label: "Maintenance"   },
  { id: "actions",     label: "Actions"       },
];

function NodePicker({ nodes, selId, onSelect }) {
  return (
    <div className="al-node-picker glass-panel">
      <p className="al-panel-title">Select Node</p>
      <div className="al-node-pick-list">
        {nodes.map(n => (
          <button
            key={n.id}
            className={`al-node-pick-item ${selId === n.id ? "active" : ""}`}
            onClick={() => onSelect(n.id)}
          >
            <span className="al-pick-serial">{n.serial_number || `NRX-${n.id}`}</span>
            <span className="al-pick-name">{n.name || `Node-${n.id}`}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Alerts() {
  const [nodes, setNodes]         = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [tab, setTab]             = useState("alerts");
  const [selId, setSelId]         = useState(null);
  const [feedback, setFeedback]   = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/nodes/")
      .then(r => r.json())
      .then(data => { setNodes(data); if (data[0]) setSelId(data[0].id); })
      .catch(() => {});
  }, []);

  const { data: wsData } = useWebSocket("ws://localhost:8000/ws/nodes");
  useEffect(() => {
    if (wsData?.type !== "NODE_UPDATE") return;
    const u = wsData.data;
    setNodes(prev => {
      const i = prev.findIndex(n => n.id === u.id);
      if (i >= 0) { const next = [...prev]; next[i] = { ...next[i], ...u }; return next; }
      return [...prev, u];
    });
  }, [wsData]);

  const alerts   = buildAlerts(nodes).filter(a => !dismissed.has(a.id));
  const critical = alerts.filter(a => a.severity === "critical").length;
  const warnings = alerts.filter(a => a.severity === "warning").length;
  const healthy  = nodes.filter(n => n.status === "MONITOR" && n.battery_level >= 20).length;

  const selNode = nodes.find(n => n.id === selId) || null;
  const diag    = selNode ? getDiag(selNode.id) : [];
  const svc     = selNode ? getSvc(selNode.id) : null;

  const fire = label => {
    const nodeName = selNode ? (selNode.name || selNode.serial_number || `Node #${selNode.id}`) : "node";
    setFeedback(`"${label}" triggered for ${nodeName}`);
    setTimeout(() => setFeedback(""), 3000);
  };

  return (
    <div className="alerts-page">
      <TopBar title="Alerts & Diagnostics" subtitle="Real-time health monitoring, diagnostics and service management" />

      {/* Summary */}
      <div className="al-summary-strip">
        {[
          { icon: <ShieldAlert size={20} />, val: critical, lbl: "Critical",    color: "var(--brand-crimson)" },
          { icon: <AlertTriangle size={20}/>, val: warnings, lbl: "Warnings",   color: "var(--brand-yellow)"  },
          { icon: <CheckCircle size={20} />, val: healthy,  lbl: "Healthy",     color: "var(--brand-emerald)" },
          { icon: <Activity size={20} />,    val: nodes.length, lbl: "Total Nodes", color: "#60a5fa"          },
        ].map(({ icon, val, lbl, color }) => (
          <div key={lbl} className="glass-panel al-sum-card" style={{ "--ac": color }}>
            <span style={{ color }}>{icon}</span>
            <div><span className="al-sum-val">{val}</span><span className="al-sum-lbl">{lbl}</span></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="al-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`al-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
            {t.id === "alerts" && alerts.length > 0 && <span className="al-tab-badge">{alerts.length}</span>}
          </button>
        ))}
      </div>

      {/* ── Active Alerts ── */}
      {tab === "alerts" && (
        <div className="al-feed">
          {alerts.length === 0 ? (
            <div className="al-clear glass-panel">
              <CheckCircle size={32} color="var(--brand-emerald)" />
              <p>All systems nominal — no active alerts.</p>
            </div>
          ) : alerts.map(alert => {
            const sev  = SEV_CFG[alert.severity];
            const Icon = ICON_MAP[alert.icon] || AlertTriangle;
            return (
              <div key={alert.id} className="glass-panel al-alert-card" style={{ "--sev": sev.color }}>
                <div className="al-alert-icon" style={{ color: sev.color, background: sev.bg }}><Icon size={17} /></div>
                <div className="al-alert-body">
                  <div className="al-alert-top">
                    <span className="al-badge" style={{ color: sev.color, background: sev.bg, border: `1px solid ${sev.color}40` }}>{sev.label}</span>
                    <span className="al-alert-title">{alert.title}</span>
                  </div>
                  <p className="al-alert-msg">{alert.message}</p>
                  <div className="al-alert-meta">
                    <span>{alert.node.serial_number || `NRX-000${alert.node.id}`}</span>
                    <span>{timeAgo(alert.time)}</span>
                  </div>
                </div>
                <button className="al-dismiss" onClick={() => setDismissed(p => new Set([...p, alert.id]))}>✕</button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Diagnostics ── */}
      {tab === "diagnostics" && (
        <div className="al-two-col">
          <NodePicker nodes={nodes} selId={selId} onSelect={setSelId} />
          <div className="al-diag-panel glass-panel">
            <p className="al-panel-title">
              Diagnostics — {selNode ? (selNode.name || selNode.serial_number) : "—"}
            </p>
            {diag.map(({ test, status }) => (
              <div key={test} className="al-diag-row">
                <span className="al-diag-test">{test}</span>
                <span className="al-diag-status" style={{ color: DIAG_COLOR[status], background: `${DIAG_COLOR[status]}18`, border: `1px solid ${DIAG_COLOR[status]}40` }}>
                  {status === "pass" ? "✓" : status === "warn" ? "⚠" : "✗"} {DIAG_LABEL[status]}
                </span>
              </div>
            ))}
            {!selNode && <p className="al-empty-msg">Select a node to view diagnostics.</p>}
          </div>
        </div>
      )}

      {/* ── Maintenance ── */}
      {tab === "maintenance" && (
        <div className="al-two-col">
          <NodePicker nodes={nodes} selId={selId} onSelect={setSelId} />
          <div className="al-maint-panel glass-panel">
            <p className="al-panel-title">
              Service History — {selNode ? (selNode.name || selNode.serial_number) : "—"}
            </p>
            {svc ? (
              <>
                <div className="al-svc-grid">
                  {[
                    { icon: <Calendar size={14}/>, label: "Installed",          val: svc.installed       },
                    { icon: <RefreshCw size={14}/>, label: "Last Inspection",   val: svc.lastInspection  },
                    { icon: <BatteryLow size={14}/>,label: "Last Battery Swap", val: svc.lastBattery     },
                    { icon: <Activity size={14}/>,  label: "Last Calibration",  val: svc.lastCalibration },
                    { icon: <UserCheck size={14}/>, label: "Last Technician",   val: svc.lastTechnician  },
                    { icon: <Wrench size={14}/>,    label: "Open Tasks",        val: svc.openTasks, warn: svc.openTasks > 0 },
                  ].map(({ icon, label, val, warn }) => (
                    <div key={label} className="al-svc-item">
                      <span className="al-svc-icon">{icon}</span>
                      <div>
                        <span className="al-svc-label">{label}</span>
                        <span className="al-svc-val" style={{ color: warn ? "var(--brand-yellow)" : "var(--text-primary)" }}>{val}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {svc.notes.length > 0 && (
                  <div className="al-svc-notes">
                    <p className="al-notes-title">Service Notes</p>
                    {svc.notes.map((note, i) => (
                      <div key={i} className="al-note-row">
                        <span className="al-note-dot" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : <p className="al-empty-msg">Select a node to view service history.</p>}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      {tab === "actions" && (
        <div className="al-two-col">
          <NodePicker nodes={nodes} selId={selId} onSelect={setSelId} />
          <div className="al-actions-panel glass-panel">
            <p className="al-panel-title">
              Actions — {selNode ? (selNode.name || selNode.serial_number) : "—"}
            </p>
            {feedback && <div className="al-feedback">{feedback}</div>}
            <div className="al-actions-grid">
              {[
                { icon: <RotateCcw size={15}/>,  label: "Restart Node",          color: "#60a5fa"              },
                { icon: <Bell size={15}/>,        label: "Silence Alert",         color: "var(--brand-yellow)"  },
                { icon: <CheckCircle size={15}/>, label: "Acknowledge Alert",     color: "var(--brand-emerald)" },
                { icon: <Activity size={15}/>,    label: "Run Diagnostics",       color: "#a78bfa"              },
                { icon: <RefreshCw size={15}/>,   label: "Push Firmware Update",  color: "#f97316"              },
                { icon: <Wrench size={15}/>,      label: "Maintenance Mode",      color: "var(--brand-yellow)"  },
                { icon: <FileText size={15}/>,    label: "Create Support Ticket", color: "var(--text-secondary)"},
                { icon: <UserCheck size={15}/>,   label: "Assign Field Engineer", color: "var(--brand-emerald)" },
              ].map(({ icon, label, color }) => (
                <button key={label} className="al-action-btn" style={{ "--ab": color }} onClick={() => fire(label)} disabled={!selNode}>
                  <span className="al-action-icon" style={{ color }}>{icon}</span>
                  <span className="al-action-label">{label}</span>
                  <ChevronRight size={13} className="al-action-chevron" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
