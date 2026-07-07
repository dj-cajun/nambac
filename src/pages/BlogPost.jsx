import { Link, useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getPostBySlug } from '../content/blogPosts';
import './Blog.css';

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <article className="blog-page blog-article">
      <Helmet>
        <title>{post.metaTitle || `${post.title} — nambac.xyz Insights`}</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <header className="blog-header">
        <Link to="/blog" className="blog-back">← Tất cả bài viết</Link>
        <time className="blog-date" dateTime={post.date}>
          {new Date(post.date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </time>
        <h1>{post.title}</h1>
        {post.subtitle && <p className="blog-subtitle">{post.subtitle}</p>}
        <p className="blog-meta">{post.readMinutes} phút đọc</p>
      </header>

      <div className="blog-body">
        {post.lead?.map((para) => (
          <p key={para.slice(0, 40)} className="blog-lead">{para}</p>
        ))}
        {post.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
            ))}
          </section>
        ))}
      </div>

      <footer className="blog-article-footer">
        <p>
          Bạn muốn thử trắc nghiệm? <Link to="/">Về trang chủ nambac.xyz</Link>
        </p>
        <p>
          <Link to="/editorial-policy">Chính sách nội dung &amp; AI</Link>
          {' · '}
          <Link to="/privacy-policy">Bảo mật</Link>
        </p>
      </footer>
    </article>
  );
}
