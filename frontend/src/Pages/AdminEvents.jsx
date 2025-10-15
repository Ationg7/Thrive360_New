import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Table, Modal, Form, Row, Col, Badge, Alert } from 'react-bootstrap';
import { Plus, Edit3, Trash2, Calendar, MapPin, Users } from 'lucide-react';


const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    category: 'general',
    max_participants: '',
    image: null
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load events
  const loadEvents = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('http://127.0.0.1:8000/api/admin/events', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        setError('Failed to load events');
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Save event
const saveEvent = async () => {
  if (!formData.title.trim() || !formData.description.trim() || !formData.start_date) {
    setError('Please fill in all required fields');
    return;
  }

  try {
    const adminToken = localStorage.getItem('adminToken');
    const formDataToSend = new FormData();

    // Convert datetime-local to Laravel compatible format
    const formatDateForLaravel = (datetimeLocal) => {
      if (!datetimeLocal) return '';
      const date = new Date(datetimeLocal);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const ss = '00';
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    };

    // Append required fields
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('start_date', formatDateForLaravel(formData.start_date));

    // Optional fields
    if (formData.end_date) formDataToSend.append('end_date', formatDateForLaravel(formData.end_date));
    if (formData.location) formDataToSend.append('location', formData.location);
    if (formData.max_participants) formDataToSend.append('max_participants', Number(formData.max_participants));
    if (formData.image) formDataToSend.append('image', formData.image);

    const url = editingEvent
      ? `http://127.0.0.1:8000/api/admin/events/${editingEvent.id}`
      : 'http://127.0.0.1:8000/api/admin/events';

    const method = editingEvent ? 'POST' : 'POST'; // If using Laravel POST for both create/update with _method=PUT

    if (editingEvent) {
      formDataToSend.append('_method', 'PUT'); // Laravel expects this for PUT via FormData
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
      body: formDataToSend
    });

    if (response.ok) {
      setSuccess(editingEvent ? 'Event updated successfully' : 'Event created successfully');
      setShowModal(false);
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        category: 'general',
        max_participants: '',
        image: null
      });
      await loadEvents();
    } else {
      const errorData = await response.json();
      setError(errorData.message || 'Failed to save event');
    }
  } catch (error) {
    console.error('Error saving event:', error);
    setError('Failed to save event');
  }
};


  // Delete event
  const deleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`http://127.0.0.1:8000/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Event deleted successfully');
        await loadEvents();
      } else {
        setError('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
    }
  };

  /// Edit event
const editEvent = (event) => {
  setEditingEvent(event);
  setFormData({
    title: event.title,
    description: event.description,
    location: event.location || '',
    // Convert Laravel datetime to datetime-local format
    start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
    end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
    category: event.category,
    max_participants: event.max_participants || '',
    image: null
  });
  setShowModal(true);
};


  // Get category badge variant
  const getCategoryVariant = (category) => {
    switch (category) {
      case 'wellness':
        return 'success';
      case 'meditation':
        return 'info';
      case 'fitness':
        return 'warning';
      case 'education':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if event is active
  const isActive = (startDate) => {
    return new Date(startDate) > new Date();
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <Container fluid className="admin-events">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Event Management</h2>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} className="me-2" />
          Add Event
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">Loading events...</div>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Start Date</th>
                  <th>Location</th>
                  <th>Participants</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      {event.image_path ? (
                        <img 
                          src={`http://127.0.0.1:8000/storage/${event.image_path}`} 
                          alt={event.title}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ) : (
                        <div style={{ width: '50px', height: '50px', backgroundColor: '#f8f9fa', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          📅
                        </div>
                      )}
                    </td>
                    <td>
                      <div>
                        <strong>{event.title}</strong>
                        <div className="small text-muted">
                          {event.description.length > 50 
                            ? `${event.description.substring(0, 50)}...` 
                            : event.description
                          }
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge bg={getCategoryVariant(event.category)}>
                        {event.category}
                      </Badge>
                    </td>
                    <td>{formatDate(event.start_date)}</td>
                    <td>
                      {event.location ? (
                        <div className="d-flex align-items-center">
                          <MapPin size={14} className="me-1" />
                          {event.location}
                        </div>
                      ) : (
                        <span className="text-muted">Online</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Users size={14} className="me-1" />
                        {event.participants?.length || 0}
                        {event.max_participants && `/${event.max_participants}`}
                      </div>
                    </td>
                    <td>
                      <Badge bg={isActive(event.start_date) ? 'success' : 'secondary'}>
                        {isActive(event.start_date) ? 'Active' : 'Past'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => editEvent(event)}
                        >
                          <Edit3 size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteEvent(event.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Event Modal */}
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setEditingEvent(null);
        setFormData({
          title: '',
          description: '',
          location: '',
          start_date: '',
          end_date: '',
          category: 'general',
          max_participants: '',
          image: null
        });
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter event title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="wellness">Wellness</option>
                    <option value="meditation">Meditation</option>
                    <option value="fitness">Fitness</option>
                    <option value="education">Education</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter event description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter location (optional)"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Participants</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date & Time *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Event Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              setEditingEvent(null);
              setFormData({
                title: '',
                description: '',
                location: '',
                start_date: '',
                end_date: '',
                category: 'general',
                max_participants: '',
                image: null
              });
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={saveEvent}>
            {editingEvent ? 'Update' : 'Create'} Event
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminEvents;
