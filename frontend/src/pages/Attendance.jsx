import { useMemo, useState } from 'react';
import { attendanceApi } from '../api';
import useResource from '../hooks/useResourse';
import PageHeader from '../components/PageHeader';
import SummaryStrip from '../components/SummaryStrip';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import StatusBadge from '../components/StatusBadge';
import StatusDonut from '../components/StatusDonut';
import { formatDate, getId, todayString, toInputDate } from '../utils/helpers';
import { attendanceDummyData } from '../data/dummyData';

const FIELDS = [
  { name: 'crewMember', label: 'Crew member', required: true },
  { name: 'role', label: 'Role' },
  { name: 'date', label: 'Date', type: 'date', required: true },
  {
    name: 'status', label: 'Status', type: 'select',
    options: ['present', 'late', 'absent', 'on-leave'], required: true
  },
  { name: 'checkIn', label: 'Check in', type: 'time' },
  { name: 'checkOut', label: 'Check out', type: 'time' },
];

const COLUMNS = [
  { key: 'crewMember', label: 'Crew member' },
  { key: 'role', label: 'Role' },
  { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
  { key: 'checkIn', label: 'In' },
  { key: 'checkOut', label: 'Out' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
];

export default function AttendancePage() {
  const { items, loading, error, save, remove } = useResource(attendanceApi, attendanceDummyData);
  const [editing, setEditing] = useState(null);
  const [date, setDate] = useState(todayString());

  const rows = useMemo(
    () => (date ? items.filter((row) => toInputDate(row.date) === date) : items),
    [items, date]
  );

  const countBy = (status) => rows.filter((row) => row.status === status).length;

  return (
    <>
      <PageHeader
        title="Attendance"
        subtitle="Who reported to set, and when."
        actionLabel="Mark attendance"
        onAction={() => setEditing({ date: todayString(), status: 'present' })}
      >
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        {date && (
          <button className="btn btn--ghost" onClick={() => setDate('')}>
            All dates
          </button>
        )}
      </PageHeader>

      <SummaryStrip
        items={[
          { label: 'Present', value: countBy('present') },
          { label: 'Late', value: countBy('late') },
          { label: 'Absent', value: countBy('absent') },
          { label: 'On leave', value: countBy('on-leave') },
        ]}
      />

      <StatusDonut
        title="Today's crew status"
        data={['present', 'late', 'absent', 'on-leave'].map((status) => ({ key: status, value: countBy(status) }))}
      />

      {error && <p className="alert alert--error">{error}</p>}

      <DataTable
        columns={COLUMNS}
        rows={rows}
        loading={loading}
        emptyText="No attendance marked for this selection."
        onEdit={setEditing}
        onDelete={remove}
      />

      {editing && (
        <FormModal
          title={getId(editing) ? 'Edit attendance' : 'Mark attendance'}
          fields={FIELDS}
          initialValues={editing}
          onSubmit={(values) => save(values, getId(editing))}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
