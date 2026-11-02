import "../css/Pageheader.css"



export default function PageHeader({ title, subtitle, actionLabel, onAction, children }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="page-header__tools">
        {children}
        {actionLabel && (
          <button className="btn btn--primary" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}