import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../api/client';

export default function AdminPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('all');

  useEffect(() => {
    setLoading(true);

    (view === 'deleted'
    ? api.getDeletedArticles()
    : api.getAdminArticles())
    .then(setArticles)
    .catch((e) => setError(e.message))
    .finally(() => setLoading(false));
    
  }, [view]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return;
    try {
      await api.deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  };

  const handleHardDelete = async (id) => {
    if (!confirm('Permanently delete this article? This cannot be undone.')) {
      return;
    }

    try {
      await api.hardDeleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      alert('Hard delete failed: ' + e.message);
    }
  };

  return (
    <Layout wide>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <h1 className="feed-title" style={{ margin: 0 }}>All Articles</h1>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            className={`admin-filter-btn all ${view === 'all' ? 'active' : ''}`}
            onClick={() => setView('all')}
          >
            All Articles
          </button>

          <button
            className={`admin-filter-btn deleted ${view === 'deleted' ? 'active' : ''}`}
            onClick={() => setView('deleted')}
          >
            Deleted Articles
          </button>
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}
      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="article-list">
          {articles.map((a) => {
            const isDeleted = !!a.deletedAt;
            return (
              <div key={a.id} className={`article-row${isDeleted ? ' deleted-row' : ''}`}>
                <div className="article-row-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <Link to={`/articles/${a.id}`}>{a.title}</Link>
                  {isDeleted && <span className="deleted-badge">deleted</span>}
                </div>
                <div className="article-row-meta">
                  <span className="article-row-author">
                    {a.author || 'Unknown'}
                    {a.createdAt && (
                      <> · {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                    )}
                  </span>
                  {a.viewCount !== undefined && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)' }}>
                      {a.viewCount} views
                    </span>
                  )}
                  {(a.tags || []).map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                  <div className="article-row-actions">
                    {view === 'all' ? (
                      <>
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(a.id)}
                        >
                          Soft Delete
                        </button>

                        <button
                          className="btn-danger"
                          onClick={() => handleHardDelete(a.id)}
                        >
                          Hard Delete
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-danger"
                        onClick={() => handleHardDelete(a.id)}
                      >
                        Hard Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
