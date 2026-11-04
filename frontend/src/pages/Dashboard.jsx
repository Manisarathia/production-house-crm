import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Clapperboard,
  Plus,
  ReceiptText,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react';

import DashboardBg from '../assets/Dashboard1.jpg';
import { dashboardApi } from '../api/systemAdministrationApi.js';

import './Dashboard.css';


function StatTrend({ points, metric, formatValue }) {
  const values = points.map((point) => point[metric]);

  const maximum = Math.max(
    1,
    ...values.filter((value) => value !== null && value !== undefined)
  );

  return (
    <div className="stat-trend" role="img" aria-label="Monthly statistics">
      {points.map((point, index) => {
        const value = point[metric];

        const month = new Date(`${point.month}-01T00:00:00`)
          .toLocaleDateString('en-IN', { month: 'short' });

        const unavailable = value === null || value === undefined;

        const hasPreviousData = values.slice(0, index).some(
          (previousValue) =>
            previousValue !== null && previousValue !== undefined
        );

        const height = unavailable
          ? '5px'
          : index === points.length - 1 && !hasPreviousData
            ? '22px'
            : `${Math.max(3, value / maximum * 22)}px`;

        return (
          <div
            className="stat-trend-item"
            key={point.month}
            title={`${month}: ${
              unavailable ? 'history unavailable' : formatValue(value)
            }`}
          >
            <span className="stat-trend-bar-track">
              <span
                className={`stat-trend-bar ${
                  unavailable ? 'unavailable' : ''
                }`}
                style={{ height }}
              />
            </span>

            <span className="stat-trend-month">{month}</span>
          </div>
        );
      })}
    </div>
  );
}


function StatCard({
  title,
  value,
  note,
  Icon,
  tone,
  points,
  metric,
  formatValue,
}) {
  return (
    <article className="stat-card dashboard-metric-card">

      <div className="stat-top">
        <div className={`stat-icon ${tone}`}>
          <Icon size={19} />
        </div>
      </div>

      <div className="stat-title-row">
        <p className="stat-title">{title}</p>

        <StatTrend
          points={points}
          metric={metric}
          formatValue={formatValue}
        />
      </div>

      <div className="stat-bottom">
        <div>
          <strong>{value}</strong>
          <span>{note}</span>
        </div>
      </div>

    </article>
  );
}


function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}


function formatCount(value) {
  return new Intl.NumberFormat('en-IN').format(value);
}


function localDateString(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, '0');

  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


function daysBetween(start, end) {
  const [startYear, startMonth, startDay] = start.split('-').map(Number);

  const [endYear, endMonth, endDay] = end.split('-').map(Number);

  return Math.round(
    (
      Date.UTC(endYear, endMonth - 1, endDay) -
      Date.UTC(startYear, startMonth - 1, startDay)
    ) / 86400000
  );
}


function formatProjectDate(value) {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(Date.UTC(year, month - 1, day))
    .toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
}


function emptyTrendPoints(teamMembers) {
  const currentMonth = new Date();

  return Array.from({ length: 6 }, (_, index) => {

    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 5 + index,
      1
    );

    const month = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;

    const isCurrentMonth = index === 5;

    return {
      month,
      activeProductions: null,
      teamMembers: isCurrentMonth ? teamMembers ?? null : null,
      totalBudget: null,
      pendingInvoices: null,
      overdueInvoices: null,
    };
  });
}


export default function Dashboard() {

  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);

  const [trends, setTrends] = useState([]);

  const [projects, setProjects] = useState(null);

  const [loading, setLoading] = useState(true);

  const [errors, setErrors] = useState([]);


  useEffect(() => {

    let active = true;

    async function loadDashboard() {

      const failures = [];

      const [
        summaryResult,
        trendsResult,
        projectsResult
      ] = await Promise.allSettled([
        dashboardApi.get(),
        dashboardApi.trends(),
        dashboardApi.projects(),
      ]);

      if (!active) return;

      if (summaryResult.status === 'fulfilled') {

        setSummary(summaryResult.value);

      } else {

        failures.push(
          `Team statistics: ${
            summaryResult.reason.message ||
            'Unable to load team statistics.'
          }`
        );
      }


      if (trendsResult.status === 'fulfilled') {

        const loadedTrends = Array.isArray(trendsResult.value)
          ? trendsResult.value
          : [];

        setTrends(
          loadedTrends.length === 6
            ? loadedTrends
            : emptyTrendPoints(
                summaryResult.status === 'fulfilled'
                  ? summaryResult.value.totalTeamMembers
                  : null
              )
        );

      } else {

        setTrends(
          emptyTrendPoints(
            summaryResult.status === 'fulfilled'
              ? summaryResult.value.totalTeamMembers
              : null
          )
        );
      }


      if (projectsResult.status === 'fulfilled') {

        setProjects(
          Array.isArray(projectsResult.value)
            ? projectsResult.value
            : []
        );

      } else {

        failures.push(
          `Production projects: ${
            projectsResult.reason.message ||
            'Unable to load production projects.'
          }`
        );
      }


      if (active) {

        setErrors(failures);

        setLoading(false);
      }
    }


    loadDashboard();

    return () => {
      active = false;
    };

  }, []);


  const departments = summary?.membersByDepartment || [];

  const roles = summary?.roleDistribution || [];

  const currentTrend = trends.at(-1);

  const today = localDateString(new Date());


  const activeProjects = (projects || [])

    .filter((project) =>
      project.stage !== 'RELEASED' &&
      project.startDate <= today &&
      (!project.endDate || project.endDate >= today)
    )

    .sort((first, second) =>
      (first.endDate || '9999-12-31')
        .localeCompare(second.endDate || '9999-12-31')
    );


  const upcomingDeadlines = (projects || [])

    .filter((project) =>
      project.stage !== 'RELEASED' &&
      project.endDate &&
      project.endDate >= today
    )

    .sort((first, second) =>
      first.endDate.localeCompare(second.endDate)
    )

    .slice(0, 4);


  const count = (value) =>
    value === null || value === undefined
      ? '—'
      : formatCount(value);


  const trendPoints = trends;


  const maxMonthlyProductions = Math.max(
    1,
    ...trendPoints.map((point) => point.activeProductions || 0)
  );


  const maxDepartmentMembers = useMemo(
    () => Math.max(
      1,
      ...departments.map((department) => department.members)
    ),
    [departments]
  );


  return (

    <div
      className="dashboard-page"
      // style={{
      //   backgroundImage: `
         
      //     url(${DashboardBg})
      //   `
      // }}
    >

      <div className="dashboard-content">


        {/* PAGE HEADING */}

        <div className="page-heading">

          <div>

            <div className="eyebrow">
              <span className="live-dot" />
              LIVE &middot; PRODUCTION OVERVIEW
            </div>

            <h1 className="page-title">
              Loopstream Dashboard
            </h1>

            <p>
              Production, team and finance statistics from your workspace.
            </p>

          </div>


          <button
            className="new-product-btn"
            onClick={() => navigate('/projects')}
          >
            <Plus size={18} />
            New Production
          </button>

        </div>



        {/* ERROR */}

        {errors.length > 0 && (

          <div className="empty-state dashboard-errors" role="alert">

            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}

          </div>

        )}


        {loading && (
          <div className="empty-state">
            Loading dashboard…
          </div>
        )}



        {(summary || trends.length > 0 || projects !== null) && (

          <>

            {/* STAT CARDS */}

            <section className="stats-grid">

              <StatCard
                title="Active Productions"
                value={count(currentTrend?.activeProductions)}
                note="within their production dates"
                Icon={Clapperboard}
                tone="blue"
                points={trendPoints}
                metric="activeProductions"
                formatValue={formatCount}
              />


              <StatCard
                title="Team Members"
                value={count(
                  currentTrend?.teamMembers ??
                  summary?.totalTeamMembers
                )}
                note={
                  summary
                    ? `${summary.activeTeamMembers} active`
                    : 'Current workspace total'
                }
                Icon={Users}
                tone="violet"
                points={trendPoints}
                metric="teamMembers"
                formatValue={formatCount}
              />


              <StatCard
                title="Total Budget"
                value={
                  currentTrend?.totalBudget == null
                    ? '—'
                    : formatCurrency(currentTrend.totalBudget)
                }
                note="allocated across productions"
                Icon={Wallet}
                tone="cyan"
                points={trendPoints}
                metric="totalBudget"
                formatValue={formatCurrency}
              />


              <StatCard
                title="Pending Invoices"
                value={count(currentTrend?.pendingInvoices)}
                note={
                  currentTrend?.overdueInvoices == null
                    ? 'Awaiting payment'
                    : `${currentTrend.overdueInvoices} overdue`
                }
                Icon={ReceiptText}
                tone="orange"
                points={trendPoints}
                metric="pendingInvoices"
                formatValue={formatCount}
              />

            </section>



            {/* DASHBOARD GRID */}

            <section className="dashboard-grid">


              {/* LEFT COLUMN */}

              <div className="dashboard-column">


                {/* PRODUCTION OVERVIEW */}

                <div className="panel production-panel">

                  <div className="panel-head">

                    <div>
                      <h2>Production overview</h2>

                      <p>
                        Active productions over the last six months.
                      </p>
                    </div>

                    <button
                      className="text-link"
                      onClick={() => navigate('/projects')}
                    >
                      View all projects
                    </button>

                  </div>


                  {trendPoints.length ? (

                    <div className="bar-chart">

                      {trendPoints.map((point) => {

                        const month = new Date(
                          `${point.month}-01T00:00:00`
                        ).toLocaleDateString('en-IN', {
                          month: 'short'
                        });

                        const percentage =
                          point.activeProductions /
                          maxMonthlyProductions * 100;

                        return (

                          <div
                            className="bar-column"
                            key={point.month}
                          >

                            <div
                              className="bar-stack"
                              title={`${point.activeProductions} active productions`}
                            >

                              <div
                                className="bar-progress"
                                style={{
                                  height: `${Math.max(4, percentage)}%`
                                }}
                              />

                            </div>

                            <span>{month}</span>

                          </div>

                        );

                      })}

                    </div>

                  ) : (

                    <div className="empty-state">
                      Monthly production history is unavailable.
                    </div>

                  )}


                  <div className="chart-footer">

                    <div>
                      <span className="footer-label">
                        Active productions now
                      </span>

                      <strong>
                        {count(currentTrend?.activeProductions)}
                      </strong>
                    </div>

                  </div>

                </div>



                {/* ACTIVE PROJECTS */}

                <div className="panel projects-panel">

                  <div className="panel-head">

                    <div>
                      <h2>Active projects</h2>

                      <p>
                        Productions currently within their scheduled dates.
                      </p>
                    </div>

                    <button
                      className="text-link"
                      onClick={() => navigate('/projects')}
                    >
                      View all projects
                    </button>

                  </div>


                  {projects === null ? (

                    <div className="empty-state">
                      Loading production projects…
                    </div>

                  ) : activeProjects.length ? (

                    <div className="active-project-list">

                      {activeProjects.slice(0, 5).map((project) => (

                        <div
                          className="active-project-item"
                          key={project.id}
                        >

                          <div className="project-icon blue">
                            <Clapperboard size={17} />
                          </div>

                          <div className="active-project-copy">

                            <strong>
                              {project.title || 'Untitled production'}
                            </strong>

                            <span>
                              {String(
                                project.stage || 'PRE_PRODUCTION'
                              ).replaceAll('_', ' ')}
                            </span>

                          </div>

                          <span className="active-project-date">

                            {project.endDate
                              ? formatProjectDate(project.endDate)
                              : 'No end date'}

                          </span>

                        </div>

                      ))}

                    </div>

                  ) : (

                    <div className="empty-state">
                      No active projects.
                    </div>

                  )}

                </div>



                {/* TEAM BY DEPARTMENT */}

                {summary && (

                  <div className="panel production-panel">

                    <div className="panel-head">

                      <div>
                        <h2>Team by department</h2>

                        <p>
                          Users assigned to each department.
                        </p>
                      </div>

                      <button
                        className="text-link"
                        onClick={() => navigate('/departments')}
                      >
                        Manage departments
                      </button>

                    </div>


                    {departments.length ? (

                      <div className="bar-chart">

                        {departments.map((department) => (

                          <div
                            className="bar-column"
                            key={department.id}
                          >

                            <div
                              className="bar-stack"
                              title={`${department.members} members`}
                            >

                              <div
                                className="bar-progress"
                                style={{
                                  height: `${
                                    Math.max(
                                      4,
                                      department.members /
                                      maxDepartmentMembers * 100
                                    )
                                  }%`
                                }}
                              />

                            </div>

                            <span>{department.department}</span>

                          </div>

                        ))}

                      </div>

                    ) : (

                      <div className="empty-state">
                        No departments to summarize.
                      </div>

                    )}


                    <div className="chart-footer">

                      <div>

                        <span className="footer-label">
                          Unassigned members
                        </span>

                        <strong>
                          {Math.max(
                            0,
                            summary.totalTeamMembers -
                            departments.reduce(
                              (total, department) =>
                                total + department.members,
                              0
                            )
                          )}
                        </strong>

                      </div>

                      <button
                        className="text-link"
                        onClick={() => navigate('/team')}
                      >
                        View team
                      </button>

                    </div>

                  </div>

                )}

              </div>



              {/* RIGHT COLUMN */}

              <div className="dashboard-column">


                {/* UPCOMING DEADLINES */}

                <div className="panel schedule-panel">

                  <div className="panel-head">

                    <div>
                      <h2>Upcoming deadlines</h2>

                      <p>
                        Scheduled production end dates.
                      </p>
                    </div>

                  </div>


                  <div className="deadline-list">

                    {upcomingDeadlines.map((project, index) => {

                      const daysRemaining = daysBetween(
                        today,
                        project.endDate
                      );

                      const tone =
                        daysRemaining <= 7
                          ? 'red'
                          : index % 2
                            ? 'purple'
                            : 'blue';

                      return (

                        <div
                          className="deadline-item"
                          key={project.id}
                        >

                          <div className={`date-box ${tone}`}>

                            <strong>
                              {project.endDate.slice(8, 10)}
                            </strong>

                            <span>
                              {formatProjectDate(project.endDate)
                                .split(' ')[1]
                                .toUpperCase()}
                            </span>

                          </div>


                          <div className="deadline-copy">

                            <strong>
                              {project.title || 'Untitled production'}
                            </strong>

                            <span>Production end date</span>

                          </div>


                          <span className={`deadline-tag ${tone}`}>

                            {daysRemaining === 0
                              ? 'Today'
                              : `${daysRemaining} days`}

                          </span>

                        </div>

                      );

                    })}


                    {!upcomingDeadlines.length && projects !== null && (

                      <div className="empty-state">
                        No upcoming deadlines.
                      </div>

                    )}


                    {projects === null && (

                      <div className="empty-state">
                        Loading deadlines…
                      </div>

                    )}

                  </div>


                  <button
                    className="full-width-link"
                    onClick={() => navigate('/projects')}
                  >
                    View all projects <span>&rarr;</span>
                  </button>

                </div>



                {/* ROLE DISTRIBUTION */}

                {summary && (

                  <div className="panel schedule-panel">

                    <div className="panel-head">

                      <div>
                        <h2>Role distribution</h2>

                        <p>
                          Workspace users grouped by assigned role.
                        </p>
                      </div>

                    </div>


                    <div className="deadline-list">

                      {roles.map((item) => {

                        const percentage = summary.totalTeamMembers
                          ? Math.round(
                              item.members /
                              summary.totalTeamMembers * 100
                            )
                          : 0;

                        return (

                          <div
                            className="deadline-item"
                            key={item.role}
                          >

                            <div className="date-box blue">
                              <ShieldCheck size={18} />
                            </div>

                            <div className="deadline-copy">

                              <strong>{item.role}</strong>

                              <span>
                                {percentage}% of team
                              </span>

                            </div>

                            <span className="deadline-tag blue">
                              {item.members}
                            </span>

                          </div>

                        );

                      })}


                      {!roles.length && (

                        <div className="empty-state">
                          No roles configured.
                        </div>

                      )}

                    </div>


                    <button
                      className="full-width-link"
                      onClick={() => navigate('/team')}
                    >
                      Manage team roles <span>&rarr;</span>
                    </button>

                  </div>

                )}

              </div>

            </section>

          </>

        )}

      </div>

    </div>

  );

}