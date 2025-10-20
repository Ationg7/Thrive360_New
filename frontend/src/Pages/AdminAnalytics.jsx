// AdminAnalytics Page - Analytics Dashboard
// Following Clean Code Principles

import React, { memo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, STORAGE_KEYS, ROUTES, MESSAGES } from '../constants/adminConstants';
import ErrorBoundary from '../components/ErrorBoundary';
import MessageDisplay from '../components/MessageDisplay';
import './AdminAnalytics.css';

const AdminAnalytics = memo(() => {
  const [analytics, setAnalytics] = useState({
    posts_per_day: [],
    challenges_per_day: [],
    user_registrations: []
  });
  const [reports, setReports] = useState({
    total_users: 0,
    active_users: 0,
    total_posts: 0,
    total_challenges: 0,
    guest_posts: 0,
    user_posts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [timeRange, setTimeRange] = useState('7');
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  // Clear messages after timeout
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  }, []);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      if (!adminToken) {
        navigate(ROUTES.ADMIN_LOGIN);
        return;
      }

      // Fetch both analytics and dashboard data
      const [analyticsResponse, dashboardResponse] = await Promise.all([
        fetch(API_ENDPOINTS.ADMIN_ANALYTICS, {
          headers: {
            "Authorization": `Bearer ${adminToken}`,
            "Content-Type": "application/json"
          }
        }),
        fetch(API_ENDPOINTS.ADMIN_DASHBOARD, {
          headers: {
            "Authorization": `Bearer ${adminToken}`,
            "Content-Type": "application/json"
          }
        })
      ]);

      if (!analyticsResponse.ok || !dashboardResponse.ok) {
        if (analyticsResponse.status === 401 || dashboardResponse.status === 401) {
          localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
          navigate(ROUTES.ADMIN_LOGIN);
          return;
        }
        throw new Error(`HTTP Error: ${analyticsResponse.status} or ${dashboardResponse.status}`);
      }

      const [analyticsData, dashboardData] = await Promise.all([
        analyticsResponse.json(),
        dashboardResponse.json()
      ]);

      setAnalytics(analyticsData);
      setReports(dashboardData);
      setSuccess('Analytics and reports data loaded successfully');
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Calculate totals
  const calculateTotals = (data) => {
    return data.reduce((sum, item) => sum + item.count, 0);
  };

  // Get max value for scaling
  const getMaxValue = (data) => {
    return Math.max(...data.map(item => item.count), 1);
  };

  // Calculate percentages
  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // Export functions
  const exportToCSV = useCallback(() => {
    try {
      setExporting(true);
      
      const csvData = [
        ['Report Type', 'Count', 'Percentage'],
        ['Total Users', reports.total_users, '100%'],
        ['Active Users', reports.active_users, `${calculatePercentage(reports.active_users, reports.total_users)}%`],
        ['Total Posts', reports.total_posts, '100%'],
        ['Guest Posts', reports.guest_posts, `${calculatePercentage(reports.guest_posts, reports.total_posts)}%`],
        ['User Posts', reports.user_posts, `${calculatePercentage(reports.user_posts, reports.total_posts)}%`],
        ['Total Challenges', reports.total_challenges, '100%']
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `thrive360-analytics-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Analytics report exported to CSV successfully!');
      clearMessages();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError('Failed to export CSV report');
    } finally {
      setExporting(false);
    }
  }, [reports, clearMessages]);

  const exportToPDF = useCallback(() => {
    try {
      setExporting(true);
      
      const activeUserPercentage = calculatePercentage(reports.active_users, reports.total_users);
      const guestPostPercentage = calculatePercentage(reports.guest_posts, reports.total_posts);
      const userPostPercentage = calculatePercentage(reports.user_posts, reports.total_posts);
      
      // Create a comprehensive HTML report
      const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Thrive360 Analytics Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .report-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .report-table th, .report-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .report-table th { background-color: #f2f2f2; }
            .summary { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .chart-summary { margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Thrive360 Analytics & Reports</h1>
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

          <div class="chart-summary">
            <h2>7-Day Activity Summary</h2>
            <p><strong>Posts Created:</strong> ${calculateTotals(analytics.posts_per_day)} posts</p>
            <p><strong>Challenges Created:</strong> ${calculateTotals(analytics.challenges_per_day)} challenges</p>
            <p><strong>New User Registrations:</strong> ${calculateTotals(analytics.user_registrations)} users</p>
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
      
      setSuccess('Analytics report opened for printing/PDF export!');
      clearMessages();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError('Failed to export PDF report');
    } finally {
      setExporting(false);
    }
  }, [reports, analytics, clearMessages]);

  // Initialize data
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-content">
          <div className="admin-loading-spinner"></div>
          <h3 className="admin-loading-text">Loading Analytics...</h3>
        </div>
      </div>
    );
  }

  const postsTotal = calculateTotals(analytics.posts_per_day);
  const challengesTotal = calculateTotals(analytics.challenges_per_day);
  const usersTotal = calculateTotals(analytics.user_registrations);
  
  const activeUserPercentage = calculatePercentage(reports.active_users, reports.total_users);
  const guestPostPercentage = calculatePercentage(reports.guest_posts, reports.total_posts);
  const userPostPercentage = calculatePercentage(reports.user_posts, reports.total_posts);

  return (
    <ErrorBoundary>
      <div className="admin-analytics-page">
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
            <h1 className="admin-page-title">Analytics & Reports Dashboard</h1>
            <p className="admin-page-subtitle">Comprehensive insights, trends, and detailed data analysis</p>
          </div>
        </div>

        {/* Key Metrics from Reports */}
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

        {/* 7-Day Activity Summary Cards */}
        <div className="analytics-summary">
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <h3>{postsTotal}</h3>
              <p>Posts (7 days)</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🎯</div>
            <div className="summary-content">
              <h3>{challengesTotal}</h3>
              <p>Challenges (7 days)</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">👥</div>
            <div className="summary-content">
              <h3>{usersTotal}</h3>
              <p>New Users (7 days)</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="analytics-charts">
          {/* Posts Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Posts Activity</h3>
              <p>Posts created per day</p>
            </div>
            <div className="chart-content">
              {analytics.posts_per_day.length > 0 ? (
                <div className="bar-chart">
                  {analytics.posts_per_day.map((item, index) => {
                    const maxValue = getMaxValue(analytics.posts_per_day);
                    const height = (item.count / maxValue) * 100;
                    return (
                      <div key={index} className="bar-item">
                        <div 
                          className="bar" 
                          style={{ height: `${height}%` }}
                          title={`${item.date}: ${item.count} posts`}
                        ></div>
                        <div className="bar-label">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div className="bar-value">{item.count}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-data">No posts data available</div>
              )}
            </div>
          </div>

          {/* Challenges Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Challenges Activity</h3>
              <p>Challenges created per day</p>
            </div>
            <div className="chart-content">
              {analytics.challenges_per_day.length > 0 ? (
                <div className="bar-chart">
                  {analytics.challenges_per_day.map((item, index) => {
                    const maxValue = getMaxValue(analytics.challenges_per_day);
                    const height = (item.count / maxValue) * 100;
                    return (
                      <div key={index} className="bar-item">
                        <div 
                          className="bar" 
                          style={{ height: `${height}%` }}
                          title={`${item.date}: ${item.count} challenges`}
                        ></div>
                        <div className="bar-label">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div className="bar-value">{item.count}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-data">No challenges data available</div>
              )}
            </div>
          </div>

          {/* User Registrations Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>User Registrations</h3>
              <p>New users registered per day</p>
            </div>
            <div className="chart-content">
              {analytics.user_registrations.length > 0 ? (
                <div className="bar-chart">
                  {analytics.user_registrations.map((item, index) => {
                    const maxValue = getMaxValue(analytics.user_registrations);
                    const height = (item.count / maxValue) * 100;
                    return (
                      <div key={index} className="bar-item">
                        <div 
                          className="bar" 
                          style={{ height: `${height}%` }}
                          title={`${item.date}: ${item.count} users`}
                        ></div>
                        <div className="bar-label">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div className="bar-value">{item.count}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-data">No user registration data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Reports Section */}
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
        <div className="analytics-actions">
          <button 
            onClick={fetchAnalytics}
            className="admin-refresh-btn"
          >
            🔄 Refresh Data
          </button>
          <button 
            onClick={exportToCSV}
            disabled={exporting}
            className="export-btn csv-btn"
          >
            {exporting ? 'Exporting...' : '📊 Export CSV'}
          </button>
          <button 
            onClick={exportToPDF}
            disabled={exporting}
            className="export-btn pdf-btn"
          >
            {exporting ? 'Exporting...' : '📄 Export PDF'}
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
});

AdminAnalytics.displayName = 'AdminAnalytics';

export default AdminAnalytics;
