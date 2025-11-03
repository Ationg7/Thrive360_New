import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";

const BlogDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { blog } = location.state || {};

  if (!blog) {
    navigate("/wellnessblog");
    return null;
  }

  // Define top foods per category
  const topFoodsByCategory = {
    "Mental Health": [
      "Blueberries",
      "Salmon",
      "Walnuts",
      "Dark Chocolate",
      "Spinach",
      "Turmeric",
      "Pumpkin Seeds",
      "Green Tea",
      "Oats",
      "Eggs"
    ],
    "Physical Wellness": [
      "Chicken Breast",
      "Quinoa",
      "Broccoli",
      "Sweet Potatoes",
      "Almonds",
      "Salmon",
      "Greek Yogurt",
      "Spinach",
      "Berries",
      "Avocado"
    ],
    "Nutrition": [
      "Oats",
      "Chia Seeds",
      "Lentils",
      "Brown Rice",
      "Almonds",
      "Quinoa",
      "Spinach",
      "Eggs",
      "Avocado",
      "Greek Yogurt"
    ],
    "Stress Management": [
      "Dark Chocolate",
      "Chamomile Tea",
      "Salmon",
      "Blueberries",
      "Nuts",
      "Spinach",
      "Avocado",
      "Oats",
      "Green Tea",
      "Bananas"
    ],
  };

  // Get top foods for this category
  const topFoods = topFoodsByCategory[blog.category] || [];

  // Function to split text into paragraphs of 5 sentences, respecting existing double line breaks
  const formatBlogText = (text) => {
    // Split by double line breaks first
    const blocks = text.split("\n\n");
    const paragraphs = [];

    blocks.forEach(block => {
      // Split block into sentences
      const sentences = block.match(/[^.!?]+[.!?]+/g) || [];
      // Group sentences into 5 per paragraph
      for (let i = 0; i < sentences.length; i += 5) {
        paragraphs.push(sentences.slice(i, i + 5).join(" ").trim());
      }
    });

    return paragraphs;
  };

  const paragraphs = formatBlogText(blog.fullText);

  return (
    <div className="guide-wrapper">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="blog-container">
        {/* Main Content */}
        <div className="blog-left">
          <div className="card blog-main-card">
            <h1 className="blog-titles">{blog.title}</h1>
            <p className="blog-date">{blog.date}</p>

            <div className="category">
              <p>{blog.category}</p>
            </div>

            <div className="blog-images">
              <img 
                src={blog.image} 
                alt={blog.title} 
                onLoad={(e) => e.target.style.height = "auto"} 
              />
            </div>

            <div className="blog-content">
              {paragraphs.map((para, index) => (
                <p key={index}>{para}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="blog-sidebar">
          <div className="sidebar-section card author-card">
            <img
              src="https://via.placeholder.com/300x200"
              alt={blog.author}
              className="author-img"
            />
            <h4>HEY, I’M {blog.author}</h4>
            <p>
              We are passionate about mental health and wellness. 
              We created Thrive360 to help students to develop personalized self-care routines and track their well-being,
              because taking care of yourself looks different for everyone.
            </p>
          </div>

          {/* Top Foods */}
          <div className="card top-foods-card minimalist">
            <h3 className="top-foods-header">Top 10 Healthy Foods</h3>
            <ul className="top-foods-list">
              {topFoods.map((food, index) => (
                <li key={index}>
                  <span className="food-rank">{index + 1}.</span> {food}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
