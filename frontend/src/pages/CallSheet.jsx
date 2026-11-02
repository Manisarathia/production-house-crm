import { useState } from 'react';
import { callSheetApi } from '../api';
import useResource from '../hooks/useResourse';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import Modal from '../components/Modal';
import { formatDate, getId } from '../utils/helpers';
import { callSheetDummyData } from '../data/dummyData';
import "../css/CallsheetPage.css"
const FIELDS = [
  { name: 'title', label: 'Call sheet title', required: true, full: true },
  { name: 'shootDate', label: 'Shoot date', type: 'date', required: true },
  { name: 'generalCallTime', label: 'General call time', type: 'time', required: true },
  { name: 'location', label: 'Location' },
  { name: 'weather', label: 'Weather' },
  { name: 'scenes', label: 'Scenes to shoot', type: 'textarea', full: true },
  { name: 'notes', label: 'Crew notes', type: 'textarea', full: true },
];

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'shootDate', label: 'Shoot date', render: (row) => formatDate(row.shootDate) },
  { key: 'generalCallTime', label: 'Call time' },
  { key: 'location', label: 'Location' },
];

function CallSheetView({ sheet, onClose }) {
  const details = [
    ['Shoot date', formatDate(sheet.shootDate)],
    ['General call', sheet.generalCallTime],
    ['Location', sheet.location],
    ['Weather', sheet.weather],
  ];

  return (
    <Modal title={sheet.title} onClose={onClose} wide>
      <div className="sheet" id="print-area">
        <dl className="sheet__details">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value || '-'}</dd>
            </div>
          ))}
        </dl>
        <h3>Scenes</h3>
        <p className="sheet__text">{sheet.scenes || 'No scenes listed.'}</p>
        <h3>Crew notes</h3>
        <p className="sheet__text">{sheet.notes || 'No notes.'}</p>
      </div>
      <footer className="form__actions">
        <button className="btn btn--primary" onClick={() => window.print()}>
          Print call sheet
        </button>
      </footer>
    </Modal>
  );
}

export default function CallSheetsPage() {
  const { items, loading, error, save, remove } = useResource(callSheetApi, callSheetDummyData);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  return (
    <>
      <PageHeader
        title="Call Sheets"
        subtitle="Daily call sheets the crew can open and print."
        actionLabel="New call sheet"
        onAction={() => setEditing({})}
      />

      {error && <p className="alert alert--error">{error}</p>}

      <DataTable
        columns={COLUMNS}
        rows={items}
        loading={loading}
        emptyText="No call sheets yet. Create one for your next shoot day."
        onEdit={setEditing}
        onDelete={remove}
        extraActions={(row) => (
          <button className="btn btn--link" onClick={() => setViewing(row)}>
            View
          </button>
        )}
      />

      {editing && (
        <FormModal
          title={getId(editing) ? 'Edit call sheet' : 'New call sheet'}
          fields={FIELDS}
          initialValues={editing}
          onSubmit={(values) => save(values, getId(editing))}
          onClose={() => setEditing(null)}
        />
      )}
      {viewing && <CallSheetView sheet={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
