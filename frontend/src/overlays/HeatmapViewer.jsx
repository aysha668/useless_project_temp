import { useState } from 'react';
import { HEATMAP_TYPES } from '../utils/formatters';

export default function HeatmapViewer({ heatmaps }) {
  const [active, setActive] = useState('damage');
  if (!heatmaps) return null;

  const grid = heatmaps[active];
  const maxVal = Math.max(...grid.flat(), 0.001);

  return (
    <div className="chart-card glass heatmap-viewer">
      <div className="heatmap-tabs">
        {HEATMAP_TYPES.map((t) => (
          <button
            key={t.key}
            className={`tab ${active === t.key ? 'active' : ''}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${heatmaps.grid_size}, 1fr)` }}>
        {grid.flat().map((val, i) => (
          <div
            key={i}
            className="heatmap-cell"
            style={{
              background: `rgba(0, 255, 170, ${val / maxVal * 0.9})`,
              opacity: 0.3 + (val / maxVal) * 0.7,
            }}
            title={val.toFixed(3)}
          />
        ))}
      </div>
    </div>
  );
}
