import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, ArrowRight, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PreConsultPrep = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: ''
  });
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation
    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      setIsSubmitting(false);
      return;
    }

    if (!formData.phoneNumber.trim()) {
      setError('Please enter your phone number');
      setIsSubmitting(false);
      return;
    }

    if (!formData.dateOfBirth.trim()) {
      setError('Please enter your date of birth');
      setIsSubmitting(false);
      return;
    }

    // Verify identity
    // In production, this would check against the user's account or appointment records
    // For now, we'll do a simple check if user is logged in
    if (user) {
      // Check if the name matches (case-insensitive, partial match for flexibility)
      const nameMatch = user.name.toLowerCase().includes(formData.fullName.toLowerCase()) ||
                       formData.fullName.toLowerCase().includes(user.name.toLowerCase());
      
      if (!nameMatch) {
        setError('The name you entered does not match our records. Please check and try again.');
        setIsSubmitting(false);
        return;
      }

      // Check if phone number matches (normalize by removing spaces, dashes, parentheses)
      const normalizePhone = (phone) => phone.replace(/[\s\-\(\)]/g, '');
      const userPhone = user.phoneNumber ? normalizePhone(user.phoneNumber) : '';
      const inputPhone = normalizePhone(formData.phoneNumber);
      
      if (userPhone && userPhone !== inputPhone) {
        setError('The phone number you entered does not match our records. Please check and try again.');
        setIsSubmitting(false);
        return;
      }

      // Check if date of birth matches
      if (user.dateOfBirth && user.dateOfBirth !== formData.dateOfBirth) {
        setError('The date of birth you entered does not match our records. Please check and try again.');
        setIsSubmitting(false);
        return;
      }
    }

    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsVerified(true);
    setIsSubmitting(false);

    // After verification, could redirect to questionnaire or next step
    setTimeout(() => {
      // Could navigate to questionnaire or show success message
    }, 2000);
  };

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
          to="/" 
          className="inline-flex items-center gap-2 text-[#2A1B1B]/70 hover:text-[#2A1B1B] mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to home</span>
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#2A1B1B] mb-2 tracking-[-0.02em]">
            Pre-consult prep
          </h1>
          <p className="text-[#2A1B1B]/70 mb-6">
            Please confirm your identity to access your pre-consultation information.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800">
              To protect your privacy, we need to confirm your identity before you fill out your pre-consultation form.
            </p>
          </div>

          {!isVerified ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-[#2A1B1B] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A1B1B] focus:border-transparent"
                  placeholder="Enter your full name as it appears on your ID"
                  required
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#2A1B1B] mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A1B1B] focus:border-transparent"
                    placeholder="(555) 123-4567"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-[#2A1B1B] mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A1B1B] focus:border-transparent"
                  required
                  aria-required="true"
                />
                <p className="mt-2 text-sm text-[#2A1B1B]/60">
                  Format: MM/DD/YYYY
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#2A1B1B] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1A0F0F] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#2A1B1B] focus:ring-offset-2"
              >
                {isSubmitting ? 'Verifying...' : 'Verify Identity'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-[#2A1B1B] mb-2">Identity Verified</h2>
              <p className="text-[#2A1B1B]/70 mb-6">
                Your identity has been confirmed. You can now access your pre-consultation information.
              </p>
              <Link
                to="/pre-screen"
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Start Pre-Screen
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PreConsultPrep;

