export function formatNumber(n, decimals = 1) {
  if (n == null || Number.isNaN(n)) return '—';
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export const CHART_COLORS = [
  '#00ffaa', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a78bfa',
  '#f472b6', '#60a5fa', '#fb923c', '#94a3b8', '#c084fc',
];

export const COLOR_MAP = {
  red: '#ff4d4d',
  green: '#10b981',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  magenta: '#d946ef',
  yellow: '#eab308',
  white: '#f8fafc',
  black: '#334155',
  gray: '#94a3b8',
  grey: '#94a3b8',
  orange: '#f97316',
  purple: '#a855f7',
  other: '#64748b',

  // Damage Area pie chart (Damaged Area MUST be RED!)
  'detected damaged area': '#ff4d4d',
  'remaining area': '#10b981',
  'damaged area': '#ff4d4d',
  'unaffected area': '#10b981',

  // Cluster Types pie chart
  'isolated pixels': '#60a5fa',
  'small clusters': '#f59e0b',
  'medium clusters': '#f97316',
  'large clusters': '#ef4444',
  'isolated': '#60a5fa',
  'small': '#f59e0b',
  'medium': '#f97316',
  'large': '#ef4444',
};

export function getColorForName(name, fallbackIndex = 0) {
  if (!name) return CHART_COLORS[fallbackIndex % CHART_COLORS.length];
  const key = String(name).toLowerCase().trim();
  return COLOR_MAP[key] || CHART_COLORS[fallbackIndex % CHART_COLORS.length];
}

export const HEATMAP_TYPES = [
  { key: 'damage', label: 'Damage Heatmap' },
  { key: 'line_density', label: 'Line Density' },
  { key: 'intersections', label: 'Intersection Heatmap' },
  { key: 'pixel_clusters', label: 'Pixel Cluster Heatmap' },
];

export const SCAN_STAGES = [
  'INITIALIZING FORENSICS...',
  'Image loaded',
  'Display region identified',
  'Noise analyzed',
  'Edges detected',
  'Lines detected',
  'Colors classified',
  'Pixel clusters identified',
  'Intersections calculated',
  'Spatial distribution mapped',
  'Uselessness calculated',
  'Report generated',
];

export function safeSetSessionStorage(key, value) {
  try {
    sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch (err) {
    console.warn(`[SessionStorage] Could not cache ${key} (Quota Exceeded):`, err);
    try {
      sessionStorage.clear();
      sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (retryErr) {
      // Ignore if browser quota strictly prevents caching
    }
  }
}
