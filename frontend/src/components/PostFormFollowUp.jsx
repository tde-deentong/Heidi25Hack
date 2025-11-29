import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, Loader, Mic, Square } from 'lucide-react';
import { voiceAssistantService } from '../services/voiceAssistantService';

const PostFormFollowUp = ({ formType, voiceHistory, formData, onComplete }) => {
  const [sessionState, setSessionState] = useState('active'); // 'active' or 'completed'
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [recordingState, setRecordingState] = useState('idle'); // idle, recording, processing
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        // Create contextual domain questions based on formType and prior conversation
        const domainQuestions = generateContextualQuestions(formType, voiceHistory, formData);
        
        const response = await voiceAssistantService.startSession('Patient', domainQuestions);
        setSessionId(response.session_id);
        setCurrentQuestion(response.first_question);
      } catch (err) {
        setError(`Failed to start follow-up session: ${err.message}`);
      }
    };
    initSession();
  }, [formType, voiceHistory, formData]);

  // Generate contextual follow-up questions based on form type and prior answers
  const generateContextualQuestions = (formType, voiceHistory, formData) => {
    const questions = [];

    if (formType === 'dentistry') {
      questions.push(
        'Have you had any previous dental treatments that you think might be related to this issue?',
        'Do you grind or clench your teeth, especially at night?',
        'Has this dental issue affected your ability to eat or sleep?',
        'Are there any activities or foods that make your symptoms better or worse?',
        'How would you rate your current oral hygiene routine?'
      );
    } else if (formType === 'cardiac') {
      questions.push(
        'Do you have a family history of heart disease or cardiac problems?',
        'Have you noticed any patterns to when these symptoms occur, such as time of day or activity level?',
        'How much regular exercise do you typically get per week?',
        "Are there any other symptoms you've experienced alongside the chest discomfort?",
        'Have you experienced stress or significant life changes recently?'
      );
    }

    return questions.slice(0, 5); // Limit to 5 questions max
  };

  // Start recording audio
  const handleStartRecording = async () => {
    setError(null);
    setRecordingState('recording');
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setRecordingState('processing');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        try {
          const transcriptionResult = await voiceAssistantService.transcribeAudio(audioBlob);
          setCurrentAnswer(transcriptionResult.transcription);
        } catch (err) {
          setError(`Transcription failed: ${err.message}`);
        } finally {
          setRecordingState('idle');
        }
      };

      mediaRecorder.start();
    } catch (err) {
      setError(`Microphone access failed: ${err.message}`);
      setRecordingState('idle');
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // Handle answer text change
  const handleAnswerChange = (e) => {
    setCurrentAnswer(e.target.value);
  };

  // Submit the answer
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await voiceAssistantService.submitAnswer(
        sessionId,
        currentQuestion,
        currentAnswer,
        null
      );

      setConversationHistory((prev) => [
        ...prev,
        { question: currentQuestion, answer: currentAnswer },
      ]);

      // If backend says done, complete immediately
      if (response.done) {
        setSessionState('completed');
        if (onComplete) {
          onComplete();
        }
        return;
      }

      // Otherwise, always ask at least 2 follow-up questions, or up to 5 max
      if (response.next_question && questionCount < 4) {
        setCurrentQuestion(response.next_question);
        setCurrentAnswer('');
        setQuestionCount(prev => prev + 1);
        await voiceAssistantService.speakText(response.next_question);
      } else if (questionCount >= 1) {
        // After at least 2 questions, allow completion
        setSessionState('completed');
        if (onComplete) {
          onComplete();
        }
      } else {
        // If less than 2 questions, force at least one more
        setCurrentQuestion(response.next_question);
        setCurrentAnswer('');
        setQuestionCount(prev => prev + 1);
        await voiceAssistantService.speakText(response.next_question);
      }
    } catch (err) {
      setError(`Failed to submit answer: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Replay the current question
  const handleReplayQuestion = async () => {
    if (currentQuestion) {
      try {
        await voiceAssistantService.speakText(currentQuestion);
      } catch (err) {
        setError(`Failed to play audio: ${err.message}`);
      }
    }
  };

  // Skip follow-up and complete
  const handleSkip = () => {
    if (onComplete) {
      onComplete();
    }
  };

  if (sessionState === 'completed') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-[#2A1B1B] mb-2">Additional Details Complete!</h3>
        <p className="text-[#2A1B1B]/70 mb-2">
          Thank you for providing these additional details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[#2A1B1B] mb-3">Additional Questions</h2>
          <p className="text-sm text-[#2A1B1B]/70 mb-4">
            Please answer any additional questions to provide more context for your appointment.
          </p>
        </div>

        {/* Current Question */}
        <div>
          <label className="block text-sm font-medium text-[#2A1B1B] mb-3">
            Question:
          </label>
          <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-4">
            <div className="flex-1">
              <p className="text-lg font-medium text-[#2A1B1B]">{currentQuestion}</p>
            </div>
            <button
              onClick={handleReplayQuestion}
              disabled={isLoading}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
              title="Replay question"
            >
              <Volume2 className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Answer Input */}
        <div>
          <label className="block text-sm font-medium text-[#2A1B1B] mb-3">
            Your Answer:
          </label>
          <textarea
            value={currentAnswer}
            onChange={handleAnswerChange}
            rows={4}
            disabled={recordingState === 'recording' || recordingState === 'processing'}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A1B1B] disabled:bg-gray-50"
            placeholder="Your transcribed answer will appear here, or you can type directly..."
          />
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col gap-4 items-center">
          {recordingState === 'idle' ? (
            <button
              onClick={handleStartRecording}
              disabled={isLoading || currentAnswer.trim().length > 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Mic className="w-4 h-4" />
              Start Recording
            </button>
          ) : (
            <>
              <button
                onClick={handleStopRecording}
                disabled={recordingState !== 'recording'}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                {recordingState === 'recording' ? (
                  <Mic className="w-4 h-4 animate-pulse" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {recordingState === 'recording' ? 'Recording...' : 'Stop Recording'}
              </button>
              {recordingState === 'processing' && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Transcribing...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Submit Button - No Skip */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSubmitAnswer}
            disabled={
              !currentAnswer.trim() ||
              isLoading ||
              recordingState === 'recording' ||
              recordingState === 'processing' ||
              questionCount >= 5
            }
            className="flex items-center gap-2 px-6 py-3 bg-[#2A1B1B] text-white rounded-lg font-medium hover:bg-[#1A0F0F] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : questionCount >= 5 ? (
              <>
                <Send className="w-4 h-4" />
                Complete Follow-up
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Answer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostFormFollowUp;
