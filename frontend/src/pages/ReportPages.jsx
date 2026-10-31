import { useMemo, useState } from 'react';
import { approvalApi, attendanceApi, deliveryApi, ottApi, scheduleApi, taskApi } from '../api';
import useResource from '../hooks/useResourse';
import PageHeader from '../components/PageHeader';
import SummaryStrip from '../components/SummaryStrip';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import StatusDonut from '../components/StatusDonut';
import ProgressBar from '../components/ProgressBar';
import { formatDate, downloadCsv, percent, todayString } from '../utils/helpers';
import { getDeliveryStatus } from '../utils/delivery';
import {
  approvalDummyData,
  attendanceDummyData,
  deliveryDummyData,
  ottDummyData,
  scheduleDummyData,
  taskDummyData,
} from '../data/dummyData';
import '../css/ReportsPage.css';

const countWhere = (list, test) => list.filter(test).length;

const donutData = (list, statuses, getStatus = (item) => item.status) =>
  statuses.map((key) => ({ key, value: countWhere(list, (item) => getStatus(item) === key) }));

export default function ReportsPage() {
  const [selectedChart, setSelectedChart] = useState('schedule');
  const schedules = useResource(scheduleApi, scheduleDummyData);
  const tasks = useResource(taskApi, taskDummyData);
  const attendance = useResource(attendanceApi, attendanceDummyData);
  const deliveries = useResource(deliveryApi, deliveryDummyData);
  const approvals = useResource(approvalApi, approvalDummyData);
  const ott = useResource(ottApi, ottDummyData);

  const sources = [schedules, tasks, attendance, deliveries, approvals, ott];
  const loading = sources.some((source) => source.loading);
  const error = sources.find((source) => source.error)?.error;

  const report = useMemo(() => {
    const scheduleItems = schedules.items;
    const taskItems = tasks.items;
    const deliveryItems = deliveries.items;
    const approvalItems = approvals.items;
    const ottItems = ott.items;


    const today = todayString();
    const crewToday = attendance.items.filter((row) => String(row.date).slice(0, 10) === today);
    const reported = countWhere(crewToday, (row) => row.status === 'present' || row.status === 'late');

    const modules = [
      { module: 'Production schedule',
         total: scheduleItems.length,
          done: countWhere(scheduleItems, (i) => i.status === 'completed') },
      { module: 'Tasks',
         total: taskItems.length,
          done: countWhere(taskItems, (i) => i.status === 'done') },
      { module: 'Final delivery',
         total: deliveryItems.length, 
         done: countWhere(deliveryItems, (i) => i.status === 'delivered') },
      { module: 'Approvals',
         total: approvalItems.length, 
         done: countWhere(approvalItems, (i) => i.status === 'approved') },
      { module: 'OTT publishing',
         total: ottItems.length,
          done: countWhere(ottItems, (i) => i.status === 'published') },
    ].map((row) => ({ ...row, open: row.total - row.done, progress: percent(row.done, row.total) }));

    const attention = [
      ...deliveryItems
        .filter((item) => getDeliveryStatus(item) === 'delayed')
        .map((item) => ({ id: `delivery-${item.id ?? item._id}`,
             area: 'Delivery',
              text: `${item.title} (due ${formatDate(item.dueDate)})`, level: 'delayed' })),
      ...ottItems
        .filter((item) => item.status === 'failed')
        .map((item) => ({ id: `ott-${item.id ?? item._id}`, 
            area: 'OTT',
             text: `${item.title} on ${item.platform}`, level: 'failed' })),
      ...approvalItems
        .filter((item) => item.status === 'rejected')
        .map((item) => ({ id: `approval-${item.id ?? item._id}`,
             area: 'Approval', 
             text: `${item.title} was rejected`, level: 'rejected' })),
    ];

    return {
      modules,
      attention,
      attendanceRate: percent(reported, crewToday.length),
      pendingApprovals: countWhere(approvalItems, (i) => i.status === 'pending'),
      live: countWhere(ottItems, (i) => i.status === 'published'),
    };
  }, [schedules.items, tasks.items,
     attendance.items, deliveries.items,
      approvals.items, ott.items]);

  const progressOf = (name) => report.modules.find(
    (row) => row.module === name)?.progress ?? 0;

  const chartOptions = [
    {
      id: 'schedule',
      label: 'Schedule',
      data: donutData(schedules.items, ['scheduled', 'in-progress', 'completed', 'delayed']),
    },
    {
      id: 'tasks',
      label: 'Tasks',
      data: donutData(tasks.items, ['todo', 'in-progress', 'done']),
    },
    {
      id: 'deliveries',
      label: 'Deliveries',
      data: donutData(
        deliveries.items,
        ['pending', 'in-progress', 'delivered', 'delayed'],
        getDeliveryStatus,
      ),
    },
    {
      id: 'approvals',
      label: 'Approvals',
      data: donutData(approvals.items, ['pending', 'approved', 'rejected']),
    },
    {
      id: 'ott',
      label: 'OTT publishing',
      data: donutData(ott.items, ['draft', 'in-review', 'scheduled', 'published', 'failed']),
    },
  ];
  const activeChart = chartOptions.find((chart) => chart.id === selectedChart) ?? chartOptions[0];

  const exportCsv = () => {
    downloadCsv(`production-report-${todayString()}.csv`, [
      ['Module', 'Total', 'Completed', 'Open', 'Progress %'],
      ...report.modules.map((row) => [row.module, row.total, row.done, row.open, row.progress]),
      ['Attendance rate today', '', '', '', report.attendanceRate],
    ]);
  };

  const moduleColumns = [
    { key: 'module', label: 'Module' },
    { key: 'total', label: 'Total' },
    { key: 'done', label: 'Completed' },
    { key: 'open', label: 'Open' },
    {
      key: 'progress',
      label: 'Progress',
      render: (row) => <ProgressBar label="Done" value={row.progress} />,
    },
  ];

  const attentionColumns = [
    { key: 'area', label: 'Area' },
    { key: 'text', label: 'Issue' },
    { key: 'level', label: 'Status', render: (row) => <StatusBadge value={row.level} /> },
  ];

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        subtitle="One look at how the whole production is moving."
        actionLabel="Export CSV"
        onAction={exportCsv}
      />

      {error && <p className="alert alert--error">{error}</p>}

      <SummaryStrip
        items={[
          { label: 'Shoot days completed', value: `${progressOf('Production schedule')}%` },
          { label: 'Tasks done', value: `${progressOf('Tasks')}%` },
          { label: 'Attendance today', value: `${report.attendanceRate}%` },
          { label: 'Delivered', value: `${progressOf('Final delivery')}%` },
          { label: 'Pending approvals', value: report.pendingApprovals },
          { label: 'Live on OTT', value: report.live },
        ]}
      />

      <div className="report-chart-switcher">
        <div className="report-chart-switcher__buttons" aria-label="Report chart selection">
          {chartOptions.map((chart) => (
            <button
              type="button"
              key={chart.id}
              className={`report-chart-switcher__button ${selectedChart === chart.id ? 'is-active' : ''}`}
              aria-pressed={selectedChart === chart.id}
              onClick={() => setSelectedChart(chart.id)}
            >
              {chart.label}
            </button>
          ))}
        </div>

        <StatusDonut title={activeChart.label} data={activeChart.data} />
      </div>

      <h2 className="report-heading">Module progress</h2>
      <DataTable columns={moduleColumns} rows={report.modules.map(
        (row) => ({ ...row, id: row.module }))}
         loading={loading} emptyText="No data yet." />

      <h2 className="report-heading">Needs attention</h2>
      <DataTable
        columns={attentionColumns}
        rows={report.attention}
        loading={loading}
        emptyText="Nothing is overdue or failing. Good going!"
      />
    </>
  );
}
