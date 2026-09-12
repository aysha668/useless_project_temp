import { motion } from 'framer-motion';

export default function RepairabilityIndex({ repairability, summary, metrics, lines, intersections }) {
  // Fallback calculation if backend cache didn't have repairability object
  const damage = summary?.damage_percentage ?? 0;
  const breakageLevel = metrics?.breakage?.level ?? 5;
  const totalLines = summary?.total_lines ?? (lines?.length || 0);
  const intersectionCount = summary?.intersections ?? 0;

  const penalty = (damage * 1.25) + (breakageLevel * 5.0) + (totalLines * 0.2) + (intersectionCount * 0.25);
  const calculatedPct = Math.max(0.0, Math.min(99.9, 100.0 - penalty)).toFixed(1);

  const pct = repairability?.percentage ?? Number(calculatedPct);
  const status = repairability?.status ?? (pct >= 75 ? 'High Possibility' : pct >= 40 ? 'Moderate Possibility' : 'Terminal / Abysmal');
  const color = repairability?.color ?? (pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444');
  const verdict = repairability?.verdict ?? (
    pct >= 75
      ? 'Minor visual anomaly detected. High possibility of software fix or ribbon cable re-seating.'
      : pct >= 40
      ? 'Moderate hardware damage detected. Display panel or digitizer glass replacement required.'
      : 'Terminal display destruction. Possibility of simple repair is mathematically abysmal.'
  );
  const recommendation = repairability?.recommendation ?? (
    pct >= 40 ? 'Consult a certified technician for panel replacement.' : 'Recycle the display and consider purchasing a replacement.'
  );

  const glassFractureRisk = repairability?.glass_fracture_risk ?? Math.min(100, (damage * 1.8).toFixed(1));
  const digitizerIntegrity = repairability?.digitizer_integrity ?? Math.max(0, (100 - damage * 1.1).toFixed(1));
  const lcdBleedRisk = repairability?.lcd_bleed_risk ?? Math.min(100, (damage * 0.9).toFixed(1));

  return (
    <div className="chart-card glass repairability-card">
      <div className="repairability-header">
        <div>
          <h3>REPAIRABILITY FORENSICS</h3>
          <p className="repairability-subtitle">Possibility Percentage That Display Can Be Repaired</p>
        </div>
        <span className="repairability-badge" style={{ backgroundColor: `${color}22`, color: color, borderColor: `${color}66` }}>
          {status}
        </span>
      </div>

      <div className="repairability-body">
        <div className="repairability-primary">
          <div className="repairability-number-wrap">
            <motion.span
              className="repairability-number"
              style={{ color }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {pct}%
            </motion.span>
            <span className="repairability-label">REPAIR POSSIBILITY CHANCE</span>
          </div>

          <div className="repairability-progress-bg">
            <motion.div
              className="repairability-progress-fill"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>

          <p className="repairability-verdict">{verdict}</p>
        </div>

        <div className="repairability-stats">
          <div className="rep-stat-item">
            <span className="rep-stat-label">Glass Fracture Risk</span>
            <span className="rep-stat-val text-red">{glassFractureRisk}%</span>
          </div>
          <div className="rep-stat-item">
            <span className="rep-stat-label">Digitizer Integrity</span>
            <span className="rep-stat-val text-green">{digitizerIntegrity}%</span>
          </div>
          <div className="rep-stat-item">
            <span className="rep-stat-label">LCD Bleed Risk</span>
            <span className="rep-stat-val text-yellow">{lcdBleedRisk}%</span>
          </div>

          <div className="rep-recommendation">
            <strong>Forensic Recommendation:</strong>
            <p>{recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
