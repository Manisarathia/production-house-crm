import { Pencil, Trash2 } from 'lucide-react';

export function EditActionButton({ onClick, label = 'Edit record' }) {
  return (
    <button type="button" className="record-action record-action--edit" onClick={onClick} title={label} aria-label={label}>
      <Pencil size={16} aria-hidden="true" />
    </button>
  );
}

export function DeleteActionButton({ onClick, label = 'Delete record' }) {
  return (
    <button type="button" className="record-action record-action--delete" onClick={onClick} title={label} aria-label={label}>
      <Trash2 size={16} aria-hidden="true" />
    </button>
  );
}
