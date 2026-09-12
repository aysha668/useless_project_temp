import { useState } from 'react';

export default function ImageOverlay({ analysis, highlightLineId }) {
  const [view, setView] = useState('annotated');
  if (!analysis?.image) return null;

  const src = view === 'original'
    ? `data:image/png;base64,${analysis.image.original_base64}`
    : view === 'damage'
      ? `data:image/png;base64,${analysis.image.damage_overlay_base64}`
      : `data:image/png;base64,${analysis.image.annotated_base64}`;

  return (
    <div className="image-overlay glass">
      <div className="overlay-tabs">
        {['original', 'annotated', 'damage'].map((v) => (
          <button key={v} className={`tab ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
            {v === 'original' ? 'Original' : v === 'annotated' ? 'Annotated' : 'Damage Map'}
          </button>
        ))}
      </div>

      {/* Fixed 9:16 portrait frame — image scales to fit, never enlarges */}
      <div className="overlay-portrait-frame">
        <img src={src} alt="Analysis overlay" className="overlay-image-fit" />
        {highlightLineId && (
          <div className="highlight-badge">Line #{highlightLineId}</div>
        )}
      </div>

      <div className="image-meta">
        {analysis.image.width} × {analysis.image.height} px · AR {analysis.image.aspect_ratio}
      </div>
    </div>
  );
}
