import './StatCard.css';

const StatCard = ({ icon, label, value, color, subtitle, trend }) => {
  return (
    <div className="stat-card glass-panel" style={{ '--card-color': color }}>
      <div className="stat-card-top-bar" />
      <div className="stat-card-body">
        <div className="stat-icon-wrapper">{icon}</div>
        <div className="stat-content">
          <span className="stat-label">{label}</span>
          <span className="stat-value">{value}</span>
          {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        </div>
        {trend !== undefined && (
          <div className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
