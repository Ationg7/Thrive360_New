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
import { Heart, ThumbsUp, Smile, Bookmark } from "lucide-react";
import { BsFilter, BsGear } from "react-icons/bs";
import { ThreeDotsVertical, Image } from "react-bootstrap-icons";
import EmojiPicker from "emoji-picker-react";
import { FaEllipsisV } from "react-icons/fa";
import TodoList from "../Components/TodoList";
import Notifications from "../Components/Notifications";
import Avatar from "../Components/Avatar";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Calendar  , History } from 'lucide-react';
import Events from "../Components/Events";



const Profile = () => {
  const { isLoggedIn, user } = useAuth();

  // States
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [postFilter, setPostFilter] = useState("my");
  const [events, setEvents] = useState([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAlreadyReportedModal, setShowAlreadyReportedModal] = useState(false);
  const [showReportSnackbar, setShowReportSnackbar] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedReasonCustom, setSelectedReasonCustom] = useState("");
  const [reportingPostId, setReportingPostId] = useState(null);
  const [hiddenPosts, setHiddenPosts] = useState([]);
  const [showUndo, setShowUndo] = useState(false);

  const reportReasons = [
    { value: "spam", label: "Spam or misleading" },
    { value: "harassment", label: "Harassment or bullying" },
    { value: "hate_speech", label: "Hate speech or violence" },
    { value: "nudity", label: "Nudity or sexual content" },
    { value: "self_harm", label: "Self-harm or dangerous acts" },
    { value: "other", label: "Other" },
  ];

  // ---------------- Helper Functions ----------------
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

  const censorText = (text) => {
    if (!text) return "";
    const bannedWords = ["badword1", "badword2", "example"]; // Add banned words here
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
    if (!newPost.trim() && !selectedImage) return;
    try {
      const formData = new FormData();
      formData.append("content", newPost);
      if (selectedImage instanceof File) formData.append("image", selectedImage);

      const token = localStorage.getItem("authToken");
      const res = await fetch("http://127.0.0.1:8000/api/freedom-wall/posts/auth", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to post");
      const p = await res.json();
      const entry = {
        id: p.id,
        author: p.author || (user?.name || "You"),
        email: p.email || user?.email || getUserEmail(),
        date: p.created_at ? new Date(p.created_at).toLocaleString() : new Date().toLocaleString(),
        content: censorText(p.content),
        likes: p.likes || 0,
        hearts: p.hearts || 0,
        sads: p.sad || 0,
        saved: !!p.is_saved,
        liked: !!(p.user_reaction === 'like'),
        hearted: !!(p.user_reaction === 'heart'),
        sadded: !!(p.user_reaction === 'sad'),
        image: p.image_path ? `http://127.0.0.1:8000/storage/${p.image_path}` : null,
      };
      setPosts((prev) => [entry, ...prev]);
      setNewPost("");
      setSelectedImage(null);
      setShowEmojiPicker(false);
      setShowPostModal(false);
    } catch (e) {
      console.error("Error creating post:", e);
      alert("Failed to create post. Please try again.");
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
      alert("Please select a reason for reporting this post.");
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

  // Hide and Undo
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

  // Load Posts and Events
  const loadPosts = async (filter) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      let response;
      switch (filter) {
        case "saved":
          response = await fetch("http://127.0.0.1:8000/api/freedom-wall/saved-posts", { headers });
          break;
        default:
          response = await fetch("http://127.0.0.1:8000/api/freedom-wall/my-posts", { headers });
          break;
      }
      if (response.ok) {
        const data = await response.json();
        const normalizedPosts = (Array.isArray(data) ? data : []).map((post) => {
          const imageUrl = post.image_path
            ? `http://127.0.0.1:8000/storage/${post.image_path}`
            : null;
          const userReaction = post.user_reaction || null;
          return {
            ...post,
            email: post.email || post.user?.email || null,
            author: post.author || post.user?.name || "Anonymous",
            content: censorText(post.content),
            date: post.created_at ? new Date(post.created_at).toLocaleString() : "",
            image: imageUrl,
            liked: userReaction === "like",
            hearted: userReaction === "heart",
            saved: !!post.is_saved,
            likes: post.likes || 0,
            hearts: post.hearts || 0,
            sad: post.sad || 0,
          };
        });

        setPosts(normalizedPosts);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  const loadEvents = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const response = await fetch("http://127.0.0.1:8000/api/events", { headers });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => { loadPosts(postFilter); }, [postFilter]);
  useEffect(() => { if (user?.email) localStorage.setItem("userEmail", user.email); }, [user]);
  useEffect(() => { loadEvents(); }, []);
  


  return (
    <Container fluid className="profile-container">
      <Row className="gx-3">
        <Col xs={12}>
          <Card className="profile-header position-relative">
            <Card.Img
              variant="top"
              src="../public/images/k.jpg"
              className="profile-cover"
            />
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
                <Dropdown.Item href="#">Settings</Dropdown.Item>
                <Dropdown.Item onClick={() => setShowPhotoModal(true)}>
                  Change Photo
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Modal
              show={showPhotoModal}
              onHide={() => setShowPhotoModal(false)}
              centered
              className="photo-modal"
            >
              <Modal.Header closeButton>
                <Modal.Title>Change Photo</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row className="g-2">
                  <Col xs={4}>
                    <img
                      src="/images/photo1.jpg"
                      alt="Photo 1"
                      className="img-fluid rounded"
                    />
                  </Col>
                  <Col xs={4}>
                    <img
                      src="/images/photo2.jpg"
                      alt="Photo 2"
                      className="img-fluid rounded"
                    />
                  </Col>
                  <Col xs={4}>
                    <img
                      src="/images/photo3.jpg"
                      alt="Photo 3"
                      className="img-fluid rounded"
                    />
                  </Col>
                  <Col xs={4}>
                    <img
                      src="/images/photo4.jpg"
                      alt="Photo 4"
                      className="img-fluid rounded"
                    />
                  </Col>
                  <Col xs={4}>
                    <img
                      src="/images/photo5.jpg"
                      alt="Photo 5"
                      className="img-fluid rounded"
                    />
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowPhotoModal(false)}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>

            <Card.Body>
              <div className="profile-info">
                 <Avatar email={getUserEmail()} size={60} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Left Side */}
        <Col md={3} className="events-container">
  <Card className="mb-3 events-card">

    
   
    <div className="events-scroll-wrapper">
      <Events hideCardHeader /> {/* pass a prop to hide the header in Events.jsx */}
    </div>
  </Card>


           
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
      {(() => {
        const [items, setItems] = React.useState([]);
        React.useEffect(() => {
          const load = async () => {
            try {
              const token = localStorage.getItem('authToken');
              if (!token) { setItems([]); return; }
              const res = await fetch('http://127.0.0.1:8000/api/challenges/history', { headers: { Authorization: `Bearer ${token}` } });
              if (res.ok) {
                const data = await res.json();
                setItems(data.filter((x) => x.is_completed));
              }
            } catch (e) { /* ignore */ }
          };
          load();
        }, []);

        if (items.length === 0) {
          return (
            <ListGroup.Item className="text-center text-muted py-3 small">
              No Completed Challenges yet.
            </ListGroup.Item>
          );
        }

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

        return items.map((entry, idx) => (
          <ListGroup.Item key={`completed-${idx}`} className="px-3 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">{entry.challenge_title}</h6>
              {renderBadge('Completed')}
            </div>
          </ListGroup.Item>
        ));
      })()}
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
                <Avatar
                  email={getUserEmail()}
                  size={40}
                  style={{ backgroundColor: "#4CAF50", color: "#fff" }}
                />
              </div>
              <Form.Control type="text" placeholder="What's on your mind?" readOnly />
            </div>
          </Card>

          {/* Filters */}
          <Card.Header className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <Dropdown className="d-inline me-2">
                <Dropdown.Toggle variant="light" className="filter-btn">
                  <BsFilter /> Filters
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setPostFilter("date")}>By Date</Dropdown.Item>
                  <Dropdown.Item onClick={() => setPostFilter("likes")}>Most Liked</Dropdown.Item>
                  <Dropdown.Item onClick={() => setPostFilter("hearts")}>Most Hearted</Dropdown.Item>
                  <Dropdown.Item onClick={() => setPostFilter("images")}>With Images</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown className="d-inline ms-2">
                <Dropdown.Toggle variant="light" className="manage-posts-btn">
                  <BsGear /> Manage posts
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setPostFilter("my")}>My Posts</Dropdown.Item>
                  <Dropdown.Item onClick={() => setPostFilter("saved")}>Saved Posts</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Card.Header>

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
       
          {/* Report Modals */}
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

          <Modal show={showAlreadyReportedModal} onHide={() => setShowAlreadyReportedModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Notice</Modal.Title>
            </Modal.Header>
            <Modal.Body>You have already reported this post.</Modal.Body>
            <Modal.Footer>
              <Button variant="success" onClick={() => setShowAlreadyReportedModal(false)}>OK</Button>
            </Modal.Footer>
          </Modal>

          {showReportSnackbar && <div className="report-snackbar">Report submitted successfully</div>}
        </Col>
        {/* Right Sidebar */}
        <Col md={3} className="right-sidebar">
          <TodoList />
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
