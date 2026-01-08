import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project configuration
// You can get this from the Firebase Console -> Project Settings -> General -> Your Apps
const firebaseConfig = {
  apiKey: "AIzaSyAauIoovLC1ukfYrLFsVZdmqNE2LqwkIyk",
  authDomain: "pro-scout-app.firebaseapp.com",
  projectId: "pro-scout-app",
  storageBucket: "pro-scout-app.firebasestorage.app",
  messagingSenderId: "153677252844",
  appId: "1:153677252844:web:c023b67eab947499ba7dc9",
  measurementId: "G-VLX6Z1BSL0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);