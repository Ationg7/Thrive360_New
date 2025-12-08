/* global firebase */

// Firebase Messaging service worker for background notifications
// Uses the compat SDK for simpler initialization in a service worker context.

importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCxru7G1A7Sbq0xTVWeZNjypbzRYYIBtFk",
  authDomain: "thrive360-594f3.firebaseapp.com",
  projectId: "thrive360-594f3",
  storageBucket: "thrive360-594f3.firebasestorage.app",
  messagingSenderId: "500722327592",
  appId: "1:500722327592:web:28c8f44b21d1e8a8e7951d",
});

const messaging = firebase.messaging();

// Handle background messages (when app is closed or in background)
messaging.onBackgroundMessage((payload) => {
  console.log("📨 Background message received in service worker:", payload);
  
  // Extract notification data
  const notification = payload.notification || {};
  const data = payload.data || {};
  
  // Get title and body from notification object or fallback to data
  const notificationTitle = notification.title || data.title || "Thrive360";
  const notificationBody = notification.body || data.body || data.message || "You have a new notification";
  
  console.log("📨 Showing notification:", {
    title: notificationTitle,
    body: notificationBody
  });

  const notificationOptions = {
    body: notificationBody,
    icon: notification.icon || "/vite.svg",
    badge: "/vite.svg",
    tag: data.type || "thrive360-notification",
    data: {
      ...data,
      click_action: data.redirect_url || "/home"
    },
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions)
    .then(() => {
      console.log("✅ Notification displayed successfully");
    })
    .catch((error) => {
      console.error("❌ Error showing notification:", error);
    });
});

// Handle notification clicks - open the app to the relevant page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  // Get redirect URL from notification data, or default to home
  let redirectUrl = data.redirect_url || "/home";
  // If redirect_url is relative, make it absolute
  if (!redirectUrl.startsWith("http")) {
    redirectUrl = self.location.origin + redirectUrl;
  }

  // Open or focus the app window
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open for this origin
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            // Focus existing window and navigate
            return client.focus().then(() => {
              // Post message to client to navigate (React Router will handle it)
              client.postMessage({
                type: "NOTIFICATION_CLICK",
                url: redirectUrl,
              });
            });
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(redirectUrl);
        }
      })
  );
});



