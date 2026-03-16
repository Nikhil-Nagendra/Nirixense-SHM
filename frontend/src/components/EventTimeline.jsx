import { Activity, Battery, Wifi, Power, AlertCircle } from 'lucide-react';
import './EventTimeline.css';

function getEventMeta(event) {
  switch (event.type) {
    case 'ping':    return { icon: <Activity size={13} />,    color: 'var(--brand-emerald)', label: 'Node Ping' };
    case 'battery': return { icon: <Battery size={13} />,     color: 'var(--brand-yellow)',  label: 'Battery Update' };
    case 'signal':  return { icon: <Wifi size={13} />,        color: '#60a5fa',              label: 'Signal Change' };
    case 'status':  return { icon: <Power size={13} />,       color: '#a78bfa',              label: 'Status Change' };
    case 'alert':   return { icon: <AlertCircle size={13} />, color: 'var(--brand-crimson)', label: 'Alert' };
    default:        return { icon: <Activity size={13} />,    color: 'var(--text-muted)',    label: 'Event' };
  }
}

export default function EventTimeline({ events }) {
  const display = events.slice(0, 10);

  return (
    <div className="timeline-panel glass-panel">
      <div className="timeline-header">
        <Activity size={15} />
        <span>Event Timeline</span>
        <span className="timeline-badge">Live</span>
      </div>

      {display.length === 0 ? (
        <div className="timeline-empty">Waiting for events...</div>
      ) : (
        <div className="timeline-list">
          {display.map((ev, i) => {
            const meta = getEventMeta(ev);
            return (
              <div key={i} className="timeline-item">
                <div className="tl-dot-col">
                  <div className="tl-icon" style={{ color: meta.color, background: `color-mix(in srgb, ${meta.color} 15%, transparent)` }}>
                    {meta.icon}
                  </div>
                  {i < display.length - 1 && <div className="tl-line" />}
                </div>
                <div className="tl-content">
                  <span className="tl-node">{ev.nodeName || `Node #${ev.nodeId}`}</span>
                  <span className="tl-desc">{ev.message}</span>
                </div>
                <span className="tl-time">{ev.time}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
