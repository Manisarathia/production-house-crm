import { useState } from 'react';
import { taskApi } from '../api';
import useResource from '../hooks/useResourse';
import PageHeader from '../components/PageHeader';
import FormModal from '../components/FormModal';
import StatusBadge from '../components/StatusBadge';
import { formatDate, getId, isPastDate, labelize } from '../utils/helpers';
import { taskDummyData } from '../data/dummyData';
import "../css/TaskPage.css"
const COLUMNS = ['todo', 'in-progress', 'done'];

const FIELDS = [
  { name: 'title', label: 'Task', required: true, full: true },
  { name: 'assignee', label: 'Assigned to', required: true },
  { name: 'department', label: 'Department' },
  { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'] },
  { name: 'dueDate', label: 'Due date', type: 'date' },
  { name: 'status', label: 'Status', type: 'select', options: COLUMNS, required: true },
  { name: 'description', label: 'Description', type: 'textarea', full: true },
];

export default function TasksPage() {
  const { items, loading, error, save, remove } = useResource(taskApi, taskDummyData);
  const [editing, setEditing] = useState(null);

  const moveForward = (task) => {
    const next = COLUMNS[COLUMNS.indexOf(task.status) + 1];
    if (next) save({ ...task, status: next }, getId(task));
  };

  const handleDelete = (task) => {
    if (window.confirm('Are you sure you want to delete this task?')) remove(getId(task));
  };

  return (
    <>
      <PageHeader
        title="Task Management"
        subtitle="Assign work to the crew and track it till it is done."
        actionLabel="Add task"
        onAction={() => setEditing({ status: 'todo' })}
      />

      {error && <p className="alert alert--error">{error}</p>}
      {loading && <p className="state">Loading...</p>}

      <div className="board">
        {COLUMNS.map((column) => {
          const tasks = items.filter((task) => task.status === column);
          return (
            <section key={column} className="board__column">
              <h2>
                {labelize(column)} <span className="board__count">{tasks.length}</span>
              </h2>
              {!tasks.length && !loading && <p className="state state--small">Nothing here.</p>}
              {tasks.map((task) => {
                const overdue = task.status !== 'done' && isPastDate(task.dueDate);
                return (
                  <article key={getId(task)} className="task">
                    <h3>{task.title}</h3>
                    <p className="task__meta">
                      {task.assignee}
                      {task.department && ` (${task.department})`}
                    </p>
                    <div className="task__row">
                      <StatusBadge value={task.priority} />
                      <span className={overdue ? 'text-bad' : ''}>
                        {task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}
                      </span>
                    </div>
                    <div className="task__actions">
                      {task.status !== 'done' && (
                        <button className="btn btn--link"
                         onClick={() => moveForward(task)}>
                          Move to {labelize(COLUMNS[COLUMNS.indexOf(task.status) + 1])}
                        </button>
                      )}
                      <button className="btn btn--link" 
                      onClick={() => setEditing(task)}>
                        Edit
                      </button>
                      <button className="btn btn--link btn--danger"
                       onClick={() => handleDelete(task)}>
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          );
        })}
      </div>

      {editing && (
        <FormModal
          title={getId(editing) ? 'Edit task' : 'Add task'}
          fields={FIELDS}
          initialValues={editing}
          onSubmit={(values) => save(values, getId(editing))}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
