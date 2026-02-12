// FreedomWall.js
import React, { useState, useEffect } from "react";
import { Container, Card, Form, Modal, Button, Dropdown } from "react-bootstrap";
import { Heart, Bookmark, Image, Smile, ThumbsUp ,Frown } from "lucide-react";
import { FaEllipsisV } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { useAuth } from "../AuthContext";
import Avatar from "../Components/Avatar";
import { Link } from "react-router-dom";
import { API_ENDPOINTS, getStorageUrl } from "../config/api.js";
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
 

  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const [showRestrictedModal, setShowRestrictedModal] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedReasonCustom, setSelectedReasonCustom] = useState("");
  const [showNoReasonModal, setShowNoReasonModal] = useState(false);
  // New: Already Reported Modal
  const [showAlreadyReportedModal, setShowAlreadyReportedModal] = useState(false);

  // New: Guest popup for home-style notification
  const [showGuestPopup, setShowGuestPopup] = useState(false);

  const [showReportSnackbar, setShowReportSnackbar] = useState(false);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [postToDelete, setPostToDelete] = useState(null);
  const [lastPostTime, setLastPostTime] = useState(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

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

  // Cooldown timer effect
  useEffect(() => {
    if (lastPostTime && cooldownRemaining > 0) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lastPostTime) / 1000);
        const remaining = Math.max(0, 15 - elapsed);
        setCooldownRemaining(remaining);
       
        if (remaining === 0) {
          setLastPostTime(null);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [lastPostTime, cooldownRemaining]);



  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        // Match Profile's pattern: Always include Authorization header if token exists
        const headers = { 
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch(API_ENDPOINTS.FREEDOM_WALL_POSTS, {
          headers
        });
        
        if (!res.ok) throw new Error("Failed to load posts");
        const data = await res.json();
        
        // Match Profile's normalization pattern exactly
        const normalized = (Array.isArray(data) ? data : []).map((p) => {
          const imageUrl = p.image_url || getStorageUrl(p.image_path);
          // Match Profile: Extract user_reaction the same way
          const userReaction = p.user_reaction || null;
          
          return {
            id: p.id,
            author: p.author || p.user?.name || "Anonymous",
            email: p.email || p.user?.email || null,
            user_id: p.user_id || null,
            date: p.created_at ? new Date(p.created_at).toLocaleString() : new Date().toLocaleString(),
            content: p.content,
            likes: p.likes || 0,
            hearts: p.hearts || 0,
            sad: p.sad || 0,
            saves: p.saves || 0,
            // Match Profile's exact pattern for setting liked/hearted
            liked: userReaction === "like",
            hearted: userReaction === "heart",
            saved: p.is_saved || false,
            user_reaction: userReaction,
            image: imageUrl,
          };
        });
        setPosts(normalized);
      } catch (e) {
        console.error("Error fetching posts:", e);
        setPosts(initialPosts);
      }
    };
    fetchPosts();
  }, [isLoggedIn]);

  const handleReaction = async (postId, reactionType) => {
    if (!isLoggedIn) {
      setShowGuestPopup(true);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.FREEDOM_WALL_POSTS}/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reaction_type: reactionType })
      });

      if (!response.ok) throw new Error('Failed to react');

      const data = await response.json();
      
      // Match Profile's exact state update pattern
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: data.likes,
                hearts: data.hearts,
                sad: data.sad,
                user_reaction: data.user_reaction,
                // Match Profile: Set liked/hearted exactly the same way
                liked: data.user_reaction === "like",
                hearted: data.user_reaction === "heart",
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

   const handleLike = (id) => handleReaction(id, "like");
  const handleHeart = (id) => handleReaction(id, "heart");
  const handleSad = (id) => handleReaction(id, "sad");

  const handleSave = async (id) => {
    if (!isLoggedIn) {
      setShowGuestPopup(true);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.FREEDOM_WALL_POSTS}/${id}/save`, {
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
 // Check cooldown
  if (lastPostTime) {
    const elapsed = Math.floor((Date.now() - lastPostTime) / 1000);
    if (elapsed < 15) {
      const remaining = 15 - elapsed;
      alert(`Please wait ${remaining} second${remaining !== 1 ? 's' : ''} before posting again.`);
      return;
    }
  }
  try {
    const formData = new FormData();
    formData.append("content", newPost);
    if (selectedImage instanceof File) formData.append("image", selectedImage);

    const token = localStorage.getItem("authToken");
    const isAuth = !!token && isLoggedIn;
    const url = isAuth
      ? API_ENDPOINTS.FREEDOM_WALL_POSTS_AUTH
      : API_ENDPOINTS.FREEDOM_WALL_POSTS;

    // Only include Authorization if logged in
    const headers = isAuth ? { Authorization: `Bearer ${token}` } : undefined;

    const res = await fetch(url, {
      method: "POST",
      headers, // don't set Content-Type, browser handles FormData
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Post creation failed:", errorData);
      throw new Error(errorData.message || "Failed to post");
    }

    const p = await res.json();
    console.log("Post created successfully:", p);

    // Handle image URL
    const imageUrl =
      p.image_url || getStorageUrl(p.image_path);

    const newEntry = {
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
      image: imageUrl,
    };

    setPosts((prev) => [newEntry, ...prev]);
    setNewPost("");
    setSelectedImage(null);
    setShowPostModal(false);
 
    // Set cooldown after successful post
    setLastPostTime(Date.now());
    setCooldownRemaining(15);


  } catch (e) {
  console.error("Error creating post:", e);
  setShowRestrictedModal(true); // show modal
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
    setShowNoReasonModal(true); // show our custom modal instead of alert
    return;
    }
    try {
      const response = await fetch(
        `${API_ENDPOINTS.FREEDOM_WALL_POSTS}/${reportPostId}/report`,
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
const handleDeletePost = async (id) => {
  try {
    // Optional: call backend to delete post
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_ENDPOINTS.FREEDOM_WALL_POSTS}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to delete post');

    // Remove post from state
    setPosts((prev) => prev.filter((post) => post.id !== id));
  } catch (error) {
    console.error('Error deleting post:', error);
    alert('Failed to delete post. Please try again.');
  }
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

    {showDeleteConfirm && postToDelete && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
    style={{ background: "rgba(0,0,0,0.35)", zIndex: 10050 }}
  >
    <div
      className="rounded-4 shadow-lg p-4"
      style={{ background: "#fff", width: "380px", maxWidth: "92%" }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h5 className="fw-bold mb-2 text-dark" style={{ margin: 0 }}>Delete Notice</h5>
        <button
          onClick={() => setShowDeleteConfirm(false)}
          style={{ fontSize: "20px", border: "none", background: "transparent", cursor: "pointer", color: "#555" }}
        >
          ×
        </button>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "12px 0" }} />

      <p className="text-muted mb-4">
        Are you sure you want to delete this post? <b>{postToDelete.author || "Guest User"}</b>'s post will be permanently deleted.
      </p>

      <div className="d-flex justify-content-end gap-2">
        <button
          className="btn fw-bold px-4 py-2 rounded-pill"
          style={{ padding: "8px 20px", borderRadius: "24px", background: "#e8f5e9", border: "1px solid #c8e6c9", color: "#2e7d32", fontWeight: 600, cursor: "pointer" }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          Cancel
        </button>
        <button
          className="btn fw-bold px-4 py-2 rounded-pill"
          style={{ padding: "8px 20px", borderRadius: "24px", background: "#d32f2f", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer" }}
          onClick={async () => {
            await handleDeletePost(postToDelete.id);
            setShowDeleteConfirm(false);
          }}
        >
          Delete
        </button>
      </div>
    </div>
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
           
      {/* New Post Input */}
      <Card className="post-input-card" style={{ cursor: "text" }}>
        <div className="post-header" style={{ alignItems: "center" }}>    
   <Avatar email={user?.email || ""} name={user?.name || "Anonymous"} className="avatar" size={40} />





<Form.Control
  type="text"
  placeholder={isLoggedIn ? "What's on your mind?" : "Express yourself anonymously..."}
  className="post-input-field"
  readOnly
  onClick={() => setShowPostModal(true)} // ✅ guests can now open modal too
/>


        </div>
      </Card>

      {/* Guest popup */}
      {showGuestPopup && (
  <div className="guest-popup-overlay">
    <div className="guest-popup">

      {/* Header with title and close X */}
      <div className="guest-popup-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontWeight: 600, fontSize: '18px' }}>Notice</span>
        <span 
          style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}
          onClick={() => setShowGuestPopup(false)}
        >
          ✕
        </span>
      </div>

      {/* Line below header */}
      <div className="guest-popup-line"></div>

      {/* Message content */}
      <p className="guest-popup-message" style={{ textAlign: 'center', marginTop: '30px' }}>
        You need to sign in to access this feature.
      </p>

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: '40px' }}>
        <Button variant="secondary" onClick={() => setShowGuestPopup(false)} style={{ padding: "0.65rem 1.5rem", fontSize: "1.05rem" }}>
          Cancel
        </Button>
        <Button variant="success" onClick={() => { setShowGuestPopup(false); window.location.href="/signin"; }} style={{ padding: "0.65rem 1.5rem", fontSize: "1.05rem" }}>
          Sign In
        </Button>
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
  <div className="mt-2" style={{ position: "relative", display: "inline-block" }}>
    <img
      src={URL.createObjectURL(selectedImage)}
      alt="Selected"
      className="img-fluid post-image-preview"
      style={{ borderRadius: "8px" }}
    />
    <span
      onClick={() => setSelectedImage(null)}
      style={{
        position: "absolute",
        top: "5px",
        right: "5px",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        color: "white",
        borderRadius: "50%",
        width: "22px",
        height: "22px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "14px",
      }}
    >
      ✕
    </span>
  </div>
)}

<div
  className="add-post-container mt-2 d-flex align-items-center"
  style={{
    border: "1px solid green",
    borderRadius: "8px",
    padding: "6px",
    gap: "10px",
  }}
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
    disabled={cooldownRemaining > 0}
    onClick={() => {
      // Both logged-in and guest users can post
      handlePost(); // handlePost already sends requests differently based on auth
      setShowPostModal(false); // close modal after posting
    }}
  >
    {cooldownRemaining > 0
      ? `Please wait ${cooldownRemaining}s`
      : (isLoggedIn ? "Post" : "Share Anonymously")}
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
                  {/* Show delete button only if user is the post owner */}
                  {user && post.user_id === user.id && (
                    <Dropdown.Item 
                      onClick={() => {
                        setPostToDelete(post);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-danger"
                    >
                      Delete
                    </Dropdown.Item>
                  )}
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

             {post.image && (
  <div className="post-image-wrapper">
    <img
      src={post.image}
      alt="Post"
      className="post-image-adjusted"
    />
  </div>
)}



                <div className="post-actions d-flex align-items-center mt-3" style={{ justifyContent: "flex-start" }}>
                  {/* LIKE */}
                  <div
                    className="d-flex align-items-center me-3 like-action"
                    onClick={isLoggedIn ? () => handleLike(post.id) : undefined}
                    style={{ cursor: isLoggedIn ? "pointer" : "default" }}
                  >
                    <ThumbsUp
                      size={18}
                      className="me-1"
                      stroke={post.liked ? "blue" : "gray"}
                      fill={post.liked ? "blue" : "none"}
                    />
                    <small>{post.likes || 0}</small>
                  </div>

                  {/* HEART */}
                  <div
                    className="d-flex align-items-center me-3 heart-action"
                    onClick={isLoggedIn ? () => handleHeart(post.id) : undefined}
                    style={{ cursor: isLoggedIn ? "pointer" : "default" }}
                  >
                    <Heart
                      size={18}
                      className="me-1"
                      fill={post.hearted ? "red" : "none"}
                      stroke={post.hearted ? "red" : "gray"}
                    />
                    <small>{post.hearts || 0}</small>
                  </div>

                  {/* SAD */}
                  <div
                    className="d-flex align-items-center me-3 sad-action"
                    onClick={isLoggedIn ? () => handleSad(post.id) : undefined}
                    style={{ cursor: isLoggedIn ? "pointer" : "default" }}
                  >
                    <Frown
                      size={18}
                      className="me-1"
                      stroke={post.user_reaction === "sad" ? "#6c757d" : "gray"}
                      fill={post.user_reaction === "sad" ? "yellow" : "none"}
                    />
                    <small>{post.sad || 0}</small>
                  </div>

                  {/* SAVE */}
                  <div
                    className="d-flex align-items-center save-action"
                    onClick={isLoggedIn ? () => handleSave(post.id) : undefined}
                    style={{ cursor: isLoggedIn ? "pointer" : "default" }}
                  >
                    <Bookmark
                      size={18}
                      className="me-1"
                      fill={post.saved ? "green" : "none"}
                      stroke={post.saved ? "green" : "gray"}
                    />
                    <small>{post.saves || 0}</small>
                  </div>
                </div>

              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
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

      {/* Report Snackbar */}
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
      style={{ cursor: "pointer", color: "rgb(138, 180, 248)", fontWeight: 600, marginLeft: "12px" }}
    >
      Ok
    </span>
  </div>
)}
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
