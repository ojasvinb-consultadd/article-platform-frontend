import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Layout from '../components/Layout';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getArticle(id)
      .then(setArticle)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this article?')) return;
    try {
      await api.deleteArticle(id);
      navigate('/feed');
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  };

  const isOwner = user && article && user.id === article.authorId;
  const isAdmin = user && user.role === 'ADMIN';

  if (loading) return <Layout><div className="spinner" /></Layout>;
  if (error) return <Layout><p className="error-msg">{error}</p></Layout>;
  if (!article) return null;

  return (
    <Layout>
      <div className="article-detail-header">
        <h1 className="article-detail-title">{article.title}</h1>

        <div className="article-detail-meta">
          <span>{article.authorName || 'Unknown author'}</span>
          {article.createdAt && (
            <span>
              {new Date(article.createdAt).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </span>
          )}
          {article.viewCount !== undefined && (
            <span className="article-detail-views">{article.viewCount} views</span>
          )}
          {article.tags && article.tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>

        {(isOwner || isAdmin) && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            {isOwner && (
              <Link to={`/articles/${id}/edit`}>
                <button className="btn-ghost">Edit</button>
              </Link>
            )}
            <button className="btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.body}
        </ReactMarkdown>
      </div>
    </Layout>
  );
}
