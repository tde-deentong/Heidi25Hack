import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import QuestionnaireHistory from './pages/QuestionnaireHistory';
import PreConsultPrep from './pages/PreConsultPrep';
import PreScreen from './pages/PreScreen';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { useAuth } from './context/AuthContext';

import { 

  Menu, 

  X, 

  ChevronDown, 

  Mic, 

  FileText, 

  CheckCircle2, 

  ArrowRight,

  Activity,

  Sparkles,

  Layers,

  Copy,

  Zap,

  Stethoscope

} from 'lucide-react';



// The custom Heidi Knot logo component
const HeidiLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} text-[#2A1B1B]`}>
     {/* Horizontal Infinity Loop */}
     <path 
       d="M3.5 12C3.5 6.5 10 6.5 12 11.5C14 6.5 20.5 6.5 20.5 12C20.5 17.5 14 17.5 12 12.5C10 17.5 3.5 17.5 3.5 12Z" 
       stroke="currentColor" 
       strokeWidth="2.5" 
       strokeLinecap="round" 
       strokeLinejoin="round"
     />
     {/* Vertical Infinity Loop */}
     <path 
       d="M12 3.5C6.5 3.5 6.5 10 11.5 12C6.5 14 6.5 20.5 12 20.5C17.5 20.5 17.5 14 12.5 12C17.5 10 17.5 3.5 12 3.5Z" 
       stroke="currentColor" 
       strokeWidth="2.5" 
       strokeLinecap="round" 
       strokeLinejoin="round"
     />
  </svg>
);

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (

    <div className="text-[#2A1B1B] antialiased bg-[#FCFCFA] selection:bg-yellow-200 overflow-x-hidden" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif" }}>

      

      {/* Top Notification Bar */}

      <div className="bg-[#FDFD96] px-4 py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-[#FBFB80] transition-colors">

        <span>Heidi for Patients makes it easier to share your symptoms and health story before your visit.</span>

        <ArrowRight size={14} />

      </div>



      {/* Navigation */}

      <nav 

        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${

          isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 py-2 shadow-sm' : 'bg-transparent py-4'

        }`}

      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          <div className="flex items-center gap-8 lg:gap-12">

            {/* Logo */}

            <Link to="/" className="flex items-center gap-2 text-2xl font-serif tracking-tight text-[#2A1B1B]">

              <div className="w-8 h-8 flex items-center justify-center">

                 <HeidiLogo />

              </div>

              <span className="font-bold">Heidi</span> for patients

            </Link>



            {/* Desktop Nav */}

            <div className="hidden lg:flex items-center gap-6 text-[15px] font-medium text-[#2A1B1B]/80 font-sans">

              <Link to="/history" className="hover:text-[#2A1B1B] transition-colors">Questionnaire History</Link>

            </div>

          </div>

          

          <div className="hidden lg:flex items-center gap-6">

            <button className="flex items-center gap-1 text-sm font-medium text-[#2A1B1B] hover:opacity-70">

              <span>🇦🇺</span> AU <ChevronDown size={14} />

            </button>

            <a href="#" className="text-sm font-medium text-[#2A1B1B] hover:opacity-70">Contact us</a>

            {user ? (
              <>
                <span className="text-sm text-[#2A1B1B]/70">{user.name}</span>
                <button 
                  onClick={logout}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-[#2A1B1B] bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-[#2A1B1B] bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Log in
                </button>
                <button 
                  onClick={() => setShowSignUp(true)}
                  className="bg-[#FDFD96] text-[#2A1B1B] px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#FBFB80] transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  Sign up
                </button>
              </>
            )}

          </div>



          <button 

            className="lg:hidden p-2 text-[#2A1B1B]"

            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}

          >

            {mobileMenuOpen ? <X /> : <Menu />}

          </button>

        </div>

      </nav>



      {/* Mobile Menu */}

      {mobileMenuOpen && (

        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 lg:hidden animate-in fade-in slide-in-from-top-10">

          <div className="flex flex-col gap-6 text-xl font-medium text-[#2A1B1B]">

            <Link to="/history" onClick={() => setMobileMenuOpen(false)}>Questionnaire History</Link>

            <hr className="border-gray-100" />

            <div className="flex flex-col gap-4">
              {user ? (
                <>
                  <span className="text-center py-3 text-[#2A1B1B]">{user.name}</span>
                  <button 
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-center py-3 bg-gray-100 rounded-full font-semibold"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setShowLogin(true);
                      setMobileMenuOpen(false);
                    }}
                    className="text-center py-3 bg-gray-100 rounded-full font-semibold"
                  >
                    Log in
                  </button>
                  <button 
                    onClick={() => {
                      setShowSignUp(true);
                      setMobileMenuOpen(false);
                    }}
                    className="bg-[#FDFD96] text-[#2A1B1B] w-full py-3 rounded-full font-bold"
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>

          </div>

        </div>

      )}



      {/* Hero Section */}

      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">

        

        {/* Abstract Side Shapes (Boomerangs) */}

        <div className="absolute top-1/4 -left-24 w-64 h-96 bg-[#2A1B1B] rounded-[100px] -rotate-45 hidden 2xl:block opacity-90 -z-10"></div>

        <div className="absolute top-1/2 -right-24 w-64 h-96 bg-[#2A1B1B] rounded-[100px] rotate-45 hidden 2xl:block opacity-90 -z-10"></div>



        {/* Floating Left Widget (Similar to Screenshot) */}

        <div className="fixed left-6 bottom-24 hidden 2xl:flex flex-col gap-3 z-40 animate-fade-in-up">

           <div className="w-12 h-12 rounded-xl bg-[#10A37F] flex items-center justify-center text-white shadow-lg shadow-green-900/10 cursor-pointer hover:scale-110 transition-transform">

             <Zap size={24} />

           </div>

           <div className="w-12 h-12 rounded-xl bg-[#F5803E] flex items-center justify-center text-white shadow-lg shadow-orange-900/10 cursor-pointer hover:scale-110 transition-transform">

             <Sparkles size={24} />

           </div>

           <div className="w-12 h-12 rounded-xl bg-[#2A9D8F] flex items-center justify-center text-white shadow-lg shadow-teal-900/10 cursor-pointer hover:scale-110 transition-transform">

             <Layers size={24} />

           </div>

           <div className="w-12 h-12 rounded-xl bg-[#64748B] flex items-center justify-center text-white shadow-lg shadow-slate-900/10 cursor-pointer hover:scale-110 transition-transform">

             <Copy size={24} />

           </div>

        </div>



        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="flex flex-col items-center text-center">

            

            {/* Sparkles Decoration */}

            <div className="absolute top-0 left-[20%] text-[#2A1B1B] animate-pulse delay-100 hidden lg:block">

               <span className="text-2xl">✦</span>

            </div>

            <div className="absolute bottom-10 right-[25%] text-[#2A1B1B] animate-pulse delay-700 hidden lg:block">

               <span className="text-2xl">✦</span>

            </div>

             <div className="absolute top-20 right-[20%] text-[#2A1B1B] animate-pulse delay-300 hidden lg:block">

               <span className="text-xl">✨</span>

            </div>



            <p className="text-[#2A1B1B]/70 font-normal mb-6 text-sm md:text-base tracking-wide">Trusted by clinics. Made for patients.</p>

            

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-[#2A1B1B] mb-6 leading-[1.15] max-w-4xl mx-auto">

              Skip the waiting room paperwork.<br />

              Start your visit prepared.

            </h1>

            

            <p className="text-lg md:text-xl text-[#2A1B1B]/70 mb-12 max-w-2xl mx-auto leading-[1.6] font-normal tracking-wide">

              Help your clinician understand your concerns ahead of time, so your visit feels smoother and more personal.

            </p>

            

            <div className="flex flex-col sm:flex-row items-center gap-4">

              <button className="bg-[#1C1C1C] text-white px-10 py-4 rounded-full text-lg font-medium hover:bg-black transition-all hover:-translate-y-1 shadow-2xl flex items-center gap-2">

                <Stethoscope size={20} />

                Chat with Heidi

              </button>

            </div>

          </div>

        </div>

      </section>






      {/* Workflow Section (Retained for content) */}

      <section className="py-24 bg-[#FCFCFA]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-20">

            <h2 className="text-3xl md:text-5xl font-medium text-[#2A1B1B] mb-6">Built to make your visit easier.</h2>

          </div>



          <div className="grid md:grid-cols-3 gap-8">

            {/* Feature 1 */}

            <Link to="/pre-consult-prep" className="block">

              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group cursor-pointer">

                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">

                  <FileText />

                </div>

                <h3 className="text-xl font-bold text-[#2A1B1B] mb-3">Pre-consult prep</h3>

                <p className="text-gray-500 leading-relaxed">

                  Review history, notes, and results in one place. Sync your schedule and walk in prepared.

                </p>

              </div>

            </Link>



             {/* Feature 2 */}

             <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group">

              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">

                <Mic />

              </div>

              <h3 className="text-xl font-bold text-[#2A1B1B] mb-3">During the consult</h3>

              <p className="text-gray-500 leading-relaxed">

                Transcribe visits in 100+ languages. Heidi for patients structures notes your way instantly.

              </p>

            </div>



             {/* Feature 3 */}

             <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group">

              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">

                <CheckCircle2 />

              </div>

              <h3 className="text-xl font-bold text-[#2A1B1B] mb-3">After the consult</h3>

              <p className="text-gray-500 leading-relaxed">

                Send everything to your EHR in one click. Auto-apply codes and finish on time.

              </p>

            </div>

          </div>

        </div>

      </section>



      {/* Footer (Simplified to match style) */}

      <footer className="bg-white border-t border-gray-100 py-12">

        <div className="max-w-7xl mx-auto px-4 text-center">

            <div className="flex items-center justify-center gap-2 text-2xl font-serif tracking-tight text-[#2A1B1B] mb-8">

              <div className="w-8 h-8 flex items-center justify-center">

                 <HeidiLogo />

              </div>

              <span className="font-bold">Heidi</span> for patients

            </div>

            <div className="flex justify-center gap-8 text-sm text-gray-500 mb-8 font-sans">

               <a href="#" className="hover:text-black">Terms</a>

               <a href="#" className="hover:text-black">Privacy</a>

               <a href="#" className="hover:text-black">Contact</a>

            </div>

            <p className="text-xs text-gray-400 font-sans">&copy; 2025 Heidi for patients Health. All rights reserved.</p>

        </div>

      </footer>

      {/* Auth Modals */}
      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)}
          onSwitchToSignUp={() => {
            setShowLogin(false);
            setShowSignUp(true);
          }}
        />
      )}

      {showSignUp && (
        <SignUp 
          onClose={() => setShowSignUp(false)}
          onSwitchToLogin={() => {
            setShowSignUp(false);
            setShowLogin(true);
          }}
        />
      )}

    </div>

  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<QuestionnaireHistory />} />
        <Route path="/pre-consult-prep" element={<PreConsultPrep />} />
        <Route path="/pre-screen" element={<PreScreen />} />
      </Routes>
    </Router>
  );
};

export default App;

