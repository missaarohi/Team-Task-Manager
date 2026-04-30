import { Plus, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [projectDetail, setProjectDetail] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', members: [] });

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedId),
    [projects, selectedId]
  );

  const loadProjects = () => {
    apiRequest('/projects')
      .then((data) => {
        setProjects(data);
        if (!selectedId && data[0]) setSelectedId(data[0]._id);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadProjects();
    if (isAdmin) apiRequest('/users').then(setUsers).catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedId) return;
    apiRequest(`/projects/${selectedId}`).then(setProjectDetail).catch((err) => setError(err.message));
  }, [selectedId]);

  const createProject = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setForm({ name: '', description: '', members: [] });
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const addMember = async (userId) => {
    if (!selectedId || !userId) return;
    await apiRequest(`/projects/${selectedId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    setProjectDetail(await apiRequest(`/projects/${selectedId}`));
    loadProjects();
  };

  const removeProject = async (id) => {
    await apiRequest(`/projects/${id}`, { method: 'DELETE' });
    setSelectedId('');
    setProjectDetail(null);
    loadProjects();
  };

  return (
    <section className="split-page">
      <div className="panel list-panel">
        <div className="panel-header">
          <h2>Projects</h2>
        </div>
        {error && <div className="alert">{error}</div>}
        <div className="stack-list">
          {projects.map((project) => (
            <button
              className={`list-item ${selectedId === project._id ? 'active' : ''}`}
              key={project._id}
              onClick={() => setSelectedId(project._id)}
              type="button"
            >
              <strong>{project.name}</strong>
              <span>{project.members.length} members</span>
            </button>
          ))}
          {projects.length === 0 && <p className="empty">No projects yet.</p>}
        </div>

        {isAdmin && (
          <form className="inline-form" onSubmit={createProject}>
            <h3><Plus size={17} /> New Project</h3>
            <input
              placeholder="Project name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <select
              multiple
              value={form.members}
              onChange={(event) =>
                setForm({ ...form, members: Array.from(event.target.selectedOptions, (option) => option.value) })
              }
            >
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            <button type="submit">Create Project</button>
          </form>
        )}
      </div>

      <div className="panel detail-panel">
        {selectedProject ? (
          <>
            <div className="panel-header">
              <div>
                <h2>{selectedProject.name}</h2>
                <p>{selectedProject.description || 'No description'}</p>
              </div>
              {isAdmin && (
                <button className="icon-button danger" onClick={() => removeProject(selectedProject._id)} type="button">
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <h3>Members</h3>
            <div className="member-grid">
              {selectedProject.members.map((member) => (
                <span className="member-chip" key={member._id}>{member.name} · {member.role}</span>
              ))}
            </div>

            {isAdmin && (
              <div className="member-add">
                <UserPlus size={18} />
                <select defaultValue="" onChange={(event) => addMember(event.target.value)}>
                  <option value="" disabled>Add member</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
              </div>
            )}

            <h3>Project Tasks</h3>
            <div className="table">
              {(projectDetail?.tasks || []).map((task) => (
                <div className="table-row" key={task._id}>
                  <div>
                    <strong>{task.title}</strong>
                    <span>{task.assignedTo?.name}</span>
                  </div>
                  <span className={`pill ${task.status.replaceAll(' ', '-').toLowerCase()}`}>{task.status}</span>
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              ))}
              {projectDetail?.tasks?.length === 0 && <p className="empty">No tasks in this project.</p>}
            </div>
          </>
        ) : (
          <p className="empty">Select a project to view details.</p>
        )}
      </div>
    </section>
  );
};

export default Projects;
