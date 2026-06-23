import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';

function excerpt(body = '', len = 140) {
  const plain = body.replace(/[#*`>\-_[\]()!]/g, '').trim();
  return plain.length > len ? plain.slice(0, len) + '…' : plain;
}

function ArticleRow({ article, currentUser, onDelete }) {
  const isOwner = currentUser && currentUser.id === article.authorId;
  const isAdmin = currentUser && currentUser.role === 'ADMIN';

  return (
    <div className="article-row">
      <div className="article-row-title">
        <Link to={`/articles/${article.id}`}>{article.title}</Link>
      </div>
      {article.body && (
        <div className="article-row-excerpt">{excerpt(article.body)}</div>
      )}
      <div className="article-row-meta">
        <span className="article-row-author">
          {article.authorName || 'Unknown'}
          {article.createdAt && (
            <> · {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
          )}
        </span>
        {article.tags && article.tags.map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
        {(isOwner || isAdmin) && (
          <div className="article-row-actions">
            {isOwner && (
              <Link to={`/articles/${article.id}/edit`}>
                <button className="btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.3rem 0.7rem' }}>
                  Edit
                </button>
              </Link>
            )}
            <button className="btn-danger" onClick={() => onDelete(article.id)}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [q, setQ] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [searching, setSearching] = useState(false);

  const loadAll = useCallback(() => {
    setLoading(true);
    api.getArticles()
      .then(setArticles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    if (!q && tags.length === 0) { loadAll(); return; }
    setSearching(true);
    try {
      const results = await api.searchArticles(q, tags);
      setArticles(results);
    } catch (e) {
      setError(e.message);
    } finally {
      setSearching(false);
    }
  };

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
    <Layout>
      <div className="feed-header">
        <h1 className="feed-title">Latest Articles</h1>

        <form onSubmit={handleSearch}>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by title or content…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={searching}>
              {searching ? 'Searching…' : 'Search'}
            </button>
            {(q || tagsInput) && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => { setQ(''); setTagsInput(''); loadAll(); }}
              >
                Clear
              </button>
            )}
          </div>
          <div className="tag-filter-input">
            <input
              type="text"
              placeholder="Filter by tags (comma-separated: java, spring, redis)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
        </form>
      </div>

      {error && <p className="error-msg">{error}</p>}
      {loading ? (
        <div className="spinner" />
      ) : articles.length === 0 ? (
        <div className="empty-state">
          <p>No articles found.</p>
          {user && (
            <p style={{ marginTop: '0.5rem' }}>
              <Link to="/articles/new">Write the first one →</Link>
            </p>
          )}
        </div>
      ) : (
        <div className="article-list">
          {articles.map((a) => (
            <ArticleRow
              key={a.id}
              article={a}
              currentUser={user}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
