import React, { useEffect, useState } from "react";
import { Container, Card, Button, Nav, Tab } from "react-bootstrap";
import { useChallenges } from "../Pages/Challenges";
import { challengesAPI } from "../services/api";
import { useAuth } from "../AuthContext";
import FloatingPopup from "../Components/FloatingPopup";
import "../App.css";

const getTheme = (type) => {
  if (type === "Daily") return "blue";
  if (type === "Weekly") return "purple";
  return "lightblue"; // Monthly
};

const ChallengesCategories = () => {
  const { joinedChallenges, joinChallenge } = useChallenges();
  const { isLoggedIn } = useAuth();
  const [allChallenges, setAllChallenges] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        let challenges = await challengesAPI.getChallenges();

        // Add an extra Monthly challenge for consistency
        const monthlyChallenges = challenges.filter((c) => c.type === "Monthly");
        if (monthlyChallenges.length === 1) {
          challenges.push({
            id: "monthly-2",
            type: "Monthly",
            title: "Monthly Challenge 2",
            description: "Extra Monthly challenge to match layout width.",
            daysLeft: 30,
            participants: 50,
          });
        }

        setAllChallenges(challenges);
      } catch (err) {
        console.error("Error loading challenges:", err);
      }
    };
    loadChallenges();
  }, []);

  const handleJoin = (challenge) => {
    if (!isLoggedIn) {
      setShowPopup(true);
      return;
    }

    if (!joinedChallenges.some((c) => c.title === challenge.title)) {
      joinChallenge({
        ...challenge,
        status: "In Progress",
        progress: 0,
        theme: getTheme(challenge.type),
      });
    }
  };

  const challengeTypes = ["Daily", "Weekly", "Monthly"];

  return (
    <Container className="challenges-container" style={{ marginTop: "50px" }}>
      {/* Header */}
      <div className="header text-center mb-4">
        <h2>All Challenges</h2>
        <p className="description">
          Choose challenges to join and improve your habits!
        </p>
      </div>

      {/* Tabs for Daily / Weekly / Monthly */}
      <Tab.Container defaultActiveKey="Daily">
        <Nav variant="tabs" className="mb-3 justify-content-center">
          {challengeTypes.map((type) => (
            <Nav.Item key={type}>
              <Nav.Link eventKey={type}>{type}</Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        <Tab.Content>
          {challengeTypes.map((type) => (
            <Tab.Pane eventKey={type} key={type}>
              {/* ✅ Fixed Grid */}
              <div
                className={`challenges-grid ${type.toLowerCase()}`}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "20px",
                  justifyContent: "flex-start",
                  width: "100%",
                }}
              >
                {allChallenges
                  .filter((c) => c.type === type)
                  .map((challenge, index) => {
                    const isJoined = joinedChallenges.some(
                      (jc) => jc.title === challenge.title
                    );
                    return (
                      <div
                        key={challenge.id ?? index}
                        style={{
                          flex: "1 1 32%",
                          minWidth: "280px",
                          maxWidth: "32%",
                        }}
                      >
                        <Card
                          className={`challenge ${getTheme(type)}`}
                          style={{
                            minHeight: "350px",
                            borderRadius: "10px",
                            backgroundColor: "#f8f9fa",
                            overflow: "hidden",
                            height: "100%",
                          }}
                        >
                          {/* Header with status tag */}
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <span className="type-tag">{challenge.type}</span>
                            <span
                              className="status-tag"
                              style={{
                                border: `2px solid ${
                                  isJoined
                                    ? "#28a745"
                                    : getTheme(type) === "blue"
                                    ? "#007bff"
                                    : getTheme(type) === "purple"
                                    ? "#6f42c1"
                                    : "#17a2b8"
                                }`,
                                borderRadius: "20px",
                                padding: "2px 10px",
                                color: isJoined
                                  ? "#28a745"
                                  : getTheme(type) === "blue"
                                  ? "#007bff"
                                  : getTheme(type) === "purple"
                                  ? "#6f42c1"
                                  : "#17a2b8",
                                background: "transparent",
                                fontWeight: 500,
                                fontSize: "0.85rem",
                              }}
                            >
                              {isJoined ? "Joined" : "Join"}
                            </span>
                          </div>

                          {/* Card Body */}
                          <Card.Body className="d-flex flex-column gap-2">
                            <Card.Title>{challenge.title}</Card.Title>
                            <Card.Text>{challenge.description}</Card.Text>

                            <div className="details d-flex justify-content-between">
                              <span>
  📅 {challenge.duration_days ?? 34} days left
</span>

                              <span>
                                👥 {challenge.participants ?? 140} participants
                              </span>
                            </div>

                            <Button
                              className="challenge-button mt-1"
                              onClick={() => handleJoin(challenge)}
                              disabled={isJoined}
                            >
                              {isJoined ? "Joined" : "Join Challenge"}
                            </Button>
                          </Card.Body>
                        </Card>
                      </div>
                    );
                  })}

                {/* ✅ Invisible placeholders for equal row width */}
                {(() => {
                  const count = allChallenges.filter(
                    (c) => c.type === type
                  ).length;
                  const placeholders = 3 - count; // assume 3 cards per row layout
                  return placeholders > 0
                    ? Array.from({ length: placeholders }).map((_, i) => (
                        <div
                          key={`placeholder-${i}`}
                          style={{
                            flex: "1 1 32%",
                            minWidth: "280px",
                            maxWidth: "32%",
                            visibility: "hidden",
                          }}
                        />
                      ))
                    : null;
                })()}
              </div>

              {/* No challenges fallback */}
              {allChallenges.filter((c) => c.type === type).length === 0 && (
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    color: "#777",
                    padding: "20px",
                  }}
                >
                  No challenges added yet.
                </div>
              )}
            </Tab.Pane>
          ))}
        </Tab.Content>
      </Tab.Container>

      <FloatingPopup
        show={showPopup}
        onHide={() => setShowPopup(false)}
        message="Take your time. When you’re ready, log in to explore this feature."
      />
    </Container>
  );
};

export default ChallengesCategories;
