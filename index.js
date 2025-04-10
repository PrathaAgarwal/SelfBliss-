import express from "express";
import pg from "pg";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import dotenv from 'dotenv'; // Import dotenv

dotenv.config(); // Load environment variables from .env

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY, // Use environment variable
  authDomain: "selfbliss-e4cad.firebaseapp.com",
  databaseURL: "https://selfbliss-e4cad-default-rtdb.firebaseio.com",
  projectId: "selfbliss-e4cad",
  storageBucket: "selfbliss-e4cad.firebasestorage.app",
  messagingSenderId: "997141981475",
  appId: "1:997141981475:web:ff4bef09c3f77c0cfa8496",
  measurementId: "G-M8V2MZ6ZRQ"
};

console.log("Firebase config:", firebaseConfig);

let app; // Declare app outside the try block

try {
  // Initialize Firebase
  const firebaseApp = initializeApp(firebaseConfig);
  console.log("Firebase app initialized:", firebaseApp);

  // Initialize Realtime Database
  const db = getDatabase(firebaseApp);
  console.log("Connected to Firebase Realtime Database:", db);

  // Example: Read data from the database
  const dbRef = ref(db, 'test');
  get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log("Data from Firebase:", snapshot.val());
      } else {
        console.log("No data available in Firebase at /test");
      }
    })
    .catch((error) => {
      console.error("Error fetching data from Firebase:", error);
    });

} catch (error) {
  console.error("Firebase initialization error:", error);
}
