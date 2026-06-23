import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Layout from '../components/Layout';
import { api } from '../api/client';

export default function CreateArticlePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    setSaving(true);
    try {
      const article = await api.createArticle({ title, body, tags });
      navigate(`/articles/${article.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <h1 className="form-page-title">New Article</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text"
            placeholder="What's this article about?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Body</label>
            <button
              type="button"
              className="btn-ghost"
              style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}
              onClick={() => setPreview(!preview)}
            >
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>
          {preview ? (
            <div
              className="markdown-body"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '1rem 1.25rem',
                minHeight: '280px',
              }}
            >
              {body ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
              ) : (
                <span style={{ color: 'var(--muted)' }}>Nothing to preview yet.</span>
              )}
            </div>
          ) : (
            <textarea
              rows={14}
              placeholder="Write in Markdown…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
              required
            />
          )}
          <span className="form-hint">Markdown supported — GFM tables, code blocks, etc.</span>
        </div>

        <div className="form-group">
          <label className="form-label">Tags</label>
          <input
            type="text"
            placeholder="java, spring-boot, redis"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
          <span className="form-hint">Comma-separated</span>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Publishing…' : 'Publish'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate('/feed')}>
            Cancel
          </button>
        </div>
      </form>
    </Layout>
  );
}
