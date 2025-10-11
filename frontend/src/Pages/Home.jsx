import React, { useState } from "react";
import { Container, Card, Row, Col, Button } from "react-bootstrap";
import { FaCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Events from "../Components/Events";

const WellnessFeatures = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const features = [
    {
      title: "Freedom Wall",
      description:
        "Share your thoughts anonymously and connect with others who understand what you're going through.",
      link: "/freedomwall",
      linkText: "Explore Wall",
    },
    {
      title: "Health & Wellness Blogs",
      description:
        "Access expert tips on exercise, nutrition, meditation, and self-care techniques.",
      link: "/wellnessblog",
      linkText: "Read Articles",
    },
    {
      title: "Guided Meditation & Exercise",
      description:
        "Follow step-by-step guides to practice mindfulness, reduce stress, and stay active.",
      link: "/meditation",
      linkText: "Start Now",
    },
    {
      title: "Self-Care Challenges",
      description:
        "Engage in daily and weekly challenges designed to promote better mental and physical health.",
      link: "/challenges",
      linkText: "Take a Challenge",
    },
  ];

  const handleFeatureClick = (link) => {
    if (isLoggedIn) {
      navigate(link);
    } else {
      setShowPopup(true);
    }
  };

  return (
    <Container fluid className="wellness-section d-flex flex-column">
      <div className="header-container">
        <h2 className="header-title">Our Wellness Features</h2>
        <p className="header-text">
          Explore the tools we offer to help you maintain balance, find
          community support, and grow stronger every day.
        </p>
      </div>

      <div className="features-container mt-auto">
        <Row className="justify-content-center">
          {features.map((feature, index) => (
            <Col key={index} md={3} sm={6} className="d-flex mb-4">
              <Card
                className="feature-card p-3 shadow-sm w-100"
                style={{
                  cursor: "pointer",
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                onClick={() => handleFeatureClick(feature.link)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.1)";
                }}
              >
                <Card.Body className="d-flex flex-column">
                  <div className="feature-icon mb-3">
                    <FaCircle color="white" size={15} />
                  </div>
                  <Card.Title
                    className="fw-bold"
                    style={{ fontSize: "1.05rem" }}
                  >
                    {feature.title}
                  </Card.Title>
                  <Card.Text className="flex-grow-1">
                    {feature.description}
                  </Card.Text>
                  <span className="text-primary mt-auto">
                    {feature.linkText}
                  </span>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>


      {/* Guest popup (home notification style) */}
      {showPopup && (
        <div className="guest-popup-overlay">
          <div className="guest-popup">
            <div className="guest-popup-line"></div>
            <p className="guest-popup-message">
              You need to sign in to access this feature.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
              <Button
                variant="secondary"
                onClick={() => setShowPopup(false)}
                style={{ padding: "0.65rem 1.5rem", fontSize: "1.05rem" }}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  setShowPopup(false);
                  navigate("/signin");
                }}
                style={{ padding: "0.65rem 1.5rem", fontSize: "1.05rem" }}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Styles for popup */}
      <style>{`
        .guest-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }
        .guest-popup {
          background: white;
          border-radius: 12px;
          padding: 30px 40px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          max-width: 400px;
          width: 90%;
          text-align: center;
        }
        .guest-popup-line {
          height: 1px;
          background: rgba(0,0,0,0.1);
          margin-bottom: 20px;
          color: green;
        }
        .guest-popup-message {
          font-size: 1rem;
          color: #333;
          margin-bottom: 25px;
          line-height: 1.5;
        }
          
  /* ✅ Unified button size (same as others) */
  .guest-popup .btn {
    padding: 0.5rem 2rem;
    font-size: 1rem;
    border-radius: 8px;
    min-width: 120px;
  }

  .guest-popup .btn + .btn {
    margin-left: 15px;
  }
      `}</style>
    </Container>
  );
};

export default WellnessFeatures;
