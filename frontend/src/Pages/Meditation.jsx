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
      category: "Meditation",
      description:
        "Beginner’s breath awareness is a simple yet powerful practice that helps you connect with your breathing to relax your mind and body. This routine teaches you to notice your natural breath, observe how it feels, and gently guide it to become deeper and more steady. By focusing on slow, mindful breathing, you can reduce stress, quiet racing thoughts, and bring yourself into the present moment. It’s perfect for beginners because it doesn’t require any special skills—just a comfortable space and a few minutes of focus. Over time, breath awareness improves emotional balance, enhances concentration, and supports overall well-being, making it an effective tool for managing anxiety and building inner calm.",
      steps: [
        {
          step: 1,
          title: "Settle In",
          description:
            "Find a comfortable seated or lying position. Relax your shoulders and place your hands gently on your lap or by your sides.",
          img: "https://i.pinimg.com/1200x/be/2e/32/be2e32e9345b6ac66cfe984e248bf0d7.jpg"
        },
        {
          step: 2,
          title: "Close Your Eyes",
          description:
            "Softly close your eyes (or keep a soft gaze). Allow your body to soften and take a moment to notice how you feel.",
          img: "https://i.pinimg.com/1200x/1a/1d/b6/1a1db6db02978a5268d05d05aacdd9b4.jpg"
        },
        {
          step: 3,
          title: "Inhale Deeply",
          description:
            "Breathe in slowly through your nose, feeling the breath expand your belly and chest. Count to 4 if it helps.",
          img: "https://i.pinimg.com/736x/48/f9/02/48f902ec6048bcddf8359c6c28b3739a.jpg"
        },
        {
          step: 4,
          title: "Exhale Gently",
          description:
            "Release your breath slowly through your mouth or nose, letting your body relax. Try a 1:1 or 4:4 rhythm.",
          img: "https://i.pinimg.com/736x/52/c1/28/52c128c3b33ebc7d03696aab14bf04a5.jpg"
        },
       
      ],
      image:
        "https://i.pinimg.com/1200x/af/dc/11/afdc1124fce580df37a111e0623e8498.jpg"
    },
    {
      title: "Managing Anxiety and Stress",
      category: "Meditation",
      description:
        "Managing anxiety and stress involves learning healthy ways to calm the mind, relax the body, and create balance in daily life. This routine focuses on simple practices such as deep breathing, grounding techniques, mindfulness, and gentle movements that help reduce tension and overwhelming thoughts. It teaches you how to identify triggers, respond with healthier coping strategies, and regain a sense of control during stressful moments. By practicing regularly, you can improve emotional resilience, enhance focus, and maintain a more peaceful mindset throughout the day. This is perfect for students, professionals, or anyone dealing with busy schedules and constant pressure—helping you stay centered, relaxed, and mentally strong.",
      steps: [
        {
          step: 1,
          title: "Get Comfortable",
          description:
            "Sit in a chair or cross-legged and rest your hands on your head.",
          img: "https://i.pinimg.com/736x/c4/35/3a/c4353a0aa6f08c2d96a63973899b8eaf.jpg"
        },
        {
          step: 2,
          title: "Begin Deep Breaths",
          description:
            "Inhale for 4 counts, hold for 2, exhale for 6. Repeat 4 times.",
          img: "https://i.pinimg.com/736x/96/41/ef/9641ef3fd84b77d38921556ed73f214f.jpg"
        },
        {
          step: 3,
          title: "Scan Your Body",
          description:
            "Bring awareness from head to toe and relax any tense areas.",
          img: "https://i.pinimg.com/736x/ca/db/32/cadb3288a1041d99ee0fce6784b10f62.jpg"
        },
        {
          step: 4,
          title: "Grounding Exercise",
          description:
            "Name 3 things you see, 2 you feel, and 1 you hear.",
          img: "https://i.pinimg.com/1200x/62/b1/80/62b180530490c99fc98e80619269f494.jpg"
        },
        {
          step: 5,
          title: "Gentle Movement",
          description:
            "Roll your shoulders or stretch lightly to release tension.",
          img: "https://i.pinimg.com/1200x/2c/94/25/2c94256e4180c66ecd7ace91f504cd8c.jpg"
        },
        {
          step: 6,
          title: "Reframe Thoughts",
          description:
            "Label thoughts and repeat a calming phrase like “I am safe.”",
          img: "https://i.pinimg.com/736x/46/e3/bd/46e3bd9bbe0052f9711d4a54135791b7.jpg"
        },
        {
          step: 7,
          title: "Finish with Calm Breathing",
          description:
            "End with 1–3 minutes of slow breathing.",
          img: "https://i.pinimg.com/1200x/69/de/2a/69de2affb5f744df495a7b93ebc40b42.jpg"
        }
      ],
      image:
        "https://i.pinimg.com/736x/71/0f/53/710f5304726fc51602db5eed448bec66.jpg"
    }
  ],

  Stretching: [
    {
      title: "Morning Stretch Routine",
      category: "Stretching",
      description:
        "A morning stretch routine is a gentle and refreshing way to wake up your body and mind at the start of the day. This routine focuses on slow, intentional movements that loosen tight muscles, improve flexibility, and increase circulation after a night of rest. Each stretch is designed to reduce stiffness in areas like the neck, shoulders, back, and legs—helping you feel lighter, more relaxed, and ready for the day’s tasks. It also helps improve posture, reduce tension, and boost mental clarity by encouraging mindful breathing. Whether you’re preparing for school, work, or a busy day ahead, this routine sets a positive tone and helps you start your morning with energy, calmness, and focus.",
      steps: [
        {
          step: 1,
          title: "Full-Body Reach",
          description: "Lift arms overhead and stretch upward for 10 seconds.",
          img: "https://i.pinimg.com/736x/3d/7f/c3/3d7fc34486d0bcd66dcc21aa3cecbdd8.jpg"
        },
        {
          step: 2,
          title: "Neck Tilt",
          description: "Tilt your head left and right, holding 10–15 seconds.",
          img: "https://i.pinimg.com/736x/9a/18/54/9a18546023f6309a900be5cfd9573eaa.jpg"
        },
        {
          step: 3,
          title: "Shoulder Rolls",
          description: "Roll shoulders forward 5 times and backward 5 times.",
          img: "https://i.pinimg.com/1200x/4d/82/52/4d8252cf72738f3e2bbe0171567ad426.jpg"
        },
        {
          step: 4,
          title: "Cross-Body Arm Stretch",
          description: "Hold each arm across your chest for 15 seconds.",
          img: "https://i.pinimg.com/736x/48/fe/85/48fe85fd9bc2ecb2e0ad4400dd0316e0.jpg"
        },
        {
          step: 5,
          title: "Forward Fold",
          description:
            "Hinge forward and stretch your hamstrings for 15–20 seconds.",
          img: "https://i.pinimg.com/1200x/21/67/aa/2167aa8ae4e7cd378d8dff0eb7c64ff1.jpg"
        },
        {
          step: 6,
          title: "Knee-to-Chest",
          description:
            "Pull one knee to your chest for 15 seconds, then switch sides.",
          img: "https://i.pinimg.com/1200x/ff/b1/22/ffb122f673f6a33b206f4c2484c56e37.jpg"
        },
        {
          step: 7,
          title: "Final Stretch",
          description: "Reach overhead and take 3 deep breaths.",
          img: "https://i.pinimg.com/1200x/02/e5/c3/02e5c32a68e75138461846acb7e494c7.jpg"
        }
      ],
      image:
        "https://i.pinimg.com/736x/c5/63/92/c5639247816a8db896c5c50720270fae.jpg"
    }
  ],

  Workout: [
    {
      title: "Full Body Beginner Workout",
      category: "Workout",
      description:
        "This full body beginner workout is designed to help new learners build strength, improve mobility, and develop healthy exercise habits. It includes simple, low-impact movements that target all major muscle groups—arms, legs, core, and back—without requiring any equipment. The routine focuses on proper form, controlled movements, and gradual progression, making it perfect for anyone starting their fitness journey or returning after a break. With consistent practice, this workout helps increase energy, improve posture, and build a strong foundation for more advanced exercises in the future.",
      steps: [
        {
          step: 1,
          title: "Warm-Up March",
          description:
            "March in place for 30–45 seconds to warm your muscles.",
          img: "https://i.pinimg.com/736x/c2/2e/c8/c22ec8b06b26546804a3293a267de999.jpg"
        },
        {
          step: 2,
          title: "Bodyweight Squats",
          description: "Do 10 slow squats with proper form.",
          img: "https://i.pinimg.com/1200x/7e/23/b8/7e23b8a003de6e3d8fe01d541a52fc89.jpg"
        },
        {
          step: 3,
          title: "Push-Ups",
          description: "Perform 8–12 modified push-ups at your pace.",
          img: "https://i.pinimg.com/736x/00/f8/a0/00f8a09077e33f6c8f13e62c4ce10e02.jpg"
        },
        {
          step: 4,
          title: "Plank Hold",
          description: "Hold a plank for 15–30 seconds with core engaged.",
          img: "https://i.pinimg.com/1200x/d7/89/d7/d789d7607655a2a2c0a6d936ae7b4f84.jpg"
        },
        {
          step: 5,
          title: "Alternating Lunges",
          description: "Do 10 lunges, 5 per leg.",
          img: "https://i.pinimg.com/736x/71/2d/03/712d038a579447e72f923fbe3441217e.jpg"
        },
        {
          step: 6,
          title: "Glute Bridges",
          description: "Lift hips for 12 controlled bridges.",
          img: "https://i.pinimg.com/1200x/cc/49/ee/cc49ee209a1465028113ae6a4c46815d.jpg"
        },
        {
          step: 7,
          title: "Cool-Down Stretch",
          description:
            "Stretch lightly for 60 seconds to relax your muscles.",
          img: "https://i.pinimg.com/1200x/fb/f8/e2/fbf8e22764b30c76920e1f5b7dd9ba6f.jpg"
        }
      ],
      image:
        "https://i.pinimg.com/1200x/af/e0/f4/afe0f415ce65fd875f635d33409eeb6b.jpg"
    }
  ]
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


        const mapped = (Array.isArray(data) ? data : []).map((m) => {
          const normalizedCategory = (m.category || "Meditation").trim();
          return {
            id: m.id, // Preserve ID for backend guides
            title: m.title,
            category: normalizedCategory,
            description: m.description,
            image: getImageUrl(m.image_url || m.image),
            steps: m.tutorial_steps
              ? (Array.isArray(m.tutorial_steps)
                  ? m.tutorial_steps
                  : JSON.parse(m.tutorial_steps || "[]"))
                  .map((step) => ({
                    step: step.step,
                    title: step.title,
                    description: step.description,
                    img: step.image_url ? getImageUrl(step.image_url) : null,
                  }))
              : [],
          };
        });

        const meditationBackend = [];
        const stretchingBackend = [];
        const workoutBackend = [];
        mapped.forEach((g) => {
          const cat = (g.category || "Meditation").trim().toLowerCase();
          if (cat === "stretching") stretchingBackend.push(g);
          else if (cat === "workout") workoutBackend.push(g);
          else meditationBackend.push(g);
        });




        const meditationData = [...hardcodedGuides.Meditation, ...meditationBackend];
        const stretchingData = [...hardcodedGuides.Stretching, ...stretchingBackend];
        const workoutData = [...hardcodedGuides.Workout, ...workoutBackend];



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
      <div key={index} className="guide-card meditation-card" onClick={() => handleCardClick(guide)}>
        <img src={guide.image} alt={guide.title} className="card-image" />

        <div className="blog-card-body">
          <span className="guide-categories">{guide.category}</span>
          <h3 className="card-title">{guide.title}</h3>
          
        </div>

        {!isLoggedIn && (
          <div className="meditation-card-overlay">
            Login to view this guide
          </div>
        )}
      </div>
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
      {/* Header with title and close X */}
      <div className="notif-header">
        <span className="notif-title">Message</span>
        <span
          className="notif-close"
          onClick={() => setShowPopup(false)}
          style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}
        >
          ✕
        </span>
      </div>

      {/* Divider line */}
      <div className="notif-line"></div>

      {/* Message content */}
      <p className="notif-message"style={{ textAlign: 'center', marginTop: '30px' }}>{popupMessage}</p>

      {/* Action button */}
      <div className="notif-btn-container"style={{ textAlign: 'center', marginTop: '40px' }}>
        <button className="btn btn-success" onClick={() => setShowPopup(false)}>
          OK
        </button>
      </div>
    </div>
  </div>
)}




      {/* ✅ Styles */}
      <style>{`
      
.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.notif-title {
  font-weight: 600;
  font-size: 18px;
}

.notif-close:hover {
  color: red;
}

     .meditation-notif-overlay {
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
          pointer-events: auto;
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
  

      `}</style>
    </div>
  );
};

export default Meditation;
