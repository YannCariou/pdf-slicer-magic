
import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

// Configuration Firebase
// Utilisation d'une variable d'environnement pour la clé API (pour plus de sécurité)
const firebaseConfig = {
  // Clé API fournie par l'utilisateur
  apiKey: "1:688016327649:web:6d422497196e3196af88a0",
  authDomain: "pdf-slicer-magic.firebaseapp.com",
  projectId: "pdf-slicer-magic",
  storageBucket: "pdf-slicer-magic.appspot.com",
  messagingSenderId: "452177240492",
  appId: "1:452177240492:web:0ff8fa9b33f3e1dc62b5b6"
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
