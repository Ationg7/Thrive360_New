import { useEffect } from "react";
import { messaging } from "../firebase";
import { API_BASE_URL } from "../config/api";
import { getToken, onMessage } from "firebase/messaging";

// Public VAPID key from your Firebase Cloud Messaging settings
const VAPID_KEY =
  "BAjP3xeK7lu_7nyE3pJb0YKayjIWJIWMLLbYZxvZ03yFQCTbJAzObwXYeZ6aqaWh-F_OLJQP2RRf8k8ymSbrdvE";

/**
 * Hook to register the FCM service worker, request notification permission,
 * obtain an FCM token, and send it to the backend for the logged in user.
 */
export function useFcmRegistration(isLoggedIn) {
  useEffect(() => {
    if (!isLoggedIn) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (!("serviceWorker" in navigator)) return;

    const registerFcm = async () => {
      try {
        console.log("🔔 Starting FCM registration...");
        
        // Ask for browser notification permission
        const permission = await Notification.requestPermission();
        console.log("🔔 Notification permission:", permission);
        
        if (permission !== "granted") {
          console.warn("⚠️ Notification permission not granted. User will only see in-app notifications.");
          console.warn("💡 To enable push notifications, please allow notifications in your browser settings.");
          return;
        }

        // Register the Firebase messaging service worker
        console.log("🔔 Registering service worker...");
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        console.log("✅ Service worker registered:", registration.scope);

        // Get FCM token for this device/browser
        console.log("🔔 Requesting FCM token...");
        const fcmToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (!fcmToken) {
          console.warn("⚠️ No FCM token received. Push notifications will not work.");
          return;
        }

        console.log("✅ FCM token received:", fcmToken.substring(0, 20) + "...");

        // Save FCM token to backend
        const authToken = localStorage.getItem("authToken");
        const response = await fetch(`${API_BASE_URL}/user/fcm-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken ? `Bearer ${authToken}` : "",
          },
          body: JSON.stringify({
            fcm_token: fcmToken,
            device_type: "web",
            device_name: navigator.userAgent,
          }),
        });

        if (response.ok) {
          console.log("✅ FCM token saved to backend successfully!");
          console.log("🎉 Push notifications are now enabled!");
        } else {
          console.error("❌ Failed to save FCM token to backend:", await response.text());
        }

        // Handle foreground messages (when tab is open)
        onMessage(messaging, (payload) => {
          console.log("📨 Foreground message received:", payload);
          
          const notification = payload.notification || {};
          const data = payload.data || {};
          
          // Get title and body from notification or data
          const title = notification.title || data.title || "Thrive360";
          const body = notification.body || data.body || data.message || "You have a new notification";
          
          if (Notification.permission === "granted") {
            console.log("📨 Showing foreground notification:", { title, body });
            new Notification(title, {
              body: body,
              icon: notification.icon || "/vite.svg",
              badge: "/vite.svg",
              tag: data.type || "thrive360-notification",
              data: data,
            });
          } else {
            console.warn("⚠️ Notification permission not granted, cannot show foreground notification");
          }
        });
      } catch (error) {
        console.error("❌ Error during FCM registration:", error);
        console.error("Stack trace:", error.stack);
      }
    };

    registerFcm();
  }, [isLoggedIn]);
}



