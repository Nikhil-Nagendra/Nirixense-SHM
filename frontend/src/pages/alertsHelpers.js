export function lcg(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

export function buildAlerts(nodes) {
  const out = [];
  nodes.forEach(n => {
    const name = n.name || n.serial_number || `Node #${n.id}`;
    if (n.status === "NOT_CONFIGURED")
      out.push({ id: `uncfg-${n.id}`, severity: "warning", icon: "settings", title: "Node Not Configured", message: `${name} has not been configured yet.`, node: n, time: n.last_ping });
    if (n.battery_level < 10)
      out.push({ id: `bat-crit-${n.id}`, severity: "critical", icon: "battery", title: "Critical Battery", message: `${name} battery at ${Math.round(n.battery_level)}% — replace immediately.`, node: n, time: n.last_ping });
    else if (n.battery_level < 20)
      out.push({ id: `bat-low-${n.id}`, severity: "warning", icon: "battery", title: "Low Battery", message: `${name} battery at ${Math.round(n.battery_level)}%.`, node: n, time: n.last_ping });
    if (n.status === "MONITOR" && n.last_ping) {
      const secs = (new Date() - new Date(n.last_ping)) / 1000;
      if (secs > 30) out.push({ id: `ping-${n.id}`, severity: secs > 120 ? "critical" : "warning", icon: "wifi", title: "Missed Ping", message: `${name} last pinged ${Math.round(secs)}s ago.`, node: n, time: n.last_ping });
    }
    if (n.status === "MONITOR" && n.signal_strength < -90)
      out.push({ id: `sig-${n.id}`, severity: "warning", icon: "wifi", title: "Weak Signal", message: `${name} signal ${Math.round(n.signal_strength)} dBm.`, node: n, time: n.last_ping });
  });
  return out.sort((a, b) => (a.severity === "critical" ? -1 : 1));
}

export function getDiag(id) {
  const r = lcg(id * 3571);
  const pick = () => { const v = r(); return v > 0.85 ? "fail" : v > 0.65 ? "warn" : "pass"; };
  return [
    { test: "Ping Test",            status: pick() },
    { test: "Network Connectivity", status: pick() },
    { test: "Sensor Self-Test",     status: pick() },
    { test: "Storage Health",       status: pick() },
    { test: "Power Health",         status: pick() },
    { test: "Firmware Integrity",   status: pick() },
  ];
}

export function getSvc(id) {
  const r = lcg(id * 1234);
  const ago = d => { const dt = new Date(); dt.setDate(dt.getDate() - d); return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); };
  return {
    installed:       ago(Math.floor(r() * 400 + 100)),
    lastInspection:  ago(Math.floor(r() * 60 + 5)),
    lastBattery:     ago(Math.floor(r() * 180 + 30)),
    lastCalibration: ago(Math.floor(r() * 90 + 10)),
    lastTechnician:  ago(Math.floor(r() * 45 + 2)),
    openTasks:       Math.floor(r() * 4),
    notes: ["Replaced antenna connector — signal improved.", "Calibrated strain gauge sensor.", "Firmware updated to v2.3."].slice(0, Math.floor(r() * 3) + 1),
  };
}

export function timeAgo(ts) {
  if (!ts) return "Unknown";
  const s = Math.floor((new Date() - new Date(ts)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export const SEV_CFG = {
  critical: { color: "var(--brand-crimson)", bg: "var(--brand-crimson-dim)", label: "CRITICAL" },
  warning:  { color: "var(--brand-yellow)",  bg: "var(--brand-yellow-dim)",  label: "WARNING"  },
};

export const DIAG_COLOR = { pass: "var(--brand-emerald)", warn: "var(--brand-yellow)", fail: "var(--brand-crimson)" };
export const DIAG_LABEL = { pass: "Passed", warn: "Warning", fail: "Failed" };
