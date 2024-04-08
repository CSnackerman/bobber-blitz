import { Analytics, getAnalytics } from 'firebase/analytics';
import { FirebaseApp, initializeApp } from 'firebase/app';

// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: 'AIzaSyAnOHKVoMh1T-RFoJegrCjBRoYzZDAu2UQ',
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
