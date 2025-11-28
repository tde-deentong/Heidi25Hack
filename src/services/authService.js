// Authentication service using Firebase Authentication
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../main';

export const authService = {
  // Sign up a new user
  signUp: async (email, password, name) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with name
      await updateProfile(user, {
        displayName: name
      });

      // Create user document in Firestore (skip if Firestore fails)
      try {
        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          createdAt: serverTimestamp()
        });
      } catch (firestoreError) {
        console.warn('Failed to create user document in Firestore:', firestoreError);
        // Continue anyway - the auth user is created successfully
      }

      return {
        id: user.uid,
        email: user.email,
        name: name
      };
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      }
      throw new Error(error.message);
    }
  },

  // Login existing user
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore (use displayName if Firestore fails)
      let userName = user.displayName || '';
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        if (userData?.name) {
          userName = userData.name;
        }
      } catch (firestoreError) {
        console.warn('Failed to fetch user document from Firestore:', firestoreError);
        // Continue with displayName from auth
      }

      return {
        id: user.uid,
        email: user.email,
        name: userName
      };
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password');
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password');
      }
      throw new Error(error.message);
    }
  },

  // Logout current user
  logout: async () => {
    await signOut(auth);
  },

  // Get current logged-in user
  getCurrentUser: () => {
    const user = auth.currentUser;
    if (!user) return null;

    return {
      id: user.uid,
      email: user.email,
      name: user.displayName || ''
    };
  },

  // Get questionnaires for a user
  getUserQuestionnaires: async (userId) => {
    try {
      const q = query(
        collection(db, 'questionnaires'),
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const questionnaires = [];

      querySnapshot.forEach((doc) => {
        questionnaires.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return questionnaires;
    } catch (error) {
      console.error('Error fetching questionnaires:', error);
      return [];
    }
  },

  // Save a questionnaire submission
  saveQuestionnaire: async (userId, questionnaireData) => {
    try {
      const docRef = await addDoc(collection(db, 'questionnaires'), {
        userId,
        ...questionnaireData,
        submittedAt: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...questionnaireData,
        submittedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      throw new Error('Failed to save questionnaire');
    }
  }
};

