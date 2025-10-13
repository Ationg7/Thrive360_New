import React, { useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { FaUserMd, FaEnvelope, FaPhone, FaMapMarkerAlt, FaDollarSign } from "react-icons/fa";
import "../App.css";

const FloatingPsychologists = () => {
  const [show, setShow] = useState(false);
  const [psychiatrists, setPsychiatrists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOpen = () => {
    setShow(true);
    fetchPsychiatrists();
  };
  
  const handleClose = () => setShow(false);

  const fetchPsychiatrists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:8000/api/admin/psychiatrists/active');
      if (!response.ok) throw new Error('Failed to fetch psychiatrists');
      
      const data = await response.json();
      setPsychiatrists(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching psychiatrists:', error);
      setError('Failed to load psychiatrists. Please try again.');
      // Fallback data
      setPsychiatrists([
        { 
          id: 1,
          name: "Dr. Jane Doe", 
          specialization: "Child Psychologist", 
          email: "jane@example.com", 
          phone: "+1 555-123-456",
          image_url: "https://i.pravatar.cc/100?img=1",
          consultation_fee: 1500.00,
          address: "123 Main St, City",
          description: "Experienced child psychologist with 10+ years of practice."
        },
        { 
          id: 2,
          name: "Dr. John Smith", 
          specialization: "Clinical Psychologist", 
          email: "john@example.com", 
          phone: "+1 555-234-567",
          image_url: "https://i.pravatar.cc/100?img=2",
          consultation_fee: 2000.00,
          address: "456 Oak Ave, City",
          description: "Specializes in anxiety and depression treatment."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button onClick={handleOpen} className="floating-psychologists-btn">
        <FaUserMd size={28} />
      </Button>

      {/* Modal */}
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Available Psychiatrists</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading psychiatrists...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-danger">{error}</p>
              <Button variant="primary" onClick={fetchPsychiatrists}>Try Again</Button>
            </div>
          ) : psychiatrists.length === 0 ? (
            <div className="text-center py-4">
              <p>No psychiatrists available at the moment.</p>
            </div>
          ) : (
            <div className="psychologist-list">
              {psychiatrists.map((doc) => (
                <div key={doc.id} className="psychologist-card">
                  {/* Profile Picture */}
                  <div className="psychologist-pic">
                    <img 
                      src={doc.image_url ? `http://127.0.0.1:8000/storage/${doc.image_url}` : `https://i.pravatar.cc/100?img=${doc.id}`} 
                      alt={doc.name}
                      onError={(e) => { e.target.src = `https://i.pravatar.cc/100?img=${doc.id}`; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="psychologist-info">
                    <h5 className="psychologist-name">{doc.name}</h5>
                    {doc.specialization && (
                     <p className="specialization">
  <strong>Specialization:</strong> {doc.specialization}
</p>

                    )}
                    {doc.description && (
                      <p className="text-muted small">{doc.description}</p>
                    )}

                    <div className="psychologist-contact-row">
                      {/* Left: email + phone */}
                      <div className="contact-left">
                        {doc.email && <p><FaEnvelope /> <a href={`mailto:${doc.email}`}>{doc.email}</a></p>}
                        {doc.phone && <p><FaPhone /> {doc.phone}</p>}
                      </div>
                      {/* Right: address + fee */}
                      <div className="contact-right">
                        {doc.address && <p><FaMapMarkerAlt /> {doc.address}</p>}
                        {doc.consultation_fee && <p><FaDollarSign /> ₱{parseFloat(doc.consultation_fee).toFixed(2)} per session</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default FloatingPsychologists;
