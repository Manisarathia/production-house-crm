export const getId = (item) => item?._id ?? item?.id;

export const toInputDate = (value) => (value ? String(value).slice(0, 10) : '');

export const todayString = () => new Date().toISOString().slice(0, 10);

export const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const labelize = (text = '') =>
  text.replace(/[-_]/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export const isPastDate = (value) => !!value && toInputDate(value) < todayString();

export const daysFromToday = (value) =>
  Math.round((new Date(toInputDate(value)) - new Date(todayString())) / 86400000);

export const percent = (part, total) => (total ? Math.round((part / total) * 100) : 0);


export const downloadCsv = (filename, rows) => {
  const escape = (cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`;
  const csv = rows.map((row) => row.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};