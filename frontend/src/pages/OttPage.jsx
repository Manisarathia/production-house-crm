import { useMemo, useState } from 'react';
import { ottApi } from '../api';
import useResource from '../hooks/useResourse';
import PageHeader from '../components/PageHeader';
import SummaryStrip from '../components/SummaryStrip';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import StatusBadge from '../components/StatusBadge';
import StatusDonut from '../components/StatusDonut';
import { formatDate, getId, isPastDate, labelize, todayString } from '../utils/helpers';
import { ottDummyData } from '../data/dummyData';

const STATUSES = ['draft', 'in-review', 'scheduled', 'published', 'failed'];
const PLATFORMS = ['Sun NXT', 'Prime Video', 'Netflix', 'Disney+ Hotstar', 'Aha', 'Other'];
const CONTENT_TYPES = ['movie', 'series', 'short-film', 'trailer'];


const NEXT_STATUS = {
  draft: 'in-review',
  'in-review': 'scheduled',
  scheduled: 'published',
  failed: 'scheduled',
};

const FIELDS = [
  { name: 'title', label: 'Title', required: true, full: true },
  { name: 'platform', label: 'Platform', type: 'select', options: PLATFORMS, required: true },
  { name: 'contentType', label: 'Content type', type: 'select', options: CONTENT_TYPES },
  { name: 'region', label: 'Region' },
  { name: 'releaseDate', label: 'Release date', type: 'date', required: true },
  { name: 'publishedOn', label: 'Published on', type: 'date' },
  { name: 'status', label: 'Status', type: 'select', options: STATUSES, required: true },
  { name: 'contentUrl', label: 'Watch link', type: 'url' },
  { name: 'notes', label: 'Notes / platform feedback', type: 'textarea', full: true },
];

export default function OttPage() {
  const { items, loading, error, save, remove } = useResource(ottApi, ottDummyData);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [actionError, setActionError] = useState('');

  const rows = useMemo(() => {
    return [...items]
      .sort((a, b) => String(a.releaseDate).localeCompare(String(b.releaseDate)))
      .filter((row) => (statusFilter === 'all' ? true : row.status === statusFilter))
      .filter((row) => (platformFilter === 'all' ? true : row.platform === platformFilter));
  }, [items, statusFilter, platformFilter]);

  const countBy = (status) => items.filter((item) => item.status === status).length;

  const advance = async (row) => {
    const next = NEXT_STATUS[row.status];
    if (!next) return;
    const payload = { ...row, status: next };
    if (next === 'published') payload.publishedOn = todayString();

    try {
      setActionError('');
      await save(payload, getId(row));
    } catch (err) {
      setActionError(err.message);
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'platform', label: 'Platform' },
    { key: 'region', label: 'Region' },
    {
      key: 'releaseDate',
      label: 'Release',
      render: (row) => {
        const late = row.status !== 'published' && isPastDate(row.releaseDate);
        return <span className={late ? 'text-bad' : ''}>{formatDate(row.releaseDate)}</span>;
      },
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'notes', label: 'Notes' },
    {
      key: 'contentUrl',
      label: 'Link',
      render: (row) =>
        row.contentUrl ? (
          <a href={row.contentUrl} target="_blank" rel="noreferrer">
            Open
          </a>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="OTT Publishing"
        subtitle="Follow each title from draft to live on every platform."
        actionLabel="Add release"
        onAction={() => setEditing({ status: 'draft' })}
      >
        <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
          <option value="all">All platforms</option>
          {PLATFORMS.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>
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
          { label: 'Published', value: countBy('published') },
          { label: 'Scheduled', value: countBy('scheduled') },
          { label: 'In review', value: countBy('in-review') },
          { label: 'Failed', value: countBy('failed') },
        ]}
      />

      <StatusDonut
        title="Publishing status"
        data={STATUSES.map((status) => ({ key: status, value: countBy(status) }))}
      />

      {(error || actionError) && <p className="alert alert--error">{actionError || error}</p>}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyText="Nothing to publish yet. Add a release to get started."
        onEdit={setEditing}
        onDelete={remove}
        extraActions={(row) =>
          NEXT_STATUS[row.status] && (
            <button className="btn btn--link" onClick={() => advance(row)}>
              {row.status === 'failed' ? 'Retry' : `Move to ${labelize(NEXT_STATUS[row.status])}`}
            </button>
          )
        }
      />

      {editing && (
        <FormModal
          title={getId(editing) ? 'Edit release' : 'Add release'}
          fields={FIELDS}
          initialValues={editing}
          onSubmit={(values) => save(values, getId(editing))}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}