
import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDsK2_4vH4k9wZaGgz1rg5ULjvTJpWfRYM",
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
    return { success: false, error: error.message };
  }
};

export { auth };
