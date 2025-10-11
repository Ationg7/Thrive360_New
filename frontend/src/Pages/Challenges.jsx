import React, { createContext, useState, useContext, useEffect } from "react";
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
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const loadUserChallengeHistory = async () => {
      try {
        if (!isLoggedIn) return;
        const history = await challengesAPI.getUserHistory();
        const joined = history.filter((h) => !h.is_completed).map((h) => ({
          id: h.challenge_id,
          title: h.challenge_title,
          description: h.challenge_type,
          type: h.challenge_type,
          status: h.status === 'Completed' ? 'Completed' : 'In Progress',
          progress: h.progress_percentage,
        }));
        const completed = history.filter((h) => h.is_completed).map((h) => ({
          id: h.challenge_id,
          title: h.challenge_title,
          description: h.challenge_type,
          type: h.challenge_type,
          status: 'Completed',
          progress: h.progress_percentage,
        }));
        setJoinedChallenges(joined);
        setCompletedChallenges(completed);
      } catch (err) {
        console.error('Error fetching challenge history:', err);
      }
    };
    loadUserChallengeHistory();
  }, [isLoggedIn]);

  const joinChallenge = async (challenge) => {
    try {
      if (!isLoggedIn) return;
      await challengesAPI.joinChallenge(challenge.id);
      // Refresh history
      const history = await challengesAPI.getUserHistory();
      const joined = history.filter((h) => !h.is_completed);
      const completed = history.filter((h) => h.is_completed);
      setJoinedChallenges(joined.map((h) => ({ id: h.challenge_id, title: h.challenge_title, description: h.challenge_type, type: h.challenge_type, status: h.status, progress: h.progress_percentage })));
      setCompletedChallenges(completed.map((h) => ({ id: h.challenge_id, title: h.challenge_title, description: h.challenge_type, type: h.challenge_type, status: 'Completed', progress: h.progress_percentage })));
    } catch (err) {
      console.error('Failed to join challenge:', err);
    }
  };

  const markDone = async (title) => {
    try {
      if (!isLoggedIn) return;
      const item = joinedChallenges.find((c) => c.title === title);
      if (!item) return;
      await challengesAPI.updateProgress(item.id, { progress_percentage: 100 });
      // Refresh lists
      const history = await challengesAPI.getUserHistory();
      const joined = history.filter((h) => !h.is_completed);
      const completed = history.filter((h) => h.is_completed);
      setJoinedChallenges(joined.map((h) => ({ id: h.challenge_id, title: h.challenge_title, description: h.challenge_type, type: h.challenge_type, status: h.status, progress: h.progress_percentage })));
      setCompletedChallenges(completed.map((h) => ({ id: h.challenge_id, title: h.challenge_title, description: h.challenge_type, type: h.challenge_type, status: 'Completed', progress: h.progress_percentage })));
    } catch (err) {
      console.error('Failed to mark as done:', err);
    }
  };

  return (
    <ChallengesContext.Provider value={{ joinedChallenges, completedChallenges, joinChallenge, markDone }}>
      {children}
    </ChallengesContext.Provider>
  );
};

export const useChallenges = () => useContext(ChallengesContext);

// -------------------- Overview Page --------------------
const ChallengesOverview = () => {
  const { isLoggedIn } = useAuth();
  const { joinedChallenges, completedChallenges, markDone } = useChallenges(); // include completedChallenges
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupAction, setPopupAction] = useState(null);
  const navigate = useNavigate();

  const handleGuestAction = (action) => {
    setPopupMessage("You need to sign in to access this feature.");
    setPopupAction(action);
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

  // Correct progress calculation
  const totalChallenges = joinedChallenges.length + completedChallenges.length || 1;
  const completedCount = completedChallenges.length;
  const completedPercent = Math.round((completedCount / totalChallenges) * 100);

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
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          marginTop: "50px",
          marginBottom: "30px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h5 style={{ margin: 0, fontWeight: 600, color: "#1e1e1e" }}>Your Progress</h5>
          <span style={{ fontWeight: 500, color: "#28a745" }}>{completedPercent}%</span>
        </div>
        <div style={{ position: "relative", height: "16px", backgroundColor: "#f1f3f5", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ width: `${completedPercent}%`, backgroundColor: "#28a745", height: "100%", borderRadius: "8px", transition: "width 0.4s ease" }} />
          <span
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              fontWeight: 500,
              fontSize: "0.85rem",
              color: completedPercent >= 50 ? "white" : "black",
            }}
          >
            {completedCount} / {totalChallenges} Completed
          </span>
        </div>
      </div>

      {/* Challenge Sections */}
      {challengeTypes.map((type) => {
        const filteredChallenges = joinedChallenges.filter((c) => c.type === type && c.status !== "Completed");

        return (
          <div
            key={type}
            className="challenge-section mb-5"
            style={{ width: "100%", backgroundColor: "#f8f9fa", borderRadius: "10px", padding: "16px 12px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h4 style={{ textAlign: "left", margin: 0 }}>{type} Challenges</h4>

              {type === "Daily" && (
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
              )}
            </div>

            <div className="challenges-grid" style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "flex-start" }}>
              {!filteredChallenges.length && (
                <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 0" }}>
                  <p style={{ margin: 0, fontSize: "16px", color: "#666" }}>
                    No joined challenges yet.
                  </p>
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
                      <span className="type-tag">{challenge.type}</span>
                      <span style={getStatusStyle(challenge.status)}>{challenge.status}</span>
                    </div>

                    <Card.Body className="d-flex flex-column gap-2">
                      <Card.Title>{challenge.title}</Card.Title>
                      <Card.Text>{challenge.description}</Card.Text>

                      <div className="details d-flex justify-content-between">
                        <span>📅 {challenge.days_left ?? challenge.daysLeft ?? 34} days left</span>
                        <span>👥 {challenge.participants ?? 140} participants</span>
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

                    {!isLoggedIn && (
                      <div className="challenge-card-overlay">
                        Login to view this challenge
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Floating Popup for Guests */}
      {showPopup && (
        <div className="guest-popup-overlay">
          <div className="guest-popup">
            <div className="guest-popup-line"></div>
            <p className="guest-popup-message">{popupMessage}</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
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
