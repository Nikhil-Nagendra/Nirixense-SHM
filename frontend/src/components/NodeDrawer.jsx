import { useEffect } from 'react';
import { X, Zap, Activity, Clock } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './NodeDrawer.css';

// Seeded LCG for deterministic per-node metrics
function lcg(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}
function nodeMetrics(id) {
  const rng = lcg(id * 9301 + 49297);
  return {
    vibration:  (0.1 + rng() * 1.4).toFixed(2),   // g
    tilt:       (rng() * 12).toFixed(1),            // °
    loadStress: (10 + rng() * 85).toFixed(1),       // MPa
    strain:     (rng() * 950).toFixed(0),           // µε
  };
}

const statusConfig = {
  NOT_CONFIGURED: { color: 'var(--status-unconfigured)', bg: 'rgba(255,255,255,0.05)', label: 'Unconfigured' },
  CONFIGURED:     { color: 'var(--status-configured)',   bg: 'var(--status-configured-dim)',   label: 'Configured' },
  MONITOR:        { color: 'var(--status-monitor)',      bg: 'var(--status-monitor-dim)',      label: 'Monitor' },
  SLEEP:          { color: 'var(--status-sleep)',        bg: 'var(--status-sleep-dim)',        label: 'Sleep' },
};

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(13,13,13,0.95)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '8px 12px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</p>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: payload[0].color }}>
          {payload[0].value} {unit}
        </span>
      </div>
    );
  }
  return null;
};

export default function NodeDrawer({ node, batteryData, signalData, onClose }) {
  const isOpen = !!node;

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const status = node ? (statusConfig[node.status] || statusConfig.NOT_CONFIGURED) : null;

  const batColor = !node ? 'var(--brand-emerald)'
    : node.battery_level < 20 ? 'var(--brand-crimson)'
    : node.battery_level < 60 ? 'var(--brand-yellow)'
    : 'var(--brand-emerald)';

  const displayBat = batteryData?.length > 0 ? batteryData : [{ time: '...', level: 0 }];
  const displaySig = signalData?.length > 0  ? signalData  : [{ time: '...', strength: -100 }];
  const metrics    = node ? nodeMetrics(node.id) : null;

  const timeSincePing = () => {
    if (!node?.last_ping) return 'Never pinged';
    const secs = Math.floor((new Date() - new Date(node.last_ping)) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
  };

  return (
    <>
      {/* Backdrop */}
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

      {/* Drawer panel */}
      <div className={`drawer-panel ${isOpen ? 'open' : ''}`}>
        {node ? (
          <>
            {/* Header */}
            <div className="drawer-header">
              <div className="drawer-node-meta">
                <div className="drawer-header-top">
                  <span className="drawer-serial">{node.serial_number || `NRX-000${node.id}`}</span>
                  <span className="drawer-header-sep" />
                  <h3 className="drawer-node-name">{node.name || `Node-Generic-00${node.id}`}</h3>
                  <span className="drawer-header-sep" />
                  <div
                    className="drawer-status-pill"
                    style={{ backgroundColor: status.bg, color: status.color, border: `1px solid ${status.color}40` }}
                  >
                    {node.status === 'MONITOR'
                      ? <span className="pulse-dot" style={{ backgroundColor: status.color, width: 6, height: 6 }} />
                      : <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: status.color, display: 'inline-block' }} />
                    }
                    {status.label}
                  </div>
                </div>
              </div>
              <button className="drawer-close-btn" onClick={onClose} aria-label="Close drawer">
                <X size={18} />
              </button>
            </div>

            {/* Telemetry strip */}
            <div className="drawer-telemetry-strip">
              <div className="drawer-tele-item">
                <span className="drawer-tele-label">Battery</span>
                <span className="drawer-tele-value" style={{ color: batColor }}>
                  {Math.round(node.battery_level)}%
                </span>
              </div>
              <div className="drawer-tele-item">
                <span className="drawer-tele-label">Signal</span>
                <span className="drawer-tele-value" style={{ color: 'var(--brand-red)' }}>
                  {node.status === 'NOT_CONFIGURED' || node.signal_strength === 0
                    ? '—'
                    : `${Math.round(node.signal_strength)} dBm`}
                </span>
              </div>
              <div className="drawer-tele-item">
                <span className="drawer-tele-label">Zone</span>
                <span className="drawer-tele-value" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {node.zone || '—'}
                </span>
              </div>
            </div>

            {/* Charts */}
            <div className="drawer-charts">
              {/* Battery chart */}
              <div className="drawer-chart-block">
                <div className="drawer-chart-title">
                  <div className="drawer-chart-icon" style={{ color: 'var(--brand-emerald)', background: 'var(--brand-emerald-dim)' }}>
                    <Zap size={16} />
                  </div>
                  <div>
                    <h4>Battery Depletion Curve</h4>
                    <span>Live stream · last 20 readings</span>
                  </div>
                </div>
                <div className="drawer-chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayBat} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="drawerBat" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="var(--brand-emerald)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--brand-emerald)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip unit="%" />} />
                      <Area type="monotone" dataKey="level" stroke="var(--brand-emerald)" strokeWidth={2}
                        fillOpacity={1} fill="url(#drawerBat)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Signal chart */}
              <div className="drawer-chart-block">
                <div className="drawer-chart-title">
                  <div className="drawer-chart-icon" style={{ color: 'var(--brand-red)', background: 'var(--brand-red-dim)' }}>
                    <Activity size={16} />
                  </div>
                  <div>
                    <h4>RF Signal Vibration</h4>
                    <span>Live stream · last 20 readings</span>
                  </div>
                </div>
                <div className="drawer-chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displaySig} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="drawerSig" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="var(--brand-red)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--brand-red)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={10} domain={[-100, 0]} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip unit="dBm" />} />
                      <Area type="monotone" dataKey="strength" stroke="var(--brand-red)" strokeWidth={2}
                        fillOpacity={1} fill="url(#drawerSig)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sensor metrics */}
              {metrics && (
                <div className="drawer-sensor-grid">
                  <div className="drawer-sensor-item" style={{ '--sm-color': '#a78bfa' }}>
                    <span className="sm-label">Vibration Level</span>
                    <span className="sm-value">{metrics.vibration} <em>g</em></span>
                  </div>
                  <div className="drawer-sensor-item" style={{ '--sm-color': '#60a5fa' }}>
                    <span className="sm-label">Tilt Angle</span>
                    <span className="sm-value">{metrics.tilt} <em>°</em></span>
                  </div>
                  <div className="drawer-sensor-item" style={{ '--sm-color': '#f97316' }}>
                    <span className="sm-label">Load Stress</span>
                    <span className="sm-value">{metrics.loadStress} <em>MPa</em></span>
                  </div>
                  <div className="drawer-sensor-item" style={{ '--sm-color': 'var(--brand-emerald)' }}>
                    <span className="sm-label">Structural Strain</span>
                    <span className="sm-value">{metrics.strain} <em>µε</em></span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="drawer-footer">
              <span className="drawer-live-dot" />
              <Clock size={12} />
              <span>Last ping: {timeSincePing()}</span>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
