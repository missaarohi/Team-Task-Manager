import { BarChart3, FolderKanban, LogOut, ListTodo } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Layout = () => {
  const { user, logout } = useAuth();
  const userInitials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">{userInitials || 'U'}</div>
          <div>
            <strong>{user?.name || 'User'}</strong>
            <span>{user?.role}</span>
          </div>
        </div>

        <nav>
          <NavLink to="/" end>
            <BarChart3 size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/projects">
            <FolderKanban size={18} />
            Projects
          </NavLink>
          <NavLink to="/tasks">
            <ListTodo size={18} />
            Tasks
          </NavLink>
        </nav>

        <button className="ghost-button logout" onClick={logout} type="button">
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p>Welcome back</p>
            <h1>{user?.name}</h1>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
