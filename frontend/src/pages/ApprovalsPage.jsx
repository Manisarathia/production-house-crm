import { useMemo, useState } from 'react';
import { approvalApi } from '../api';
import useResource from '../hooks/useResourse';
import PageHeader from '../components/PageHeader';
import SummaryStrip from '../components/SummaryStrip';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import StatusBadge from '../components/StatusBadge';
import StatusDonut from '../components/StatusDonut';
import { formatDate, getId, labelize, todayString } from '../utils/helpers';
import { approvalDummyData } from '../data/dummyData';
import '../css/ApprovelPage.css';

const STAGES = ['director', 'producer', 'studio-head'];
const STATUSES = ['pending', 'approved', 'rejected'];
const TYPES = ['rough-cut', 'final-cut', 'audio-mix', 'subtitles', 'poster', 'final-master'];

const FIELDS = [
  { name: 'title', label: 'Item for approval', required: true, full: true },
  { name: 'type', label: 'Type', type: 'select', options: TYPES, required: true },
  { name: 'requestedBy', label: 'Requested by', required: true },
  { name: 'stage', label: 'Current stage', type: 'select', options: STAGES, required: true },
  { name: 'status', label: 'Status', type: 'select', options: STATUSES, required: true },
  { name: 'requestedOn', label: 'Requested on', type: 'date' },
  { name: 'remarks', label: 'Remarks', type: 'textarea', full: true },
];

const REJECT_FIELDS = [
  { name: 'remarks', label: 'Reason for rejection', type: 'textarea', required: true, full: true },
];

function StageTrack({ stage, status }) {
  const current = STAGES.indexOf(stage);

  return (
    <ol className="stages">
      {STAGES.map((name, index) => {
        let state = 'upcoming';
        if (status === 'approved' || index < current) state = 'done';
        else if (index === current) state = status === 'rejected' ? 'rejected' : 'current';

        return (
          <li key={name} className={`stages__step stages__step--${state}`}>
            {labelize(name)}
          </li>
        );
      })}
    </ol>
  );
}

export default function ApprovalsPage() {
  const { items, loading, error, save, remove } = useResource(approvalApi, approvalDummyData);
  const [editing, setEditing] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionError, setActionError] = useState('');

  const rows = useMemo(() => {
    const sorted = [...items].sort((a, b) => String(b.requestedOn).localeCompare(String(a.requestedOn)));
    return statusFilter === 'all' ? sorted : sorted.filter((row) => row.status === statusFilter);
  }, [items, statusFilter]);

  const countBy = (status) => items.filter((item) => item.status === status).length;

  const approve = async (row) => {
    const nextStage = STAGES[STAGES.indexOf(row.stage) + 1];
    const payload = nextStage
      ? { ...row, stage: nextStage }
      : { ...row, status: 'approved', decidedOn: todayString() };

    try {
      setActionError('');
      await save(payload, getId(row));
    } catch (err) {
      setActionError(err.message);
    }
  };

  const reject = (row, values) =>
    save({ ...row, status: 'rejected', remarks: values.remarks, decidedOn: todayString() }, getId(row));

  const columns = [
    { key: 'title', label: 'Item' },
    { key: 'type', label: 'Type', render: (row) => labelize(row.type) },
    { key: 'requestedBy', label: 'Requested by' },
    { key: 'requestedOn', label: 'Requested', render: (row) => formatDate(row.requestedOn) },
    { key: 'stage', label: 'Approval flow', render: (row) => <StageTrack stage={row.stage} status={row.status} /> },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'remarks', label: 'Remarks' },
  ];

  return (
    <>
      <PageHeader
        title="Approvals"
        subtitle="Cuts, mixes and artwork go through director, producer and studio sign-off."
        actionLabel="Request approval"
        onAction={() => setEditing({ stage: STAGES[0], status: 'pending', requestedOn: todayString() })}
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
          { label: 'Pending', value: countBy('pending') },
          { label: 'Approved', value: countBy('approved') },
          { label: 'Rejected', value: countBy('rejected') },
        ]}
      />

      <StatusDonut
        title="Approval status"
        data={STATUSES.map((status) => ({ key: status, value: countBy(status) }))}
      />

      {(error || actionError) && <p className="alert alert--error">{actionError || error}</p>}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyText="No approval requests yet."
        onEdit={setEditing}
        onDelete={remove}
        extraActions={(row) =>
          row.status === 'pending' && (
            <>
              <button className="btn btn--link" onClick={() => approve(row)}>
                Approve
              </button>
              <button className="btn btn--link btn--danger" onClick={() => setRejecting(row)}>
                Reject
              </button>
            </>
          )
        }
      />

      {editing && (
        <FormModal
          title={getId(editing) ? 'Edit approval' : 'Request approval'}
          fields={FIELDS}
          initialValues={editing}
          onSubmit={(values) => save(values, getId(editing))}
          onClose={() => setEditing(null)}
        />
      )}

      {rejecting && (
        <FormModal
          title={`Reject "${rejecting.title}"`}
          fields={REJECT_FIELDS}
          initialValues={rejecting}
          onSubmit={(values) => reject(rejecting, values)}
          onClose={() => setRejecting(null)}
        />
      )}
    </>
  );
}
