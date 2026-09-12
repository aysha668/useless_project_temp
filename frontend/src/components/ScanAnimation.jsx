import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SCAN_STAGES } from '../utils/formatters';

export default function ScanAnimation({ active, imagePreview }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!active) {
      setStage(0);
      return;
    }
    const interval = setInterval(() => {
      setStage((s) => (s < SCAN_STAGES.length - 1 ? s + 1 : s));
    }, 800);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="scan-overlay">
      <div className="scan-container glass">
        {imagePreview && (
          <div className="scan-image-wrap">
            <img src={imagePreview} alt="Scanning" />
            <motion.div
              className="scan-line"
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}
        <div className="scan-stages">
          <AnimatePresence mode="popLayout">
            {SCAN_STAGES.slice(0, stage + 1).map((s, i) => (
              <motion.div
                key={s}
                className="scan-stage"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {i === 0 ? s : `✓ ${s}`}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
