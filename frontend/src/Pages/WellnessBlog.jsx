import React, { useState, useEffect, useRef } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../App.css";

const WellnessBlog = () => {
  const { isLoggedIn } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Topics");
  const [searchTerm, setSearchTerm] = useState("");
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();
  const blogCardsRef = useRef([]);

  // --------- Hardcoded fallback blogs ---------
  const fallbackBlogs = [
    {
      id: 1,
      title: "Finding Balance: How to Manage Academic Stress",
      category: "Mental Health",
      image:
        "https://i.pinimg.com/474x/1e/e6/6a/1ee66a4517d068f5db3b0443684b748b.jpg",
      fullText: "Academic stress is something that almost every student faces...",
      author: "Dr. Channy San",
    },
    {
      id: 2,
      title: "Brain Foods: Eating for Academic Success",
      category: "Nutrition",
      image:
        "https://i.pinimg.com/474x/86/6a/d0/866ad0b1e99a5a6a7809ebe4801b2147.jpg",
      fullText: "The food you eat has a direct impact on how your brain functions...",
      author: "Dr. Channy San",
    },
    {
      id: 3,
      title: "The Student’s Guide to Quality Sleep",
      category: "Physical Wellness",
      image:
        "https://i.pinimg.com/474x/0b/70/38/0b70385eece9929f2460e7e18f8a15e5.jpg",
      fullText: "Quality sleep is often overlooked by students...",
      author: "Dr. Channy San",
    },
    {
      id: 4,
      title: "Stress-Free Studying: Mind Hacks for Exams",
      category: "Stress Management",
      image:
        "https://i.pinimg.com/474x/1e/3e/88/1e3e8884e34fa76dfcfe969d1ec0bb88.jpg",
      fullText: "Exams don’t have to be overwhelming if you approach studying...",
      author: "Dr. Channy San",
    },
  ];

  // --------- Fetch blogs from backend ---------
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/admin/blogs");
        if (!res.ok) throw new Error("Failed to load blogs");

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          setBlogs(fallbackBlogs);
        } else {
          const toImageUrl = (img) => {
            if (!img) return null;
            if (typeof img !== 'string') return null;
            if (img.startsWith('http://') || img.startsWith('https://')) return img;
            return `http://127.0.0.1:8000/storage/${img}`;
          };
          const normalized = data.map((b) => ({
            id: b.id,
            title: b.title,
            category: b.category || "General",
            image: toImageUrl(b.image_url) || toImageUrl(b.image_path) || "https://via.placeholder.com/600x400?text=Health+%26+Wellness",
            fullText: b.content,
            author: b.author_name || "Admin",
          }));
          setBlogs([...fallbackBlogs, ...normalized]);
        }
      } catch (e) {
        console.error("Error fetching blogs:", e);
        setBlogs(fallbackBlogs);
      }
    };

    fetchBlogs();
  }, []);

  // --------- Filtering blogs ---------
  const filteredBlogs =
    activeCategory === "All Topics"
      ? blogs.filter((blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : blogs.filter(
          (blog) =>
            blog.category === activeCategory &&
            blog.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

  // --------- Handle blog click ---------
  const handleCardClick = (blog) => {
    if (isLoggedIn) {
      navigate("/blogdetail", { state: { blog } });
    } else {
      setShowPopup(true);
    }
  };

  // --------- Equal height cards ---------
  useEffect(() => {
    if (blogCardsRef.current.length === 0) return;
    let maxHeight = 0;
    blogCardsRef.current.forEach((card) => {
      if (card) maxHeight = Math.max(maxHeight, card.offsetHeight);
    });
    blogCardsRef.current.forEach((card) => {
      if (card) card.style.height = maxHeight + "px";
    });
  }, [filteredBlogs]);

  return (
    <Container className="wellness-container">
      {/* Categories + Search */}
      <div className="category-search-container">
        <div className="categories">
          {[
            "All Topics",
            "Mental Health",
            "Physical Wellness",
            "Nutrition",
            "Stress Management",
          ].map((category) => (
            <button
              key={category}
              className={activeCategory === category ? "active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Blog Grid */}
      <div className="blog-grid mt-4">
        {filteredBlogs.map((blog, index) => (
          <Card
            key={blog.id}
            ref={(el) => (blogCardsRef.current[index] = el)}
            className={`blog-card${!isLoggedIn ? " blog-card-guest" : ""}`}
            onClick={() => handleCardClick(blog)}
          >
            <Card.Img variant="top" src={blog.image} />
            <div className="blog-card-body">
              <span className="blog-card-category">{blog.category}</span>
              <h5 className="blog-card-title">{blog.title}</h5>
            </div>
            {!isLoggedIn && (
              <div className="blog-card-overlay">Login to read more</div>
            )}
          </Card>
        ))}
      </div>
      {showPopup && (
  <div className="meditation-notif-overlay">
    <div className="meditation-notif-popup">

      {/* Header with title and close X */}
      <div className="notif-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontWeight: 600, fontSize: '18px' }}>Message</span>
        <span 
          style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}
          onClick={() => setShowPopup(false)}
        >
          ✕
        </span>
      </div>

      {/* Line below header */}
      <div className="notif-line"></div>

      {/* Message content */}
      <p className="notif-message"style={{ textAlign: 'center', marginTop: '30px' }}>
        Take your time. When you're ready, log in to explore this feature.
      </p>

      {/* Action button */}
      <div className="notif-btn-container" style={{ textAlign: 'center', marginTop: '40px' }}>
        <Button
          variant="success"
          onClick={() => setShowPopup(false)}
        >
          OK
        </Button>
      </div>
    </div>
  </div>
)}





      <style>{`
        .blog-card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2e7d32;
          font-weight: 600;
          font-size: 1rem;
          text-align: center;
         background: rgba(255,255,255,0.25);
          border-radius: 8px;
          pointer-events: none;
        }

        /* Meditation-style notification */
        .meditation-notif-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backdrop-filter: blur(3px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }

        .meditation-notif-popup {
          background: #fff;
          border-radius: 12px;
          padding: 20px 25px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          max-width: 350px;
          width: 90%;
          text-align: center;
        }

        .notif-message {
          font-size: 1rem;
          color: #333;
          margin-bottom: 15px;
          line-height: 1.4;
        }
         .notif-line {
  height: 1px;
  background-color: rgba(0,0,0,0.1); /* light gray line */
  margin: 15px 0; /* space above and below */
}

        .notif-btn-container {
          display: flex;
          justify-content: center;
        }

        .notif-btn-container .btn {
          padding: 0.5rem 3rem;
          font-size: 1rem;
        }
      `}</style>
    </Container>
  );
};

export default WellnessBlog;
