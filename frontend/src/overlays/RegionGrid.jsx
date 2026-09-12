export default function RegionGrid({ regions }) {
  if (!regions) return null;

  const order = [
    'top-left', 'top-center', 'top-right',
    'mid-left', 'center', 'mid-right',
    'bot-left', 'bot-center', 'bot-right',
  ];

  const maxDamage = Math.max(...order.map((k) => regions[k]?.damage_percentage || 0), 1);

  return (
    <div className="chart-card glass">
      <h3>3×3 Damage Map</h3>
      <div className="region-grid">
        {order.map((key) => {
          const r = regions[key] || {};
          const intensity = (r.damage_percentage || 0) / maxDamage;
          return (
            <div
              key={key}
              className="region-cell"
              style={{ background: `rgba(255, 80, 80, ${intensity * 0.8})` }}
            >
              <span className="region-name">{key.replace('-', ' ')}</span>
              <span className="region-stat">{r.damage_percentage?.toFixed(1)}%</span>
              <span className="region-lines">{r.line_count} lines</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
