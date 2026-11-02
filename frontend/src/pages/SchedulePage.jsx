import { useMemo, useState } from 'react';
import { scheduleApi } from '../api';
import useResource from '../hooks/useResourse';
import PageHeader from '../components/PageHeader';
import SummaryStrip from '../components/SummaryStrip';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import StatusBadge from '../components/StatusBadge';
import StatusDonut from '../components/StatusDonut';
import { formatDate, getId, labelize } from '../utils/helpers';
import { scheduleDummyData } from '../data/dummyData';

const STATUSES = ['scheduled', 'in-progress', 'completed', 'delayed'];

const FIELDS = [
  { name: 'scene', label: 'Scene / Shot', required: true },
  { name: 'shootDate', label: 'Shoot date', type: 'date', required: true },
  { name: 'startTime', label: 'Start time', type: 'time' },
  { name: 'endTime', label: 'End time', type: 'time' },
  { name: 'location', label: 'Location' },
  { name: 'status', label: 'Status', type: 'select', options: STATUSES, required: true },
  { name: 'notes', label: 'Notes', type: 'textarea', full: true },
];

export default function SchedulePage() {
  const { items, loading, error, save, remove } = useResource(scheduleApi, scheduleDummyData);
  const [editing, setEditing] = useState(null); // null = closed, {} = new record
  const [statusFilter, setStatusFilter] = useState('all');

  const rows = useMemo(() => {
    const sorted = [...items].sort((a, b) => String(a.shootDate).localeCompare(String(b.shootDate)));
    return statusFilter === 'all' ? sorted : sorted.filter((row) => row.status === statusFilter);
  }, [items, statusFilter]);

  const countBy = (status) => items.filter((item) => item.status === status).length;

  const columns = [
    { key: 'shootDate', label: 'Date', render: (row) => formatDate(row.shootDate) },
    { key: 'scene', label: 'Scene / Shot' },
    {
      key: 'time',
      label: 'Time',
      render: (row) => (row.startTime ? `${row.startTime} - ${row.endTime || '?'}` : '-'),
    },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Production Schedule"
        subtitle="Shooting days, scenes and timings in one place."
        actionLabel="Add shoot"
        onAction={() => setEditing({})}
      >
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {labelize(s)}
            </option>
          ))}
        </select>
      </PageHeader>

      <SummaryStrip
        items={[
          { label: 'Total shoots', value: items.length },
          { label: 'Scheduled', value: countBy('scheduled') },
          { label: 'In progress', value: countBy('in-progress') },
          { label: 'Delayed', value: countBy('delayed') },
        ]}
      />

      <StatusDonut
        title="Shoot status overview"
        data={STATUSES.map((status) => ({ key: status, value: countBy(status) }))}
      />

      {error && <p className="alert alert--error">{error}</p>}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyText="No shoots yet. Add the first one to start planning."
        onEdit={setEditing}
        onDelete={remove}
      />

      {editing && (
        <FormModal
          title={getId(editing) ? 'Edit shoot' : 'Add shoot'}
          fields={FIELDS}
          initialValues={editing}
          onSubmit={(values) => save(values, getId(editing))}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
