import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import './index.css'


// Firebase hosting support
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtrLTQTXlJRAZQa8A8JpTCdhh6emqXFg4",
  authDomain: "heidi-team3.firebaseapp.com",
  projectId: "heidi-team3",
  storageBucket: "heidi-team3.firebasestorage.app",
  messagingSenderId: "696094893892",
  appId: "1:696094893892:web:376f9ef943563589e3d911",
  measurementId: "G-7CLSBPGJ5G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);




ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)

