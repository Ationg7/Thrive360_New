import React, { createContext, useState, useContext, useEffect , useRef} from "react";
import { Container, Card, Button } from "react-bootstrap";
import { useAuth } from "../AuthContext";
import { challengesAPI } from "../services/api";
import FloatingPopup from "../Components/FloatingPopup";
import { useNavigate } from "react-router-dom";
import "../App.css";

// -------------------- Context --------------------
const ChallengesContext = createContext();

export const ChallengesProvider = ({ children }) => {
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [allChallenges, setAllChallenges] = useState([]);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const loadUserChallengeHistory = async () => {
      try {
        if (!isLoggedIn) return;

        const [history, challenges] = await Promise.all([
          challengesAPI.getUserHistory(),
          challengesAPI.getChallenges(),
        ]);

        setAllChallenges(challenges);

        const joined = history
          .filter((h) => !h.is_completed)
          .map((h) => {
            const fallbackChallenge = challenges.find((c) => c.id === h.challenge_id) || {};
            const rawDifficulty = h.challenge_difficulty_level || h.difficulty_level || h.difficulty || fallbackChallenge.difficulty_level || fallbackChallenge.difficulty || "Medium";
            const difficulty = String(rawDifficulty).toLowerCase();
            return {
              id: h.challenge_id,
              title: h.challenge_title,
              description: h.challenge_description,
              type: h.challenge_category || h.challenge_type,
              category: h.challenge_category || h.challenge_type,
              status: h.status === "Completed" ? "Completed" : "In Progress",
              progress: h.progress_percentage,
              difficulty,
            };
          });

        const completed = history
          .filter((h) => h.is_completed)
          .map((h) => {
            const fallbackChallenge = challenges.find((c) => c.id === h.challenge_id) || {};
            const rawDifficulty = h.challenge_difficulty_level || h.difficulty_level || h.difficulty || fallbackChallenge.difficulty_level || fallbackChallenge.difficulty || "Medium";
            const difficulty = String(rawDifficulty).toLowerCase();
            return {
              id: h.challenge_id,
              title: h.challenge_title,
              description: h.challenge_description,
              type: h.challenge_category || h.challenge_type,
              category: h.challenge_category || h.challenge_type,
              status: "Completed",
              progress: h.progress_percentage,
              difficulty,
            };
          });

        setJoinedChallenges(joined);
        setCompletedChallenges(completed);
      } catch (err) {
        console.error("Error fetching challenge history:", err);
      }
    };
    loadUserChallengeHistory();
  }, [isLoggedIn]);

  const joinChallenge = async (challenge) => {
    try {
      if (!isLoggedIn) return;

      await challengesAPI.joinChallenge(challenge.id);

      // Fetch updated participants
      const [history, challenges] = await Promise.all([
        challengesAPI.getUserHistory(),
        challengesAPI.getChallenges(),
      ]);

      setAllChallenges(challenges);

      const joined = history.filter((h) => !h.is_completed);
      const completed = history.filter((h) => h.is_completed);

      setJoinedChallenges(
        joined.map((h) => {
          const fallbackChallenge = challenges.find((c) => c.id === h.challenge_id) || {};
          const rawDifficulty = h.challenge_difficulty_level || h.difficulty_level || h.difficulty || fallbackChallenge.difficulty_level || fallbackChallenge.difficulty || "Medium";
          return {
            id: h.challenge_id,
            title: h.challenge_title,
            description: h.challenge_description,
            type: h.challenge_category || h.challenge_type,
            category: h.challenge_category || h.challenge_type,
            status: h.status,
            progress: h.progress_percentage,
            difficulty: String(rawDifficulty).toLowerCase(),
          };
        })
      );
      setCompletedChallenges(
        completed.map((h) => {
          const fallbackChallenge = challenges.find((c) => c.id === h.challenge_id) || {};
          const rawDifficulty = h.challenge_difficulty_level || h.difficulty_level || h.difficulty || fallbackChallenge.difficulty_level || fallbackChallenge.difficulty || "Medium";
          return {
            id: h.challenge_id,
            title: h.challenge_title,
            description: h.challenge_description,
            type: h.challenge_category || h.challenge_type,
            category: h.challenge_category || h.challenge_type,
            status: "Completed",
            progress: h.progress_percentage,
            difficulty: String(rawDifficulty).toLowerCase(),
          };
        })
      );
    } catch (err) {
      console.error("Failed to join challenge:", err);
    }
  };

  const markDone = async (title) => {
    try {
      if (!isLoggedIn) return;
      const item = joinedChallenges.find((c) => c.title === title);
      if (!item) return;

      await challengesAPI.updateProgress(item.id, { progress_percentage: 100 });

      // Show comforting message
      const messages = [
        "🌟 Amazing work! You've completed another challenge!",
        "✨ Congratulations! You're making incredible progress!",
        "🎉 Well done! Every step forward is a victory!",
        "💪 You're doing great! Keep up the excellent work!",
        "🏆 Fantastic! Your dedication is inspiring!",
        "⭐ Outstanding! You're building amazing habits!",
        "🎊 Wonderful! You're on the right track!",
        "💚 Excellent! You're taking care of yourself beautifully!",
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setCompletionMessage(randomMessage);
      setShowCompletionMessage(true);

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowCompletionMessage(false);
      }, 5000);

      const [history, challenges] = await Promise.all([
        challengesAPI.getUserHistory(),
        challengesAPI.getChallenges(),
      ]);

      setAllChallenges(challenges);

      const joined = history.filter((h) => !h.is_completed);
      const completed = history.filter((h) => h.is_completed);

      setJoinedChallenges(
        joined.map((h) => {
          const fallbackChallenge = challenges.find((c) => c.id === h.challenge_id) || {};
          const rawDifficulty = h.challenge_difficulty_level || h.difficulty_level || h.difficulty || fallbackChallenge.difficulty_level || fallbackChallenge.difficulty || "Medium";
          return {
            id: h.challenge_id,
            title: h.challenge_title,
            description: h.challenge_description,
            type: h.challenge_category || h.challenge_type,
            category: h.challenge_category || h.challenge_type,
            status: h.status,
            progress: h.progress_percentage,
            difficulty: String(rawDifficulty).toLowerCase(),
          };
        })
      );
      setCompletedChallenges(
        completed.map((h) => {
          const fallbackChallenge = challenges.find((c) => c.id === h.challenge_id) || {};
          const rawDifficulty = h.challenge_difficulty_level || h.difficulty_level || h.difficulty || fallbackChallenge.difficulty_level || fallbackChallenge.difficulty || "Medium";
          return {
            id: h.challenge_id,
            title: h.challenge_title,
            description: h.challenge_description,
            type: h.challenge_category || h.challenge_type,
            category: h.challenge_category || h.challenge_type,
            status: "Completed",
            progress: h.progress_percentage,
            difficulty: String(rawDifficulty).toLowerCase(),
          };
        })
      );
    } catch (err) {
      console.error("Failed to mark as done:", err);
    }
  };

  return (
    <ChallengesContext.Provider
      value={{ 
        joinedChallenges, 
        completedChallenges, 
        allChallenges, 
        joinChallenge, 
        markDone,
        showCompletionMessage,
        completionMessage,
        setShowCompletionMessage
      }}
    >
      {children}
    </ChallengesContext.Provider>
  );
};

export const useChallenges = () => useContext(ChallengesContext);

// -------------------- Overview Page --------------------
const ChallengesOverview = () => {
  const { isLoggedIn } = useAuth();
  const { 
    joinedChallenges, 
    completedChallenges, 
    allChallenges, 
    markDone,
    showCompletionMessage,
    completionMessage,
    setShowCompletionMessage
  } = useChallenges();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const navigate = useNavigate();

  const handleGuestAction = (action) => {
    setPopupMessage("You need to sign in to access this feature.");
    setShowPopup(true);
  };

  const challengeTypes = ["Daily", "Weekly", "Monthly"];

  const getTheme = (type) => {
    if (type === "Daily") return "blue";
    if (type === "Weekly") return "purple";
    return "lightblue"; // Monthly
  };

  const getStatusStyle = (status) => {
    const base = {
      padding: "2px 8px",
      borderRadius: "12px",
      fontSize: "0.75rem",
      fontWeight: "500",
      textTransform: "capitalize",
      border: "1.5px solid",
      backgroundColor: "transparent",
    };
    if (status === "Completed") return { ...base, borderColor: "#28a745", color: "#28a745" };
    if (status === "In Progress") return { ...base, borderColor: "#ffc107", color: "#ffc107" };
    return { ...base, borderColor: "#007bff", color: "#007bff" };
  };

  const totalChallenges = joinedChallenges.length + completedChallenges.length || 1;
  const completedCount = completedChallenges.length;
  const completedPercent = Math.round((completedCount / totalChallenges) * 100);


  
 const [animatedPercent, setAnimatedPercent] = useState(0);
const  textRef = useRef(null);
const barRef = useRef(null);


// Animate progress on mount or when completedPercent changes
useEffect(() => {
  let start = 0;
  const duration = 800; // ms
  const stepTime = 16; // ~60fps

  const step = () => {
    start += (completedPercent - start) * (stepTime / duration);
    if (Math.abs(start - completedPercent) < 0.5) {
      setAnimatedPercent(completedPercent);
    } else {
      setAnimatedPercent(start);
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}, [completedPercent]);

// Determine text color dynamically
const getTextColor = () => {
  if (!textRef.current || !barRef.current) return "black";

  const barWidth = (barRef.current.offsetWidth / 100) * animatedPercent;
  const textCenter = textRef.current.offsetLeft + textRef.current.offsetWidth / 2;

  return barWidth >= textCenter ? "white" : "black";
};


  return (
    <Container className="challenges-container" style={{ marginTop: "50px" }}>
      {/* Progress Bar */}
      
<div
  className="progress-container"
  style={{
    width: "100%",
    backgroundColor: "white",
    padding: "20px 25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginTop: "50px",
    marginBottom: "30px",
  }}
>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
    <h5 style={{ margin: 0, fontWeight: 600, color: "#1e1e1e" }}>Your Progress</h5>
    <span style={{ fontWeight: 500, color: "#28a745" }}>{Math.round(animatedPercent)}%</span>
  </div>


  <div
    ref={barRef}
    style={{ position: "relative", height: "16px", backgroundColor: "#f1f3f5", borderRadius: "8px", overflow: "hidden" }}
  >
    <div
      style={{
        width: `${animatedPercent}%`,
    height: "100%",
    borderRadius: "8px",
    background: "linear-gradient(90deg, #28a745 25%, #2ecc71 50%, #28a745 75%)",
    backgroundSize: "200% 100%", // allows the gradient to move
    animation: "shimmer 2s linear infinite",
    transition: "width 0.3s ease-out",
      }}
    />
    <span
      ref={textRef}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        fontWeight: 600,
        fontSize: "0.85rem",
        color: getTextColor(),
        zIndex: 2,
        pointerEvents: "none",
        transition: "color 0.2s ease",
      }}
    >
      {completedCount} / {totalChallenges} Completed
    </span>
  </div>
</div>


      <div className="join-challenges-btn">
  <Button
    variant="success"
    size="sm"
    onClick={() => {
      if (!isLoggedIn) handleGuestAction("join");
      else navigate("/challenges/categories");
    }}
  >
    + Join More Challenges
  </Button>
</div>


      {/* Challenge Sections */}
      {challengeTypes.map((type) => {
        const filteredChallenges = joinedChallenges.filter((c) => (c.category || c.type) === type && c.status !== "Completed");

        return (
          <div
            key={type}
            className="challenge-section mb-5"
            style={{ width: "100%", backgroundColor: "#f8f9fa", borderRadius: "10px", padding: "16px 12px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h4 style={{ textAlign: "left", margin: 0 }}>{type} Challenges</h4>
            </div>

            <div className="challenges-grid" style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "flex-start" }}>
              {!filteredChallenges.length && (
                <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 0" }}>
                  <p style={{ margin: 0, fontSize: "16px", color: "#666" }}>No joined challenges yet.</p>
                </div>
              )}

              {filteredChallenges.map((challenge, index) => (
                <div key={index} style={{ flex: "0 0 32%", minWidth: "280px", maxWidth: "32%" }}>
                  <Card
                    className={`challenge ${getTheme(type)} ${!isLoggedIn ? "challenge-guest" : ""}`}
                    onClick={() => { if (!isLoggedIn) handleGuestAction("markDone"); }}
                    style={{ minHeight: "350px", position: "relative", overflow: "hidden" }}
                  >
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <span className="type-tag">{challenge.category || challenge.type}</span>
                      <span style={getStatusStyle(challenge.status)}>{challenge.status}</span>
                    </div>

                    <Card.Body className="d-flex flex-column gap-2 align-items-center">
                      <Card.Title>{challenge.title}</Card.Title>
                      <Card.Text>{challenge.description}</Card.Text>

                      <div className="details w-100 d-flex justify-content-between align-items-center">
                        
                        <span>👥 {allChallenges.find(c => c.id === challenge.id)?.participants ?? 0} participants</span>
                        <span
    className={`px-3 py-1 rounded-pill fw-medium badge-difficulty ${
      challenge.difficulty?.toLowerCase() === "easy"
        ? "easy-border"
        : challenge.difficulty?.toLowerCase() === "hard"
        ? "hard-border"
        : "medium-border"
    }`}
  >
    {challenge.difficulty
      ? challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)
      : "Medium"}
  </span>
                      </div>

                      <Button
                        className="challenge-button mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isLoggedIn) handleGuestAction("markDone");
                          else if (challenge.status !== "Completed") markDone(challenge.title);
                        }}
                        disabled={challenge.status === "Completed"}
                      >
                        {challenge.status === "Completed" ? "Completed" : "Mark as Done"}
                      </Button>
                    </Card.Body>

                    {!isLoggedIn && <div className="challenge-card-overlay">Login to view this challenge</div>}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        );
      })}

     {/* Completion Success Message */}
   {showCompletionMessage && (
  <div className="completion-overlay">
    <div className="completion-box">
      <button
        className="completion-close"
        onClick={() => setShowCompletionMessage(false)}
      >
        ×
      </button>

      <div className="completion-icon">🎉</div>

      <h5 className="completion-title">Challenge Completed!</h5>

      <p className="completion-text">{completionMessage}</p>

      <button
        className="completion-ok"
        onClick={() => setShowCompletionMessage(false)}
      >
        Okay
      </button>
    </div>
  </div>
)}




      {/* Floating Popup for Guests */}
      {showPopup && (
  <div className="guest-popup-overlay">
    <div className="guest-popup">

      {/* Header with title and close X */}
      <div
        className="guest-popup-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}
      >
        <span style={{ fontWeight: 600, fontSize: '18px' }}>Notice</span>
        <span
          style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}
          onClick={() => setShowPopup(false)}
        >
          ✕
        </span>
      </div>

      {/* Line below header */}
      <div className="guest-popup-line"></div>

      {/* Message content */}
      <p className="guest-popup-message" style={{ textAlign: 'center', margin: '30px 0' }}>
        {popupMessage}
      </p>

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: '40px' }}>
        <Button variant="secondary" onClick={() => setShowPopup(false)}>
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={() => {
            setShowPopup(false);
            navigate("/signin");
          }}
        >
          Sign In
        </Button>
      </div>
    </div>
  </div>
)}


      {/* Guest Mode Styles */}
      <style>{`
        .challenge-guest .card-body,
        .challenge-guest .card-header {
          filter: blur(4px);
          pointer-events: none;
        }
        .challenge-card-overlay {
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

        .guest-popup-overlay {
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

        .guest-popup {
          background: #fff;
          border-radius: 12px;
          padding: 20px 25px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          max-width: 350px;
          width: 90%;
          text-align: center;
          animation: slideUp 0.3s ease forwards;
        }

        .guest-popup-line {
          height: 1px;
          background-color: rgba(0,0,0,0.1);
          margin-bottom: 15px;
        }

        .guest-popup-message {
          font-size: 1rem;
          color: #333;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .guest-popup .btn {
          padding: 0.5rem 2rem;
          font-size: 1rem;
          border-radius: 8px;
        }

        .guest-popup .btn + .btn {
          margin-left: 15px;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
       .join-challenges-btn {
  display: flex;
  justify-content: flex-end; /* desktop: right-aligned */
  margin-bottom: 20px;
  height: 45px;
  width: 100%;
}

.join-challenges-btn button {
  min-width: 150px;
}
 /* Completion Message */
/* Background overlay */
.completion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* White popup box */
.completion-box {
  background: #fff;
  padding: 28px;
  width: 380px;
  max-width: 92%;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  position: relative;
  text-align: center;
  animation: fadeIn 0.25s ease;
  font-family: "Poppins", sans-serif;
}

/* Close button (X) */
.completion-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  color: #555;
}

/* Big celebration icon */
.completion-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

/* Title */
.completion-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #222;
}

/* Text message */
.completion-text {
  font-size: 15px;
  color: #555;
  margin-bottom: 20px;
  line-height: 1.5;
}

/* OK Button — same as Bootstrap "success" button */
.completion-ok {
  padding: 10px 24px;
  border-radius: 10px;
  background: #2e7d32;     /* success green */
  border: 1px solid #198754;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

/* Hover — matches Bootstrap success hover */
.completion-ok:hover {
  background: #157347;     /* darker green */
  border-color: #146c43;   /* matching darker border */
  color: white;
}


/* Animation */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}


/* Mobile responsive */
@media (max-width: 768px) {
  .join-challenges-btn {
    justify-content: center;  /* center on mobile */
  }

  .join-challenges-btn button {
    width: 50%;       /* almost full width */
    max-width: 300px; /* optional cap */
    height: 50px;
  }
    .completion-message {
    left: 50%;
    transform: translateX(-50%);
    border-radius: 8px;
    padding: 10px 16px;
    min-width: 260px;
    max-width: 300px;
    font-size: 14px;
  }

  .completion-message-icon {
    font-size: 22px;
  }

  .completion-message-title {
    font-size: 14px;
  }

  .completion-message-text {
    font-size: 12px;
  }

  .completion-message-content {
    gap: 8px;
  }

  .completion-message-close {
    font-size: 16px;
  }
}


      `}</style>
    </Container>
  );
};

export default function Challenges() {
  return (
    <ChallengesProvider>
      <ChallengesOverview />
    </ChallengesProvider>
  );
}