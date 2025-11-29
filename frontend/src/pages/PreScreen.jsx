import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ChevronRight, CheckCircle2, Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import VoiceAssistant from '../components/VoiceAssistant';
import CardiacForm from '../components/CardiacForm';
import PostFormFollowUp from '../components/PostFormFollowUp';

const PreScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState('dental'); // 'dental' or 'medical'
  const [mode, setMode] = useState('voice'); // 'voice', 'form', or 'followup'
  const [selectedFormType, setSelectedFormType] = useState(null); // 'dentistry' | 'cardiac' | null
  const [voiceHistory, setVoiceHistory] = useState([]); // Store voice conversation history
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    // Dental History
    hasPain: '',
    painfulTeeth: '',
    symptomDate: '',
    symptomFrequency: '',
    episodesFrequency: '', // more, same, less
    episodesSeverity: '', // more, same, less
    symptomTriggers: '',
    temperatureSensitivity: '', // hot, cold, both
    painDuration: '', // secs, mins, hours
    sharpPain: '',
    dullPain: '',
    somethingElse: '',
    spontaneousPain: '',
    throbbingPain: '',
    bitingPain: '',
    bitingPainTeeth: '',
    bitingPainStops: '',
    headShakingPain: '', // yes or no
    recentTreatment: '',
    recentTreatmentDetails: '',
    grindingClenching: '', // yes, maybe, no
    trauma: '',
    
    // Medical History
    generallyFit: '',
    seenDoctor: '',
    seenDoctorReason: '',
    takingMedication: '',
    medicationDetails: '',
    pregnant: '',
    highBloodPressure: '',
    anaemia: '',
    rheumaticFever: '',
    asthma: '',
    diabetes: '',
    epilepsy: '',
    hepatitis: '',
    hiv: '',
    drugAllergies: '',
    brainConditions: '',
    heartConditions: '',
    lungConditions: '',
    stomachConditions: '',
    bladderConditions: '',
    arthritis: '',
    otherConditions: '',
    otherConditionsDetails: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVoiceSessionComplete = async (sessionId, conversationHistory, formType = null) => {
    try {
      // Store voice history for follow-up questions
      setVoiceHistory(conversationHistory);

      // Persist voice session summary as questionnaire record
      if (user) {
        const questionnaireData = {
          type: formType === 'cardiac' ? 'cardiac-voice' : 'dental-voice',
          clinic: formType === 'cardiac' ? 'Cardiology Clinic' : 'Dental Clinic',
          appointmentDate: new Date().toISOString().split('T')[0],
          appointmentTime: 'TBD',
          voiceSessionId: sessionId,
          conversationHistory: conversationHistory,
          form_type: formType,
          submittedAt: new Date().toISOString()
        };
        
        authService.saveQuestionnaire(user.id, questionnaireData);
      }

      // If the LLM provided a form type, show the corresponding written form to the user
      if (formType) {
        setSelectedFormType(formType);
        setMode('form');
        // If dentistry, set dental tab; if cardiac, ensure we show cardiac form
        if (formType === 'dentistry') {
          setCurrentSection('dental');
        }
      } else {
        // Fallback: mark submitted as before
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Error completing voice session:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save questionnaire data
      if (user) {
        const questionnaireData = {
          type: 'dental',
          clinic: 'Dental Clinic',
          appointmentDate: new Date().toISOString().split('T')[0],
          appointmentTime: 'TBD',
          ...formData,
          submittedAt: new Date().toISOString()
        };
        
        authService.saveQuestionnaire(user.id, questionnaireData);
      }
      
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Auto-navigate to follow-up tab after form submission
      setMode('followup');
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowUpComplete = () => {
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FCFCFA]">
        <nav className="sticky top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-8 lg:gap-12">
              <Link to="/" className="flex items-center gap-2 text-2xl font-serif tracking-tight text-[#2A1B1B]">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#2A1B1B]">
                    <path d="M3.5 12C3.5 6.5 10 6.5 12 11.5C14 6.5 20.5 6.5 20.5 12C20.5 17.5 14 17.5 12 12.5C10 17.5 3.5 17.5 3.5 12Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 3.5C6.5 3.5 6.5 10 11.5 12C6.5 14 6.5 20.5 12 20.5C17.5 20.5 17.5 14 12.5 12C17.5 10 17.5 3.5 12 3.5Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-bold">Heidi</span> for patients
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-[#2A1B1B] mb-2">Thank you!</h2>
            <p className="text-[#2A1B1B]/70 mb-6">
              Your questionnaire has been submitted successfully. Your clinician will review this information before your appointment.
            </p>
            <Link
              to="/"
              className="inline-block bg-[#2A1B1B] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1A0F0F] transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFA]">
      {/* Navigation Bar */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-8 lg:gap-12">
            <Link to="/" className="flex items-center gap-2 text-2xl font-serif tracking-tight text-[#2A1B1B]">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#2A1B1B]">
                  <path d="M3.5 12C3.5 6.5 10 6.5 12 11.5C14 6.5 20.5 6.5 20.5 12C20.5 17.5 14 17.5 12 12.5C10 17.5 3.5 17.5 3.5 12Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 3.5C6.5 3.5 6.5 10 11.5 12C6.5 14 6.5 20.5 12 20.5C17.5 20.5 17.5 14 12.5 12C17.5 10 17.5 3.5 12 3.5Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-bold">Heidi</span> for patients
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link 
          to="/pre-consult-prep" 
          className="inline-flex items-center gap-2 text-[#2A1B1B]/70 hover:text-[#2A1B1B] mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#2A1B1B] mb-2 tracking-[-0.02em]">
            Pre-Screen Questionnaire
          </h1>
          <p className="text-[#2A1B1B]/70 mb-6 text-sm">
            Please complete the following questions to help us prepare for your visit.
          </p>

          {/* Mode Selection */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => {
                if (!selectedFormType) setMode('voice');
              }}
              disabled={selectedFormType}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                mode === 'voice'
                  ? 'bg-[#2A1B1B] text-white shadow-md'
                  : 'bg-gray-100 text-[#2A1B1B] hover:bg-gray-200'
              } ${selectedFormType ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Mic className="inline mr-2" size={18} />
              Determine Visit Purpose
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedFormType && mode !== 'followup') setMode('form');
              }}
              disabled={!selectedFormType || mode === 'followup'}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                mode === 'form'
                  ? 'bg-[#2A1B1B] text-white shadow-md'
                  : 'bg-gray-100 text-[#2A1B1B] hover:bg-gray-200'
              } ${!selectedFormType || mode === 'followup' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FileText className="inline mr-2" size={18} />
              Written Form
            </button>
            <button
              type="button"
              onClick={() => {
                if (mode === 'followup') setMode('followup');
              }}
              disabled={mode !== 'followup'}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                mode === 'followup'
                  ? 'bg-[#2A1B1B] text-white shadow-md'
                  : 'bg-gray-100 text-[#2A1B1B] hover:bg-gray-200'
              } ${mode !== 'followup' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Mic className="inline mr-2" size={18} />
              Additional Details
            </button>
          </div>
          {!selectedFormType && (
            <p className="text-sm text-[#2A1B1B]/60 mt-2">
              Complete the Voice Assistant session first — the written form will be shown
              automatically once the assistant finishes and determines the correct form.
            </p>
          )}

          {/* Voice Mode */}
          {mode === 'voice' ? (
            <VoiceAssistant 
              onSessionComplete={handleVoiceSessionComplete}
              domainQuestions={[
                "What is the main reason for your visit today?",
                "How long have you had these symptoms?",
                "Are you currently taking any medications?",
                "Do you have any allergies to medication?"
              ]}
            />
          ) : mode === 'followup' ? (
            <PostFormFollowUp formType={selectedFormType} voiceHistory={voiceHistory} formData={formData} onComplete={handleFollowUpComplete} />
          ) : (
            <>
              {selectedFormType === 'cardiac' ? (
                <CardiacForm onSubmitted={() => setMode('followup')} />
              ) : (
                <>
                  {/* Section Tabs */}
                  <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setCurrentSection('dental')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                currentSection === 'dental'
                  ? 'text-[#2A1B1B] border-b-2 border-[#2A1B1B]'
                  : 'text-[#2A1B1B]/60 hover:text-[#2A1B1B]'
              }`}
            >
              Dental History
            </button>
            <button
              type="button"
              onClick={() => setCurrentSection('medical')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                currentSection === 'medical'
                  ? 'text-[#2A1B1B] border-b-2 border-[#2A1B1B]'
                  : 'text-[#2A1B1B]/60 hover:text-[#2A1B1B]'
              }`}
            >
              Medical History
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentSection === 'dental' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[#2A1B1B] mb-4">Dental History</h2>
                
                {/* Pain Questions */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                      Have you had any pain or discomfort with your teeth?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="hasPain" value="yes" checked={formData.hasPain === 'yes'} onChange={handleChange} className="mr-2" />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="hasPain" value="no" checked={formData.hasPain === 'no'} onChange={handleChange} className="mr-2" />
                        No
                      </label>
                    </div>
                  </div>

                  {/* All pain-related questions - always visible */}
                  <div>
                      <div>
                        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                          Can you identify which teeth were painful? Which teeth:
                        </label>
                        <input
                          type="text"
                          name="painfulTeeth"
                          value={formData.painfulTeeth}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A1B1B]"
                          placeholder="e.g., Upper left molar, Lower front teeth"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                          When did this symptom first occur? Date:
                        </label>
                        <input
                          type="date"
                          name="symptomDate"
                          value={formData.symptomDate}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A1B1B]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                          How often does the symptom happen, and how long is each episode?
                        </label>
                        <textarea
                          name="symptomFrequency"
                          value={formData.symptomFrequency}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A1B1B]"
                          placeholder="Describe frequency and duration"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                          Are the episodes getting more, the same or less common?
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input type="radio" name="episodesFrequency" value="more" checked={formData.episodesFrequency === 'more'} onChange={handleChange} className="mr-2" />
                            More
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="episodesFrequency" value="same" checked={formData.episodesFrequency === 'same'} onChange={handleChange} className="mr-2" />
                            Same
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="episodesFrequency" value="less" checked={formData.episodesFrequency === 'less'} onChange={handleChange} className="mr-2" />
                            Less
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                          Are the episodes getting more, the same or less severe?
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input type="radio" name="episodesSeverity" value="more" checked={formData.episodesSeverity === 'more'} onChange={handleChange} className="mr-2" />
                            More
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="episodesSeverity" value="same" checked={formData.episodesSeverity === 'same'} onChange={handleChange} className="mr-2" />
                            Same
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="episodesSeverity" value="less" checked={formData.episodesSeverity === 'less'} onChange={handleChange} className="mr-2" />
                            Less
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                          Is there anything which makes the symptom come, or go?
                        </label>
                        <textarea
                          name="symptomTriggers"
                          value={formData.symptomTriggers}
                          onChange={handleChange}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A1B1B]"
                          placeholder="Describe what triggers or relieves the symptom"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                          Do cold or hot food and drink bring on the symptom? Just cold or just hot or both?
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input type="radio" name="temperatureSensitivity" value="hot" checked={formData.temperatureSensitivity === 'hot'} onChange={handleChange} className="mr-2" />
                            Hot
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="temperatureSensitivity" value="cold" checked={formData.temperatureSensitivity === 'cold'} onChange={handleChange} className="mr-2" />
                            Cold
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="temperatureSensitivity" value="both" checked={formData.temperatureSensitivity === 'both'} onChange={handleChange} className="mr-2" />
                            Both
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="temperatureSensitivity" value="neither" checked={formData.temperatureSensitivity === 'neither'} onChange={handleChange} className="mr-2" />
                            Neither
                          </label>
                        </div>
                      </div>

                      {formData.temperatureSensitivity && formData.temperatureSensitivity !== 'neither' && (
                        <div>
                          <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                            How long does the pain last for after the stimulus? Few secs, minutes or hours?
                          </label>
                          <div className="flex gap-4">
                            <label className="flex items-center">
                              <input type="radio" name="painDuration" value="secs" checked={formData.painDuration === 'secs'} onChange={handleChange} className="mr-2" />
                              Seconds
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name="painDuration" value="mins" checked={formData.painDuration === 'mins'} onChange={handleChange} className="mr-2" />
                              Minutes
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name="painDuration" value="hours" checked={formData.painDuration === 'hours'} onChange={handleChange} className="mr-2" />
                              Hours
                            </label>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                          Is the pain sharp and short, just in one tooth?
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input type="radio" name="sharpPain" value="yes" checked={formData.sharpPain === 'yes'} onChange={handleChange} className="mr-2" />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="sharpPain" value="no" checked={formData.sharpPain === 'no'} onChange={handleChange} className="mr-2" />
                            No
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                          Or is it a duller, longer lasting, more generalized pain in the region?
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input type="radio" name="dullPain" value="yes" checked={formData.dullPain === 'yes'} onChange={handleChange} className="mr-2" />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="dullPain" value="no" checked={formData.dullPain === 'no'} onChange={handleChange} className="mr-2" />
                            No
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="dullPain" value="something-else" checked={formData.dullPain === 'something-else'} onChange={handleChange} className="mr-2" />
                            Something else
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                          Does the pain ever occur spontaneously without stimulus?
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input type="radio" name="spontaneousPain" value="yes" checked={formData.spontaneousPain === 'yes'} onChange={handleChange} className="mr-2" />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="spontaneousPain" value="no" checked={formData.spontaneousPain === 'no'} onChange={handleChange} className="mr-2" />
                            No
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                          Does the pain ever throb?
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input type="radio" name="throbbingPain" value="yes" checked={formData.throbbingPain === 'yes'} onChange={handleChange} className="mr-2" />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="throbbingPain" value="no" checked={formData.throbbingPain === 'no'} onChange={handleChange} className="mr-2" />
                            No
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                          Do any of your teeth hurt on biting? Which?
                        </label>
                        <div className="flex gap-4 mb-2">
                          <label className="flex items-center">
                            <input type="radio" name="bitingPain" value="yes" checked={formData.bitingPain === 'yes'} onChange={handleChange} className="mr-2" />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="bitingPain" value="no" checked={formData.bitingPain === 'no'} onChange={handleChange} className="mr-2" />
                            No
                          </label>
                        </div>
                        {formData.bitingPain === 'yes' && (
                          <>
                            <input
                              type="text"
                              name="bitingPainTeeth"
                              value={formData.bitingPainTeeth}
                              onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A1B1B] mt-2"
                              placeholder="Which teeth?"
                            />
                            <div className="mt-2">
                              <label className="block text-sm font-medium text-[#2A1B1B] mb-2 mt-2">
                                If biting causes pain, does the pain stop when you stop biting?
                              </label>
                              <div className="flex gap-4">
                                <label className="flex items-center">
                                  <input type="radio" name="bitingPainStops" value="yes" checked={formData.bitingPainStops === 'yes'} onChange={handleChange} className="mr-2" />
                                  Yes
                                </label>
                                <label className="flex items-center">
                                  <input type="radio" name="bitingPainStops" value="no" checked={formData.bitingPainStops === 'no'} onChange={handleChange} className="mr-2" />
                                  No
                                </label>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                          Does shaking your head cause any pain?
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input type="radio" name="headShakingPain" value="yes" checked={formData.headShakingPain === 'yes'} onChange={handleChange} className="mr-2" />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="headShakingPain" value="no" checked={formData.headShakingPain === 'no'} onChange={handleChange} className="mr-2" />
                            No
                          </label>
                        </div>
                      </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                      Have you had any recent dental treatment, particularly to teeth which are symptomatic? What:
                    </label>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center">
                        <input type="radio" name="recentTreatment" value="yes" checked={formData.recentTreatment === 'yes'} onChange={handleChange} className="mr-2" />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="recentTreatment" value="no" checked={formData.recentTreatment === 'no'} onChange={handleChange} className="mr-2" />
                        No
                      </label>
                    </div>
                    {formData.recentTreatment === 'yes' && (
                      <textarea
                        name="recentTreatmentDetails"
                        value={formData.recentTreatmentDetails}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A1B1B] mt-2"
                        placeholder="Describe recent treatment"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                      Are you aware that you grind or clench your teeth, perhaps at night?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="grindingClenching" value="yes" checked={formData.grindingClenching === 'yes'} onChange={handleChange} className="mr-2" />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="grindingClenching" value="maybe" checked={formData.grindingClenching === 'maybe'} onChange={handleChange} className="mr-2" />
                        Maybe
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="grindingClenching" value="no" checked={formData.grindingClenching === 'no'} onChange={handleChange} className="mr-2" />
                        No
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                      Have you had any trauma to your teeth, say in sports accidents? (Even years ago)
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="trauma" value="yes" checked={formData.trauma === 'yes'} onChange={handleChange} className="mr-2" />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="trauma" value="no" checked={formData.trauma === 'no'} onChange={handleChange} className="mr-2" />
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentSection === 'medical' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[#2A1B1B] mb-4">Medical History</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                      Are you generally fit and well?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="generallyFit" value="yes" checked={formData.generallyFit === 'yes'} onChange={handleChange} className="mr-2" />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="generallyFit" value="no" checked={formData.generallyFit === 'no'} onChange={handleChange} className="mr-2" />
                        No
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                      Have you seen your general medical doctor or medical specialist in the last 2 years?
                    </label>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center">
                        <input type="radio" name="seenDoctor" value="yes" checked={formData.seenDoctor === 'yes'} onChange={handleChange} className="mr-2" />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="seenDoctor" value="no" checked={formData.seenDoctor === 'no'} onChange={handleChange} className="mr-2" />
                        No
                      </label>
                    </div>
                    {formData.seenDoctor === 'yes' && (
                      <input
                        type="text"
                        name="seenDoctorReason"
                        value={formData.seenDoctorReason}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A1B1B] mt-2"
                        placeholder="If yes, why:"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                      Do you take any medication at present?
                    </label>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center">
                        <input type="radio" name="takingMedication" value="yes" checked={formData.takingMedication === 'yes'} onChange={handleChange} className="mr-2" />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="takingMedication" value="no" checked={formData.takingMedication === 'no'} onChange={handleChange} className="mr-2" />
                        No
                      </label>
                    </div>
                    {formData.takingMedication === 'yes' && (
                      <textarea
                        name="medicationDetails"
                        value={formData.medicationDetails}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A1B1B] mt-2"
                        placeholder="If yes, what: (Include dose/mg. Remember any antibiotics your dentist or doctor may have given you)"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                      Ladies, are you pregnant?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="pregnant" value="yes" checked={formData.pregnant === 'yes'} onChange={handleChange} className="mr-2" />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="pregnant" value="no" checked={formData.pregnant === 'no'} onChange={handleChange} className="mr-2" />
                        No
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="pregnant" value="n/a" checked={formData.pregnant === 'n/a'} onChange={handleChange} className="mr-2" />
                        N/A
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-[#2A1B1B] mb-4">Do you have or have had any of the following?</p>
                    
                    {[
                      { name: 'highBloodPressure', label: 'High blood pressure' },
                      { name: 'anaemia', label: 'Anaemia or any bleeding problem' },
                      { name: 'rheumaticFever', label: 'Rheumatic fever (this is not rheumatoid arthritis)' },
                      { name: 'asthma', label: 'Asthma' },
                      { name: 'diabetes', label: 'Diabetes' },
                      { name: 'epilepsy', label: 'Epilepsy' },
                      { name: 'hepatitis', label: 'Hepatitis or Jaundice' },
                      { name: 'hiv', label: 'HIV or AIDS' },
                      { name: 'drugAllergies', label: 'Allergies to any drug (e.g. Penicillin)' }
                    ].map(condition => (
                      <div key={condition.name} className="mb-3">
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-[#2A1B1B]">{condition.label}</span>
                          <div className="flex gap-4">
                            <label className="flex items-center">
                              <input type="radio" name={condition.name} value="yes" checked={formData[condition.name] === 'yes'} onChange={handleChange} className="mr-2" />
                              <span className="text-sm">Yes</span>
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name={condition.name} value="no" checked={formData[condition.name] === 'no'} onChange={handleChange} className="mr-2" />
                              <span className="text-sm">No</span>
                            </label>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-[#2A1B1B] mb-4">Do you have any conditions of the following?</p>
                    
                    {[
                      { name: 'brainConditions', label: 'Brain' },
                      { name: 'heartConditions', label: 'Heart' },
                      { name: 'lungConditions', label: 'Lungs' },
                      { name: 'stomachConditions', label: 'Stomach or bowels' },
                      { name: 'bladderConditions', label: 'Bladder or genitals' },
                      { name: 'arthritis', label: 'Arthritis/Spine' }
                    ].map(condition => (
                      <div key={condition.name} className="mb-3">
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-[#2A1B1B]">{condition.label}</span>
                          <div className="flex gap-4">
                            <label className="flex items-center">
                              <input type="radio" name={condition.name} value="yes" checked={formData[condition.name] === 'yes'} onChange={handleChange} className="mr-2" />
                              <span className="text-sm">Yes</span>
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name={condition.name} value="no" checked={formData[condition.name] === 'no'} onChange={handleChange} className="mr-2" />
                              <span className="text-sm">No</span>
                            </label>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2A1B1B] mb-2">
                      Do you have any other medical condition not given above?
                    </label>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center">
                        <input type="radio" name="otherConditions" value="yes" checked={formData.otherConditions === 'yes'} onChange={handleChange} className="mr-2" />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="otherConditions" value="no" checked={formData.otherConditions === 'no'} onChange={handleChange} className="mr-2" />
                        No
                      </label>
                    </div>
                    {formData.otherConditions === 'yes' && (
                      <input
                        type="text"
                        name="otherConditionsDetails"
                        value={formData.otherConditionsDetails}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A1B1B] mt-2"
                        placeholder="If yes, what:"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation and Submit */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              {currentSection === 'medical' ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSection('dental');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-[#2A1B1B] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span>Previous: Dental History</span>
                </button>
              ) : (
                <div></div>
              )}
              
              {currentSection === 'dental' ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentSection('medical');
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-[#2A1B1B] text-white rounded-lg font-medium hover:bg-[#1A0F0F] transition-colors"
                >
                  <span>Next: Medical History</span>
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-[#2A1B1B] text-white rounded-lg font-medium hover:bg-[#1A0F0F] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Questionnaire'}
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </form>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PreScreen;
