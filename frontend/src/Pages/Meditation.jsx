// Meditation.js
import React, { useState, useEffect } from "react";
import { Container, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../App.css";

const Meditation = () => {
  const { isLoggedIn } = useAuth(); // ✅ reactive auth state
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("All Topics");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [guides, setGuides] = useState({
    "All Topics": [],
    Meditation: [],
    Stretching: [],
    Workout: [],
  });

  const BASE_URL = "http://127.0.0.1:8000";

  // 🔹 Hardcoded guides
  const hardcodedGuides = {
    Meditation: [
      {
        title: "Beginner’s Breath Awareness",
        category: "Mental Health",
        description:
          "A simple guide to start your meditation journey with breath awareness...",
        image:
          "https://i.pinimg.com/736x/28/90/4e/28904e0443cc6749d2e004c2bbac7639.jpg",
      },
      {
        title: "Managing Anxiety and Stress",
        category: "Mental Health",
        description:
          "Techniques to manage stress and calm your mind during anxious moments...",
        image:
          "https://i.pinimg.com/474x/a9/0f/ba/a90fba4eef258ca5cdec3abdb479fe91.jpg",
      },
    ],
    Stretching: [
      {
        title: "Morning Stretch Routine",
        category: "Physical Health",
        description: "Wake up your body with a refreshing stretch routine...",
        image:
          "https://i.pinimg.com/736x/d7/6d/cd/d76dcddcfaadf653d5ab7a83e91f31d8.jpg",
      },
    ],
    Workout: [
      {
        title: "Full Body Beginner Workout",
        category: "Fitness",
        description:
          "A basic workout for beginners to improve strength and flexibility...",
        image:
          "https://i.pinimg.com/736x/45/aa/fd/45aafdd5b6bb21f77a50a89d33fcb1b5.jpg",
      },
    ],
  };

  // ✅ Normalize backend image URL
  const getImageUrl = (image) => {
    if (!image) return "https://via.placeholder.com/600x400?text=Meditation";
    if (image.startsWith("http")) return image;
    return `${BASE_URL}/storage/${image}`;
  };

  // ✅ Fetch backend and merge with hardcoded
  useEffect(() => {
    const fetchMeditations = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/meditation`);
        if (!res.ok) throw new Error("Failed to load meditations");
        const data = await res.json();

        const mapped = (Array.isArray(data) ? data : []).map((m) => ({
          title: m.title,
          category: m.category || "Meditation",
          description: m.description,
          image: getImageUrl(m.image_url || m.image),
          steps: m.tutorial_steps ? (Array.isArray(m.tutorial_steps) ? m.tutorial_steps : JSON.parse(m.tutorial_steps || '[]')).map(step => ({
            step: step.step,
            title: step.title,
            img: step.image_url ? getImageUrl(step.image_url) : null
          })) : []
        }));

        const meditationData = [...hardcodedGuides.Meditation, ...mapped];
        const stretchingData = [...hardcodedGuides.Stretching];
        const workoutData = [...hardcodedGuides.Workout];

        setGuides({
          "All Topics": [...meditationData, ...stretchingData, ...workoutData],
          Meditation: meditationData,
          Stretching: stretchingData,
          Workout: workoutData,
        });
      } catch (e) {
        console.error("Error fetching meditations:", e);
        const all = [
          ...hardcodedGuides.Meditation,
          ...hardcodedGuides.Stretching,
          ...hardcodedGuides.Workout,
        ];
        setGuides({ "All Topics": all, ...hardcodedGuides });
      }
    };
    fetchMeditations();
  }, []);

  // 🧠 Comforting messages
  const getComfortMessage = (category) => {
    switch (category) {
      case "Mental Health":
        return "Your thoughts are valid. Take a slow breath — it’s okay to feel what you feel.";
      case "Physical Health":
        return "Your body appreciates every small act of care. You’re doing great — one step at a time.";
      case "Fitness":
        return "Strength isn’t built in a day. Progress begins the moment you show up for yourself.";
      default:
        return "Take this moment to pause and breathe. You deserve calm in your day.";
    }
  };

  // ✅ Card click → detail or popup
  const handleCardClick = (guide) => {
    if (isLoggedIn) {
      navigate("/guide-detail", { state: { guide } });
    } else {
      const message = getComfortMessage(guide.category);
      setPopupMessage(message);
      setShowPopup(true);
    }
  };

  // ✅ Search filter
  const filteredGuides = (guides[activeTab] || []).filter((guide) => {
    const term = searchTerm.toLowerCase();
    return (
      (guide.title || "").toLowerCase().includes(term) ||
      (guide.category || "").toLowerCase().includes(term) ||
      (guide.description || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="meditation-page">
      <Container className="meditation-container">
        {/* 🔹 Category Tabs + Search */}
        <div className="category-search-container">
          <div className="categories">
            {Object.keys(guides).map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search guides..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

      {/* 🔹 Guides Grid */}
<div className="guide-grid">
  {filteredGuides.length > 0 ? (
    filteredGuides.map((guide, index) => (
      <Card
        key={index}
        className={`meditation-card guide-card ${!isLoggedIn ? "meditation-card-guest" : ""}`}
        onClick={() => handleCardClick(guide)}
      >
        <img src={guide.image} alt={guide.title} className="card-image" />
        <Card.Body>
          <span className="guide-categories">{guide.category}</span>
          <Card.Title className="card-title">{guide.title}</Card.Title>
        </Card.Body>
        {!isLoggedIn && (
          <div className="meditation-card-overlay">
            Login to view this guide
          </div>
        )}
      </Card>
    ))
  ) : (
    <p className="text-center">No guides found.</p>
  )}
</div>

      </Container>

      {/* 🔹 Guest Popup */}
      {showPopup && (
  <div className="meditation-notif-overlay">
    <div className="meditation-notif-popup">
      <div className="notif-line"></div>
      <p className="notif-message">{popupMessage}</p>
      <div className="notif-btn-container">
        <button className="btn btn-success" onClick={() => setShowPopup(false)}>
          OK
        </button>
      </div>
    </div>
  </div>
)}



      {/* ✅ Styles */}
      <style>{`
     .meditation-notif-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(3px);
  background: rgba(0,0,0,0.2); /* subtle dark overlay like WellnessBlog */
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

.notif-line {
  height: 1px;
  background-color: rgba(0,0,0,0.1); /* light gray line */
  margin: 15px 0; /* space above and below */
}

.notif-message {
  font-size: 1rem;
  color: #333;
  line-height: 1.4;
  margin-bottom: 15px;
}

.notif-btn-container {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.notif-btn-container .btn {
  padding: 0.5rem 3rem;
  font-size: 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}
.meditation-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2e7d32; /* same green */
  font-weight: 600;
  font-size: 1rem;
  text-align: center;
  background: rgba(255,255,255,0.25); /* matches Challenges overlay */
  border-radius: 8px;
  pointer-events: none;
}
  

      `}</style>
    </div>
  );
};

export default Meditation;
