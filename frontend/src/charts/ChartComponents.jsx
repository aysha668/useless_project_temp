import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from 'recharts';
import { CHART_COLORS, getColorForName } from '../utils/formatters';

export function DonutChart({ data, title }) {
  if (!data?.length) return <EmptyChart title={title} />;
  return (
    <div className="chart-card glass">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill || getColorForName(entry.name, i)} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: '#0a1628', border: '1px solid #00ffaa33' }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChartCard({ data, title, dataKey = 'value', nameKey = 'name' }) {
  if (!data?.length) return <EmptyChart title={title} />;
  return (
    <div className="chart-card glass">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
          <XAxis dataKey={nameKey} tick={{ fill: '#8899aa', fontSize: 11 }} />
          <YAxis tick={{ fill: '#8899aa', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#0a1628', border: '1px solid #00ffaa33' }} />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill || getColorForName(entry[nameKey], i)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HistogramChart({ histogram, title }) {
  if (!histogram?.bins?.length) return <EmptyChart title={title} />;
  const data = histogram.bins.map((b, i) => ({ bin: b, count: histogram.counts[i] }));
  return (
    <div className="chart-card glass">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
          <XAxis dataKey="bin" tick={{ fill: '#8899aa', fontSize: 10 }} />
          <YAxis tick={{ fill: '#8899aa', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#0a1628', border: '1px solid #00ffaa33' }} />
          <Bar dataKey="count" fill="#00ffaa" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScatterChartCard({ data, title, xLabel, yLabel }) {
  if (!data?.length) return <EmptyChart title={title} />;
  return (
    <div className="chart-card glass">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
          <XAxis type="number" dataKey="x" name={xLabel} tick={{ fill: '#8899aa', fontSize: 11 }} />
          <YAxis type="number" dataKey="y" name={yLabel} tick={{ fill: '#8899aa', fontSize: 11 }} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#0a1628', border: '1px solid #00ffaa33' }} />
          <Scatter data={data} fill="#00ffaa" fillOpacity={0.7} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyChart({ title }) {
  return (
    <div className="chart-card glass">
      <h3>{title}</h3>
      <div className="empty-chart">No data detected</div>
    </div>
  );
}
