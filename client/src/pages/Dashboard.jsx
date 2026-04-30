import { AlertTriangle, CheckCircle2, Clock3, FolderKanban, ListTodo } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/dashboard').then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert">{error}</div>;
  if (!data) return <div>Loading dashboard...</div>;

  const cards = [
    { label: 'Projects', value: data.totalProjects, icon: FolderKanban },
    { label: 'Tasks', value: data.totalTasks, icon: ListTodo },
    { label: 'Pending', value: data.statusCounts.pending, icon: Clock3 },
    { label: 'Completed', value: data.statusCounts.completed, icon: CheckCircle2 },
    { label: 'Overdue', value: data.overdue, icon: AlertTriangle }
  ];

  return (
    <section className="page-stack">
      <div className="stats-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.label}>
            <card.icon size={22} />
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Upcoming Tasks</h2>
        </div>
        <div className="table">
          {data.recentTasks.map((task) => (
            <div className="table-row" key={task._id}>
              <div>
                <strong>{task.title}</strong>
                <span>{task.project?.name} · {task.assignedTo?.name}</span>
              </div>
              <span className={`pill ${task.status.replaceAll(' ', '-').toLowerCase()}`}>{task.status}</span>
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          ))}
          {data.recentTasks.length === 0 && <p className="empty">No tasks yet.</p>}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
