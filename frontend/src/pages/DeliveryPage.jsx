import { useMemo, useState } from 'react';
import '../css/DeliveryPage.css';
import { deliveryApi } from '../api';
import useResource from '../hooks/useResourse';
import PageHeader from '../components/PageHeader';
import SummaryStrip from '../components/SummaryStrip';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import StatusBadge from '../components/StatusBadge';
import StatusDonut from '../components/StatusDonut';
import ProgressBar from '../components/ProgressBar';
import { formatDate, getId, labelize, percent, todayString } from '../utils/helpers';
import { getDeliveryStatus } from '../utils/delivery';
import { deliveryDummyData } from '../data/dummyData';

const STATUSES = ['pending', 'in-progress', 'delivered', 'delayed'];
const TYPES = ['master', 'subtitles', 'audio-stems', 'trailer', 'poster', 'metadata'];

const FIELDS = [
  { name: 'title', label: 'Deliverable', required: true, full: true },
  { name: 'type', label: 'Type', type: 'select', options: TYPES, required: true },
  { name: 'format', label: 'Format / spec' },
  { name: 'recipient', label: 'Delivered to', required: true },
  { name: 'dueDate', label: 'Due date', type: 'date', required: true },
  { name: 'deliveredOn', label: 'Delivered on', type: 'date' },
  { name: 'status', label: 'Status', type: 'select', options: STATUSES, required: true },
  { name: 'notes', label: 'Notes', type: 'textarea', full: true },
];

export default function DeliveryPage() {
  const { items, loading, error, save, remove } = useResource(deliveryApi, deliveryDummyData);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionError, setActionError] = useState('');

  const rows = useMemo(() => {
    const sorted = [...items].sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
    return statusFilter === 'all'
      ? sorted
      : sorted.filter((row) => getDeliveryStatus(row) === statusFilter);
  }, [items, statusFilter]);

  const countBy = (status) => items.filter((item) => getDeliveryStatus(item) === status).length;
  const deliveredPercent = percent(countBy('delivered'), items.length);

  const markDelivered = async (row) => {
    try {
      setActionError('');
      await save({ ...row, status: 'delivered', deliveredOn: todayString() }, getId(row));
    } catch (err) {
      setActionError(err.message);
    }
  };

  const columns = [
    { key: 'title', label: 'Deliverable' },
    { key: 'type', label: 'Type', render: (row) => labelize(row.type) },
    { key: 'recipient', label: 'Delivered to' },
    {
      key: 'dueDate',
      label: 'Due',
      render: (row) => (
        <span className={getDeliveryStatus(row) === 'delayed' ? 'text-bad' : ''}>
          {formatDate(row.dueDate)}
        </span>
      ),
    },
    { key: 'deliveredOn', label: 'Delivered on', render: (row) => formatDate(row.deliveredOn) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge value={getDeliveryStatus(row)} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Final Delivery"
        subtitle="Track every master, subtitle and asset that has to leave the building."
        actionLabel="Add deliverable"
        onAction={() => setEditing({ status: 'pending' })}
      >
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {labelize(status)}
            </option>
          ))}
        </select>
      </PageHeader>

      <SummaryStrip
        items={[
          { label: 'Total items', value: items.length },
          { label: 'Delivered', value: countBy('delivered') },
          { label: 'In progress', value: countBy('in-progress') },
          { label: 'Delayed', value: countBy('delayed') },
        ]}
      />

      <div className="delivery-overview">
        <StatusDonut
          title="Delivery status"
          data={STATUSES.map((status) => ({ key: status, value: countBy(status) }))}
        />
        <ProgressBar label="Delivered so far" value={deliveredPercent} />
      </div>

      {(error || actionError) && <p className="alert alert--error">{actionError || error}</p>}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyText="No deliverables found. Add the first one to start tracking."
        onEdit={setEditing}
        onDelete={remove}
        extraActions={(row) =>
          getDeliveryStatus(row) !== 'delivered' && (
            <button className="btn btn--link" onClick={() => markDelivered(row)}>
              Mark delivered
            </button>
          )
        }
      />

      {editing && (
        <FormModal
          title={getId(editing) ? 'Edit deliverable' : 'Add deliverable'}
          fields={FIELDS}
          initialValues={editing}
          onSubmit={(values) => save(values, getId(editing))}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}