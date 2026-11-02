
import "../css/SummaryStrip.css"


export default function SummaryStrip({ items }) {
  return (
    <div className="summary">
      {items.map(({ label, value }) => (
        <div className="summary__item" key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}