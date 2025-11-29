// Voice Assistant Service - handles communication with backend voice assistant API
// Backend runs on http://localhost:8000 during development

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const voiceAssistantService = {
  /**
   * Start a new session with the voice assistant
   * @param {string} patientName - Name of the patient
   * @param {Array<string>} domainQuestions - Optional list of domain-specific questions
   * @returns {Promise<{session_id: string, first_question: string}>}
   */
  startSession: async (patientName, domainQuestions = null) => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/start_session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: patientName,
          domain_questions: domainQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Start session failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  },

  /**
   * Submit an answer (text or audio) and get the next question
   * @param {string} sessionId - Session ID from startSession
   * @param {string} question - Current question being answered
   * @param {string} answer - Text answer or transcribed answer
   * @param {Array<string>} domainQuestions - Optional domain questions (for context)
   * @returns {Promise<{next_question: string|null, done: boolean, user_answer: string}>}
   */
  submitAnswer: async (sessionId, question, answer, domainQuestions = null) => {
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('question', question);
      formData.append('text', answer);
      
      if (domainQuestions) {
        formData.append('domain_questions', JSON.stringify(domainQuestions));
      }

      const response = await fetch(`${BACKEND_BASE_URL}/answer`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Submit answer failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  },

  /**
   * Transcribe an audio blob using the backend
   * @param {Blob} audioBlob - Audio blob to transcribe
   * @returns {Promise<{transcription: string}>}
   */
  transcribeAudio: async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'answer.webm');

      const response = await fetch(`${BACKEND_BASE_URL}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  },

  /**
   * Get text-to-speech audio from the backend
   * @param {string} text - Text to convert to speech
   * @returns {Promise<Blob>} - Audio blob
   */
  getTextToSpeech: async (text) => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/tts?text=${encodeURIComponent(text)}`
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error getting TTS audio:', error);
      throw error;
    }
  },

  /**
   * Retrieve a completed session's Q&A pairs
   * @param {string} sessionId - Session ID
   * @returns {Promise<{session_id: string, patient_name: string, qas: Array}>}
   */
  getSession: async (sessionId) => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/sessions/${sessionId}`);

      if (!response.ok) {
        throw new Error(`Get session failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  },

  /**
   * Submit a follow-up answer (text or audio) for Additional Details section
   * @param {string} sessionId - Session ID
   * @param {string} question - Current question being answered
   * @param {string} answer - Text answer or transcribed answer
   * @param {object} formData - The written form data (object)
   * @param {number} maxQuestions - Maximum number of follow-up questions (default 5)
   * @returns {Promise<{next_question: string|null, done: boolean, user_answer: string}>}
   */
  submitFollowupAnswer: async (sessionId, question, answer, formDataObj = {}, maxQuestions = 5) => {
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('question', question);
      formData.append('text', answer);
      formData.append('form_data', JSON.stringify(formDataObj));
      formData.append('max_questions', maxQuestions);

      const response = await fetch(`${BACKEND_BASE_URL}/followup_answer`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Submit followup answer failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting followup answer:', error);
      throw error;
    }
  },

  /**
   * Utility: Speak text using either browser's SpeechSynthesis or TTS endpoint
   * @param {string} text - Text to speak
   */
  speakText: async (text) => {
    if (!text) return;

    // Helper to actually speak with preferred voice
    const speakWithPreferredVoice = (utterance, synth) => {
      const voices = synth.getVoices();
      const preferredVoice = voices.find(v =>
        v.lang.startsWith('en') && v.gender === 'female'
      ) || voices.find(v =>
        v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
      ) || voices.find(v =>
        v.lang.startsWith('en') && v.name.toLowerCase().includes('natural')
      ) || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('woman'))
        || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('girl'))
        || voices.find(v => v.lang.startsWith('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      synth.cancel();
      synth.speak(utterance);
    };

    // Wait for voices to be loaded if needed
    const waitForVoices = () => {
      return new Promise(resolve => {
        const synth = window.speechSynthesis;
        let voices = synth.getVoices();
        if (voices && voices.length > 0) {
          resolve();
        } else {
          const voicesChanged = () => {
            voices = synth.getVoices();
            if (voices && voices.length > 0) {
              synth.removeEventListener('voiceschanged', voicesChanged);
              resolve();
            }
          };
          synth.addEventListener('voiceschanged', voicesChanged);
          // Also trigger loading
          synth.getVoices();
        }
      });
    };

    // Try browser's SpeechSynthesis first
    try {
      const synth = window.speechSynthesis;
      if (synth) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        await waitForVoices();
        speakWithPreferredVoice(utterance, synth);
        return;
      }
    } catch (error) {
      console.warn('SpeechSynthesis not available:', error);
    }

    // Fallback to backend TTS
    try {
      const audioBlob = await voiceAssistantService.getTextToSpeech(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error playing TTS audio:', error);
    }
  },
};
