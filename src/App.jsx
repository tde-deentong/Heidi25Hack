import React, { useState, useEffect } from 'react';

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

  Zap

} from 'lucide-react';



const App = () => {

  const [isScrolled, setIsScrolled] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



  useEffect(() => {

    const handleScroll = () => {

      setIsScrolled(window.scrollY > 20);

    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);



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



  return (

    <div className="font-sans text-[#2A1B1B] antialiased bg-[#FCFCFA] selection:bg-yellow-200 overflow-x-hidden">

      

      {/* Top Notification Bar */}

      <div className="bg-[#FDFD96] px-4 py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-[#FBFB80] transition-colors">

        <span>Heidi for patients announces <strong>$65m Series B</strong> to accelerate building the AI Care Partner for Clinicians</span>

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

            <a href="#" className="flex items-center gap-2 text-2xl font-serif tracking-tight text-[#2A1B1B]">

              <div className="w-8 h-8 flex items-center justify-center">

                 <HeidiLogo />

              </div>

              <span className="font-bold">Heidi</span> for patients

            </a>



            {/* Desktop Nav */}

            <div className="hidden lg:flex items-center gap-6 text-[15px] font-medium text-[#2A1B1B]/80 font-sans">

              <a href="#" className="flex items-center gap-1 hover:text-[#2A1B1B] transition-colors">Product <ChevronDown size={14} /></a>

              <a href="#" className="flex items-center gap-1 hover:text-[#2A1B1B] transition-colors">Specialties <ChevronDown size={14} /></a>

              <a href="#" className="hover:text-[#2A1B1B] transition-colors">Pricing</a>

              <a href="#" className="flex items-center gap-1 hover:text-[#2A1B1B] transition-colors">Resources <ChevronDown size={14} /></a>

            </div>

          </div>

          

          <div className="hidden lg:flex items-center gap-6">

            <button className="flex items-center gap-1 text-sm font-medium text-[#2A1B1B] hover:opacity-70">

              <span>🇦🇺</span> AU <ChevronDown size={14} />

            </button>

            <a href="#" className="text-sm font-medium text-[#2A1B1B] hover:opacity-70">Contact us</a>

            <a href="#" className="px-5 py-2.5 rounded-full text-sm font-medium text-[#2A1B1B] bg-gray-100 hover:bg-gray-200 transition-colors">Log in</a>

            <button className="bg-[#FDFD96] text-[#2A1B1B] px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#FBFB80] transition-all hover:scale-105 active:scale-95 shadow-sm">

              Sign up

            </button>

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

            <a href="#" className="flex items-center justify-between">Product <ChevronDown size={16} /></a>

            <a href="#" className="flex items-center justify-between">Specialties <ChevronDown size={16} /></a>

            <a href="#">Pricing</a>

            <a href="#" className="flex items-center justify-between">Resources <ChevronDown size={16} /></a>

            <hr className="border-gray-100" />

            <div className="flex flex-col gap-4">

               <a href="#" className="text-center py-3 bg-gray-100 rounded-full font-semibold">Log in</a>

               <button className="bg-[#FDFD96] text-[#2A1B1B] w-full py-3 rounded-full font-bold">Sign up</button>

            </div>

          </div>

        </div>

      )}



      {/* Hero Section */}

      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">

        

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



            <p className="text-[#2A1B1B]/70 font-medium mb-8">AI trusted and loved by clinicians</p>

            

            <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-medium tracking-tight text-[#2A1B1B] mb-8 leading-[0.95]">

              Get time <span className="font-serif italic font-light">back</span>.<br />

              Move care <span className="font-serif italic font-light">forward</span>.

            </h1>

            

            <p className="text-xl md:text-2xl text-[#2A1B1B]/70 mb-12 max-w-2xl mx-auto leading-relaxed font-light">

              Your AI scribe capturing notes, summaries, and follow-ups as you go. By your side while care flows.

            </p>

            

            <div className="flex flex-col sm:flex-row items-center gap-4">

              <button className="bg-[#1C1C1C] text-white px-10 py-4 rounded-full text-lg font-medium hover:bg-black transition-all hover:-translate-y-1 shadow-2xl flex items-center gap-2">

                <Sparkles size={20} className="fill-white" />

                Get Heidi for patients free

              </button>

            </div>

          </div>

        </div>

      </section>



      {/* App Mockup Section (Recreated roughly from Context) */}

      <section className="bg-white py-12 border-t border-gray-100">

         <div className="max-w-7xl mx-auto px-4">

            <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden aspect-[16/9] relative">

               {/* Header of App */}

               <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white">

                  <div className="flex items-center gap-4">

                     <span className="text-sm font-medium text-gray-500">Today 11:29AM</span>

                     <div className="h-4 w-[1px] bg-gray-200"></div>

                     <span className="text-sm font-medium text-gray-500 flex items-center gap-1">文 English</span>

                     <span className="bg-[#8B5CF6] text-white text-xs font-bold px-2 py-1 rounded-md">14 days</span>

                  </div>

                  <div className="flex items-center gap-4">

                     <span className="text-sm text-gray-400">02:11</span>

                     <div className="border border-red-200 bg-red-50 text-red-500 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">

                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>

                        Default - Macbook...

                     </div>

                  </div>

               </div>

               

               {/* Body of App */}

               <div className="flex h-full">

                  {/* Sidebar */}

                  <div className="w-64 border-r border-gray-100 bg-[#FAFAFA] hidden md:flex flex-col justify-between p-4">

                     <div className="space-y-1">

                        <button className="w-full bg-[#2A1B1B] text-white rounded-lg py-2.5 px-4 text-sm font-medium flex items-center gap-2 mb-6">

                           <span className="text-lg">+</span> New session

                        </button>

                        {['View sessions', 'Tasks'].map(item => (

                           <div key={item} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer font-medium">{item}</div>

                        ))}

                         <div className="pt-4 text-xs font-bold text-gray-400 uppercase tracking-wider px-4">Templates</div>

                         {['Template library', 'Community'].map(item => (

                           <div key={item} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer font-medium">{item}</div>

                        ))}

                     </div>

                     <div className="space-y-1">

                        {['Earn $50', 'Request a feature', 'Shortcuts', 'Help'].map(item => (

                           <div key={item} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md cursor-pointer">{item}</div>

                        ))}

                     </div>

                  </div>



                  {/* Main Content */}

                  <div className="flex-1 flex flex-col p-6 relative">

                     <div className="flex items-center gap-6 border-b border-gray-100 pb-4 mb-6">

                        <div className="text-gray-400 font-medium cursor-pointer">Context</div>

                        <div className="bg-white shadow-sm border border-gray-200 text-[#2A1B1B] px-4 py-1.5 rounded-md font-medium text-sm flex items-center gap-2">

                           <div className="h-3 w-[2px] bg-red-400 rounded-full"></div>

                           Transcript

                        </div>

                        <div className="text-gray-400 font-medium cursor-pointer">Dentistry Note</div>

                        <div className="text-gray-400">+</div>

                     </div>

                     

                     <div className="flex-1 bg-white rounded-xl">

                        {/* Empty State */}

                     </div>



                     {/* Bottom Input */}

                     <div className="mt-4">

                        <div className="relative">

                           <input 

                              type="text" 

                              placeholder="Ask Heidi for patients to do anything..." 

                              className="w-full border border-gray-200 rounded-xl py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"

                           />

                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">

                              <Activity size={20} />

                           </div>

                        </div>

                        <div className="text-center mt-3 text-xs text-orange-600 flex items-center justify-center gap-2">

                           <div className="w-3 h-3 border border-orange-600 rounded-full flex items-center justify-center text-[8px]">!</div>

                           Review your note before use to ensure it accurately represents the visit

                        </div>

                     </div>

                  </div>

               </div>

            </div>

         </div>

      </section>



      {/* Workflow Section (Retained for content) */}

      <section className="py-24 bg-[#FCFCFA]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-20">

            <h2 className="text-3xl md:text-5xl font-medium text-[#2A1B1B] mb-6">Built for the way you practice.</h2>

          </div>



          <div className="grid md:grid-cols-3 gap-8">

            {/* Feature 1 */}

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group">

              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">

                <FileText />

              </div>

              <h3 className="text-xl font-bold text-[#2A1B1B] mb-3">Pre-consult prep</h3>

              <p className="text-gray-500 leading-relaxed">

                Review history, notes, and results in one place. Sync your schedule and walk in prepared.

              </p>

            </div>



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

    </div>

  );

};



export default App;

