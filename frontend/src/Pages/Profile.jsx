import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Container,
  Row,
  Col,
  ListGroup,
  Dropdown,
  Form,
  Modal,
} from "react-bootstrap";
import { Heart, ThumbsUp, Smile, Bookmark, History } from "lucide-react";
import { BsFilter, BsGear } from "react-icons/bs";
import { ThreeDotsVertical, Image } from "react-bootstrap-icons";
import EmojiPicker from "emoji-picker-react";
import { FaEllipsisV } from "react-icons/fa";
import TodoList from "../Components/TodoList";
import Avatar from "../Components/Avatar";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Events from "../Components/Events";
import ChangePhoto from "./ChangePhoto"; // <-- import your component
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";
import './Profile.css'

// Challenge History Component
const ChallengeHistoryList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) { 
          setItems([]); 
          setLoading(false);
          return; 
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const res = await fetch(API_ENDPOINTS.CHALLENGES_HISTORY || `${API_BASE_URL}/challenges/history`, { 
          signal: controller.signal,
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        });
        clearTimeout(timeoutId);
        
        if (res.ok) {
          const data = await res.json();
          setItems(Array.isArray(data) ? data.filter((x) => x.is_completed) : []);
        } else {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.message || `Failed to load challenge history (${res.status})`);
        }
      } catch (e) {
        if (e.name === 'AbortError') {
          setError('Request timed out. Please check your connection.');
        } else if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
          setError('Network error. Please check your connection and ensure the API server is running.');
        } else {
          setError(e.message || 'Failed to load challenge history. Please check your connection and try again.');
        }
        console.error('Error loading challenge history:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const renderBadge = (status) => {
    const style = status === 'In Progress'
      ? { borderColor: '#FFC107', color: '#FFC107' }
      : { borderColor: '#198754', color: '#198754' };
    return (
      <span className="px-2 py-1 rounded-pill" style={{ border: `1px solid ${style.borderColor}`, color: style.color, backgroundColor: 'transparent', fontSize: '10px', fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <ListGroup.Item className="text-center text-muted py-3 small">
        <div style={{ padding: '20px' }}>Loading challenge history...</div>
      </ListGroup.Item>
    );
  }

  if (error) {
    return (
      <ListGroup.Item className="text-center text-danger py-3 small">
        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
          <div>{error}</div>
        </div>
      </ListGroup.Item>
    );
  }

  if (items.length === 0) {
    return (
      <ListGroup.Item className="text-center text-muted py-3 small">
        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎯</div>
          <div>No Completed Challenges yet.</div>
          <div style={{ fontSize: '12px', marginTop: '8px', color: '#888' }}>
            Keep pushing forward! Every journey begins with a single step.
          </div>
        </div>
      </ListGroup.Item>
    );
  }

  return (
    <>
      {items.map((entry, idx) => (
        <ListGroup.Item key={`completed-${idx}`} className="px-3 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0">{entry.challenge_title}</h6>
              <small className="text-muted" style={{ fontSize: '11px', fontStyle: 'italic' }}>
                {idx === 0 && items.length > 0 ? '🌟 Amazing work! You\'re doing great!' : 
                 '✨ Well done! Keep up the excellent progress!'}
              </small>
            </div>
            {renderBadge('Completed')}
          </div>
        </ListGroup.Item>
      ))}
    </>
  );
};

const Profile = () => {
  const { isLoggedIn, user, updateUser } = useAuth();

  // States
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [postFilter, setPostFilter] = useState("my");
  const [displayFilter, setDisplayFilter] = useState("all"); // For client-side filtering: "all", "date", "most_reacted", "images"
  const [setEvents] = useState([]);
  const [setShowGuestPopup] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAlreadyReportedModal, setShowAlreadyReportedModal] = useState(false);
  const [showReportSnackbar, setShowReportSnackbar] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedReasonCustom, setSelectedReasonCustom] = useState("");
  const [reportingPostId, setReportingPostId] = useState(null);
  const [hiddenPosts, setHiddenPosts] = useState([]);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);

  const [showUndo, setShowUndo] = useState(false);
  const [showChangePhoto, setShowChangePhoto] = useState(false); // <-- new state
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [modalKeys, setModalKeys] = useState({
    events: Date.now(),
    history: Date.now(),
    todo: Date.now()
  });

  const [showNoReasonModal, setShowNoReasonModal] = useState(false);
  const [profileCoverUrl, setProfileCoverUrl] = useState(null);

  // ---------------- Helper ----------------
  const toImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    // Use API_BASE_URL but remove /api suffix for storage paths
    const baseUrl = API_BASE_URL.replace('/api', '');
    if (img.startsWith('/storage')) return `${baseUrl}${img}`;
    return `${baseUrl}/storage/${img}`;
  };

  const reportReasons = [
    { value: "spam", label: "Spam or misleading" },
    { value: "harassment", label: "Harassment or bullying" },
    { value: "hate_speech", label: "Hate speech or violence" },
    { value: "nudity", label: "Nudity or sexual content" },
    { value: "self_harm", label: "Self-harm or dangerous acts" },
    { value: "other", label: "Other" },
  ];

  // ---------------- Helper Functions ----------------
  

  const censorText = (text) => {
    if (!text) return "";
    const bannedWords = ["badword1", "badword2", "example"];
    let censored = text;
    bannedWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      censored = censored.replace(regex, "****");
    });
    return censored;
  };

  const handlePostInput = (e) => {
    const filtered = censorText(e.target.value);
    setNewPost(filtered);
  };

  // ---------------- Post Handlers ----------------
  const handlePost = async () => {
    if (newPost.trim() === "" && !selectedImage) return;

    try {
      const formData = new FormData();
      formData.append("content", newPost);
      if (selectedImage) formData.append("image", selectedImage);

      const token = localStorage.getItem("authToken");
      const isAuth = !!token && isLoggedIn;
      const url = isAuth
        ? "http://127.0.0.1:8000/api/freedom-wall/posts/auth"
        : "http://127.0.0.1:8000/api/freedom-wall/posts";

      const headers = isAuth ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to post");
      }

      const p = await res.json();
      console.log("Post created successfully:", p);

      const imageUrl = p.image_url || (p.image_path ? `http://127.0.0.1:8000/storage/${p.image_path}` : null);
      const newEntry = {
        id: p.id,
        author: p.author || user?.name || "Anonymous",
        email: user?.email || null,
        date: p.created_at ? new Date(p.created_at).toLocaleString() : new Date().toLocaleString(),
        content: censorText(p.content),
        likes: p.likes || 0,
        hearts: p.hearts || 0,
        saves: p.saves || 0,
        liked: false,
        hearted: false,
        saved: false,
        image: imageUrl,
        images: imageUrl ? [imageUrl] : [],
      };

      setPosts((prev) => [newEntry, ...prev]);
      setNewPost("");
      setSelectedImage(null);
      setShowPostModal(false);
      await loadPosts(postFilter);

    } catch (e) {
  console.error("Error creating post:", e);
  setShowRestrictedModal(true); // show modal
}

  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(file);
  };

  const handleEmojiClick = (event, emojiObject) => {
    setNewPost((prev) => prev + emojiObject.emoji);
  };

  const handleReaction = async (postId, reactionType) => {
    if (!isLoggedIn) {
      setShowGuestPopup(true);
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://127.0.0.1:8000/api/freedom-wall/posts/${postId}/react`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ reaction_type: reactionType }),
        }
      );
      if (!response.ok) throw new Error("Failed to react");
      const data = await response.json();
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: data.likes,
                hearts: data.hearts,
                sad: data.sad,
                user_reaction: data.user_reaction,
                liked: data.user_reaction === "like",
                hearted: data.user_reaction === "heart",
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error reacting to post:", error);
      alert(`Failed to react to post: ${error.message}`);
    }
  };

  const handleLike = (id) => handleReaction(id, "like");
  const handleHeart = (id) => handleReaction(id, "heart");
  const handleSad = (id) => handleReaction(id, "sad");

  const handleSave = async (id) => {
    if (!isLoggedIn) {
      setShowGuestPopup(true);
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://127.0.0.1:8000/api/freedom-wall/posts/${id}/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to save post");
      const data = await response.json();
      setPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? { ...post, saves: data.saves_count, is_saved: data.is_saved, saved: data.is_saved }
            : post
        )
      );
    } catch (error) {
      console.error("Error saving post:", error);
      alert(`Failed to save post: ${error.message}`);
    }
  };

  const openReportModal = (id) => {
    setReportingPostId(id);
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!selectedReason) {
      setShowNoReasonModal(true);
      return;
    }
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/freedom-wall/posts/${reportingPostId}/report`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: selectedReason,
            custom_reason: selectedReason === "other" ? selectedReasonCustom : null,
          }),
        }
      );
      if (response.ok) {
        setShowReportSnackbar(true);
        setTimeout(() => setShowReportSnackbar(false), 2000);
        setShowReportModal(false);
        setReportingPostId(null);
        setSelectedReason("");
        setSelectedReasonCustom("");
      } else {
        const errorData = await response.json();
        if (errorData.message?.toLowerCase().includes("already reported")) {
          setShowAlreadyReportedModal(true);
          setShowReportModal(false);
        } else alert(errorData.message || "Failed to submit report.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("An error occurred while submitting the report.");
    }
  };

  const handleHide = (id) => {
    const postToHide = posts.find((post) => post.id === id);
    if (postToHide) {
      setHiddenPosts((prev) => [postToHide, ...prev]);
      setPosts((prev) => prev.filter((post) => post.id !== id));
      setShowUndo(true);
      setTimeout(() => setShowUndo(false), 5000);
    }
  };
  const undoHide = () => {
    setPosts((prev) => [...hiddenPosts, ...prev]);
    setHiddenPosts([]);
    setShowUndo(false);
  };

  const loadPosts = async (filter = "my-posts") => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      let url;
      switch (filter) {
        case "saved":
          url = "http://127.0.0.1:8000/api/freedom-wall/saved-posts";
          break;
        default:
          url = "http://127.0.0.1:8000/api/freedom-wall/my-posts";
      }

      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error("Failed to load posts");

      const data = await response.json();
      const normalizedPosts = Array.isArray(data) ? data.map((post) => {
        const imageUrl = post.image_url || (post.image_path ? `http://127.0.0.1:8000/storage/${post.image_path}` : null);
        const userReaction = post.user_reaction || null;
        return {
          ...post,
          author: post.author || post.user?.name || "Anonymous",
          email: post.email || post.user?.email || null,
          content: censorText(post.content),
          date: post.created_at ? new Date(post.created_at).toLocaleString() : "",
          image: imageUrl,
          images: imageUrl ? [imageUrl] : [],
          liked: userReaction === "like",
          hearted: userReaction === "heart",
          saved: !!post.is_saved,
          likes: post.likes || 0,
          hearts: post.hearts || 0,
          sad: post.sad || 0,
        };
      }) : [];

      setPosts(normalizedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  // Apply display filters to posts
  const getFilteredAndSortedPosts = () => {
    let filtered = [...posts];

    // Apply display filter
    switch (displayFilter) {
      case "images":
        filtered = filtered.filter((post) => post.image || (post.images && post.images.length > 0));
        break;
      case "most_reacted":
        // Sort by total reactions (likes + hearts + sad)
        filtered = filtered.sort((a, b) => {
          const totalA = (a.likes || 0) + (a.hearts || 0) + (a.sad || 0);
          const totalB = (b.likes || 0) + (b.hearts || 0) + (b.sad || 0);
          return totalB - totalA; // Descending order
        });
        break;
      case "date":
        // Sort by date (newest first)
        filtered = filtered.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : (a.date ? new Date(a.date) : new Date(0));
          const dateB = b.created_at ? new Date(b.created_at) : (b.date ? new Date(b.date) : new Date(0));
          return dateB - dateA; // Descending order (newest first)
        });
        break;
      default:
        // "all" - no filtering, keep original order
        break;
    }

    return filtered;
  };

  const loadEvents = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(API_ENDPOINTS.EVENTS || `${API_BASE_URL}/events`, { 
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => { loadPosts(postFilter); }, [postFilter]);
  useEffect(() => { 
    if (user?.email) {
      localStorage.setItem("userEmail", user.email);
      // Force immediate update of email display
      setTimeout(() => {
        const event = new CustomEvent('user-updated', { detail: user });
        window.dispatchEvent(event);
      }, 100);
    }
  }, [user]);
  useEffect(() => { loadEvents(); }, []);

  // Fetch user-specific profile cover from user object
  useEffect(() => {
    if (user?.profile_cover_url) {
      setProfileCoverUrl(user.profile_cover_url);
    } else {
      setProfileCoverUrl(null);
    }
  }, [user]);

  // Listen for cover updates
  useEffect(() => {
    const onCoverUpdated = (e) => {
      const url = e?.detail?.url;
      if (url) {
        setProfileCoverUrl(url);
        // Also update the user object in context
        if (updateUser && user) {
          updateUser({ ...user, profile_cover_url: url });
        }
      }
    };
    window.addEventListener('profile-cover-updated', onCoverUpdated);
    return () => window.removeEventListener('profile-cover-updated', onCoverUpdated);
  }, [user, updateUser]);

  return (
    <Container fluid className="profile-container">
      <Row className="gx-3">
        <Col xs={12}>
          <Card className="profile-header position-relative">
            {profileCoverUrl || user?.profile_cover_url ? (
              <Card.Img
                variant="top"
                src={toImageUrl(profileCoverUrl) || toImageUrl(user?.profile_cover_url)}
                className="profile-cover"
              />
            ) : (
              <div 
                className="profile-cover d-flex align-items-center justify-content-center"
                style={{
                  height: "200px",
                  backgroundColor: "#f8f9fa",
                  border: "2px dashed #dee2e6",
                  borderRadius: "8px 8px 0 0"
                }}
              >
                <div className="text-center text-muted">
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>📸</div>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>Set up your cover photo now</div>
                </div>
              </div>
            )}
            <Dropdown
              className="position-absolute"
              style={{ bottom: "10px", right: "10px" }}
              align="end"
            >
              <Dropdown.Toggle
                variant="light"
                className="three-dots-btn"
                bsPrefix="no-arrow-toggle"
              >
                <ThreeDotsVertical />
              </Dropdown.Toggle>
              <Dropdown.Menu>
  <Dropdown.Item  onClick={() => setShowChangePhoto(true)}>
    Change Photo
  </Dropdown.Item>
  <Dropdown.Item className="desktop-hide" onClick={() => {
    setModalKeys(prev => ({ ...prev, events: Date.now() }));
    setShowEventsModal(true);
  }}>
    Upcoming Events
  </Dropdown.Item>
  <Dropdown.Item className="desktop-hide" onClick={() => {
    setModalKeys(prev => ({ ...prev, history: Date.now() }));
    setShowHistoryModal(true);
  }}>
  Challenge's History
</Dropdown.Item>
  <Dropdown.Item className="desktop-hide" onClick={() => {
    setModalKeys(prev => ({ ...prev, todo: Date.now() }));
    setShowTodoModal(true);
  }}>
    To-Do List
  </Dropdown.Item>
</Dropdown.Menu>

            </Dropdown>

            <Card.Body>
              <div className="profile-info">
                <Avatar email={user?.email || ""} name={user?.name || "Anonymous"} className="avatar" size={60} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Floating ChangePhoto Modal */}
        {showChangePhoto && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
            onClick={() => setShowChangePhoto(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ChangePhoto closeModal={() => setShowChangePhoto(false)} toImageUrl={toImageUrl} />
            </div>
          </div>
        )}

        {/* Events Modal */}
{showEventsModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
    onClick={() => setShowEventsModal(false)}
  >
    <div onClick={(e) => e.stopPropagation()} className="p-3 bg-white rounded shadow mobile-modal-content" style={{ maxWidth: "500px", width: "90%", position: "relative" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 style={{ margin: 0 }}>Upcoming Events</h4>
        <button onClick={() => setShowEventsModal(false)} className="mobile-modal-close">×</button>
      </div>
      <Events key={`events-modal-${modalKeys.events}`} hideCardHeader /> {/* reuse your Events component */}
    </div>
  </div>
)}

{showHistoryModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
    onClick={() => setShowHistoryModal(false)}
  >
    <div onClick={(e) => e.stopPropagation()} 
         className="p-3 bg-white rounded shadow mobile-modal-content" 
         style={{ maxWidth: "500px", width: "90%", maxHeight: "80vh", overflowY: "auto", position: "relative" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 style={{ margin: 0 }}>Challenge History</h4>
        <button onClick={() => setShowHistoryModal(false)} className="mobile-modal-close">×</button>
      </div>

      {/* Challenge History Content */}
      <Card className="mb-3 events-card shadow-sm border-0 mobile-visible-section" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="events-scroll-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <ListGroup variant="flush">
            <ChallengeHistoryList key={`history-modal-${modalKeys.history}`} />
          </ListGroup>
        </div>
      </Card>

    </div>
  </div>
)}


{/* To-Do List Modal */}
{showTodoModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
    onClick={() => setShowTodoModal(false)}
  >
    <div onClick={(e) => e.stopPropagation()} className="p-3 bg-white rounded shadow mobile-modal-content" style={{ maxWidth: "500px", width: "90%", position: "relative" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 style={{ margin: 0 }}>To-Do List</h4>
        <button onClick={() => setShowTodoModal(false)} className="mobile-modal-close">×</button>
      </div>
      <TodoList key={`todo-modal-${modalKeys.todo}`} /> {/* reuse your TodoList component */}
    </div>
  </div>
)}


        {/* Left Side */}
        <Col md={3} className="events-container mobile-hide-section">
  <Card className="mb-3 events-card ">

    
   
    <div >
      <Events hideCardHeader /> {/* pass a prop to hide the header in Events.jsx */}
    </div>
  </Card>
{showUndo && (
  <div
    style={{
      position: "fixed",
      bottom: "20px",
      left: "0px", // flush to left edge
      zIndex: 9999,
      backgroundColor: "rgb(32,31,36)", // white background
      borderLeft: "4px solid green", // green accent
      borderRadius: "0 6px 6px 0", // rounded except left edge
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "2px 2px 8px rgba(0,0,0,0.15)",
      fontFamily: "Poppins, sans-serif",
      fontSize: "16px",
      minWidth: "320px",
      maxWidth: "400px",
      wordBreak: "break-word",
      marginLeft: "20px",
    }}
  >
    <span style={{ color: "#fff", fontWeight: 600 }}>
      Post hidden
    </span>
    
    <div style={{ display: "flex", gap: "14px" }}>
      <span
        onClick={undoHide}
        style={{ cursor: "pointer", color: "rgb(138, 180, 248)", fontWeight: 600, display:"underline" }}
      >
        Undo
      </span>
      <span
        onClick={() => setShowUndo(false)}
        style={{ cursor: "pointer", color: "rgb(138, 180, 248)", fontWeight: 600 }}
      >
        Ok
      </span>
    </div>
  </div>
)}
{showRestrictedModal && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
    style={{ background: "rgba(0,0,0,0.35)", zIndex: 9999 }}
  >
    <div
      className="rounded-4 shadow-lg p-4"
      style={{ background: "#fff", width: "380px", maxWidth: "92%" }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h5 className="fw-bold mb-2 text-dark" style={{ margin: 0 }}>
          Warning
        </h5>
        <button
          onClick={() => setShowRestrictedModal(false)}
          style={{
            fontSize: "20px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#555"
          }}
        >
          ×
        </button>
      </div>

      {/* Separator */}
      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "12px 0" }} />

      {/* Body */}
      <p className="text-muted mb-4">
        Your account is currently restricted. You cannot post content.
      </p>

      {/* Actions */}
      <div className="d-flex justify-content-end gap-2">
        <button
          className="btn fw-bold px-4 py-2 rounded-pill"
          style={{
            padding: "8px 20px",
            borderRadius: "24px",
            background: "#d32f2f",
            border: "none",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer"
          }}
          onClick={() => setShowRestrictedModal(false)}
        >
          Ok
        </button>
      </div>
    </div>
  </div>
)}


{showReportSnackbar && (
  <div
    style={{
      position: "fixed",
      bottom: "20px",
      left: "0px", // flush to left edge
      zIndex: 9999,
      backgroundColor: "rgb(32,31,36)",
      borderLeft: "6px solid green",
      borderRadius: "0 6px 6px 0",
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "2px 2px 8px rgba(0,0,0,0.15)",
      fontFamily: "Poppins, sans-serif",
      fontSize: "16px",
      minWidth: "320px",
      maxWidth: "400px",
      wordBreak: "break-word",
      marginLeft: "20px",
    }}
  >
    <span style={{ color: "#fff", fontWeight: 600 }}>
      You successfully reported this post.
    </span>
    
    <span
      onClick={() => setShowReportSnackbar(false)}
      style={{ cursor: "pointer", color: "rgb(138, 180, 248)rgb(138, 180, 248)", fontWeight: 600, marginLeft: "12px" }}
    >
      Ok
    </span>
  </div>
)}

<Modal
  show={showNoReasonModal}
  onHide={() => setShowNoReasonModal(false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Notice</Modal.Title>
  </Modal.Header>

  <Modal.Body className="text-center">
    Please select a reason for reporting this post.
  </Modal.Body>

  <Modal.Footer className="justify-content-center">
    <Button
      variant="success"
      onClick={() => setShowNoReasonModal(false)}
      style={{ width: '150px', minWidth: '120px' }}
    >
      OK
    </Button>
  </Modal.Footer>
</Modal>
           
           {/* history of joined challenge */}
<Card className="mb-3 events-card shadow-sm border-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
  {/* Header */}
  <Card.Header className="d-flex justify-content-between align-items-center bg-white">
    <div className="d-flex align-items-center">
      <History className="me-2" />
      <div className="fw-semibold">Challenge History</div>
    </div>
  </Card.Header>

  <hr className="my-0" />

  {/* Scrollable List */}
  <div className="events-scroll-wrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
    <ListGroup variant="flush">
      <ChallengeHistoryList />
    </ListGroup>
  </div>

  <hr className="my-0" />
</Card>

        </Col>

        {/* What's on your mind? */}
        <Col md={6} className="what-form">
          {/* Post Input Card */}
          <Card
            className="post-input-card mb-3 mt-3"
            onClick={() => setShowPostModal(true)}
            style={{ cursor: "pointer" }}
          >
            <div className="post-input d-flex align-items-center p-2">
              <div className="me-3">
                 <Avatar email={user?.email || ""} name={user?.name || "Anonymous"} className="avatar" size={40} />
              </div>
              <Form.Control type="text" placeholder="What's on your mind?" readOnly />
            </div>
          </Card>

          {/* Filters */}
          <Card.Header className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <Dropdown className="d-inline me-2">
                <Dropdown.Toggle variant="light" className="filter-btn">
                  <BsFilter /> Filters {displayFilter !== "all" && `(${displayFilter === "date" ? "Date" : displayFilter === "most_reacted" ? "Most Reacted" : "Images"})`}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item 
                    onClick={() => setDisplayFilter("date")}
                    active={displayFilter === "date"}
                  >
                    By Date
                  </Dropdown.Item>
                  <Dropdown.Item 
                    onClick={() => setDisplayFilter("most_reacted")}
                    active={displayFilter === "most_reacted"}
                  >
                    Most Reacted
                  </Dropdown.Item>
                  <Dropdown.Item 
                    onClick={() => setDisplayFilter("images")}
                    active={displayFilter === "images"}
                  >
                    With Images
                  </Dropdown.Item>
                  
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown className="d-inline ms-2">
                <Dropdown.Toggle variant="light" className="manage-posts-btn">
                  <BsGear /> Manage posts
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => {
                    setPostFilter("my");
                    setDisplayFilter("all"); // Reset display filter when changing post source
                  }}>My Posts</Dropdown.Item>
                  <Dropdown.Item onClick={() => {
                    setPostFilter("saved");
                    setDisplayFilter("all"); // Reset display filter when changing post source
                  }}>Saved Posts</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Card.Header>

       <Modal show={showPostModal} onHide={() => setShowPostModal(false)} centered>
               <Modal.Header closeButton style={{ backgroundColor: "#e6f4ea" }}>
                 <Modal.Title>{isLoggedIn ? "Create Post" : "Share Anonymously"}</Modal.Title>
               </Modal.Header>
               <Modal.Body >
                 <div className="post-header" style={{ alignItems: "center" }}>
                    <Avatar email={user?.email || ""} name={user?.name || "Anonymous"} className="avatar" size={40} />
       
       
       
                   <div className="author-info">
                     <span className="post-author">{isLoggedIn ? user?.name || "You" : "Anonymous"}</span>
                     <span className="post-date">{new Date().toLocaleString()}</span>
                   </div>
                 </div>
       
                 <Form.Control
                   as="textarea"
                   rows={3}
                   placeholder={isLoggedIn ? "What's on your mind?" : "Express yourself freely..."}
                   className="post-textarea"
                   value={newPost}
                   onChange={(e) => setNewPost(e.target.value)}
                 />
       
                 {selectedImage && (
                   <div className="mt-2">
                     <img src={URL.createObjectURL(selectedImage)} alt="Selected" className="img-fluid post-image-preview" />
                   </div>
                 )}
       
          <div
  className="add-post-container mt-2 d-flex align-items-center"
  style={{ border: "1px solid green", borderRadius: "8px", padding: "6px", gap: "10px" }}
>
  <label htmlFor="image-upload" style={{ cursor: "pointer" }} title="Add image">
    <Image size={20} className="post-icon" />
  </label>
  <input
    type="file"
    id="image-upload"
    accept="image/*"
    style={{ display: "none" }}
    onChange={handleImageUpload}
  />
  
  <Smile
    size={20}
    className="post-icon"
    onClick={() => setShowEmojiPicker((s) => !s)}
    style={{ cursor: "pointer" }}
  />
  
</div>

          {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#e6f4ea" }}>
          <Button variant="secondary" onClick={() => setShowPostModal(false)}>Cancel</Button>
          <Button
            variant="success"
            onClick={() => {
              if (isLoggedIn) {
                handlePost();
              } else {
                setShowGuestPopup(true); // <-- guest notification here too
                setShowPostModal(false);
              }
            }}
          >
            {isLoggedIn ? "Post" : "Share Anonymously"}
          </Button>
        </Modal.Footer>
      </Modal>

         {/* Posts */}
              <div className="post-list mt-3">
                  {getFilteredAndSortedPosts().map((post) => (
                    <Card className={`post-card position-relative ${!isLoggedIn ? "blurred-content" : ""}`} key={post.id}>
                      {!isLoggedIn && (
                        <div className="post-blur-overlay">
                          <p>🔒 Join to view posts</p>
                          <Link to="/signin" className="btn btn-success btn-sm me-2">
                            Sign In
                          </Link>
                          <Link to="/signup" className="btn btn-outline-success btn-sm">
                            Sign Up
                          </Link>
                        </div>
                      )}
          
                      {isLoggedIn && (
                        <Dropdown className="position-absolute" style={{ top: "10px", right: "10px" }}>
                          <Dropdown.Toggle variant="light" size="sm" className="p-0 border-0 no-caret">
                            <FaEllipsisV />
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => openReportModal(post.id)}>Report</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleHide(post.id)}>Hide</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      )}
          
                    <Card.Body className="p-0">
                                  <div className="p-3">
                                    <div className="post-header">
                                      <div className="me-2">
                                      <Avatar 
                      email={post.email} 
                      name={post.author} 
                      className="avatar" 
                      size={40} 
                    />
                    </div>
                  
                                    <div className="author-info">
                                      <Card.Title className="post-author">{post.author}</Card.Title>
                                      <Card.Subtitle className="post-date">{post.date}</Card.Subtitle>
                                    </div>
                                  </div>
        
                        <p className="post-content ">{censorText(post.content)}</p>
  {post.images && post.images.length > 0 && (
  <div className={`post-image-wrapper ${post.images.length > 1 ? "multiple-images" : ""}`}>
    {post.images.map((img, idx) => (
      <div key={idx} className="post-image-container">
        <img src={img} alt={`Post image ${idx + 1}`} className="post-image" />
      </div>
    ))}
  </div>
)}




        
                        <div className="post-actions d-flex align-items-center mt-3" style={{ justifyContent: "flex-start" }}>
                          <div className="d-flex align-items-center me-3 like-action" onClick={isLoggedIn ? () => handleLike(post.id) : undefined} style={{ cursor: isLoggedIn ? "pointer" : "default" }}>
                            <ThumbsUp size={18} stroke={post.liked ? "blue" : "black"} fill={post.liked ? "blue" : "none"} className="me-1" />
                            <small>{post.likes || 0}</small>
                          </div>
        
                          <div className="d-flex align-items-center me-3 heart-action" onClick={isLoggedIn ? () => handleHeart(post.id) : undefined} style={{ cursor: isLoggedIn ? "pointer" : "default" }}>
                            <Heart size={18} className="me-1" fill={post.hearted ? "red" : "none"} stroke={post.hearted ? "red" : "gray"} />
                            <small>{post.hearts || 0}</small>
                          </div>
        
                          <div className="d-flex align-items-center me-3 sad-action" onClick={isLoggedIn ? () => handleSad(post.id) : undefined} style={{ cursor: isLoggedIn ? "pointer" : "default" }}>
                            <span className="me-1" style={{ color: post.user_reaction === 'sad' ? "#6c757d" : "gray", fontSize: "18px" }}>😢</span>
                            <small>{post.sad || 0}</small>
                          </div>
        
                          <div className="d-flex align-items-center save-action" onClick={isLoggedIn ? () => handleSave(post.id) : undefined} style={{ cursor: isLoggedIn ? "pointer" : "default" }}>
                            <Bookmark size={18} className="me-1" fill={post.saved ? "green" : "none"} stroke={post.saved ? "green" : "gray"} />
                            <small>{post.saves || 0}</small>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
 {/* Undo Snackbar */}
{showUndo && (
  <div
    style={{
      position: "fixed",
      bottom: "20px",
      left: "0px", // flush to left edge
      zIndex: 9999,
      backgroundColor: "rgb(32,31,36)", // white background
      borderLeft: "4px solid green", // green accent
      borderRadius: "0 6px 6px 0", // rounded except left edge
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "2px 2px 8px rgba(0,0,0,0.15)",
      fontFamily: "Poppins, sans-serif",
      fontSize: "16px",
      minWidth: "320px",
      maxWidth: "400px",
      wordBreak: "break-word",
      marginLeft: "20px",
    }}
  >
    <span style={{ color: "#fff", fontWeight: 600 }}>
      Post hidden
    </span>
    
    <div style={{ display: "flex", gap: "14px" }}>
      <span
        onClick={undoHide}
        style={{ cursor: "pointer", color: "rgb(138, 180, 248)", fontWeight: 600, display:"underline" }}
      >
        Undo
      </span>
      <span
        onClick={() => setShowUndo(false)}
        style={{ cursor: "pointer", color: "rgb(138, 180, 248)", fontWeight: 600 }}
      >
        Ok
      </span>
    </div>
  </div>
)}

         
       
          {/* Report Modals */}
          <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Report Post</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <h6 style={{ fontWeight: 500, marginBottom: "15px"}}>
      Why did you report this post?
    </h6>

<Form>
  {reportReasons.map((r) => (
    <Form.Check
      type="radio"
      key={r.value}
      id={`report-${r.value}`}
      name="reportReason"
      label={r.label}
      value={r.value}
      checked={selectedReason === r.value}
      onChange={(e) => setSelectedReason(e.target.value)}
      className="mb-2"
    />
  ))}

  {selectedReason === "other" && (
    <Form.Control
      className="mt-2"
      placeholder="Please specify"
      value={selectedReasonCustom}
      onChange={(e) => setSelectedReasonCustom(e.target.value)}
    />
  )}
</Form>

            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowReportModal(false)}>Cancel</Button>
              <Button variant="success" onClick={submitReport}>Submit</Button>
            </Modal.Footer>
          </Modal>

          <Modal

  show={showAlreadyReportedModal}
  onHide={() => setShowAlreadyReportedModal(false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Notice</Modal.Title>
  </Modal.Header>

  <Modal.Body className="text-center">
    You have already reported this post.
  </Modal.Body>

  <Modal.Footer className="justify-content-center">
    <Button
      variant="success"
      onClick={() => setShowAlreadyReportedModal(false)}
      style={{ width: '150px', minWidth: '120px' }} // Adjust width here
    >
      OK
    </Button>
  </Modal.Footer>
</Modal>


            {showReportSnackbar && <div className="report-snackbar">Report submitted successfully</div>}
        </Col>
        {/* Right Sidebar */}
        <Col
  xs={12}
  md={3}
  className="right-sidebar mobile-hide-section"
  style={{
    maxHeight: "calc(100vh - 20px)", // leave a little space from top/bottom
    overflowY: "auto",
  }}
>
  <TodoList />
</Col>

      </Row>
    </Container>
  );
};

export default Profile;
