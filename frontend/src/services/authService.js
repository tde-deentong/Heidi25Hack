// Authentication service using localStorage for persistence
// In production, this would make API calls to a backend

const STORAGE_KEY = 'heidi_patients_auth';
const USERS_KEY = 'heidi_patients_users';
const QUESTIONNAIRES_KEY = 'heidi_patients_questionnaires';

export const authService = {
  // Sign up a new user
  signUp: async (email, password, name, phoneNumber, dateOfBirth) => {
    // Get existing users
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      throw new Error('An account with this email already exists');
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      phoneNumber,
      dateOfBirth,
      createdAt: new Date().toISOString()
    };

    // Store password (in production, this would be hashed on the backend)
    // For demo purposes, we'll store it (not secure, but works for demo)
    const userWithPassword = {
      ...newUser,
      password // In production, never store passwords in localStorage
    };

    users.push(userWithPassword);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Initialize empty questionnaire history for this user
    const questionnaires = JSON.parse(localStorage.getItem(QUESTIONNAIRES_KEY) || '{}');
    questionnaires[newUser.id] = [];
    localStorage.setItem(QUESTIONNAIRES_KEY, JSON.stringify(questionnaires));

    // Auto-login the new user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

    return newUser;
  },

  // Login existing user
  login: async (email, password) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Remove password before storing in session
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));

    return userWithoutPassword;
  },

  // Logout current user
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Get current logged-in user
  getCurrentUser: () => {
    const userStr = localStorage.getItem(STORAGE_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Get questionnaires for a user
  getUserQuestionnaires: (userId) => {
    const questionnaires = JSON.parse(localStorage.getItem(QUESTIONNAIRES_KEY) || '{}');
    return questionnaires[userId] || [];
  },

  // Save a questionnaire submission
  saveQuestionnaire: (userId, questionnaireData) => {
    const questionnaires = JSON.parse(localStorage.getItem(QUESTIONNAIRES_KEY) || '{}');
    if (!questionnaires[userId]) {
      questionnaires[userId] = [];
    }
    
    const submission = {
      id: Date.now().toString(),
      ...questionnaireData,
      submittedAt: new Date().toISOString()
    };
    
    questionnaires[userId].push(submission);
    localStorage.setItem(QUESTIONNAIRES_KEY, JSON.stringify(questionnaires));
    
    return submission;
  }
};

