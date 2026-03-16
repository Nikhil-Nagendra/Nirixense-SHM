import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Activity, CheckCircle, Moon, AlertTriangle, Signal } from 'lucide-react';
import TopBar from '../layout/TopBar';
import StatCard from './StatCard';
import NodeZoneMap from './NodeZoneMap';
import MaintenanceInsights from './MaintenanceInsights';
import EventTimeline from './EventTimeline';
import './Dashboard.css';

export default function Dashboard() {
  const [nodes, setNodes] = useState([]);
  const [events, setEvents] = useState([]);
  const prevNodes = useRef({});

  useEffect(() => {
    fetch('http://localhost:8000/api/nodes/')
      .then(res => res.json())
      .then(data => {
        setNodes(data);
        const map = {};
        data.forEach(n => { map[n.id] = n; });
        prevNodes.current = map;
      })
      .catch(err => console.error('Failed to load nodes', err));
  }, []);

  const { data: wsData } = useWebSocket('ws://localhost:8000/ws/nodes');

  useEffect(() => {
    if (wsData?.type !== 'NODE_UPDATE') return;
    const u = wsData.data;
    const prev = prevNodes.current[u.id];
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const name = u.node_name || `Node #${u.id}`;

    const newEvents = [];

    if (!prev) {
      newEvents.push({ type: 'ping', nodeId: u.id, nodeName: name, message: 'Node came online', time });
    } else {
      if (prev.status !== u.status) {
        newEvents.push({ type: 'status', nodeId: u.id, nodeName: name, message: `Status → ${u.status}`, time });
      }
      if (Math.abs((prev.battery_level || 0) - (u.battery_level || 0)) >= 2) {
        newEvents.push({ type: 'battery', nodeId: u.id, nodeName: name, message: `Battery ${Math.round(u.battery_level)}%`, time });
      }
      if (Math.abs((prev.signal_strength || 0) - (u.signal_strength || 0)) >= 3) {
        newEvents.push({ type: 'signal', nodeId: u.id, nodeName: name, message: `Signal ${Math.round(u.signal_strength)} dBm`, time });
      }
      if (!newEvents.length) {
        newEvents.push({ type: 'ping', nodeId: u.id, nodeName: name, message: 'Telemetry update received', time });
      }
    }

    if (u.battery_level < 20) {
      newEvents.push({ type: 'alert', nodeId: u.id, nodeName: name, message: `Critical battery: ${Math.round(u.battery_level)}%`, time });
    }

    prevNodes.current[u.id] = u;

    setNodes(prev => {
      const idx = prev.findIndex(n => n.id === u.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...u };
        return next;
      }
      return [...prev, u];
    });

    setEvents(prev => [...newEvents, ...prev].slice(0, 10));
  }, [wsData]);

  const total       = nodes.length;
  const monitoring  = nodes.filter(n => n.status === 'MONITOR').length;
  const sleeping    = nodes.filter(n => n.status === 'SLEEP').length;
  const critical    = nodes.filter(n => n.battery_level < 20 || n.status === 'NOT_CONFIGURED').length;
  const onlineRate  = total ? Math.round((monitoring / total) * 100) : 0;

  return (
    <div className="dashboard-page">
      <TopBar
        title="Control Room"
        subtitle={total > 0 ? `${total} nodes across all zones` : 'Loading nodes...'}
      />

      <div className="kpi-grid">
        <StatCard icon={<Activity />}      label="Total Nodes"    value={total}       color="var(--brand-red)"     subtitle="Across all zones" />
        <StatCard icon={<CheckCircle />}   label="Monitoring"     value={monitoring}  color="var(--brand-emerald)" subtitle={`${onlineRate}% online rate`} trend={onlineRate - 80} />
        <StatCard icon={<Moon />}          label="Sleeping"       value={sleeping}    color="#a78bfa"              subtitle="Low-power mode" />
        <StatCard icon={<AlertTriangle />} label="Critical"       value={critical}    color="var(--brand-crimson)" subtitle="Need attention" trend={critical > 0 ? -critical * 10 : 0} />
        <StatCard icon={<Signal />}        label="Configured"     value={nodes.filter(n => n.status !== 'NOT_CONFIGURED').length} color="#60a5fa" subtitle={`of ${total} total`} />
      </div>

      <div className="dashboard-mid-row">
        <div className="zone-map-wrapper">
          <NodeZoneMap nodes={nodes} />
        </div>
        <div className="insights-wrapper">
          <MaintenanceInsights nodes={nodes} />
        </div>
      </div>

      <div className="dashboard-timeline-row">
        <EventTimeline events={events} />
      </div>
    </div>
  );
}
