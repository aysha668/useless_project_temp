import { motion } from 'framer-motion';

export default function AwardsSection({ awards }) {
  if (!awards?.length) return null;

  return (
    <div className="awards-section glass">
      <h2>THE USELESS AWARDS™</h2>
      <div className="awards-grid">
        {awards.map((award, i) => (
          <motion.div
            key={award.title}
            className="award-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <span className="award-emoji">{award.emoji}</span>
            <span className="award-title">{award.title}</span>
            <span className="award-winner">{award.winner}</span>
            <span className="award-value">{award.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
