export default function SocialNetwork({ socialNetwork }) {
  if (!socialNetwork?.nodes?.length) return null;

  const maxConn = Math.max(...socialNetwork.nodes.map((n) => n.connections), 1);
  const size = 400;
  const center = size / 2;
  const radius = size / 2 - 40;

  const positioned = socialNetwork.nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / socialNetwork.nodes.length;
    return {
      ...node,
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });

  const nodeMap = Object.fromEntries(positioned.map((n) => [n.id, n]));

  return (
    <div className="chart-card glass social-network">
      <h3>{socialNetwork.title}</h3>
      <svg viewBox={`0 0 ${size} ${size}`} className="network-svg">
        {socialNetwork.edges.map((e, i) => {
          const s = nodeMap[e.source];
          const t = nodeMap[e.target];
          if (!s || !t) return null;
          return (
            <line
              key={i}
              x1={s.x} y1={s.y} x2={t.x} y2={t.y}
              stroke={e.type === 'intersection' ? '#ff6b6b' : e.type === 'parallel' ? '#60a5fa' : '#8899aa'}
              strokeWidth={1}
              opacity={0.4}
            />
          );
        })}
        {positioned.map((n) => (
          <g key={n.id}>
            <circle
              cx={n.x} cy={n.y}
              r={6 + (n.connections / maxConn) * 12}
              fill="#00ffaa"
              opacity={0.3 + (n.connections / maxConn) * 0.7}
            />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#fff" fontSize="8">{n.label}</text>
          </g>
        ))}
      </svg>
      <div className="network-stats">
        Most connected: Line #{socialNetwork.most_connected_line} ·
        Most isolated: Line #{socialNetwork.most_isolated_line} ·
        Communities: {socialNetwork.community_count}
      </div>
    </div>
  );
}
