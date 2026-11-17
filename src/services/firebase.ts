import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyC4-R3HtdJKAEYVz9X4n5j-ponRRay58Lo",
  authDomain: "barbearia-app-1e98e.firebaseapp.com",
  projectId: "barbearia-app-1e98e",
  storageBucket: "barbearia-app-1e98e.firebasestorage.app",
  messagingSenderId: "868926332565",
  appId: "1:868926332565:web:bd277c48a21b6a2ddc459c",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: ReturnType<typeof getAuth>;

if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  const { getReactNativePersistence } = require("firebase/auth");
  const AsyncStorage =
    require("@react-native-async-storage/async-storage").default;
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    auth = getAuth(app);
  }
}

const db = getFirestore(app);

export { auth, db };