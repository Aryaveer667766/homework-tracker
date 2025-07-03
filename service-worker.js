self.addEventListener('install', event => {
  console.log('[SW] Installed');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Activated');
});

self.addEventListener('fetch', event => {
  // Optionally add caching logic here
});
// firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyBRwSrbSvrFAW5dTyQN0BoRHS3_6iLrV_E",
  projectId: "homeworkbrothers-12345",
  messagingSenderId: "77683184454",
  appId: "1:77683184454:web:9b0bc1e8e5028943a3cb47",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
