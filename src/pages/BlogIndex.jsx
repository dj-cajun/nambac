import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BLOG_POSTS } from '../content/blogPosts';
import './Blog.css';

export default function BlogIndex() {
  return (
    <div className="blog-page">
      <Helmet>
        <title>Insights — nambac.xyz</title>
        <meta name="description" content="Bài viết phân tích về quiz online, Gen Z Việt Nam và AI trong giải trí số." />
      </Helmet>

      <header className="blog-header">
        <Link to="/" className="blog-back">← Trang chủ</Link>
        <h1>Insights</h1>
        <p className="blog-tagline">
          Phân tích văn hóa số, quiz online và Gen Z Việt Nam — nội dung biên tập, không phải quảng cáo.
        </p>
      </header>

      <ul className="blog-list">
        {BLOG_POSTS.map((post) => (
          <li key={post.slug} className="blog-card">
            <time className="blog-date" dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            <h2>
              <Link to={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="blog-excerpt">{post.excerpt}</p>
            <p className="blog-meta">{post.readMinutes} phút đọc</p>
            <Link to={`/blog/${post.slug}`} className="blog-read-more">
              Đọc tiếp →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
