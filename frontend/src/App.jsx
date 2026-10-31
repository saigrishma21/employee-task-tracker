import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, ClipboardList, Plus, Search, Trash2,
  CheckCircle2, Clock3, CircleAlert, CalendarDays, ArrowUpRight,
  RefreshCw, X
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const today = new Date().toISOString().slice(0, 10);

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let message = 'Something went wrong';
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {}
    throw new Error(
      typeof message === 'string' ? message : JSON.stringify(message)
    );
  }

  if (response.status === 204) return null;
  return response.json();
}

function App() {
  const [page, setPage] = useState('Dashboard');
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total_employees: 0,
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [taskFilter, setTaskFilter] = useState('All');
  const [employeeModal, setEmployeeModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);

  async function refresh() {
    setLoading(true);
    setError('');

    try {
      const [e, t, s] = await Promise.all([
        request('/employees'),
        request('/tasks'),
        request('/dashboard')
      ]);

      setEmployees(e);
      setTasks(t);
      setStats(s);
    } catch (err) {
      setError(
        `${err.message}. Check that the API and PostgreSQL database are running.`
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const visibleEmployees = useMemo(
    () =>
      employees.filter(e =>
        `${e.name} ${e.email} ${e.department}`
          .toLowerCase()
          .includes(employeeSearch.toLowerCase())
      ),
    [employees, employeeSearch]
  );

  const visibleTasks = useMemo(
    () =>
      taskFilter === 'All'
        ? tasks
        : tasks.filter(t => t.status === taskFilter),
    [tasks, taskFilter]
  );

  const flash = message => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  };

  // Corrected employee submission
  async function addEmployee(event) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    try {
      await request('/employees', {
        method: 'POST',
        body: JSON.stringify({
          name: String(form.get('name') || '').trim(),
          email: String(form.get('email') || '').trim(),
          department: String(form.get('department') || '').trim()
        })
      });

      formElement.reset();
      setEmployeeModal(false);
      await refresh();
      flash('Employee added successfully');
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteEmployee(employee) {
    if (
      !window.confirm(
        `Delete ${employee.name}? Their assigned tasks will also be deleted.`
      )
    ) return;

    try {
      await request(`/employees/${employee.id}`, {
        method: 'DELETE'
      });
      await refresh();
      flash('Employee deleted');
    } catch (err) {
      setError(err.message);
    }
  }

  // Corrected task submission
  async function addTask(event) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    try {
      await request('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: String(form.get('title') || '').trim(),
          description: String(form.get('description') || '').trim(),
          priority: form.get('priority'),
          due_date: form.get('due_date'),
          employee_id: Number(form.get('employee_id'))
        })
      });

      formElement.reset();
      setTaskModal(false);
      await refresh();
      flash('Task created and assigned');
    } catch (err) {
      setError(err.message);
    }
  }

  async function changeStatus(task, status) {
    try {
      await request(`/tasks/${task.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      await refresh();
      flash('Task status updated');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">T</div>
          <div>
            <strong>TaskFlow</strong>
            <span>WORKSPACE</span>
          </div>
        </div>

        <div className="nav-label">MENU</div>

        <nav>
          {[
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Employees', icon: Users },
            { name: 'Tasks', icon: ClipboardList }
          ].map(item => (
            <button
              key={item.name}
              className={`nav-item ${page === item.name ? 'active' : ''}`}
              onClick={() => setPage(item.name)}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
              {item.name === 'Tasks' && (
                <span className="nav-count">{stats.total_tasks}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <strong>Stay on top of work</strong>
            <p>Keep your team aligned and every task moving forward.</p>
          </div>

          <div className="profile">
            <div className="avatar">A</div>
            <div>
              <strong>Admin</strong>
              <span>Workspace owner</span>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{page}</strong>
          </div>

          <div className="top-actions">
            <span className="today-label">
              <CalendarDays size={15} />
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>

            <button
              className="icon-button"
              onClick={refresh}
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>

            <div className="avatar small">A</div>
          </div>
        </header>

        <div className="content">
          {error && (
            <div className="alert">
              <CircleAlert size={17} />
              <span>{error}</span>
              <button onClick={() => setError('')}>
                <X size={16} />
              </button>
            </div>
          )}

          {notice && (
            <div className="toast">
              <CheckCircle2 size={17} />
              {notice}
            </div>
          )}

          <div className="page-heading">
            <div>
              <div className="eyebrow">OVERVIEW</div>
              <h1>
                {page === 'Dashboard' ? 'Good morning, Admin' : page}
              </h1>
              <p>
                {page === 'Dashboard'
                  ? 'Here’s what’s happening with your team today.'
                  : page === 'Employees'
                    ? 'Manage your people and their departments.'
                    : 'Create, assign and track your team’s work.'}
              </p>
            </div>

            <div className="heading-actions">
              {page === 'Employees' && (
                <button
                  className="primary-btn"
                  onClick={() => setEmployeeModal(true)}
                >
                  <Plus size={17} /> Add employee
                </button>
              )}

              {page === 'Tasks' && (
                <button
                  className="primary-btn"
                  onClick={() => setTaskModal(true)}
                  disabled={!employees.length}
                >
                  <Plus size={17} /> Create task
                </button>
              )}
            </div>
          </div>

          {page === 'Dashboard' && (
            <>
              <div className="stats-grid">
                <Stat
                  icon={<Users />}
                  label="Total employees"
                  value={stats.total_employees}
                  hint="People in your workspace"
                  tone="blue"
                />
                <Stat
                  icon={<ClipboardList />}
                  label="Total tasks"
                  value={stats.total_tasks}
                  hint="Across all team members"
                  tone="violet"
                />
                <Stat
                  icon={<CheckCircle2 />}
                  label="Completed tasks"
                  value={stats.completed_tasks}
                  hint="Successfully finished"
                  tone="green"
                />
                <Stat
                  icon={<Clock3 />}
                  label="Pending tasks"
                  value={stats.pending_tasks}
                  hint="Waiting to get started"
                  tone="amber"
                />
              </div>

              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Recent tasks</h2>
                    <p>Your team’s latest work items</p>
                  </div>
                  <button
                    className="text-btn"
                    onClick={() => setPage('Tasks')}
                  >
                    View all <ArrowUpRight size={15} />
                  </button>
                </div>

                <TaskTable
                  tasks={tasks.slice(0, 5)}
                  onStatus={changeStatus}
                />

                {!tasks.length && !loading && (
                  <Empty
                    icon={<ClipboardList />}
                    title="No tasks yet"
                    text="Create your first task to get the team moving."
                    action="Create task"
                    onAction={() => setTaskModal(true)}
                    disabled={!employees.length}
                  />
                )}
              </section>

              <div className="bottom-grid">
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <h2>Team members</h2>
                      <p>People in your workspace</p>
                    </div>
                    <button
                      className="text-btn"
                      onClick={() => setPage('Employees')}
                    >
                      View all <ArrowUpRight size={15} />
                    </button>
                  </div>

                  {employees.slice(0, 4).map(e => (
                    <div className="member-row" key={e.id}>
                      <div className="avatar">
                        {e.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-info">
                        <strong>{e.name}</strong>
                        <span>{e.department}</span>
                      </div>
                      <span className="member-email">{e.email}</span>
                    </div>
                  ))}

                  {!employees.length && !loading && (
                    <Empty
                      icon={<Users />}
                      title="No employees added"
                      text="Add employees to start assigning tasks."
                      action="Add employee"
                      onAction={() => setEmployeeModal(true)}
                    />
                  )}
                </section>

                <section className="panel progress-panel">
                  <div className="panel-head">
                    <div>
                      <h2>Task progress</h2>
                      <p>Completion at a glance</p>
                    </div>
                  </div>

                  <div className="progress-number">
                    {stats.total_tasks
                      ? Math.round(
                          (stats.completed_tasks / stats.total_tasks) * 100
                        )
                      : 0}
                    <span>%</span>
                  </div>

                  <div className="progress-track">
                    <div
                      style={{
                        width: `${
                          stats.total_tasks
                            ? (stats.completed_tasks / stats.total_tasks) * 100
                            : 0
                        }%`
                      }}
                    />
                  </div>

                  <div className="progress-legend">
                    <span>
                      <i className="legend-dot green-dot" />
                      Completed <b>{stats.completed_tasks}</b>
                    </span>
                    <span>
                      <i className="legend-dot amber-dot" />
                      Pending <b>{stats.pending_tasks}</b>
                    </span>
                  </div>
                </section>
              </div>
            </>
          )}

          {page === 'Employees' && (
            <section className="panel">
              <div className="panel-head employee-tools">
                <div>
                  <h2>
                    All employees{' '}
                    <span className="count-pill">{employees.length}</span>
                  </h2>
                  <p>Manage your employee directory</p>
                </div>

                <div className="search-wrap">
                  <Search size={16} />
                  <input
                    placeholder="Search employees..."
                    value={employeeSearch}
                    onChange={e => setEmployeeSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>EMPLOYEE</th>
                      <th>EMAIL ADDRESS</th>
                      <th>DEPARTMENT</th>
                      <th>TASKS</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {visibleEmployees.map(e => (
                      <tr key={e.id}>
                        <td>
                          <div className="employee-cell">
                            <div className="avatar">
                              {e.name.charAt(0).toUpperCase()}
                            </div>
                            <strong>{e.name}</strong>
                          </div>
                        </td>
                        <td>{e.email}</td>
                        <td>
                          <span className="department-tag">
                            {e.department}
                          </span>
                        </td>
                        <td>
                          {tasks.filter(t => t.employee_id === e.id).length}
                        </td>
                        <td>
                          <button
                            className="delete-btn"
                            title="Delete employee"
                            onClick={() => deleteEmployee(e)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!visibleEmployees.length && !loading && (
                  <Empty
                    icon={<Users />}
                    title="No employees found"
                    text="Try another search or add a new employee."
                    action="Add employee"
                    onAction={() => setEmployeeModal(true)}
                  />
                )}
              </div>
            </section>
          )}

          {page === 'Tasks' && (
            <section className="panel">
              <div className="panel-head task-tools">
                <div>
                  <h2>
                    All tasks{' '}
                    <span className="count-pill">{tasks.length}</span>
                  </h2>
                  <p>Track and update assigned work</p>
                </div>

                <div className="filter-wrap">
                  <label>STATUS</label>
                  <select
                    value={taskFilter}
                    onChange={e => setTaskFilter(e.target.value)}
                  >
                    <option>All</option>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              <TaskTable
                tasks={visibleTasks}
                onStatus={changeStatus}
              />

              {!visibleTasks.length && !loading && (
                <Empty
                  icon={<ClipboardList />}
                  title="No tasks to show"
                  text="Create a task or change the selected status filter."
                  action="Create task"
                  onAction={() => setTaskModal(true)}
                  disabled={!employees.length}
                />
              )}
            </section>
          )}

          {loading && (
            <div className="loading">
              <span className="spinner" />
              Loading workspace data...
            </div>
          )}

          <footer>
            © 2026 TaskFlow <span>•</span> Employee Task Tracker
          </footer>
        </div>
      </main>

      {employeeModal && (
        <Modal
          title="Add employee"
          subtitle="Add a new member to your workspace"
          onClose={() => setEmployeeModal(false)}
        >
          <form onSubmit={addEmployee} className="form-stack">
            <Field label="Full name">
              <input
                name="name"
                placeholder="e.g. Alex Morgan"
                minLength="2"
                required
              />
            </Field>

            <Field label="Email address">
              <input
                name="email"
                type="email"
                placeholder="alex@company.com"
                required
              />
            </Field>

            <Field label="Department">
              <input
                name="department"
                placeholder="e.g. Engineering"
                minLength="2"
                required
              />
            </Field>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setEmployeeModal(false)}
              >
                Cancel
              </button>
              <button className="primary-btn" type="submit">
                Add employee
              </button>
            </div>
          </form>
        </Modal>
      )}

      {taskModal && (
        <Modal
          title="Create a task"
          subtitle="Add details and assign it to a team member"
          onClose={() => setTaskModal(false)}
        >
          <form onSubmit={addTask} className="form-stack">
            <Field label="Task title">
              <input
                name="title"
                placeholder="e.g. Prepare monthly report"
                minLength="2"
                required
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                placeholder="Add a few details about this task..."
                rows="3"
              />
            </Field>

            <div className="form-row">
              <Field label="Priority">
                <select name="priority" defaultValue="Medium">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </Field>

              <Field label="Due date">
                <input
                  name="due_date"
                  type="date"
                  min={today}
                  defaultValue={today}
                  required
                />
              </Field>
            </div>

            <Field label="Assign to">
              <select name="employee_id" required defaultValue="">
                <option value="" disabled>
                  Select an employee
                </option>
                {employees.map(e => (
                  <option value={e.id} key={e.id}>
                    {e.name} · {e.department}
                  </option>
                ))}
              </select>
            </Field>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setTaskModal(false)}
              >
                Cancel
              </button>
              <button className="primary-btn" type="submit">
                Create task
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Stat({ icon, label, value, hint, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-hint">{hint}</div>
    </div>
  );
}

function TaskTable({ tasks, onStatus }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>TASK</th>
            <th>ASSIGNED TO</th>
            <th>PRIORITY</th>
            <th>DUE DATE</th>
            <th>STATUS</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map(t => (
            <tr key={t.id}>
              <td>
                <div className="task-title">
                  <strong>{t.title}</strong>
                  {t.description && <span>{t.description}</span>}
                </div>
              </td>

              <td>
                <div className="assignee">
                  <div className="avatar tiny">
                    {(t.employee_name || '?').charAt(0).toUpperCase()}
                  </div>
                  {t.employee_name || 'Unknown employee'}
                </div>
              </td>

              <td>
                <span className={`priority ${t.priority.toLowerCase()}`}>
                  <i /> {t.priority}
                </span>
              </td>

              <td>
                {new Date(`${t.due_date}T00:00:00`).toLocaleDateString(
                  'en-US',
                  { month: 'short', day: 'numeric', year: 'numeric' }
                )}
              </td>

              <td>
                <select
                  className={`status-select ${t.status
                    .toLowerCase()
                    .replace(' ', '-')}`}
                  value={t.status}
                  onChange={e => onStatus(t, e.target.value)}
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty({ icon, title, text, action, onAction, disabled }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <strong>{title}</strong>
      <p>{text}</p>
      <button
        className="primary-btn"
        disabled={disabled}
        onClick={onAction}
      >
        <Plus size={16} />
        {action}
      </button>
    </div>
  );
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default App;