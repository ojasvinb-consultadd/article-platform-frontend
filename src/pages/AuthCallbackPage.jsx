import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../api/client';

/**
 * Handles the redirect back from Spring Security after Google OAuth.
 * Spring sends the user to /login-complete — we map that to this page,
 * re-fetch /me to hydrate auth state, then push to /feed.
 */
export default function AuthCallbackPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getMe()
      .then((user) => {
        setUser(user);
        navigate('/feed', { replace: true });
      })
      .catch(() => navigate('/login', { replace: true }));
  }, [navigate, setUser]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div className="spinner" />
    </div>
  );
}
