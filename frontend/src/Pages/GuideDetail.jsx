import React from "react";
import { useLocation } from "react-router-dom";
import "../App.css";

const GuideDetails = () => {
  const location = useLocation();
  const { guide } = location.state || {};

  if (!guide) {
    return <p>No guide details available.</p>;
  }

  return (
    <div className="guide-wrapper">
      {/* Top card */}
      <div className="top-card">
        <div className="top-text">
          <h2 className="guide-title">{guide.title}</h2>
          <span className="category">{guide.category}</span>
          <p className="guide-description">{guide.description}</p>
        </div>

        <div className="top-image">
          <img src={guide.image} alt={guide.title} />
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions">
        <h3 className="steps-title">Step-by-Step Instructions</h3>
        <div className="steps-grid">
          {guide.steps && guide.steps.length > 0 ? (
            guide.steps.map((item) => (
              <div className="step-cards" key={item.step}>
                {item.img ? (
                  <img src={item.img} alt={`Step ${item.step}`} />
                ) : (
                  <div className="step-placeholder">
                    <span className="step-number">{item.step}</span>
                  </div>
                )}
                <div className="step-text">
                  <h4>Step {item.step}</h4>
                  <p>{item.title}</p>
                  {item.description && (
                    <p className="step-description">{item.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No steps available for this guide.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideDetails;
