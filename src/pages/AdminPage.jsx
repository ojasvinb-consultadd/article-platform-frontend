import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../api/client';

export default function AdminPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAdminArticles()
      .then(setArticles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return;
    try {
      await api.deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  };

  return (
    <Layout wide>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <h1 className="feed-title" style={{ margin: 0 }}>All Articles</h1>
        <span className="admin-badge">admin view</span>
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
                    {a.authorName || 'Unknown'}
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
                    {!isDeleted && (
                      <button className="btn-danger" onClick={() => handleDelete(a.id)}>
                        Delete
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
