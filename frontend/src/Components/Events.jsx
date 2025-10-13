import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

const Events = ({ hideHeader = false }) => {
  const [events, setEvents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://127.0.0.1:8000/api/events/suggestions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const getCategoryVariant = (category) => {
    switch (category) {
      case 'wellness': return 'success';
      case 'meditation': return 'info';
      case 'fitness': return 'warning';
      case 'education': return 'primary';
      default: return 'secondary';
    }
  };

  const toImageUrl = (img) => {
    if (!img) return null;
    if (typeof img !== 'string') return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `http://127.0.0.1:8000/storage/${img}`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const isUpcoming = (startDate) => new Date(startDate) > new Date();

  useEffect(() => {
    loadEvents();
    loadSuggestions();
  }, []);

  return (
    <div>
      {/* Suggested Events */}
      {suggestions.length > 0 && (
        <Card className="mb-3 shadow-sm">
          {!hideHeader && (
            <div
              className="d-flex align-items-center px-3 py-2 mb-2"
              style={{ fontWeight: 500, fontSize: '0.95rem' }}
            >
              <Calendar className="me-2" />
              Suggested Events
            </div>
          )}
          <ListGroup variant="flush">
            {suggestions.slice(0, 3).map((event) => (
              <ListGroup.Item key={event.id}>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <strong className="small">{event.title}</strong>
                    <Badge bg={getCategoryVariant(event.category)} size="sm" className="ms-2">
                      {event.category}
                    </Badge>
                  </div>
                  {toImageUrl(event.image_url || event.image_path) && (
                    <div className="mb-2">
                      <img
                        src={toImageUrl(event.image_url || event.image_path)}
                        alt={event.title}
                        className="img-fluid rounded"
                        style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="small text-muted mb-2">{event.description}</div>
                  <div className="d-flex align-items-center small text-muted">
                    <Clock size={14} className="me-1" />
                    {formatDateTime(event.start_date)}
                    {event.location && (
                      <>
                        <MapPin size={14} className="ms-2 me-1" />
                        {event.location}
                      </>
                    )}
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}

      {/* All Events */}
      <Card className="mb-3 shadow-sm">
        {!hideHeader && (
          <div
            className="d-flex align-items-center px-3 py-2 mb-2"
            style={{ fontWeight: 500, fontSize: '0.95rem' }}
          >
            <Calendar className="me-2" />
            Upcoming Events
          </div>
        )}
        {loading ? (
          <div className="p-3 text-center">Loading...</div>
        ) : (
          <ListGroup variant="flush">
            {events.length === 0 ? (
              <ListGroup.Item className="text-center text-muted">
                No events available
              </ListGroup.Item>
            ) : (
              events.slice(0, 5).map((event) => (
                <ListGroup.Item key={event.id}>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                      <strong className="small">{event.title}</strong>
                      <Badge bg={getCategoryVariant(event.category)} size="sm" className="ms-2">
                        {event.category}
                      </Badge>
                      {!isUpcoming(event.start_date) && (
                        <Badge bg="secondary" size="sm" className="ms-1">
                          Past
                        </Badge>
                      )}
                    </div>
{toImageUrl(event.image_url || event.image_path) && (
  <div className="mb-2">
    <img
      src={toImageUrl(event.image_url || event.image_path)}
      alt={event.title}
      className="img-fluid rounded"
      style={{
        width: "100%",
        height: "auto",
        borderRadius: "10px",
        objectFit: "contain",
        display: "block",
        marginTop: "10px",
      }}
    />
  </div>
)}

                    
                    <div className="small text-muted mb-2">
                      {event.description.length > 100
                        ? `${event.description.substring(0, 100)}...`
                        : event.description}
                    </div>
                    <div className="d-flex align-items-center small text-muted">
                      <Clock size={14} className="me-1" />
                      {formatDateTime(event.start_date)}
                      {event.location && (
                        <>
                          <MapPin size={14} className="ms-2 me-1" />
                          {event.location}
                        </>
                      )}
                      {event.max_participants && (
                        <>
                          <Users size={14} className="ms-2 me-1" />
                          {event.participants?.length || 0}/{event.max_participants}
                        </>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        )}
      </Card>
    </div>
  );
};

export default Events;
