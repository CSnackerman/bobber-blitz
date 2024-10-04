import { FirebaseOptions, initializeApp } from 'firebase/app';

// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyAnOHKVoMh1T-RFoJegrCjBRoYzZDAu2UQ',
  authDomain: 'resume-fishing.firebaseapp.com',
  projectId: 'resume-fishing',
  storageBucket: 'resume-fishing.appspot.com',
  messagingSenderId: '340417479534',
  appId: '1:340417479534:web:0f5b23f74b88906a67f77f',
  measurementId: 'G-PQ4S36SQPD',
};

export function initFirebaseApp() {
  initializeApp(firebaseConfig);
}
