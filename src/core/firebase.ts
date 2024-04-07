// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Analytics, getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'resume-fishing.firebaseapp.com',
  projectId: 'resume-fishing',
  storageBucket: 'resume-fishing.appspot.com',
  messagingSenderId: '340417479534',
  appId: '1:340417479534:web:0f5b23f74b88906a67f77f',
  measurementId: 'G-PQ4S36SQPD',
};

// Initialize Firebase
let app: FirebaseApp;
let analytics: Analytics;

export function initFirebase() {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  analytics.app.automaticDataCollectionEnabled = true;
}
