import { useEffect } from 'react';
import  "../css/Modal.css"
export default function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className={`modal ${wide ? 'modal--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="modal__header">
          <h2>{title}</h2>
          <button className="btn btn--ghost" onClick={onClose} aria-label="Close">
            Close
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}