import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, ReferenceLine } from 'recharts';
import './NodeZoneMap.css';

// Deterministic position per node id
function nodePos(id) {
  const seed = id * 2654435761;
  const x = 10 + ((seed >>> 0) % 80);
  const y = 10 + (((seed * 1234567) >>> 0) % 80);
  return { x, y };
}

function severity(node) {
  if (node.battery_level < 20 || node.status === 'NOT_CONFIGURED') return 'critical';
  if (node.battery_level < 35 || node.signal_strength < -85)       return 'warning';
  return 'healthy';
}

const SEV_COLOR = { critical: '#ef4444', warning: '#eab308', healthy: '#10b981' };

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  const color = SEV_COLOR[payload.sev];
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={color} fillOpacity={0.18} />
      <circle cx={cx} cy={cy} r={5}  fill={color} />
      {payload.sev === 'critical' && (
        <circle cx={cx} cy={cy} r={10} fill="none" stroke={color} strokeWidth={1} strokeOpacity={0.6}>
          <animate attributeName="r" from="6" to="14" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="zone-tooltip">
      <div className="zt-name">{d.name}</div>
      <div className="zt-row"><span>Battery</span><span>{Math.round(d.battery)}%</span></div>
      <div className="zt-row"><span>Signal</span><span>{Math.round(d.signal)} dBm</span></div>
      <div className="zt-row"><span>Status</span><span>{d.status}</span></div>
      <div className={`zt-sev sev-${d.sev}`}>{d.sev.toUpperCase()}</div>
    </div>
  );
};

export default function NodeZoneMap({ nodes }) {
  const data = nodes.map(n => {
    const pos = nodePos(n.id);
    return {
      ...pos,
      id: n.id,
      name: n.node_name || `Node #${n.id}`,
      battery: n.battery_level,
      signal: n.signal_strength,
      status: n.status,
      sev: severity(n),
    };
  });

  const counts = { critical: 0, warning: 0, healthy: 0 };
  data.forEach(d => counts[d.sev]++);

  return (
    <div className="zone-map-panel glass-panel">
      <div className="zone-map-header">
        <span>Node Zone Map</span>
        <div className="zone-legend">
          {Object.entries(SEV_COLOR).map(([k, c]) => (
            <span key={k} className="legend-item">
              <span className="legend-dot" style={{ background: c }} />
              {k} ({counts[k]})
            </span>
          ))}
        </div>
      </div>

      <div className="zone-map-body">
        <div className="zone-label zone-a">Zone A</div>
        <div className="zone-label zone-b">Zone B</div>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <XAxis type="number" dataKey="x" domain={[0, 100]} hide />
            <YAxis type="number" dataKey="y" domain={[0, 100]} hide />
            <ReferenceLine x={50} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <ReferenceLine y={50} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Scatter data={data} shape={<CustomDot />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
