
import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBlSgcQwPlzEOtH8CoDXUFXI-f1_OwJaEE",
  authDomain: "pdf-slicer-magic.firebaseapp.com",
  projectId: "pdf-slicer-magic",
  storageBucket: "pdf-slicer-magic.appspot.com",
  messagingSenderId: "688016327649",
  appId: "1:688016327649:web:6d422497196e3196af88a0",
  measurementId: "G-72XGWD1P95"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Fonction pour réinitialiser le mot de passe
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    console.error("Erreur de réinitialisation du mot de passe:", error);
    return { success: false, error: error.message };
  }
};

export { auth };
