import React from 'react';
import { Clock, Cpu } from 'lucide-react';
import './NodeCard.css';

export default function NodeCard({ node, isActive, onClick }) {
  const isCritical = node.battery_level < 20 || node.status === 'NOT_CONFIGURED';
  
  const statusConfig = {
    'NOT_CONFIGURED': { color: 'var(--status-unconfigured)', bg: 'var(--status-unconfigured-dim)', label: 'Unconfigured' },
    'CONFIGURED': { color: 'var(--status-configured)', bg: 'var(--status-configured-dim)', label: 'Configured' },
    'MONITOR': { color: 'var(--status-monitor)', bg: 'var(--status-monitor-dim)', label: 'Monitor' },
    'SLEEP': { color: 'var(--status-sleep)', bg: 'var(--status-sleep-dim)', label: 'Sleep' },
  };

  const currentStatus = statusConfig[node.status] || statusConfig['NOT_CONFIGURED'];

  let batColor = 'var(--brand-emerald)';
  if (node.battery_level < 20) batColor = 'var(--brand-crimson)';
  else if (node.battery_level < 60) batColor = 'var(--brand-yellow)';

  const sigBars = () => {
    if (node.status === 'NOT_CONFIGURED' || node.signal_strength === 0) return 0;
    if (node.signal_strength > -60) return 4;
    if (node.signal_strength > -75) return 3;
    if (node.signal_strength > -85) return 2;
    return 1;
  };
  
  const renderBars = () => {
    const bars = [];
    const activeBars = sigBars();
    for(let i=1; i<=4; i++) {
        bars.push(
            <div 
              key={i} 
              className={`sig-bar ${i <= activeBars ? 'active' : ''}`} 
              style={{
                height: `${i * 3 + 6}px`, 
                backgroundColor: i <= activeBars ? 'var(--brand-red)' : 'var(--border-subtle)',
                boxShadow: i <= activeBars ? '0 0 5px rgba(230,57,70,0.4)' : 'none'
              }}
            />
        )
    }
    return bars;
  }

  const timeSincePing = () => {
    if (!node.last_ping) return 'Never pinged';
    const diff = new Date() - new Date(node.last_ping);
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return 'less than a minute ago';
    if (secs < 3600) return `${Math.floor(secs/60)} minute(s) ago`;
    return `${Math.floor(secs/3600)} hour(s) ago`;
  };

  return (
    <div 
      className={`node-card glass-panel ${isActive ? 'active glow-red' : ''} ${isCritical && !isActive ? 'critical-border' : ''}`}
      onClick={onClick}
    >
      <div className="card-topline">
        <div className="serial-box">
          <Cpu size={12} className="serial-icon" />
          <span className="serial-text">{node.serial_number || `NRX-000${node.id}`}</span>
        </div>
        <div className="status-pill" style={{ backgroundColor: currentStatus.bg, color: currentStatus.color, border: `1px solid ${currentStatus.color}40` }}>
          {node.status === 'MONITOR' && <span className="pulse-dot" style={{ backgroundColor: currentStatus.color, width: '6px', height: '6px' }}></span>}
          {node.status !== 'MONITOR' && <span className="static-dot" style={{ backgroundColor: currentStatus.color }}></span>}
          <span>{currentStatus.label}</span>
        </div>
      </div>
      
      <h3 className="node-name">{node.name || `Node-Generic-00${node.id}`}</h3>
      
      <div className="telemetry-section">
        <div className="telemetry-row">
          <div className="battery-icon-shell">
             <div className="battery-body">
                <div className="battery-fill" style={{ width: `${node.battery_level}%`, backgroundColor: batColor, boxShadow: `0 0 8px ${batColor}` }}></div>
             </div>
             <div className="battery-nipple"></div>
          </div>
          <span className="telemetry-text" style={{ color: batColor }}>{Math.round(node.battery_level)}%</span>
          <div className="signal-bars">{renderBars()}</div>
          <span className="telemetry-text">{node.status === 'NOT_CONFIGURED' || node.signal_strength === 0 ? 'No signal' : `${Math.round(node.signal_strength)} dBm`}</span>
        </div>
      </div>
      
      <div className="sensors-section">
         <span className="sensor-pill">STRAIN GAUGE</span>
         <span className="sensor-pill">{node.id % 2 === 0 ? 'ACCELEROMETER' : 'DISPLACEMENT'}</span>
      </div>
      
      <div className="card-footer">
        <div className="ping-time">
          <Clock size={12} />
          <span>{timeSincePing()}</span>
        </div>
        <div className="view-more-chevron">
          &rsaquo;
        </div>
      </div>
    </div>
  );
}
