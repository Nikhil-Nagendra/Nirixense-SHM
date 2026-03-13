import React from 'react';
import { Battery, Activity, Clock } from 'lucide-react';
import './NodeCard.css';

export default function NodeCard({ node, isActive, onClick }) {
  const statusColor = {
    'NOT_CONFIGURED': 'var(--status-gray)',
    'CONFIGURED': 'var(--status-blue)',
    'MONITOR': 'var(--status-green)',
    'SLEEP': 'var(--status-amber)',
  }[node.status] || 'var(--status-gray)';

  return (
    <div 
      className={`glass-panel node-card ${isActive ? 'active' : ''}`} 
      style={{ 
        borderTop: `4px solid ${statusColor}`,
        border: isActive ? `2px solid ${statusColor}` : undefined,
        cursor: 'pointer',
        transform: isActive ? 'scale(1.02)' : 'none',
        transition: 'all 0.2s ease',
        boxShadow: isActive ? `0 0 15px ${statusColor}40` : 'none'
      }}
      onClick={onClick}
    >
      <div className="node-header">
        <h3>Node #{node.id}</h3>
        <span className="badge" style={{ backgroundColor: statusColor }}>{node.status}</span>
      </div>
      <div className="node-stats">
        <div className="stat">
          <Battery size={16} /> {node.battery_level}%
        </div>
        <div className="stat">
          <Activity size={16} /> {node.signal_strength} dBm
        </div>
      </div>
      <div className="node-footer">
        <Clock size={12} /> {node.last_ping ? new Date(node.last_ping).toLocaleTimeString() : 'Never'}
      </div>
    </div>
  );
}
