import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../App.css";
import { API_BASE_URL, getStorageUrl } from "../config/api";

const GuideDetails = () => {
  const location = useLocation();
  const { guide: guideFromState } = location.state || {};
  const [guide, setGuide] = useState(guideFromState);
  const [loading, setLoading] = useState(false);

  const BASE_URL = API_BASE_URL.replace("/api", "");

  // Helper to normalize image URL
  const getImageUrl = (image) => getStorageUrl(image);

  // Fetch fresh guide data from backend if guide has an ID
  useEffect(() => {
    const fetchFreshGuide = async () => {
      // Only fetch if guide has an ID (backend guide) and we have state data
      if (guideFromState?.id && guideFromState?.title) {
        setLoading(true);
        try {
          // Fetch all meditations and find the matching one
          const res = await fetch(`${API_BASE_URL}/admin/meditation`);
          if (res.ok) {
            const data = await res.json();
            const matchedGuide = Array.isArray(data) 
              ? data.find((m) => m.id === guideFromState.id || m.title === guideFromState.title)
              : null;
            
            if (matchedGuide) {
              const normalizedGuide = {
                id: matchedGuide.id,
                title: matchedGuide.title,
                category: matchedGuide.category || guideFromState.category,
                description: matchedGuide.description || guideFromState.description,
                image: getImageUrl(matchedGuide.image_url) || guideFromState.image,
                steps: matchedGuide.tutorial_steps
                  ? (Array.isArray(matchedGuide.tutorial_steps)
                      ? matchedGuide.tutorial_steps
                      : JSON.parse(matchedGuide.tutorial_steps || "[]"))
                      .map((step) => ({
                        step: step.step,
                        title: step.title,
                        description: step.description,
                        img: step.image_url ? getImageUrl(step.image_url) : null,
                      }))
                  : guideFromState.steps || [],
              };
              setGuide(normalizedGuide);
            }
          }
        } catch (error) {
          console.error("Error fetching fresh guide data:", error);
          // Keep using guide from state if fetch fails
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFreshGuide();
  }, [guideFromState?.id, guideFromState?.title]);

  if (!guide && !loading) {
    return <p>No guide details available.</p>;
  }

  if (loading) {
    return <p>Loading guide details...</p>;
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
     {/* Instructions */}
<div className="instructions">
  <h3 className="steps-title">Step-by-Step Instructions</h3>
  <div className="steps-grid">
    {guide.steps && guide.steps.length > 0 ? (
      guide.steps.map((item) => (
        <div className="step-cards" key={item.step}>
          {item.img ? (
            <img src={item.img} alt={`Step ${item.step}`} className="step-image" />
          ) : (
            <div className="step-placeholder">
              <span className="step-number">{item.step}</span>
            </div>
          )}
          <div className="step-text">
            <h4 className="step-title">Step {item.step}: {item.title}</h4>
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
