import { useState } from 'react';
import { Link } from 'react-router-dom';
import { compareImages } from '../services/api';
import Gauge from '../components/Gauge';

export default function ComparePage() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const compare = async () => {
    if (!fileA || !fileB) return;
    setLoading(true);
    setError(null);
    try {
      const data = await compareImages(fileA, fileB);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compare-page">
      <h1>USELESSNESS BATTLE</h1>
      <p>Upload two broken screens. Only one can be objectively more useless.</p>

      <div className="compare-uploads">
        <div className="compare-slot glass">
          <h3>Screen A</h3>
          <input type="file" accept="image/*" onChange={(e) => setFileA(e.target.files[0])} />
        </div>
        <div className="vs">VS</div>
        <div className="compare-slot glass">
          <h3>Screen B</h3>
          <input type="file" accept="image/*" onChange={(e) => setFileB(e.target.files[0])} />
        </div>
      </div>

      <button className="btn btn-primary" disabled={!fileA || !fileB || loading} onClick={compare}>
        {loading ? 'Analyzing...' : 'FIGHT'}
      </button>

      {error && <div className="error-banner">{error}</div>}

      {result && (
        <div className="compare-results">
          <div className="winner-banner glass">
            <h2>WINNER: {result.comparison.winner}</h2>
            <p>{result.comparison.message}</p>
          </div>

          <div className="compare-scores">
            <div className="compare-screen glass">
              <h3>SCREEN A</h3>
              <Gauge label="Uselessness" value={result.comparison.screen_a.uselessness} />
              <Gauge label="Chaos" value={result.comparison.screen_a.chaos} />
              <p>Damage: {result.comparison.screen_a.damage_percentage}%</p>
              <p>Lines: {result.comparison.screen_a.total_lines}</p>
              <Link to={`/dashboard/${result.analysis_a.id}`} className="btn btn-secondary">View Dashboard</Link>
            </div>
            <div className="compare-screen glass">
              <h3>SCREEN B</h3>
              <Gauge label="Uselessness" value={result.comparison.screen_b.uselessness} />
              <Gauge label="Chaos" value={result.comparison.screen_b.chaos} />
              <p>Damage: {result.comparison.screen_b.damage_percentage}%</p>
              <p>Lines: {result.comparison.screen_b.total_lines}</p>
              <Link to={`/dashboard/${result.analysis_b.id}`} className="btn btn-secondary">View Dashboard</Link>
            </div>
          </div>

          <table className="compare-table glass">
            <thead>
              <tr><th>Metric</th><th>Screen A</th><th>Screen B</th></tr>
            </thead>
            <tbody>
              {result.comparison.comparisons.map((row) => (
                <tr key={row.metric}>
                  <td>{row.metric}</td>
                  <td className={row.a > row.b ? 'winner-cell' : ''}>{row.a}</td>
                  <td className={row.b > row.a ? 'winner-cell' : ''}>{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
