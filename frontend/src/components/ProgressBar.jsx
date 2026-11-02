import '../css/ProgressBar.css';

export default function ProgressBar({ label, value }) {
  return (
    <div className="progress">
      <div className="progress__head">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div
        className="progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress__fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}