import { getId } from '../utils/helpers';
import '../css/Datatable.css';
export default function DataTable({ columns,
     rows, loading, emptyText,
      onEdit, onDelete, extraActions }) {
  const handleDelete = (row) => {
    if (window.confirm('Are you sure you want to delete this record?')) onDelete(getId(row));
  };

  const hasActions = Boolean(onEdit || onDelete || extraActions);

  if (loading) return <p className="state">Loading...</p>;
  if (!rows.length) return <p className="state">{emptyText}</p>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {hasActions && <th aria-label="Actions" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getId(row)}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key] || '-'}</td>
              ))}
              {hasActions && (
                <td className="table__actions">
                  {extraActions?.(row)}
                  {onEdit && (
                    <button className="btn btn--link" onClick={() => onEdit(row)}>
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button className="btn btn--link btn--danger" onClick={() => handleDelete(row)}>
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
