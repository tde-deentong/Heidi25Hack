import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Clock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const QuestionnaireHistory = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [questionnaires, setQuestionnaires] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (user) {
      const userQuestionnaires = authService.getUserQuestionnaires(user.id);
      setQuestionnaires(userQuestionnaires);
    }
  }, [user]);

  const handleDelete = (e, questionnaireId) => {
    e.stopPropagation(); // Prevent expanding/collapsing when clicking delete
    if (window.confirm('Are you sure you want to delete this questionnaire?')) {
      if (user) {
        authService.deleteQuestionnaire(user.id, questionnaireId);
        // Refresh the list
        const userQuestionnaires = authService.getUserQuestionnaires(user.id);
        setQuestionnaires(userQuestionnaires);
        // If the deleted item was expanded, close it
        if (expandedId === questionnaireId) {
          setExpandedId(null);
        }
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const formatAnswer = (value) => {
    if (value === '' || value === null || value === undefined) {
      return 'Not answered';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  const getQuestionLabel = (key) => {
    const labels = {
      // Dental History
      hasPain: 'Have you had any pain or discomfort with your teeth?',
      painfulTeeth: 'Can you identify which teeth were painful?',
      symptomDate: 'When did this symptom first occur?',
      symptomFrequency: 'How often does the symptom happen, and how long is each episode?',
      episodesFrequency: 'Are the episodes getting more, the same or less common?',
      episodesSeverity: 'Are the episodes getting more, the same or less severe?',
      symptomTriggers: 'Is there anything which makes the symptom come, or go?',
      temperatureSensitivity: 'Do cold or hot food and drink bring on the symptom?',
      painDuration: 'How long does the pain last for after the stimulus?',
      sharpPain: 'Is the pain sharp and short, just in one tooth?',
      dullPain: 'Or is it a duller, longer lasting, more generalized pain in the region?',
      spontaneousPain: 'Does the pain ever occur spontaneously without stimulus?',
      throbbingPain: 'Does the pain ever throb?',
      bitingPain: 'Do any of your teeth hurt on biting?',
      bitingPainTeeth: 'Which teeth hurt on biting?',
      bitingPainStops: 'If biting causes pain, does the pain stop when you stop biting?',
      headShakingPain: 'Does shaking your head cause any pain?',
      recentTreatment: 'Have you had any recent dental treatment, particularly to teeth which are symptomatic?',
      recentTreatmentDetails: 'Recent dental treatment details',
      grindingClenching: 'Are you aware that you grind or clench your teeth, perhaps at night?',
      trauma: 'Have you had any trauma to your teeth, say in sports accidents?',
      
      // Medical History
      generallyFit: 'Are you generally fit and well?',
      seenDoctor: 'Have you seen your general medical doctor or medical specialist in the last 2 years?',
      seenDoctorReason: 'Why did you see your doctor?',
      takingMedication: 'Do you take any medication at present?',
      medicationDetails: 'Medication details',
      pregnant: 'Ladies, are you pregnant?',
      highBloodPressure: 'High blood pressure',
      anaemia: 'Anaemia or any bleeding problem',
      rheumaticFever: 'Rheumatic fever',
      asthma: 'Asthma',
      diabetes: 'Diabetes',
      epilepsy: 'Epilepsy',
      hepatitis: 'Hepatitis or Jaundice',
      hiv: 'HIV or AIDS',
      drugAllergies: 'Allergies to any drug (e.g. Penicillin)',
      brainConditions: 'Brain conditions',
      heartConditions: 'Heart conditions',
      lungConditions: 'Lung conditions',
      stomachConditions: 'Stomach or bowel conditions',
      bladderConditions: 'Bladder or genital conditions',
      arthritis: 'Arthritis/Spine conditions',
      otherConditions: 'Do you have any other medical condition not given above?',
      otherConditionsDetails: 'Other medical conditions details'
    };
    return labels[key] || key;
  };

  const formatValue = (key, value) => {
    if (!value || value === '') return 'Not answered';
    
    // Format specific values
    if (key === 'episodesFrequency' || key === 'episodesSeverity') {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    if (key === 'temperatureSensitivity') {
      const map = { hot: 'Hot', cold: 'Cold', both: 'Both', neither: 'Neither' };
      return map[value] || value;
    }
    if (key === 'painDuration') {
      const map = { secs: 'Seconds', mins: 'Minutes', hours: 'Hours' };
      return map[value] || value;
    }
    if (key === 'grindingClenching') {
      const map = { yes: 'Yes', maybe: 'Maybe', no: 'No' };
      return map[value] || value;
    }
    if (value === 'yes') return 'Yes';
    if (value === 'no') return 'No';
    
    return value;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FCFCFA] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-[#2A1B1B] mb-4">Please log in</h2>
          <p className="text-[#2A1B1B]/70 mb-6">
            You need to be logged in to view your questionnaire history.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#2A1B1B] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1A0F0F] transition-colors"
          >
            Go to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFA]">
      {/* Navigation Bar - Same as main page */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-8 lg:gap-12">
            <Link to="/" className="flex items-center gap-2 text-2xl font-serif tracking-tight text-[#2A1B1B]">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#2A1B1B]">
                  <path 
                    d="M3.5 12C3.5 6.5 10 6.5 12 11.5C14 6.5 20.5 6.5 20.5 12C20.5 17.5 14 17.5 12 12.5C10 17.5 3.5 17.5 3.5 12Z" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M12 3.5C6.5 3.5 6.5 10 11.5 12C6.5 14 6.5 20.5 12 20.5C17.5 20.5 17.5 14 12.5 12C17.5 10 17.5 3.5 12 3.5Z" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-bold">Heidi</span> for patients
            </Link>
            <div className="hidden lg:flex items-center gap-6 text-[15px] font-medium text-[#2A1B1B]/80 font-sans">
              <Link to="/history" className="hover:text-[#2A1B1B] transition-colors">Questionnaire History</Link>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            <button className="flex items-center gap-1 text-sm font-medium text-[#2A1B1B] hover:opacity-70">
              <span>🇦🇺</span> AU <ChevronDown size={14} />
            </button>
            <a href="#" className="text-sm font-medium text-[#2A1B1B] hover:opacity-70">Contact us</a>
            <span className="text-sm text-[#2A1B1B]/70">{user.name}</span>
            <button 
              onClick={logout}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-[#2A1B1B] bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-[#2A1B1B]/70 hover:text-[#2A1B1B] mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to home</span>
        </Link>

        <h1 className="text-3xl md:text-4xl font-semibold text-[#2A1B1B] mb-2 tracking-[-0.02em]">
          Questionnaire History
        </h1>
        <p className="text-[#2A1B1B]/70 mb-8">
          View your previously submitted questionnaires
        </p>

        {questionnaires.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-[#2A1B1B]/70">No questionnaires found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questionnaires.map((questionnaire) => {
              const isExpanded = expandedId === questionnaire.id;
              
              // Define keys for dental and medical history
              const dentalKeys = [
                'hasPain', 'painfulTeeth', 'symptomDate', 'symptomFrequency', 'episodesFrequency',
                'episodesSeverity', 'symptomTriggers', 'temperatureSensitivity', 'painDuration',
                'sharpPain', 'dullPain', 'spontaneousPain', 'throbbingPain', 'bitingPain',
                'bitingPainTeeth', 'bitingPainStops', 'headShakingPain', 'recentTreatment',
                'recentTreatmentDetails', 'grindingClenching', 'trauma'
              ];
              
              const medicalKeys = [
                'generallyFit', 'seenDoctor', 'seenDoctorReason', 'takingMedication', 'medicationDetails',
                'pregnant', 'highBloodPressure', 'anaemia', 'rheumaticFever', 'asthma', 'diabetes',
                'epilepsy', 'hepatitis', 'hiv', 'drugAllergies', 'brainConditions', 'heartConditions',
                'lungConditions', 'stomachConditions', 'bladderConditions', 'arthritis', 'otherConditions',
                'otherConditionsDetails'
              ];
              
              // Responses are stored in questionnaire.responses, but check top level too for backwards compatibility
              const responses = questionnaire.responses || (() => {
                // If no responses object, check if form fields are at top level
                const topLevelResponses = {};
                const allKeys = [...dentalKeys, ...medicalKeys];
                allKeys.forEach(key => {
                  if (questionnaire[key] !== undefined) {
                    topLevelResponses[key] = questionnaire[key];
                  }
                });
                return topLevelResponses;
              })();
              
              // Check if there are any dental history responses
              const hasDentalResponses = dentalKeys.some(key => responses[key] && responses[key] !== '');
              
              // Check if there are any medical history responses
              const hasMedicalResponses = medicalKeys.some(key => responses[key] && responses[key] !== '');
              
              return (
                <div
                  key={questionnaire.id}
                  className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div 
                      className="cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : questionnaire.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#2A1B1B] mb-1">
                            {questionnaire.title || questionnaire.type || 'Questionnaire'}
                          </h3>
                          <p className="text-sm text-[#2A1B1B]/70 mb-2">
                            {questionnaire.clinic?.name || questionnaire.clinic || 'Unknown Clinic'}
                          </p>
                          {questionnaire.appointmentDate && (
                            <div className="flex items-center gap-4 text-sm text-[#2A1B1B]/70">
                              <div className="flex items-center gap-1.5">
                                <Calendar size={16} />
                                <span>{formatDate(questionnaire.appointmentDate)}</span>
                              </div>
                              {questionnaire.appointmentTime && questionnaire.appointmentTime !== 'TBD' && (
                                <div className="flex items-center gap-1.5">
                                  <Clock size={16} />
                                  <span>{questionnaire.appointmentTime}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                            Completed
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="text-[#2A1B1B]/60" size={20} />
                          ) : (
                            <ChevronDown className="text-[#2A1B1B]/60" size={20} />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-[#2A1B1B]/60">
                        Submitted on {formatDate(questionnaire.submittedAt)} at {formatTime(questionnaire.submittedAt)}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={(e) => handleDelete(e, questionnaire.id)}
                        className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-6 bg-gray-50">
                      <h4 className="font-semibold text-[#2A1B1B] mb-4">Your Responses</h4>
                      <div className="space-y-4">
                        {/* Dental History Section */}
                        {hasDentalResponses && (
                          <div>
                            <h5 className="font-medium text-[#2A1B1B] mb-3 text-sm uppercase tracking-wide">Dental History</h5>
                            <div className="space-y-3">
                              {dentalKeys.map((key) => {
                                const value = responses[key];
                                if (!value || value === '') {
                                  return null;
                                }
                                
                                return (
                                  <div key={key} className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm font-medium text-[#2A1B1B] mb-1">{getQuestionLabel(key)}</p>
                                    <p className="text-sm text-[#2A1B1B]/70">{formatValue(key, value)}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Medical History Section */}
                        {hasMedicalResponses && (
                          <div>
                            <h5 className="font-medium text-[#2A1B1B] mb-3 text-sm uppercase tracking-wide mt-6">Medical History</h5>
                            <div className="space-y-3">
                              {medicalKeys.map((key) => {
                                const value = responses[key];
                                if (!value || value === '') {
                                  return null;
                                }
                                
                                return (
                                  <div key={key} className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm font-medium text-[#2A1B1B] mb-1">{getQuestionLabel(key)}</p>
                                    <p className="text-sm text-[#2A1B1B]/70">{formatValue(key, value)}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {!hasDentalResponses && !hasMedicalResponses && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                            <p className="text-sm text-[#2A1B1B]/70">No responses found for this questionnaire.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestionnaireHistory;

