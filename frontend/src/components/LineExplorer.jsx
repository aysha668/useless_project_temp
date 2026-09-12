import { useMemo, useState } from 'react';

export default function LineExplorer({ lines, onSelectLine, selectedLineId }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('length');
  const [sortDir, setSortDir] = useState('desc');

  const filtered = useMemo(() => {
    let result = [...(lines || [])];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          String(l.id).includes(q) ||
          l.color.includes(q) ||
          l.orientation.includes(q) ||
          l.region.includes(q),
      );
    }
    result.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return result;
  }, [lines, search, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const selected = lines?.find((l) => l.id === selectedLineId);

  return (
    <div className="line-explorer glass">
      <h3>Interactive Line Explorer</h3>
      <input
        className="search-input"
        placeholder="Search by ID, color, orientation, region..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {['id', 'color', 'length', 'width', 'angle', 'orientation', 'brightness', 'intersections', 'region'].map((col) => (
                <th key={col} onClick={() => toggleSort(col)} className="sortable">
                  {col.toUpperCase()} {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((line) => (
              <tr
                key={line.id}
                className={selectedLineId === line.id ? 'selected' : ''}
                onClick={() => onSelectLine?.(line.id)}
              >
                <td>{line.id}</td>
                <td><span className={`color-dot ${line.color}`} />{line.color}</td>
                <td>{line.length.toFixed(1)}</td>
                <td>{line.width.toFixed(1)}</td>
                <td>{line.angle.toFixed(1)}°</td>
                <td>{line.orientation}</td>
                <td>{line.brightness.toFixed(0)}</td>
                <td>{line.intersections}</td>
                <td>{line.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="line-detail">
          <strong>Line #{selected.id}</strong> — {selected.length.toFixed(1)}px · {selected.color} ·
          Nearest line: {selected.nearest_line_distance.toFixed(1)}px ·
          {selected.intersections} intersections
        </div>
      )}
    </div>
  );
}
