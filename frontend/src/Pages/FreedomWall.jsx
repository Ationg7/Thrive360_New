// FreedomWall.js
import React, { useState, useEffect } from "react";
import { Container, Card, Form, Modal, Button, Dropdown } from "react-bootstrap";
import { Heart, Bookmark, Image, Smile, ThumbsUp } from "lucide-react";
import { FaEllipsisV } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { useAuth } from "../AuthContext";
import Avatar from "../Components/Avatar";
import { Link } from "react-router-dom";
import "../App.css";

const FreedomWall = () => {
  const { isLoggedIn, user } = useAuth();

  const initialPosts = [
    {
      id: 1,
      author: "Anonymous",
      date: "March 21 at 6:59 PM",
      content: "I was doing fine, but you just came and ruined my peace of mind...",
      likes: 34,
      hearts: 5,
      saves: 10,
      liked: false,
      hearted: false,
      saved: false,
      image: null,
    },
    {
      id: 2,
      author: "Anonymous",
      date: "March 21 at 6:59 PM",
      content: '"How is your life?" Ito unti-unting nilulunod ng kalungkutan...',
      likes: 120,
      hearts: 12,
      saves: 25,
      liked: false,
      hearted: false,
      saved: false,
      image: null,
    },
  ];

  const [posts, setPosts] = useState([]);
  const [hiddenPosts, setHiddenPosts] = useState([]);
  const [showUndo, setShowUndo] = useState(false);

  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedReasonCustom, setSelectedReasonCustom] = useState("");

  // New: Already Reported Modal
  const [showAlreadyReportedModal, setShowAlreadyReportedModal] = useState(false);

  // New: Guest popup for home-style notification
  const [showGuestPopup, setShowGuestPopup] = useState(false);

  const [showReportSnackbar, setShowReportSnackbar] = useState(false);

  const reportReasons = [
    { value: "spam", label: "Spam or misleading" },
    { value: "harassment", label: "Harassment or bullying" },
    { value: "hate_speech", label: "Hate speech or violence" },
    { value: "nudity", label: "Nudity or sexual content" },
    { value: "self_harm", label: "Self-harm or dangerous acts" },
    { value: "other", label: "Other" },
  ];

  const badWords = ["badword1", "badword2", "badword3"];
  const censorText = (text) => {
    if (!text) return "";
    let censored = text;
    badWords.forEach((word) => {
      const regex = new RegExp(word, "gi");
      censored = censored.replace(regex, "*".repeat(word.length));
    });
    return censored;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/freedom-wall/posts");
        if (!res.ok) throw new Error("Failed to load posts");
        const data = await res.json();
        const normalized = (Array.isArray(data) ? data : []).map((p) => ({
          id: p.id,
         // Prefer explicit author/name fields from API; fallback to Anonymous
          author: p.author || p.user?.name || "Anonymous",
          // Capture email if API provides it (directly or nested under user)
          email: p.email || p.user?.email || null,

          date: p.created_at ? new Date(p.created_at).toLocaleString() : new Date().toLocaleString(),
          content: p.content,
          likes: p.likes || 0,
          hearts: p.hearts || 0,
          sad: p.sad || 0,
          saves: p.saves || 0,
          liked: p.user_reaction === 'like',
          hearted: p.user_reaction === 'heart',
          saved: p.is_saved || false,
          user_reaction: p.user_reaction,
          image: p.image_path ? `http://127.0.0.1:8000/storage/${p.image_path}` : null,
        }));
        setPosts(normalized);
      } catch (e) {
        console.error("Error fetching posts:", e);
        setPosts(initialPosts);
      }
    };
    fetchPosts();
  }, []);

  const handleReaction = async (postId, reactionType) => {
    if (!isLoggedIn) {
      setShowGuestPopup(true);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://127.0.0.1:8000/api/freedom-wall/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reaction_type: reactionType })
      });

      if (!response.ok) throw new Error('Failed to react');

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
                liked: data.user_reaction === 'like',
                hearted: data.user_reaction === 'heart'
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error reacting to post:', error);
      console.error('Error details:', {
        message: error.message,
        postId,
        reactionType,
        isLoggedIn,
        hasToken: !!localStorage.getItem('authToken')
      });
      alert(`Failed to react to post: ${error.message}. Please check if you're logged in and try again.`);
    }
  };

  const handleLike = (id) => {
    handleReaction(id, 'like');
  };

  const handleHeart = (id) => {
    handleReaction(id, 'heart');
  };

  const handleSad = (id) => {
    handleReaction(id, 'sad');
  };

  const handleSave = async (id) => {
    if (!isLoggedIn) {
      setShowGuestPopup(true);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://127.0.0.1:8000/api/freedom-wall/posts/${id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to save post');

      const data = await response.json();
      
      setPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? {
                ...post,
                saves: data.saves_count,
                is_saved: data.is_saved,
                saved: data.is_saved
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error saving post:', error);
      console.error('Save error details:', {
        message: error.message,
        postId: id,
        isLoggedIn,
        hasToken: !!localStorage.getItem('authToken')
      });
      alert(`Failed to save post: ${error.message}. Please check if you're logged in and try again.`);
    }
  };

  const handlePost = async () => {
    if (newPost.trim() === "" && !selectedImage) return;
    try {
      const formData = new FormData();
      formData.append("content", newPost);
      if (selectedImage instanceof File) formData.append("image", selectedImage);

      const token = localStorage.getItem('authToken');
      const isAuth = !!token && isLoggedIn;
      const url = isAuth
        ? "http://127.0.0.1:8000/api/freedom-wall/posts/auth"
        : "http://127.0.0.1:8000/api/freedom-wall/posts";

      const headers = isAuth ? { 'Authorization': `Bearer ${token}` } : undefined;

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to post");
      const p = await res.json();
      const entry = {
        id: p.id,
          author: p.author || user?.name || "Anonymous",
        email: user?.email || null,

        date: p.created_at ? new Date(p.created_at).toLocaleString() : new Date().toLocaleString(),
        content: p.content,
        likes: p.likes || 0,
        hearts: p.hearts || 0,
        saves: p.saves || 0,
        liked: false,
        hearted: false,
        saved: false,
        image: p.image_path ? `http://127.0.0.1:8000/storage/${p.image_path}` : null,
      };
      setPosts((prev) => [entry, ...prev]);
      setNewPost("");
      setSelectedImage(null);
      setShowPostModal(false);
    } catch (e) {
      console.error("Error creating post:", e);
      alert("Failed to create post. Please try again.");
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewPost((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) setSelectedImage(file);
  };

  const openReportModal = (id) => {
    setReportPostId(id);
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!selectedReason) {
      alert("Please select a reason for reporting this post.");
      return;
    }
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/freedom-wall/posts/${reportPostId}/report`,
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
        setReportPostId(null);
        setSelectedReason("");
        setSelectedReasonCustom("");
      } else {
        const errorData = await response.json();
        if (errorData.message && errorData.message.toLowerCase().includes("already reported")) {
          setShowAlreadyReportedModal(true);
          setShowReportModal(false);
        } else {
          alert(errorData.message || "Failed to submit report.");
        }
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
 const getUserEmail = () => {
    if (user?.email) return user.email;
    try {
      const stored = localStorage.getItem("user");
      if (stored) return JSON.parse(stored)?.email || "";
    } catch {
      // Ignore JSON parse errors
    }
    return localStorage.getItem("userEmail") || "";
  };



  return (
    <Container className="freedom-wall-container">
      <div className="header">
        <h2 className="title">Freedom Wall</h2>
        <p className="description" style={{ textAlign: "center" }}>
                   Express yourself freely, share your thoughts, struggles, victories, or uplifting messages with our community.


        </p>
      </div>

      {/* Undo Snackbar */}
      {showUndo && (
        <div className="undo-toast show">
          Post hidden.{" "}
          <span onClick={undoHide} style={{ cursor: "pointer", color: "green", fontWeight: "600" }}>
            Undo
          </span>
        </div>
      )}

      {/* New Post Input */}
      <Card className="post-input-card" style={{ cursor: "text" }}>
        <div className="post-header" style={{ alignItems: "center" }}>    
   <Avatar email={user?.email || ""} name={user?.name || "Anonymous"} className="avatar" size={40} />






          <Form.Control
            type="text"
            placeholder={isLoggedIn ? "What's on your mind?" : "Express yourself anonymously..."}
            className="post-input-field"
            readOnly
            onClick={() => {
              if (isLoggedIn) {
                setShowPostModal(true);
              } else {
                setShowGuestPopup(true); // <-- guest notification here
              }
            }}
          />
        </div>
      </Card>

      {/* Guest popup */}
      {showGuestPopup && (
        <div className="guest-popup-overlay">
          <div className="guest-popup">
            <div className="guest-popup-line"></div>
            <p className="guest-popup-message">
              You need to sign in to access this feature.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
              <Button variant="secondary" onClick={() => setShowGuestPopup(false)}>Cancel</Button>
              <Button variant="success" onClick={() => { setShowGuestPopup(false); window.location.href="/signin"; }}>Sign In</Button>
            </div>
          </div>
        </div>
      )}
         

      {/* Guest Info */}
      {!isLoggedIn && (
        <div className="alert alert-info mt-3 text-center" role="alert">
          Anonymous posting enabled. <Link to="/signin">Sign in</Link> to interact with others.
        </div>
      )}
      {/* Post Modal */}
      <Modal show={showPostModal} onHide={() => setShowPostModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#e6f4ea" }}>
          <Modal.Title>{isLoggedIn ? "Create Post" : "Share Anonymously"}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#f7fff9" }}>
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
            <input type="file" id="image-upload" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
            <Smile size={20} className="post-icon" onClick={() => setShowEmojiPicker((s) => !s)} style={{ cursor: "pointer" }} />
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
        {posts.map((post) => (
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

                {post.image && <img src={post.image} alt="Post" className="img-fluid post-image" />}

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

      {/* Already Reported Modal */}
      <Modal
        show={showAlreadyReportedModal}
        onHide={() => setShowAlreadyReportedModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Notice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You have already reported this post.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => setShowAlreadyReportedModal(false)}>OK</Button>
        </Modal.Footer>
      </Modal>

      {/* Report Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Report Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            <option value="">Select a reason</option>
            {reportReasons.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </Form.Select>

          {selectedReason === "other" && (
            <Form.Control
              className="mt-2"
              placeholder="Please specify"
              value={selectedReasonCustom}
              onChange={(e) => setSelectedReasonCustom(e.target.value)}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>Cancel</Button>
          <Button variant="success" onClick={submitReport}>Submit</Button>
        </Modal.Footer>
      </Modal>

      {/* Report Snackbar */}
      {showReportSnackbar && <div className="report-snackbar">Report submitted successfully</div>}

      {/* Styles for guest popup */}
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
          
        .guest-popup .btn {
          padding: 0.5rem 2rem;
          font-size: 1rem;
          border-radius: 8px;
          min-width: 120px;
        }
        .guest-popup .btn + .btn {
          margin-left: 15px;
        }
          .snackbar-report {
          position: fixed;
          top: 20px;
          right: 20px;
          background-color: white;
          color: #111;
          border-radius: 8px;
          padding: 12px 18px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.12);
          z-index: 11000;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          animation: slideInFade 2s forwards;
        }

        @keyframes slideInFade {
          0% { opacity: 0; transform: translateY(-8px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-8px); }
        }
      `}</style>
    </Container>
  );
};

export default FreedomWall;
