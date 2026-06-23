import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/feed" className="navbar-brand">
        article<span>.</span>platform
      </Link>

      <div className="navbar-right">
        {user && (
          <>
            {user.role === 'ADMIN' && (
              <Link to="/admin">
                <span className="admin-badge">admin</span>
              </Link>
            )}
            <Link to="/articles/new">
              <button className="btn-primary">Write</button>
            </Link>
            <span className="navbar-user">{user.email}</span>
            <button className="btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </>
        )}
        {user === null && (
          <Link to="/login">
            <button className="btn-primary">Sign in</button>
          </Link>
        )}
      </div>
    </nav>
  );
}
