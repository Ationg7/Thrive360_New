import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";

const BlogDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { blog, allBlogs } = location.state || {};

  // Redirect back if no blog is provided
  if (!blog) {
    navigate("/wellnessblog");
    return null;
  }

  // Format blog text into paragraphs
  const formatBlogText = (text) => {
    const blocks = text.split("\n\n");
    const paragraphs = [];

    blocks.forEach((block) => {
      const sentences = block.match(/[^.!?]+[.!?]+/g) || [];
      for (let i = 0; i < sentences.length; i += 5) {
        paragraphs.push(sentences.slice(i, i + 5).join(" ").trim());
      }
    });

    return paragraphs;
  };

  const paragraphs = formatBlogText(blog.fullText);

  // Get related articles (5 max) from the same category
  const relatedArticles = (allBlogs || [])
    .filter((b) => b.category === blog.category && b.id !== blog.id)
    .slice(0, 5);

  return (
    <div className="blog-detail-wrapper">
      {/* HEADER BANNER */}
      <div className="blog-header-banner">
        <img src={blog.image} alt={blog.title} className="banner-img" />
        <div className="banner-text">
          <h1 className="banner-title">{blog.title}</h1>
          <span className="banner-category">{blog.category}</span>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      {/* MAIN LAYOUT */}
<div className="blog-layout">
  {/* CONTENT AREA */}
  <div className="blog-content-area">
    <div className="content-card">
  {/* Full blog text at the top */}
 <p
  className="content-excerpt"
  
>
  {blog.fullText}
</p>

  {/* Full blog paragraphs */}
  {paragraphs.map((para, index) => (
    <p key={index} className="content-paragraph">
      {para}
    </p>
  ))}
</div>
</div>

  {/* SIDEBAR - Related Articles */}
  <div className="blog-sidebar-area">
    <div className="related-articles-card">
      <h3>Related Articles</h3>
      {relatedArticles.length === 0 && <p>No related articles.</p>}

      <div className="related-articles-list">
        {relatedArticles.map((item) => (
          <div 
            key={item.id} 
            className="related-article-card"
            style={{
              marginBottom: "15px",
              cursor: "pointer",
              border: "1px solid #ddd",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
            onClick={() =>
              navigate("/blogdetail", { state: { blog: item, allBlogs } })
            }
          >
            <img
              src={item.image}
              alt={item.title}
              style={{
               width: "150px",   // fixed width for uniformity
    height: "100px",  // adjust height to match aspect ratio
    objectFit: "cover", 
    borderRadius: "12px",
    flexShrink: 0      // prevents image from shrinking when card resizes
              }}
            />
            <div style={{ padding: "10px" }}>
              <h5 style={{ fontSize: "14px", marginBottom: "5px" }}>{item.title}</h5>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "12px",
                  color: "#2e7d32", 
                  border: "1px solid #2e7d32", 
                  borderRadius: "6px",
                  padding: "2px 6px",
                  backgroundColor: "transparent"
                }}
              >
                {item.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

    </div>
  );
};

export default BlogDetail;
