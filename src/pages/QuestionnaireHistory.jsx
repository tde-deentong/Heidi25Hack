import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const QuestionnaireHistory = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [questionnaires, setQuestionnaires] = useState([]);

  useEffect(() => {
    if (user) {
      const userQuestionnaires = authService.getUserQuestionnaires(user.id);
      setQuestionnaires(userQuestionnaires);
    }
  }, [user]);

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
            {questionnaires.map((questionnaire) => (
              <div
                key={questionnaire.id}
                className="bg-white rounded-lg border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#2A1B1B] mb-1">
                      {questionnaire.clinic?.name || questionnaire.clinic || 'Unknown Clinic'}
                    </h3>
                    {questionnaire.appointmentDate && (
                      <div className="flex items-center gap-4 text-sm text-[#2A1B1B]/70">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={16} />
                          <span>{formatDate(questionnaire.appointmentDate)}</span>
                        </div>
                        {questionnaire.appointmentTime && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={16} />
                            <span>{questionnaire.appointmentTime}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    Completed
                  </span>
                </div>
                <p className="text-sm text-[#2A1B1B]/60">
                  Submitted on {formatDate(questionnaire.submittedAt)} at {formatTime(questionnaire.submittedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestionnaireHistory;

