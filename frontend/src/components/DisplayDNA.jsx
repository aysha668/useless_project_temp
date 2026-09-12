export default function DisplayDNA({ displayDna }) {
  if (!displayDna) return null;

  return (
    <div className="chart-card glass display-dna">
      <h3>Display DNA™</h3>
      <div className="dna-id">{displayDna.id}</div>
      <div className="dna-barcode">
        {displayDna.barcode?.slice(0, 32).map((bar, i) => (
          <div
            key={i}
            className="dna-bar"
            style={{ height: `${bar.height}%`, background: bar.color }}
          />
        ))}
      </div>
    </div>
  );
}
