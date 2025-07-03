importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBRwSrbSvrFAW5dTyQN0BoRHS3_6iLrV_E",
  projectId: "homeworkbrothers-12345",
  messagingSenderId: "77683184454",
  appId: "1:77683184454:web:9b0bc1e8e5028943a3cb47"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body
  });
});
