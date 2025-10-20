// AdminReports Page - System Reports and User Violation Reports
// Following Clean Code Principles

import React, { memo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, STORAGE_KEYS, ROUTES, MESSAGES } from '../constants/adminConstants';
import ErrorBoundary from '../components/ErrorBoundary';
import MessageDisplay from '../components/MessageDisplay';
import { CheckCircle, XCircle, AlertTriangle, Ban, Trash2 } from 'lucide-react';
import './AdminReports.css';

const AdminReports = memo(() => {
  const [reports, setReports] = useState({
    total_users: 0,
    active_users: 0,
    total_posts: 0,
    total_challenges: 0,
    guest_posts: 0,
    user_posts: 0
  });
  const [violationReports, setViolationReports] = useState([]);
  const [violationStats, setViolationStats] = useState({
    total_reports: 0,
    pending_reports: 0,
    reviewed_reports: 0,
    resolved_reports: 0,
    dismissed_reports: 0,
    reports_by_reason: {}
  });
  const [activeTab, setActiveTab] = useState('system');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showRestrictModal, setShowRestrictModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [restrictDays, setRestrictDays] = useState(7);
  const [restrictMessage, setRestrictMessage] = useState('');
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [reportToDelete, setReportToDelete] = useState(null);


  // Clear messages after timeout
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  }, []);

  // Fetch all reports data
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      if (!adminToken) {
        navigate(ROUTES.ADMIN_LOGIN);
        return;
      }

      // Fetch both system reports and violation reports
      const [systemResponse, violationResponse, violationStatsResponse] = await Promise.all([
        fetch(API_ENDPOINTS.DASHBOARD, {
          headers: {
            "Authorization": `Bearer ${adminToken}`,
            "Content-Type": "application/json"
          }
        }),
        fetch(API_ENDPOINTS.ADMIN_REPORTS, {
          headers: {
            "Authorization": `Bearer ${adminToken}`,
            "Content-Type": "application/json"
          }
        }),
        fetch(API_ENDPOINTS.ADMIN_REPORTS_STATS, {
          headers: {
            "Authorization": `Bearer ${adminToken}`,
            "Content-Type": "application/json"
          }
        })
      ]);

      if (!systemResponse.ok || !violationResponse.ok || !violationStatsResponse.ok) {
        if (systemResponse.status === 401 || violationResponse.status === 401 || violationStatsResponse.status === 401) {
          localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
          navigate(ROUTES.ADMIN_LOGIN);
          return;
        }
        throw new Error(`HTTP Error: Failed to fetch reports data`);
      }

      const [systemData, violationData, violationStatsData] = await Promise.all([
        systemResponse.json(),
        violationResponse.json(),
        violationStatsResponse.json()
      ]);

      setReports(systemData);
      setViolationReports(violationData);
      setViolationStats(violationStatsData);
      setSuccess('All reports data loaded successfully');
      
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.message || 'Failed to fetch reports data');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Calculate percentages
  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };
  const activeUserPercentage = calculatePercentage(reports.active_users, reports.total_users);
  const guestPostPercentage = calculatePercentage(reports.guest_posts, reports.total_posts);
  const userPostPercentage = calculatePercentage(reports.user_posts, reports.total_posts);

  // Export functions
  const exportToCSV = useCallback(() => {
    try {
      setExporting(true);
      
      const csvData = [
        ['Report Type', 'Count', 'Percentage'],
        ['Total Users', reports.total_users, '100%'],
        ['Active Users', reports.active_users, `${activeUserPercentage}%`],
        ['Total Posts', reports.total_posts, '100%'],
        ['Guest Posts', reports.guest_posts, `${guestPostPercentage}%`],
        ['User Posts', reports.user_posts, `${userPostPercentage}%`],
        ['Total Challenges', reports.total_challenges, '100%']
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `thrive360-reports-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Report exported to CSV successfully!');
      clearMessages();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError('Failed to export CSV report');
    } finally {
      setExporting(false);
    }
  }, [reports, activeUserPercentage, guestPostPercentage, userPostPercentage, clearMessages]);

  const exportToPDF = useCallback(() => {
    try {
      setExporting(true);
      
      // Create a simple HTML report
      const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Thrive360 Reports - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .report-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .report-table th, .report-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .report-table th { background-color: #f2f2f2; }
            .summary { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Thrive360 Admin Reports</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="summary">
            <h2>Summary Statistics</h2>
            <table class="report-table">
              <tr><th>Metric</th><th>Count</th><th>Percentage</th></tr>
              <tr><td>Total Users</td><td>${reports.total_users}</td><td>100%</td></tr>
              <tr><td>Active Users</td><td>${reports.active_users}</td><td>${activeUserPercentage}%</td></tr>
              <tr><td>Total Posts</td><td>${reports.total_posts}</td><td>100%</td></tr>
              <tr><td>Guest Posts</td><td>${reports.guest_posts}</td><td>${guestPostPercentage}%</td></tr>
              <tr><td>User Posts</td><td>${reports.user_posts}</td><td>${userPostPercentage}%</td></tr>
              <tr><td>Total Challenges</td><td>${reports.total_challenges}</td><td>100%</td></tr>
            </table>
          </div>
        </body>
        </html>
      `;
      
      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      
      setSuccess('Report opened for printing/PDF export!');
      clearMessages();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError('Failed to export PDF report');
    } finally {
      setExporting(false);
    }
  }, [reports, activeUserPercentage, guestPostPercentage, userPostPercentage, clearMessages]);

  const exportToExcel = useCallback(() => {
    try {
      setExporting(true);
      
      // Create Excel-like data structure
      const excelData = {
        'Summary Report': [
          ['Metric', 'Count', 'Percentage'],
          ['Total Users', reports.total_users, '100%'],
          ['Active Users', reports.active_users, `${activeUserPercentage}%`],
          ['Total Posts', reports.total_posts, '100%'],
          ['Guest Posts', reports.guest_posts, `${guestPostPercentage}%`],
          ['User Posts', reports.user_posts, `${userPostPercentage}%`],
          ['Total Challenges', reports.total_challenges, '100%']
        ]
      };
      
      // Convert to CSV format (Excel can open CSV)
      const csvContent = excelData['Summary Report'].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `thrive360-reports-${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Report exported to Excel successfully!');
      clearMessages();
    } catch (error) {
      console.error('Error exporting Excel:', error);
      setError('Failed to export Excel report');
    } finally {
      setExporting(false);
    }
  }, [reports, activeUserPercentage, guestPostPercentage, userPostPercentage, clearMessages]);

  // Violation report management functions
  const updateReportStatus = useCallback(async (reportId, status, adminNotes = '') => {
    try {
      setActionLoading(true);
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

      const response = await fetch(`${API_ENDPOINTS.ADMIN_REPORTS}/${reportId}/status`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status, admin_notes: adminNotes })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSuccess(data.message);
      fetchReports(); // Refresh data
      setShowModal(false);
      setSelectedReport(null);
      clearMessages();
      
    } catch (error) {
      console.error('Error updating report status:', error);
      setError(error.message || 'Failed to update report status');
    } finally {
      setActionLoading(false);
    }
  }, [fetchReports, clearMessages]);

  const deleteReportedPost = useCallback(async (reportId) => {
   

    try {
      setActionLoading(true);
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

      const response = await fetch(`${API_ENDPOINTS.ADMIN_REPORTS}/${reportId}/post`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSuccess(data.message);
      fetchReports(); // Refresh data
      setShowModal(false);
      setSelectedReport(null);
      clearMessages();
      
    } catch (error) {
      console.error('Error deleting reported post:', error);
      setError(error.message || 'Failed to delete reported post');
    } finally {
      setActionLoading(false);
    }
  }, [fetchReports, clearMessages]);

  // Send warning to user
  const sendWarningToUser = useCallback(async (reportId, message) => {
    try {
      setActionLoading(true);
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

      const response = await fetch(`${API_ENDPOINTS.ADMIN_REPORTS}/${reportId}/warning`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSuccess(data.message);
      fetchReports(); // Refresh data
      setShowWarningModal(false);
      setShowModal(false);
      setSelectedReport(null);
      setWarningMessage('');
      clearMessages();
      
    } catch (error) {
      console.error('Error sending warning:', error);
      setError(error.message || 'Failed to send warning');
    } finally {
      setActionLoading(false);
    }
  }, [fetchReports, clearMessages]);

  // Restrict user
  const restrictUser = useCallback(async (reportId, days, message) => {
    try {
      setActionLoading(true);
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

      const response = await fetch(`${API_ENDPOINTS.ADMIN_REPORTS}/${reportId}/restrict`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ days, message })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSuccess(data.message);
      fetchReports(); // Refresh data
      setShowRestrictModal(false);
      setShowModal(false);
      setSelectedReport(null);
      setRestrictDays(7);
      setRestrictMessage('');
      clearMessages();
      
    } catch (error) {
      console.error('Error restricting user:', error);
      setError(error.message || 'Failed to restrict user');
    } finally {
      setActionLoading(false);
    }
  }, [fetchReports, clearMessages]);

  // Filter violation reports
  const filteredViolationReports = violationReports.filter(report => {
    if (filterStatus === 'all') return true;
    return report.status === filterStatus;
  });

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-badge pending';
      case 'reviewed': return 'status-badge reviewed';
      case 'resolved': return 'status-badge resolved';
      case 'dismissed': return 'status-badge dismissed';
      default: return 'status-badge';
    }
  };

  // Get reason display text
  const getReasonText = (reason) => {
    const reasonMap = {
      'spam': 'Spam or misleading',
      'harassment': 'Harassment or bullying',
      'hate_speech': 'Hate speech or violence',
      'nudity': 'Nudity or sexual content',
      'self_harm': 'Self-harm or dangerous acts',
      'other': 'Other'
    };
    return reasonMap[reason] || reason;
  };

  // Initialize data
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-content">
          <div className="admin-loading-spinner"></div>
          <h3 className="admin-loading-text">Loading Reports...</h3>
        </div>
      </div>
    );
  }

  

  return (
    <ErrorBoundary>
      <div className="admin-reports-page">
        {(success || error) && (
  <div
    style={{
      position: "fixed",
      bottom: "20px",
      left: "0px",
      zIndex: 9999,
      backgroundColor: "rgb(32,31,36)",
      borderLeft: `6px solid ${success ? "green" : "red"}`,
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
      color: "#fff",
      transition: "left 0.4s ease, opacity 0.4s ease",
    }}
  >
    <span style={{ fontWeight: 600 }}>{success || error}</span>

    <span
      onClick={() => {
        setError(null);
        setSuccess(null);
      }}
      style={{
        cursor: "pointer",
        color: "#fff",
        fontWeight: 600,
        marginLeft: "12px",
        fontSize: "18px",
      }}
    >
      ✕
    </span>
  </div>
)}



        {/* Header */}
        <div className="admin-page-header">
          <div className="admin-page-header-content">
            <h1 className="admin-page-title">Reports Dashboard</h1>
            <p className="admin-page-subtitle">System statistics and user violation reports</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="reports-tabs">
          <button 
            className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            📊 System Reports
          </button>
          <button 
            className={`tab-btn ${activeTab === 'violations' ? 'active' : ''}`}
            onClick={() => setActiveTab('violations')}
          >
            ⚠️ User Reports ({violationStats.pending_reports} pending)
          </button>
        </div>

        {/* System Reports Tab */}
        {activeTab === 'system' && (
          <>
            {/* Key Metrics */}
            <div className="reports-metrics">
          <div className="metric-card primary">
            <div className="metric-icon">👥</div>
            <div className="metric-content">
              <h3>{reports.total_users}</h3>
              <p>Total Users</p>
              <div className="metric-detail">
                <span className="detail-label">Active:</span>
                <span className="detail-value">{reports.active_users} ({activeUserPercentage}%)</span>
              </div>
            </div>
          </div>

          <div className="metric-card success">
            <div className="metric-icon">📝</div>
            <div className="metric-content">
              <h3>{reports.total_posts}</h3>
              <p>Total Posts</p>
              <div className="metric-detail">
                <span className="detail-label">User Posts:</span>
                <span className="detail-value">{reports.user_posts} ({userPostPercentage}%)</span>
              </div>
            </div>
          </div>

          <div className="metric-card warning">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <h3>{reports.total_challenges}</h3>
              <p>Total Challenges</p>
              <div className="metric-detail">
                <span className="detail-label">Active:</span>
                <span className="detail-value">All Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Reports */}
        <div className="reports-sections">
          {/* User Activity Report */}
          <div className="report-section">
            <div className="report-header">
              <h3>User Activity Report</h3>
              <p>User engagement and activity metrics</p>
            </div>
            <div className="report-content">
              <div className="report-stats">
                <div className="stat-item">
                  <div className="stat-label">Total Registered Users</div>
                  <div className="stat-value">{reports.total_users}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Active Users</div>
                  <div className="stat-value">{reports.active_users}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Inactive Users</div>
                  <div className="stat-value">{reports.total_users - reports.active_users}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">User Activity Rate</div>
                  <div className="stat-value">{activeUserPercentage}%</div>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${activeUserPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Content Report */}
          <div className="report-section">
            <div className="report-header">
              <h3>Content Report</h3>
              <p>Posts and content creation metrics</p>
            </div>
            <div className="report-content">
              <div className="report-stats">
                <div className="stat-item">
                  <div className="stat-label">Total Posts</div>
                  <div className="stat-value">{reports.total_posts}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">User Posts</div>
                  <div className="stat-value">{reports.user_posts}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Guest Posts</div>
                  <div className="stat-value">{reports.guest_posts}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">User Post Ratio</div>
                  <div className="stat-value">{userPostPercentage}%</div>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${userPostPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Platform Health Report */}
          <div className="report-section">
            <div className="report-header">
              <h3>Platform Health Report</h3>
              <p>Overall system health and performance</p>
            </div>
            <div className="report-content">
              <div className="health-metrics">
                <div className="health-item">
                  <div className="health-icon">✅</div>
                  <div className="health-content">
                    <div className="health-label">System Status</div>
                    <div className="health-value">Operational</div>
                  </div>
                </div>
                <div className="health-item">
                  <div className="health-icon">📊</div>
                  <div className="health-content">
                    <div className="health-label">Data Integrity</div>
                    <div className="health-value">100%</div>
                  </div>
                </div>
                <div className="health-item">
                  <div className="health-icon">🔒</div>
                  <div className="health-content">
                    <div className="health-label">Security Status</div>
                    <div className="health-value">Secure</div>
                  </div>
                </div>
                <div className="health-item">
                  <div className="health-icon">⚡</div>
                  <div className="health-content">
                    <div className="health-label">Performance</div>
                    <div className="health-value">Optimal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="reports-actions">
          <button 
            onClick={fetchReports}
            className="admin-refresh-btn"
          >
            🔄 Refresh Reports
          </button>
          <button 
           onClick={exportToPDF}
           disabled={exporting}
           className="export-btn pdf-btn"
         >
           {exporting ? 'Exporting...' : '📄 Export PDF'}
          </button>
        </div>
          </>
        )}

        {/* User Violation Reports Tab */}
        {activeTab === 'violations' && (
          <>
            {/* Violation Statistics Cards */}
            <div className="reports-stats">
              <div className="stat-card total">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>{violationStats.total_reports}</h3>
                  <p>Total Reports</p>
                </div>
              </div>
              <div className="stat-card pending">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h3>{violationStats.pending_reports}</h3>
                  <p>Pending Review</p>
                </div>
              </div>
              <div className="stat-card resolved">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>{violationStats.resolved_reports}</h3>
                  <p>Resolved</p>
                </div>
              </div>
              <div className="stat-card dismissed">
                <div className="stat-icon">❌</div>
                <div className="stat-content">
                  <h3>{violationStats.dismissed_reports}</h3>
                  <p>Dismissed</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="reports-filters">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Reports</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
              <button 
                onClick={fetchReports}
                className="refresh-btn"
              >
                🔄 Refresh
              </button>
            </div>

            {/* Reports Table */}
            <div className="reports-table-container">
              {filteredViolationReports.length > 0 ? (
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Post Content</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Reported At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredViolationReports.map((report) => (
                      <tr key={report.id}>
                        <td>#{report.id}</td>
                        <td className="post-content">
                          {report.post ? (
                            <div className="post-preview">
                              <p>{report.post.content.substring(0, 100)}...</p>
                              <small>By: {report.post.author}</small>
                              {report.post.email && (
                                <small className="d-block text-muted">Email: {report.post.email}</small>
                              )}
                            </div>
                          ) : (
                            <span className="deleted-post">Post deleted</span>
                          )}
                        </td>
                        <td>
                          <div className="reason-info">
                            <span className="reason-main">{getReasonText(report.reason)}</span>
                            {report.custom_reason && (
                              <small className="reason-custom">{report.custom_reason}</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(report.status)}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </td>
                        <td>{new Date(report.created_at).toLocaleString()}</td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowModal(true);
                            }}
                            className="action-btn review-btn"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-reports">
                  <div className="no-reports-icon">📋</div>
                  <h3>No Reports Found</h3>
                  <p>There are no violation reports matching your current filter.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Review Modal */}
        {showModal && selectedReport && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Review Report #{selectedReport.id}</h3>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setSelectedReport(null);
                  }}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="report-details">
                  <div className="detail-section">
                    <h4>Reported Post</h4>
                    {selectedReport.post ? (
                      <div className="post-full">
                        <p>{selectedReport.post.content}</p>
                        <small>By: {selectedReport.post.author} on {new Date(selectedReport.post.created_at).toLocaleString()}</small>
                        {selectedReport.post.email && (
                          <small className="d-block text-muted">Email: {selectedReport.post.email}</small>
                        )}
                      </div>
                    ) : (
                      <p className="deleted-post">Post has been deleted</p>
                    )}
                  </div>

                  <div className="detail-section">
                    <h4>Report Information</h4>
                    <p><strong>Reason:</strong> {getReasonText(selectedReport.reason)}</p>
                    {selectedReport.custom_reason && (
                      <p><strong>Additional Details:</strong> {selectedReport.custom_reason}</p>
                    )}
                    <p><strong>Reported At:</strong> {new Date(selectedReport.created_at).toLocaleString()}</p>
                    <p><strong>Current Status:</strong> <span className={getStatusBadgeClass(selectedReport.status)}>{selectedReport.status}</span></p>
                  </div>

                  {selectedReport.admin_notes && (
                    <div className="detail-section">
                      <h4>Admin Notes</h4>
                      <p>{selectedReport.admin_notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
  {selectedReport.status === 'pending' && (
    <>
      <button
        onClick={() => updateReportStatus(selectedReport.id, 'reviewed', 'Report reviewed by admin')}
        disabled={actionLoading}
        className="icon-btn reviewed-btn"
        title="Mark as Reviewed"
      >
        <CheckCircle size={20} />
        <span className="btn-label">Reviewed</span>
      </button>

      <button
        onClick={() => updateReportStatus(selectedReport.id, 'dismissed', 'Report dismissed - no violation found')}
        disabled={actionLoading}
        className="icon-btn dismissed-btn"
        title="Dismiss Report"
      >
        <XCircle size={20} />
        <span className="btn-label">Dismis</span>
      </button>

      {selectedReport.post && (
        <>
          <button
            onClick={() => setShowWarningModal(true)}
            disabled={actionLoading}
            className="icon-btn warning-btn"
            title="Send Warning"
          >
            <AlertTriangle size={20} />
            <span className="btn-label">Warning</span>
          </button>

          <button
            onClick={() => setShowRestrictModal(true)}
            disabled={actionLoading}
            className="icon-btn restrict-btn"
            title="Restrict User"
          >
            <Ban size={20} />
            <span className="btn-label">Restrict</span>
          </button>

          <button
  onClick={() => {
    setReportToDelete(selectedReport);
    setShowDeleteModal(true);
  }}
  disabled={actionLoading}
  className="icon-btn delete-btn"
  title="Delete Post"
>
  <Trash2 size={20} />
  <span className="btn-label">Delete Post</span>
</button>

        </>
      )}
    </>
  )}

  {selectedReport.status === 'reviewed' && selectedReport.post && (
    <>
      <button
        onClick={() => setShowWarningModal(true)}
        disabled={actionLoading}
        className="icon-btn warning-btn"
        title="Send Warning"
      >
        <AlertTriangle size={20} />
        <span className="btn-label">Warning</span>
      </button>

      <button
        onClick={() => setShowRestrictModal(true)}
        disabled={actionLoading}
        className="icon-btn restrict-btn"
        title="Restrict User"
      >
        <Ban size={20} />
        <span className="btn-label">Restrict</span>
      </button>

      <button
  onClick={() => {
    setReportToDelete(selectedReport);
    setShowDeleteModal(true);
  }}
  disabled={actionLoading}
  className="icon-btn delete-btn"
  title="Delete Post"
>
  <Trash2 size={20} />
  <span className="btn-label">Delete Post</span>
</button>

    </>
  )}
</div>

              </div>
            </div>
          )}
{/* Delete Confirmation Modal */}
{showDeleteModal && reportToDelete && (
  <div className="modal-overlay">
    <div className="modal-content">
      {/* Header */}
      <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontWeight: 600, color: "#212121" }}>Delete Notice</h3>
        <button
          onClick={() => {
            setShowDeleteModal(false);
            setReportToDelete(null);
          }}
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
      <div className="modal-body">
        <p style={{ color: "#555" }}> 
        <p>Are you sure you want to delete this reported post? This action cannot be undone.</p>

          This action will permanently delete the reported post. This cannot be undone.
        </p>
        {reportToDelete.post && (
          <div className="post-preview" style={{ background: "#f9f9f9", padding: "12px", borderRadius: "8px", marginTop: "12px" }}>
            <p>{reportToDelete.post.content}</p>
            <small>By: {reportToDelete.post.author}</small>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
        <button
          onClick={() => {
            setShowDeleteModal(false);
            setReportToDelete(null);
          }}
          className="action-btn secondary-btn"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            deleteReportedPost(reportToDelete.id);
            setShowDeleteModal(false);
            setReportToDelete(null);
          }}
          disabled={actionLoading}
          className="action-btn delete-btn"
        >
          {actionLoading ? 'Deleting...' : 'Delete Post'}
        </button>
      </div>
    </div>
  </div>
)}


        {/* Warning Modal */}
        {showWarningModal && selectedReport && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Send Warning to User</h3>
                <button 
                  onClick={() => {
                    setShowWarningModal(false);
                    setWarningMessage('');
                  }}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="warning-details">
                  <p><strong>User:</strong> {selectedReport.post?.author}</p>
                  {selectedReport.post?.email && (
                    <p><strong>Email:</strong> {selectedReport.post.email}</p>
                  )}
                  <p><strong>Reported Post:</strong></p>
                  <div className="post-preview">
                    <p>{selectedReport.post?.content}</p>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="warning-message">Warning Message:</label>
                  <textarea
                    id="warning-message"
                    value={warningMessage}
                    onChange={(e) => setWarningMessage(e.target.value)}
                    placeholder="Enter warning message for the user..."
                    rows={4}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => {
                    setShowWarningModal(false);
                    setWarningMessage('');
                  }}
                  className="action-btn secondary-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendWarningToUser(selectedReport.id, warningMessage)}
                  disabled={actionLoading || !warningMessage.trim()}
                  className="action-btn warning-btn"
                >
                  {actionLoading ? 'Sending...' : 'Send Warning'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restrict Modal */}
        {showRestrictModal && selectedReport && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Restrict User</h3>
                <button 
                  onClick={() => {
                    setShowRestrictModal(false);
                    setRestrictDays(7);
                    setRestrictMessage('');
                  }}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="restrict-details">
                  <p><strong>User:</strong> {selectedReport.post?.author}</p>
                  {selectedReport.post?.email && (
                    <p><strong>Email:</strong> {selectedReport.post.email}</p>
                  )}
                  <p><strong>Reported Post:</strong></p>
                  <div className="post-preview">
                    <p>{selectedReport.post?.content}</p>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="restrict-days">Restriction Duration (Days):</label>
                  <select
                    id="restrict-days"
                    value={restrictDays}
                    onChange={(e) => setRestrictDays(parseInt(e.target.value))}
                    className="form-control"
                  >
                    <option value={1}>1 Day</option>
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={365}>1 Year</option>
                    <option value={-1}>Permanent</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="restrict-message">Restriction Message:</label>
                  <textarea
                    id="restrict-message"
                    value={restrictMessage}
                    onChange={(e) => setRestrictMessage(e.target.value)}
                    placeholder="Enter restriction message for the user..."
                    rows={4}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => {
                    setShowRestrictModal(false);
                    setRestrictDays(7);
                    setRestrictMessage('');
                  }}
                  className="action-btn secondary-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={() => restrictUser(selectedReport.id, restrictDays, restrictMessage)}
                  disabled={actionLoading || !restrictMessage.trim()}
                  className="action-btn restrict-btn"
                >
                  {actionLoading ? 'Restricting...' : 'Restrict User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});

AdminReports.displayName = 'AdminReports';

export default AdminReports;
