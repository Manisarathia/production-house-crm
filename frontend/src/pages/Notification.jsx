import { useMemo, useState } from 'react';
import { notificationApi } from '../api';
import useResource from '../hooks/useResourse';
import PageHeader from '../components/PageHeader';
import SummaryStrip from '../components/SummaryStrip';
import FormModal from '../components/FormModal';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime, getId, labelize } from '../utils/helpers';
import { notificationDummyData } from '../data/dummyData';
import '../css/NotificationPage.css';

const TYPES = ['delivery', 'approval', 'ott', 'schedule', 'general'];
const LEVELS = ['info', 'success', 'warning', 'critical'];

const FIELDS = [
  { name: 'title', label: 'Title', required: true, full: true },
  { name: 'type', label: 'Category', type: 'select', options: TYPES, required: true },
  { name: 'level', label: 'Level', type: 'select', options: LEVELS, required: true },
  { name: 'message', label: 'Message', type: 'textarea', required: true, full: true },
];

export default function NotificationsPage() {
  const { items, loading, error, save, remove, reload } = useResource(notificationApi, notificationDummyData);
  const [creating, setCreating] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionError, setActionError] = useState('');

  const unread = items.filter((item) => !item.read);

  const rows = useMemo(() => {
    return [...items]
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .filter((item) => (onlyUnread ? !item.read : true))
      .filter((item) => (typeFilter === 'all' ? true : item.type === typeFilter));
  }, [items, onlyUnread, typeFilter]);

  const run = async (action) => {
    try {
      setActionError('');
      await action();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const markRead = (item) => run(() => save({ ...item, read: true }, getId(item)));

  const markAllRead = () =>
    run(async () => {
      await Promise.all(unread.map((item) => notificationApi.update(getId(item), { ...item, read: true })));
      await reload();
    });

  const handleDelete = (item) => {
    if (window.confirm('Are you sure you want to delete this notification?')) run(() => remove(getId(item)));
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Delivery, approval and publishing alerts in one inbox."
        actionLabel="Send alert"
        onAction={() => setCreating(true)}
      >
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All categories</option>
          {TYPES.map((type) => (
            <option key={type} value={type}>
              {labelize(type)}
            </option>
          ))}
        </select>
        <button className="btn btn--ghost" onClick={() => setOnlyUnread((value) => !value)}>
          {onlyUnread ? 'Show all' : 'Unread only'}
        </button>
        <button className="btn btn--ghost" onClick={markAllRead} disabled={!unread.length}>
          Mark all read
        </button>
      </PageHeader>

      <SummaryStrip
        items={[
          { label: 'Unread', value: unread.length },
          { label: 'Critical', value: items.filter((item) => item.level === 'critical' && !item.read).length },
          { label: 'Total', value: items.length },
        ]}
      />

      {(error || actionError) && <p className="alert alert--error">{actionError || error}</p>}
      {loading && <p className="state">Loading...</p>}
      {!loading && !rows.length && <p className="state">You are all caught up.</p>}

      <ul className="notices">
        {rows.map((item) => (
          <li key={getId(item)} className={`notice ${item.read ? '' : 'notice--unread'}`}>
            <div className="notice__body">
              <div className="notice__top">
                <h3>{item.title}</h3>
                <StatusBadge value={item.level} />
              </div>
              <p>{item.message}</p>
              <p className="notice__meta">
                {labelize(item.type)} · {formatDateTime(item.createdAt)}
              </p>
            </div>
            <div className="notice__actions">
              {!item.read && (
                <button className="btn btn--link" onClick={() => markRead(item)}>
                  Mark read
                </button>
              )}
              <button className="btn btn--link btn--danger" onClick={() => handleDelete(item)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {creating && (
        <FormModal
          title="Send alert"
          fields={FIELDS}
          initialValues={{ type: 'general', level: 'info' }}
          onSubmit={(values) => save({ ...values, read: false, createdAt: new Date().toISOString() })}
          onClose={() => setCreating(false)}
        />
      )}
    </>
  );
}
