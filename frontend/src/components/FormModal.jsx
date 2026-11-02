import { useState } from 'react';
import Modal from './Modal';
import { labelize, toInputDate } from '../utils/helpers';
import "../css/FormModal.css"

const buildInitialValues = (fields, initial = {}) =>
  fields.reduce((acc, field) => {
    const value = initial[field.name] ?? '';
    acc[field.name] = field.type === 'date' ? toInputDate(value) : value;
    return acc;
  }, {});

export default function FormModal({ title, fields, initialValues, onSubmit, onClose }) {
  const [values, setValues] = useState(() => buildInitialValues(fields, initialValues));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const renderInput = (field) => {
    const common = {
      id: field.name,
      name: field.name,
      value: values[field.name],
      onChange: handleChange,
      required: field.required,
    };

    if (field.type === 'select') {
      return (
        <select {...common}>
          <option value="">Select</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {labelize(option)}
            </option>
          ))}
        </select>
      );
    }
    if (field.type === 'textarea') return <textarea rows={3} {...common} />;
    return <input type={field.type || 'text'} {...common} />;
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form__grid">
          {fields.map((field) => (
            <label
              key={field.name}
              htmlFor={field.name}
              className={`field ${field.full ? 'field--full' : ''}`}
            >
              <span>{field.label}</span>
              {renderInput(field)}
            </label>
          ))}
        </div>
        {error && <p className="alert alert--error">{error}</p>}
        <footer className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}