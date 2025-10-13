import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, Modal, Alert, Badge } from 'react-bootstrap';
import { Key, RefreshCw, Eye, EyeOff, Copy, Check } from 'lucide-react';

const AdminPasswordReset = () => {
  const [resetRequests, setResetRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [email, setEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const BASE_URL = 'http://127.0.0.1:8000';

  // Fetch password reset requests
  const fetchResetRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${BASE_URL}/api/admin/password-reset-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out PENDING requests for the main table, but keep them for pending section
        const activeRequests = data.filter(req => req.code !== 'PENDING');
        const pendingRequests = data.filter(req => req.code === 'PENDING');
        setResetRequests(activeRequests);
        setPendingRequests(pendingRequests);
      } else {
        showAlert('Failed to fetch reset requests', 'danger');
      }
    } catch (error) {
      console.error('Error fetching reset requests:', error);
      showAlert('Error fetching reset requests', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Generate password reset code
  const generateResetCode = async () => {
    if (!email.trim()) {
      showAlert('Please enter an email address', 'danger');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${BASE_URL}/api/admin/generate-password-reset-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedCode(data.code);
        setShowCode(true);
        showAlert(`Reset code generated for ${email}`, 'success');
        fetchResetRequests(); // Refresh the list
      } else {
        showAlert(data.error || 'Failed to generate reset code', 'danger');
      }
    } catch (error) {
      console.error('Error generating reset code:', error);
      showAlert('Error generating reset code', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Generate code for pending request
  const generateCodeForPending = async (pendingEmail) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${BASE_URL}/api/admin/generate-password-reset-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: pendingEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setEmail(pendingEmail);
        setGeneratedCode(data.code);
        setShowCode(true);
        setShowGenerateModal(true);
        showAlert(`Reset code generated for ${pendingEmail}`, 'success');
        fetchResetRequests(); // Refresh the list
      } else {
        showAlert(data.error || 'Failed to generate reset code', 'danger');
      }
    } catch (error) {
      console.error('Error generating reset code:', error);
      showAlert('Error generating reset code', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Copy code to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Show alert
  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 5000);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Get status badge
  const getStatusBadge = (isUsed, expiresAt) => {
    if (isUsed) {
      return <Badge bg="secondary">Used</Badge>;
    }
    if (new Date(expiresAt) < new Date()) {
      return <Badge bg="danger">Expired</Badge>;
    }
    return <Badge bg="success">Active</Badge>;
  };

  // Close generate modal
  const closeGenerateModal = () => {
    setShowGenerateModal(false);
    setEmail('');
    setGeneratedCode('');
    setShowCode(false);
    setCopied(false);
  };

  useEffect(() => {
    fetchResetRequests();
  }, []);

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <Key className="me-2" size={28} />
            Password Reset Management
          </h2>
          <p className="text-muted mb-0">Manage password reset codes for users</p>
        </div>
        <Button
          variant="success"
          onClick={() => setShowGenerateModal(true)}
          className="d-flex align-items-center"
        >
          <Key className="me-2" size={18} />
          Generate Code
        </Button>
      </div>

      {alert.show && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: 'success' })}>
          {alert.message}
        </Alert>
      )}

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <Card className="mb-4 border-warning">
          <Card.Header className="bg-warning text-dark">
            <h5 className="mb-0">
              <Key className="me-2" size={20} />
              Pending Requests ({pendingRequests.length})
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-warning">
                <tr>
                  <th>Email</th>
                  <th>Requested</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.email}</strong>
                    </td>
                    <td>{formatDate(request.created_at)}</td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => generateCodeForPending(request.email)}
                        disabled={loading}
                      >
                        <Key className="me-1" size={14} />
                        Generate Code
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Active Password Reset Codes</h5>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={fetchResetRequests}
            disabled={loading}
            className="d-flex align-items-center"
          >
            <RefreshCw className={`me-2 ${loading ? 'spinning' : ''}`} size={16} />
            Refresh
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Email</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Expires</th>
                  <th>Used At</th>
                </tr>
              </thead>
              <tbody>
                {resetRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No active password reset codes
                    </td>
                  </tr>
                ) : (
                  resetRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <strong>{request.email}</strong>
                      </td>
                      <td>
                        <code className="bg-light px-2 py-1 rounded">
                          {request.code}
                        </code>
                      </td>
                      <td>
                        {getStatusBadge(request.is_used, request.expires_at)}
                      </td>
                      <td>{formatDate(request.created_at)}</td>
                      <td>{formatDate(request.expires_at)}</td>
                      <td>
                        {request.used_at ? formatDate(request.used_at) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Generate Code Modal */}
      <Modal show={showGenerateModal} onHide={closeGenerateModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Key className="me-2" size={20} />
            Generate Password Reset Code
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>User Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter user's email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </Form.Group>

            {generatedCode && (
              <div className="mb-3">
                <Form.Label>Generated Code</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type={showCode ? 'text' : 'password'}
                    value={generatedCode}
                    readOnly
                    className="me-2"
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowCode(!showCode)}
                    className="me-2"
                  >
                    {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
                {copied && (
                  <small className="text-success">Code copied to clipboard!</small>
                )}
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeGenerateModal}>
            Close
          </Button>
          <Button
            variant="success"
            onClick={generateResetCode}
            disabled={loading || !email.trim()}
          >
            {loading ? 'Generating...' : 'Generate Code'}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .table th {
          border-top: none;
          font-weight: 600;
          color: #495057;
        }
        
        .table td {
          vertical-align: middle;
        }
        
        code {
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
      `}</style>
    </Container>
  );
};

export default AdminPasswordReset;
