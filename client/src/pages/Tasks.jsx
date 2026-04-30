import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const emptyForm = {
  title: '',
  description: '',
  project: '',
  assignedTo: '',
  status: 'Pending',
  priority: 'Medium',
  dueDate: ''
};

const Tasks = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const loadTasks = () => apiRequest('/tasks').then(setTasks).catch((err) => setError(err.message));

  useEffect(() => {
    loadTasks();
    apiRequest('/projects').then(setProjects).catch(() => {});
    if (isAdmin) apiRequest('/users').then(setUsers).catch(() => {});
  }, [isAdmin]);

  const createTask = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setForm(emptyForm);
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiRequest(`/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async (id) => {
    await apiRequest(`/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  };

  return (
    <section className="page-stack">
      <div className="panel">
        <div className="panel-header">
          <h2>Tasks</h2>
        </div>
        {error && <div className="alert">{error}</div>}
        <div className="task-grid">
          {tasks.map((task) => (
            <article className="task-card" key={task._id}>
              <div>
                <strong>{task.title}</strong>
                <p>{task.description || 'No description'}</p>
              </div>
              <div className="meta-line">
                <span>{task.project?.name}</span>
                <span>{task.assignedTo?.name}</span>
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="task-actions">
                <select value={task.status} onChange={(event) => updateStatus(task._id, event.target.value)}>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
                <span className={`pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
                {isAdmin && (
                  <button className="icon-button danger" onClick={() => deleteTask(task._id)} type="button">
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
            </article>
          ))}
          {tasks.length === 0 && <p className="empty">No tasks yet.</p>}
        </div>
      </div>

      {isAdmin && (
        <form className="panel form-panel" onSubmit={createTask}>
          <div className="panel-header">
            <h2><Plus size={20} /> New Task</h2>
          </div>
          <div className="form-grid">
            <input
              placeholder="Task title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
            <select value={form.project} onChange={(event) => setForm({ ...form, project: event.target.value })}>
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
            <select value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}>
              <option value="">Assign to</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
            <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
          <button type="submit">Create Task</button>
        </form>
      )}
    </section>
  );
};

export default Tasks;
