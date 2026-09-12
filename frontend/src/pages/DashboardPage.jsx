import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedCounter from '../components/AnimatedCounter';
import LineExplorer from '../components/LineExplorer';
import RepairabilityIndex from '../components/RepairabilityIndex';
import DisplayDNA from '../components/DisplayDNA';
import ImageOverlay from '../overlays/ImageOverlay';
import HeatmapViewer from '../overlays/HeatmapViewer';
import RegionGrid from '../overlays/RegionGrid';
import { DonutChart, BarChartCard, HistogramChart, ScatterChartCard } from '../charts/ChartComponents';
import { getAnalysis, getReportUrl } from '../services/api';

export default function DashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('lastAnalysis');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.id === id) {
          setAnalysis(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Session storage read error, fetching from API:', e);
    }
    getAnalysis(id)
      .then(setAnalysis)
      .catch(() => setError('Analysis not found.'));
  }, [id]);

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensics_${id}.json`;
    a.click();
  };

  const downloadAnnotated = () => {
    const a = document.createElement('a');
    a.href = `data:image/png;base64,${analysis.image.annotated_base64}`;
    a.download = `annotated_${id}.png`;
    a.click();
  };

  if (error) return <div className="error-page">{error} <Link to="/upload">Try again</Link></div>;
  if (!analysis) return <div className="loading-page">Loading forensic data...</div>;

  const charts = analysis.visualizations?.charts || {};
  const summary = analysis.summary;
  const metrics = analysis.metrics;

  return (
    <motion.div className="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="dashboard-header">
        <div>
          <h1>FORENSIC DASHBOARD</h1>
          <p className="personality-badge">{analysis.personality?.type}</p>
        </div>
        <div className="header-actions">
          <a href={getReportUrl(id)} className="btn btn-secondary" target="_blank" rel="noreferrer">Download Report</a>
          <button className="btn btn-secondary" onClick={downloadAnnotated}>Download Annotated Image</button>
          <button className="btn btn-secondary" onClick={downloadJson}>Download JSON</button>
          <Link to="/upload" className="btn btn-primary">ANALYZE ANOTHER SCREEN</Link>
          <Link to="/compare" className="btn btn-secondary">Battle</Link>
        </div>
      </div>

      {/* Key stats */}
      <div className="stat-row">
        {[
          { label: 'TOTAL LINES',    value: summary.total_lines },
          { label: 'COLORS',         value: summary.colors_detected },
          { label: 'DAMAGE',         value: summary.damage_percentage, suffix: '%' },
          { label: 'INTERSECTIONS',  value: summary.intersections },
        ].map((s) => (
          <div key={s.label} className="stat-card glass">
            <span className="stat-label">{s.label}</span>
            <span className="stat-value">
              <AnimatedCounter value={s.value} decimals={s.suffix ? 1 : 0} suffix={s.suffix || ''} />
            </span>
          </div>
        ))}
      </div>

      {/* Image views — full natural width */}
      <div className="image-full-row">
        <ImageOverlay analysis={analysis} highlightLineId={selectedLineId} />
      </div>

      {/* Charts grid */}
      <div className="dashboard-grid">
        <DonutChart data={charts.orientation_pie}     title="Line Orientation Breakdown" />
        <DonutChart data={charts.color_pie}           title="Colors Detected" />
        <DonutChart data={charts.damage_pie}          title="Damage vs Unaffected Area" />

        <HistogramChart histogram={charts.length_histogram} title="Line Length Distribution" />
        <HistogramChart histogram={charts.width_histogram}  title="Line Width Distribution" />
        <HistogramChart histogram={charts.intensity_histogram} title="Pixel Intensity (Abnormal Regions)" />

        <HeatmapViewer heatmaps={analysis.visualizations?.heatmaps} />
        <RegionGrid    regions={analysis.regions} />

        <BarChartCard data={charts.lines_by_color}        title="Lines by Color" />
        <BarChartCard data={charts.length_by_color}       title="Total Line Length by Color" />
        <BarChartCard data={charts.damage_by_region}      title="Damage by Screen Region" />
        <BarChartCard data={charts.lines_by_orientation}  title="Line Count by Orientation" />
        <BarChartCard data={charts.intersections_by_region} title="Intersection Count by Region" />

        <ScatterChartCard data={charts.scatter_length_width}      title="Line Length vs Width"      xLabel="Length" yLabel="Width" />
        <ScatterChartCard data={charts.scatter_length_brightness} title="Line Length vs Brightness" xLabel="Length" yLabel="Brightness" />
      </div>

      {/* H:V ratio */}
      <div className="hv-analysis glass">
        <h3>Horizontal : Vertical Ratio — {analysis.horizontal_vertical?.ratio_display}</h3>
        <div className="hv-bars">
          <div className="hv-bar"         style={{ width: `${analysis.horizontal_vertical?.horizontal_percentage}%` }}>
            H {analysis.horizontal_vertical?.horizontal_count}
          </div>
          <div className="hv-bar vertical" style={{ width: `${analysis.horizontal_vertical?.vertical_percentage}%` }}>
            V {analysis.horizontal_vertical?.vertical_count}
          </div>
        </div>
      </div>

      <div className="intersection-crisis glass">
        <h3>The Intersection Crisis</h3>
        <p>{analysis.intersections?.message}</p>
      </div>

      <div className="parallel-analysis glass">
        <h3>Most Organized Damage</h3>
        <p>{analysis.intersections?.parallel_analysis?.most_organized_damage}</p>
      </div>

      <div className="fun-facts glass">
        <h3>Image-Derived Fun Facts</h3>
        <ul>
          {analysis.fun_facts?.map((fact, i) => <li key={i}>{fact}</li>)}
        </ul>
      </div>

      <DisplayDNA displayDna={analysis.display_dna} />
      <RepairabilityIndex
        repairability={analysis.repairability}
        summary={summary}
        metrics={metrics}
        lines={analysis.lines}
        intersections={analysis.intersections}
      />
      <LineExplorer lines={analysis.lines} selectedLineId={selectedLineId} onSelectLine={setSelectedLineId} />

      <div className="final-message glass">
        <h2>YOUR SCREEN IS BROKEN.</h2>
        <p>BUT WE NOW HAVE {Object.keys(analysis.line_statistics || {}).length + (analysis.lines?.length || 0)} DIFFERENT STATISTICS TO PROVE IT.</p>
        <p className="disclaimer">{summary.disclaimer}</p>
      </div>
    </motion.div>
  );
}
