import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="hero-grid-bg" />
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-visual">
          <div className="broken-screen">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="hero-line"
                style={{
                  left: `${8 + i * 7}%`,
                  animationDelay: `${i * 0.15}s`,
                  height: `${60 + Math.random() * 40}%`,
                }}
              />
            ))}
            <div className="hero-scan" />
          </div>
        </div>
        <div className="hero-content">
          <p className="tagline">Because someone had to count the lines.</p>
          <h1>DEAD PIXEL<br />FORENSICS</h1>
          <p className="hero-sub">
            Turn broken pixels into unnecessarily detailed statistics.
          </p>
          <p className="hero-desc">
            Upload a broken display and let our Computer Vision engine investigate
            every suspicious line, color, pixel cluster, intersection and pattern.
          </p>
          <div className="hero-buttons">
            <Link to="/upload" className="btn btn-primary">ANALYZE MY SCREEN</Link>
            <Link to="/upload?demo=1" className="btn btn-secondary">EXPLORE THE USELESSNESS</Link>
          </div>
        </div>
      </motion.section>

      <section className="features">
        {[
          { title: 'Computer Vision', desc: 'Real OpenCV pipeline — Canny, Hough, contours, clustering.' },
          { title: 'Forensic Analytics', desc: 'Lines, colors, intersections, regions — all measured.' },
          { title: 'Useless Metrics', desc: 'Uselessness Score™, Chaos Index™, Display DNA™.' },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            className="feature-card glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
          >
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
