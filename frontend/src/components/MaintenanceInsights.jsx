import { AlertTriangle, Battery, Wifi, Clock } from 'lucide-react';
import './MaintenanceInsights.css';

function getRisk(node) {
  if (node.battery_level < 15) return { level: 'critical', reason: 'Battery critical', icon: 'battery' };
  if (node.battery_level < 30) return { level: 'high',     reason: 'Battery low',      icon: 'battery' };
  if (node.signal_strength < -90) return { level: 'high',  reason: 'Signal degraded',  icon: 'signal' };
  if (node.signal_strength < -80) return { level: 'medium',reason: 'Weak signal',       icon: 'signal' };
  if (node.status === 'SLEEP')    return { level: 'low',   reason: 'Node sleeping',     icon: 'sleep' };
  return null;
}

const RISK_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export default function MaintenanceInsights({ nodes }) {
  const atRisk = nodes
    .map(n => ({ ...n, risk: getRisk(n) }))
    .filter(n => n.risk)
    .sort((a, b) => RISK_ORDER[a.risk.level] - RISK_ORDER[b.risk.level])
    .slice(0, 8);

  return (
    <div className="maintenance-panel glass-panel">
      <div className="maintenance-header">
        <AlertTriangle size={16} />
        <span>Maintenance Insights</span>
        <span className="risk-count">{atRisk.length} at risk</span>
      </div>

      {atRisk.length === 0 ? (
        <div className="no-risk">All nodes operating normally</div>
      ) : (
        <ul className="risk-list">
          {atRisk.map(node => (
            <li key={node.id} className={`risk-item risk-${node.risk.level}`}>
              <div className="risk-icon">
                {node.risk.icon === 'battery' && <Battery size={14} />}
                {node.risk.icon === 'signal'  && <Wifi size={14} />}
                {node.risk.icon === 'sleep'   && <Clock size={14} />}
              </div>
              <div className="risk-info">
                <span className="risk-node-name">{node.node_name || `Node #${node.id}`}</span>
                <span className="risk-reason">{node.risk.reason}</span>
              </div>
              <div className="risk-meta">
                {node.risk.icon === 'battery' && (
                  <span className="risk-value">{Math.round(node.battery_level)}%</span>
                )}
                {node.risk.icon === 'signal' && (
                  <span className="risk-value">{Math.round(node.signal_strength)} dBm</span>
                )}
                <span className={`risk-badge badge-${node.risk.level}`}>{node.risk.level}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
