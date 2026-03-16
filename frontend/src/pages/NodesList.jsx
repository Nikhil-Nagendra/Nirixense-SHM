import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import TopBar from '../layout/TopBar';
import NodeCard from '../components/NodeCard';
import NodeFilters from '../components/NodeFilters';
import NodeDrawer from '../components/NodeDrawer';
import './NodesList.css';

export default function NodesList() {
  const [nodes, setNodes]           = useState([]);
  const [filters, setFilters]       = useState({ client: 'All', zone: 'All', status: 'All' });
  const [history, setHistory]       = useState({});
  const [activeNodeId, setActiveNodeId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/nodes/')
      .then(res => res.json())
      .then(data => {
        setNodes(data.map(n => ({
          ...n,
          client: n.id <= 15 ? 'Acme Corp' : 'Globex Labs',
          zone: n.id % 2 === 0 ? 'Zone B' : 'Zone A',
        })));
      })
      .catch(err => console.error('Failed to load nodes', err));
  }, []);

  const { data: wsData } = useWebSocket('ws://localhost:8000/ws/nodes');

  useEffect(() => {
    if (wsData?.type === 'NODE_UPDATE') {
      const u = wsData.data;
      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setNodes(prev => {
        const idx = prev.findIndex(n => n.id === u.id);
        const ctx = { client: u.id <= 15 ? 'Acme Corp' : 'Globex Labs', zone: u.id % 2 === 0 ? 'Zone B' : 'Zone A' };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...u, ...ctx };
          return next;
        }
        return [...prev, { ...u, ...ctx }];
      });

      setHistory(prev => {
        const h = prev[u.id] || { battery: [], signal: [] };
        return {
          ...prev,
          [u.id]: {
            battery: [...h.battery, { time: timeStr, level: Math.round(u.battery_level) }].slice(-20),
            signal:  [...h.signal,  { time: timeStr, strength: Math.round(u.signal_strength) }].slice(-20),
          },
        };
      });
    }
  }, [wsData]);

  const handleFilterChange = (type, value) => setFilters(prev => ({ ...prev, [type]: value }));

  const filteredNodes = nodes.filter(node => {
    if (filters.client !== 'All' && node.client !== filters.client) return false;
    if (filters.zone   !== 'All' && node.zone   !== filters.zone)   return false;
    if (filters.status !== 'All' && node.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="nodes-list-page">
      <TopBar
        title="Nodes Inventory"
        subtitle="Manage all sensor nodes and infrastructure hardware"
      />

      <div className="nodes-toolbar">
        <NodeFilters onFilterChange={handleFilterChange} />
        <button className="premium-btn">+ Add Node</button>
      </div>

      <div className="node-grid">
        {filteredNodes.map(node => (
          <NodeCard
            key={node.id}
            node={node}
            isActive={node.id === activeNodeId}
            onClick={() => setActiveNodeId(node.id)}
          />
        ))}
        {filteredNodes.length === 0 && (
          <div className="empty-state">No nodes match the selected filters.</div>
        )}
      </div>

      <NodeDrawer
        node={filteredNodes.find(n => n.id === activeNodeId) || null}
        batteryData={history[activeNodeId]?.battery || []}
        signalData={history[activeNodeId]?.signal || []}
        onClose={() => setActiveNodeId(null)}
      />
    </div>
  );
}
