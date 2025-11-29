import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Volume2, Loader } from 'lucide-react';
import { voiceAssistantService } from '../services/voiceAssistantService';

const VoiceAssistant = ({ onSessionComplete, domainQuestions = null }) => {
  const [sessionState, setSessionState] = useState('idle'); // idle, active, completed
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [recordingState, setRecordingState] = useState('idle'); // idle, recording, processing
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Start a new session
  const handleStartSession = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await voiceAssistantService.startSession('Patient', domainQuestions);
      setSessionId(response.session_id);
      setCurrentQuestion(response.first_question);
      setSessionState('active');

      // Automatically speak the first question
      await voiceAssistantService.speakText(response.first_question);
    } catch (err) {
      setError(`Failed to start session: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
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
          // Transcribe the audio
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

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
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
        domainQuestions
      );

      // Add to conversation history
      setConversationHistory((prev) => [
        ...prev,
        { question: currentQuestion, answer: currentAnswer },
      ]);

      if (response.next_question) {
        setCurrentQuestion(response.next_question);
        setCurrentAnswer('');

        // Automatically speak the next question
        await voiceAssistantService.speakText(response.next_question);
      } else if (response.done) {
        setSessionState('completed');

        // Call the callback to notify parent component
        if (onSessionComplete) {
          onSessionComplete(sessionId, conversationHistory, response.form_type || null);
        }
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

  // Edit the transcribed answer
  const handleAnswerChange = (e) => {
    setCurrentAnswer(e.target.value);
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
        <h3 className="text-2xl font-semibold text-[#2A1B1B] mb-2">Voice Pre-screening Complete!</h3>
        <p className="text-[#2A1B1B]/70 mb-4">
          Your responses have been recorded and will be reviewed by your clinician.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-[#2A1B1B] mb-2">
            Questions answered: {conversationHistory.length}
          </p>
          <div className="text-xs text-[#2A1B1B]/60 max-h-32 overflow-y-auto">
            {conversationHistory.map((item, index) => (
              <div key={index} className="mb-2 text-left">
                <p className="font-medium">Q: {item.question}</p>
                <p className="text-[#2A1B1B]/50">A: {item.answer}</p>
              </div>
            ))}
          </div>
        </div>
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

      {sessionState === 'idle' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-semibold text-[#2A1B1B] mb-2">
            Voice Pre-screening Assistant
          </h3>
          <p className="text-[#2A1B1B]/70 mb-6 max-w-md mx-auto">
            Answer pre-screening questions using your voice. The system will transcribe your
            responses and provide follow-up questions based on your answers.
          </p>
          <button
            onClick={handleStartSession}
            disabled={isLoading}
            className="px-6 py-3 bg-[#2A1B1B] text-white rounded-lg font-medium hover:bg-[#1A0F0F] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start Voice Pre-screening
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
          {/* Current Question */}
          <div>
            <label className="block text-sm font-medium text-[#2A1B1B] mb-3">
              Current Question:
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

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSubmitAnswer}
              disabled={
                !currentAnswer.trim() ||
                isLoading ||
                recordingState === 'recording' ||
                recordingState === 'processing'
              }
              className="flex items-center gap-2 px-6 py-3 bg-[#2A1B1B] text-white rounded-lg font-medium hover:bg-[#1A0F0F] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Answer
                </>
              )}
            </button>
          </div>

          {/* Conversation History */}
          {conversationHistory.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-[#2A1B1B] mb-3">
                Conversation History ({conversationHistory.length} answered)
              </p>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {conversationHistory.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-[#2A1B1B] mb-1">
                      Q{index + 1}: {item.question}
                    </p>
                    <p className="text-xs text-[#2A1B1B]/70">A: {item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
