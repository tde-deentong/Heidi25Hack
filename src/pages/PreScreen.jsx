import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const PreScreen = () => {
  return (
    <div className="min-h-screen bg-[#FCFCFA]">
      {/* Navigation Bar */}
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <Link 
          to="/pre-consult-prep" 
          className="inline-flex items-center gap-2 text-[#2A1B1B]/70 hover:text-[#2A1B1B] mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#2A1B1B] mb-4 tracking-[-0.02em]">
            Pre-Screen Questionnaire
          </h1>
          <p className="text-[#2A1B1B]/70 mb-8">
            Please complete the following questions to help us prepare for your visit.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
            <div className="flex items-start gap-4">
              <FileText className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-[#2A1B1B]/70">
                  This questionnaire will help your clinician understand your concerns and prepare for your appointment. 
                  All information is kept confidential and secure.
                </p>
              </div>
            </div>
          </div>

          {/* Placeholder for questionnaire - will be implemented later */}
          <div className="mt-8 text-center py-12">
            <p className="text-[#2A1B1B]/60">
              Questionnaire form will be displayed here
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PreScreen;

