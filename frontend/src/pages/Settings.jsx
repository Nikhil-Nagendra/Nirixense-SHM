import React, { useState } from "react";
import TopBar from "../layout/TopBar";
import { Settings, Bell, Wifi, Shield, Monitor, Save } from "lucide-react";
import "./Settings.css";

const Section = ({ icon, title, children }) => (
  <div className="glass-panel settings-section">
    <div className="settings-section-header">
      <div className="settings-section-icon">{icon}</div>
      <h3>{title}</h3>
    </div>
    <div className="settings-section-body">{children}</div>
  </div>
);

const Toggle = ({ label, description, value, onChange }) => (
  <div className="settings-row">
    <div className="settings-row-text">
      <span className="settings-row-label">{label}</span>
      {description && <span className="settings-row-desc">{description}</span>}
    </div>
    <button
      className={`settings-toggle ${value ? "on" : ""}`}
      onClick={() => onChange(!value)}
      aria-label={label}
    >
      <span className="settings-toggle-knob" />
    </button>
  </div>
);

const Select = ({ label, description, value, options, onChange }) => (
  <div className="settings-row">
    <div className="settings-row-text">
      <span className="settings-row-label">{label}</span>
      {description && <span className="settings-row-desc">{description}</span>}
    </div>
    <select className="settings-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const [notifs, setNotifs] = useState({
    lowBattery: true,
    missedPing: true,
    signalDrop: false,
    weeklyReport: true,
  });

  const [display, setDisplay] = useState({
    refreshRate: "1000",
    historyPoints: "20",
    theme: "dark",
  });

  const [network, setNetwork] = useState({
    autoReconnect: true,
    pingTimeout: "30",
  });

  const [security, setSecurity] = useState({
    sessionTimeout: "60",
    auditLog: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="settings-page">
      <TopBar title="Settings" subtitle="Platform preferences and configuration" />

      <Section icon={<Bell size={18} />} title="Notifications">
        <Toggle label="Low Battery Alerts" description="Trigger when any node drops below 20%" value={notifs.lowBattery} onChange={(v) => setNotifs({ ...notifs, lowBattery: v })} />
        <Toggle label="Missed Ping Alerts" description="Alert when a MONITOR node hasn't pinged in 30s" value={notifs.missedPing} onChange={(v) => setNotifs({ ...notifs, missedPing: v })} />
        <Toggle label="Signal Drop Alerts" description="Alert when signal falls below -90 dBm" value={notifs.signalDrop} onChange={(v) => setNotifs({ ...notifs, signalDrop: v })} />
        <Toggle label="Weekly Summary Report" description="Email digest every Monday at 08:00" value={notifs.weeklyReport} onChange={(v) => setNotifs({ ...notifs, weeklyReport: v })} />
      </Section>

      <Section icon={<Monitor size={18} />} title="Display">
        <Select
          label="Dashboard Refresh Rate"
          description="How often the node grid polls for updates"
          value={display.refreshRate}
          options={[{ value: "500", label: "500ms" }, { value: "1000", label: "1s (default)" }, { value: "3000", label: "3s" }, { value: "5000", label: "5s" }]}
          onChange={(v) => setDisplay({ ...display, refreshRate: v })}
        />
        <Select
          label="Chart History Points"
          description="Number of data points shown in live charts"
          value={display.historyPoints}
          options={[{ value: "10", label: "10 points" }, { value: "20", label: "20 points (default)" }, { value: "50", label: "50 points" }, { value: "100", label: "100 points" }]}
          onChange={(v) => setDisplay({ ...display, historyPoints: v })}
        />
      </Section>

      <Section icon={<Wifi size={18} />} title="Network">
        <Toggle label="Auto-Reconnect WebSocket" description="Automatically reconnect on connection drop" value={network.autoReconnect} onChange={(v) => setNetwork({ ...network, autoReconnect: v })} />
        <Select
          label="Ping Timeout Threshold"
          description="Seconds before a missed ping triggers an alert"
          value={network.pingTimeout}
          options={[{ value: "15", label: "15s" }, { value: "30", label: "30s (default)" }, { value: "60", label: "60s" }, { value: "120", label: "2 min" }]}
          onChange={(v) => setNetwork({ ...network, pingTimeout: v })}
        />
      </Section>

      <Section icon={<Shield size={18} />} title="Security">
        <Select
          label="Session Timeout"
          description="Auto-logout after inactivity"
          value={security.sessionTimeout}
          options={[{ value: "15", label: "15 min" }, { value: "30", label: "30 min" }, { value: "60", label: "1 hour (default)" }, { value: "0", label: "Never" }]}
          onChange={(v) => setSecurity({ ...security, sessionTimeout: v })}
        />
        <Toggle label="Audit Log" description="Record all configuration changes" value={security.auditLog} onChange={(v) => setSecurity({ ...security, auditLog: v })} />
      </Section>

      <div className="settings-save-bar">
        <button className={`settings-save-btn ${saved ? "saved" : ""}`} onClick={handleSave}>
          {saved ? "✓ Saved" : <><Save size={15} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
