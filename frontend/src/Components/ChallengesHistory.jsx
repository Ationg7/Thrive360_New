import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, ProgressBar } from 'react-bootstrap';
import { CheckCircle, Clock, Calendar } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const ChallengesHistory = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load challenges history
  const loadChallengesHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.CHALLENGES_HISTORY, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChallenges(data);
      }
    } catch (error) {
      console.error('Error loading challenges history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'primary';
      case 'Not Started':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle size={16} className="text-success" />;
      case 'In Progress':
        return <Clock size={16} className="text-primary" />;
      default:
        return <Calendar size={16} className="text-muted" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    loadChallengesHistory();
  }, []);

  return (
    <Card
      className="mb-3 right-sidebar-card"
      style={{ overflow: 'visible', maxHeight: 'none' }}
    >
      <Card.Header>
        <div className="d-flex align-items-center">
          <Calendar className="me-2" />
          Challenges History
        </div>
      </Card.Header>
      <hr className="my-0" />

      {loading ? (
        <div className="p-3 text-center">Loading...</div>
      ) : (
        <ListGroup
          variant="flush"
          style={{ overflow: 'visible', maxHeight: 'none' }}
        >
          {challenges.length === 0 ? (
            <ListGroup.Item className="text-center text-muted">
              No challenges joined yet
            </ListGroup.Item>
          ) : (
            challenges.map((challenge) => (
              <ListGroup.Item
                key={challenge.id}
                className="challenge-history-item"
              >
                <div className="d-flex align-items-start">
                  <div className="me-2">{getStatusIcon(challenge.status)}</div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        <strong className="small">
                          {challenge.challenge_title}
                        </strong>
                        <div className="small text-muted">
                          {challenge.challenge_type}
                        </div>
                      </div>
                      <Badge bg={getStatusVariant(challenge.status)} size="sm">
                        {challenge.status}
                      </Badge>
                    </div>

                    {challenge.status === 'In Progress' && (
                      <div className="mt-2">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span>Progress</span>
                          <span>{challenge.progress_percentage}%</span>
                        </div>
                        <ProgressBar
                          now={challenge.progress_percentage}
                          variant="primary"
                          style={{ height: '6px' }}
                        />
                      </div>
                    )}

                    <div className="small text-muted mt-2">
                      <div>Joined: {formatDate(challenge.joined_at)}</div>
                      {challenge.last_updated && (
                        <div>Updated: {formatDate(challenge.last_updated)}</div>
                      )}
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      )}
    </Card>
  );
};

export default ChallengesHistory;
