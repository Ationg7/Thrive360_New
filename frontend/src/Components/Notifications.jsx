import React, { useState, useEffect } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import { Bell, CheckCircle, Heart, Bookmark, Calendar } from 'lucide-react';

const Notifications = ({ onUnreadUpdate }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://127.0.0.1:8000/api/notifications';
  const token = localStorage.getItem('authToken');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.data || data;
        setNotifications(list);
        const unread = list.filter(n => !n.is_read).length;
        setUnreadCount(unread);
        onUnreadUpdate(unread); // update navbar badge
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/mark-all-read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'reaction': return <Heart size={16} className="text-danger" />;
      case 'save': return <Bookmark size={16} className="text-success" />;
      case 'challenge_joined': return <CheckCircle size={16} className="text-primary" />;
      case 'challenge_available': return <CheckCircle size={16} className="text-primary" />;
      case 'event': return <Calendar size={16} className="text-info" />;
      case 'event_available': return <Calendar size={16} className="text-info" />;
      case 'blog': return <Bell size={17} className="text-warning" />;
      case 'welcome': return <Bell size={16} className="text-success" />;
      case 'getting_started': return <Bell size={16} className="text-info" />;
      case 'password_reset_request': return <Bell size={16} className="text-warning" />;
      default: return <Bell size={16} className="text-muted" />;
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  return (
    <div style={{ width: '100%', padding: '0' }}>
      {/* Header */}
      <div className="d-flex justify-content-start align-items-center mb-2" style={{ padding: '0 5px' }}>
        <Bell className="me-2 text-primary" />
        <strong>Notifications</strong>
        {unreadCount > 0 && (
          <Button
            variant="link"
            size="sm"
            className="p-0 ms-4"
            style={{ fontSize: '0.7rem', textDecoration: 'underline' }}
            onClick={markAllAsRead}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-2">Loading...</div>
      ) : (
        <ListGroup variant="flush" style={{ border: 'none', padding: 0, margin: 0 }}>
          {notifications.length === 0 ? (
            <ListGroup.Item
              className="text-center text-muted py-2"
              style={{ border: 'none', padding: '8px 5px' }}
            >
              No notifications
            </ListGroup.Item>
          ) : (
            notifications.map(n => (
              <ListGroup.Item
                key={n.id}
                className={`d-flex ${!n.is_read ? 'bg-light' : ''}`}
                style={{ cursor: 'pointer', border: 'none', padding: '8px 10px', alignItems: 'flex-start' }} // top-align
                onClick={() => !n.is_read && markAsRead(n.id)}
              >
                {/* Icon */}
                <div className="me-2 d-flex align-items-start mt-1">
                  {getIcon(n.type)}
                </div>

                {/* Message */}
                <div className="flex-grow-1 text-start">
                  <strong className="small d-block">{n.title}</strong>
                  <div className="small text-muted">{n.message}</div>
                  <div className="small text-muted">{new Date(n.created_at).toLocaleString()}</div>
                </div>

                {/* Unread Dot */}
                {!n.is_read && (
                  <div
                    className="bg-primary rounded-circle ms-2 mt-1"
                    style={{ width: '10px', height: '10px', flexShrink: 0 }}
                  />
                )}
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      )}
    </div>
  );
};

export default Notifications;
