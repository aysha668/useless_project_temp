import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

export default function Gauge({ label, value, max = 100, unit = '', subtitle }) {
  const pct = Math.min(100, (value / max) * 100);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="gauge-card glass">
      <div className="gauge-label">{label}</div>
      <svg viewBox="0 0 120 120" className="gauge-svg">
        <circle cx="60" cy="60" r="54" className="gauge-bg" />
        <motion.circle
          cx="60" cy="60" r="54"
          className="gauge-fill"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="gauge-value">
        <AnimatedCounter value={value} decimals={1} suffix={unit} />
      </div>
      {subtitle && <div className="gauge-subtitle">{subtitle}</div>}
    </div>
  );
}
