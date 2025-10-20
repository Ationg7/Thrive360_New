// Custom Hook for Notification Badges
// Following Clean Code Principle: Single Responsibility

import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/adminConstants';

export const useNotificationBadges = () => {
  const [badges, setBadges] = useState({
    users: 0,
    posts: 0,
    challenges: 0,
    meditation: 0,
    blogs: 0,
    analytics: 0,
    reports: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch notification counts (new items that need attention)
  const fetchBadgeCounts = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      
      if (!adminToken) {
        setLoading(false);
        return;
      }

      // Fetch data for each category to check for new items
      const [usersRes, postsRes, challengesRes, meditationRes, blogsRes, reportsRes] = await Promise.allSettled([
        fetch(API_ENDPOINTS.USERS, {
          headers: { "Authorization": `Bearer ${adminToken}` }
        }),
        fetch(API_ENDPOINTS.POSTS, {
          headers: { "Authorization": `Bearer ${adminToken}` }
        }),
        fetch(API_ENDPOINTS.CHALLENGES, {
          headers: { "Authorization": `Bearer ${adminToken}` }
        }),
        fetch(API_ENDPOINTS.MEDITATION, {
          headers: { "Authorization": `Bearer ${adminToken}` }
        }),
        fetch(API_ENDPOINTS.BLOGS, {
          headers: { "Authorization": `Bearer ${adminToken}` }
        }),
        fetch(API_ENDPOINTS.ADMIN_REPORTS, {
          headers: { "Authorization": `Bearer ${adminToken}` }
        })
      ]);

      const newBadges = {
        users: 0,
        posts: 0,
        challenges: 0,
        meditation: 0,
        blogs: 0,
        analytics: 0,
        reports: 0
      };

      // Check for new users (created in last 24 hours)
      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const usersData = await usersRes.value.json();
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newUsers = usersData.filter(user => {
          const createdAt = new Date(user.created_at || user.createdAt);
          return createdAt > oneDayAgo;
        });
        newBadges.users = newUsers.length;
      }

      // Check for new posts (created in last 24 hours)
      if (postsRes.status === 'fulfilled' && postsRes.value.ok) {
        const postsData = await postsRes.value.json();
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newPosts = postsData.filter(post => {
          const createdAt = new Date(post.created_at || post.createdAt);
          return createdAt > oneDayAgo;
        });
        newBadges.posts = newPosts.length;
      }

      // Check for new challenges (created in last 24 hours)
      if (challengesRes.status === 'fulfilled' && challengesRes.value.ok) {
        const challengesData = await challengesRes.value.json();
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newChallenges = challengesData.filter(challenge => {
          const createdAt = new Date(challenge.created_at || challenge.createdAt);
          return createdAt > oneDayAgo;
        });
        newBadges.challenges = newChallenges.length;
      }

      // Check for new meditation content (created in last 24 hours)
      if (meditationRes.status === 'fulfilled' && meditationRes.value.ok) {
        const meditationData = await meditationRes.value.json();
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newMeditation = meditationData.filter(meditation => {
          const createdAt = new Date(meditation.created_at || meditation.createdAt);
          return createdAt > oneDayAgo;
        });
        newBadges.meditation = newMeditation.length;
      }

      // Check for new blogs (created in last 24 hours)
      if (blogsRes.status === 'fulfilled' && blogsRes.value.ok) {
        const blogsData = await blogsRes.value.json();
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newBlogs = blogsData.filter(blog => {
          const createdAt = new Date(blog.created_at || blog.createdAt);
          return createdAt > oneDayAgo;
        });
        newBadges.blogs = newBlogs.length;
      }

      // Reports: count pending
      if (reportsRes.status === 'fulfilled' && reportsRes.value.ok) {
        const reportsData = await reportsRes.value.json();
        newBadges.reports = (Array.isArray(reportsData) ? reportsData : []).filter(r => r.status === 'pending').length;
      }
      // Analytics doesn't have badge
      newBadges.analytics = 0;

      setBadges(newBadges);
      
    } catch (error) {
      console.error('Error fetching badge counts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize badges
  useEffect(() => {
    fetchBadgeCounts();
    
    // Set up interval to refresh badges every 5 minutes
    const interval = setInterval(fetchBadgeCounts, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchBadgeCounts]);

  // Refresh badges manually
  const refreshBadges = useCallback(() => {
    fetchBadgeCounts();
  }, [fetchBadgeCounts]);

  return {
    badges,
    loading,
    refreshBadges
  };
};
