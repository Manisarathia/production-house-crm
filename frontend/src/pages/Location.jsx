import { useState } from 'react';
import { locationApi } from '../api';
import useResource from '../hooks/useResourse';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import StatusBadge from '../components/StatusBadge';
import { daysFromToday, formatDate, getId } from '../utils/helpers';
import { locationDummyData } from '../data/dummyData';

const FIELDS = [
  { name: 'name', label: 'Location name', required: true },
  { name: 'address', label: 'Address', required: true },
  { name: 'contactPerson', label: 'Contact person' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'permitNumber', label: 'Permit number' },
  { name: 'permitStatus', label: 'Permit status', type: 'select', options: ['pending', 'approved', 'rejected', 'expired'], required: true },
  { name: 'permitExpiry', label: 'Permit valid till', type: 'date' },
];


const renderExpiry = (row) => {
  if (!row.permitExpiry) return '-';
  const days = daysFromToday(row.permitExpiry);
  const soon = days >= 0 && days <= 7;
  return (
    <span className={days < 0 || soon ? 'text-bad' : ''}>
      {formatDate(row.permitExpiry)}
      {soon && ` (${days}d left)`}
    </span>
  );
};

const COLUMNS = [
  { key: 'name', label: 'Location' },
  { key: 'address', label: 'Address' },
  { key: 'contactPerson', label: 'Contact', render: (row) => [row.contactPerson, row.phone].filter(Boolean).join(' / ') || '-' },
  { key: 'permitNumber', label: 'Permit no.' },
  { key: 'permitStatus', label: 'Permit', render: (row) => <StatusBadge value={row.permitStatus} /> },
  { key: 'permitExpiry', label: 'Valid till', render: renderExpiry },
];

export default function Location() {
  const { items, loading, error, save, remove } = useResource(locationApi, locationDummyData);
  const [editing, setEditing] = useState(null);

  return (
    <>
      <PageHeader
        title="Locations & Shooting Permits"
        subtitle="Keep every location and its permit status under control."
        actionLabel="Add location"
        onAction={() => setEditing({ permitStatus: 'pending' })}
      />

      {error && <p className="alert alert--error">{error}</p>}

      <DataTable
        columns={COLUMNS}
        rows={items}
        loading={loading}
        emptyText="No locations added yet."
        onEdit={setEditing}
        onDelete={remove}
      />

      {editing && (
        <FormModal
          title={getId(editing) ? 'Edit location' : 'Add location'}
          fields={FIELDS}
          initialValues={editing}
          onSubmit={(values) => save(values, getId(editing))}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
