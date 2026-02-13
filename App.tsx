
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WhatsAppModal from './components/WhatsAppModal';
import IframeView from './components/IframeView';
import VerificationGate from './components/VerificationGate';
import VerifyPage from './components/VerifyPage';
import TokenDisplayPage from './components/TokenDisplayPage';
import { ApiService } from './services/api';

type View = 'main' | 'verify' | 'display' | 'error';

const App: React.FC = () => {
  const [view, setView] = useState<View>('main');
  const [isVerified, setIsVerified] = useState(false);
  const [token, setToken] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const initialize = async () => {
      // 1. Initial Access Check
      const verified = await ApiService.checkSession();
      setIsVerified(verified);

      // 2. Handle URL Routing (Token Display with Security Guard)
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const tokenParam = params.get('token');

      if (viewParam === 'display' && tokenParam) {
        // ANTI-BYPASS CHECK
        const isAuthorized = await ApiService.validateDisplayAccess(tokenParam);
        if (isAuthorized) {
          setToken(tokenParam);
          setView('display');
        } else {
          setErrorMessage('Invalid Access Path. Please complete the verification flow.');
          setView('error');
        }
      }
    };

    initialize();

    // 3. WhatsApp Modal Delay
    const shown = localStorage.getItem('wa_shown');
    const timer = setTimeout(() => { if (!shown) setIsModalOpen(true); }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleVerified = () => {
    setIsVerified(true);
    setView('main');
  };

  const resetToHome = () => {
    window.history.replaceState({}, '', window.location.pathname);
    setView('main');
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden select-none">
      
      {/* 1. ERROR LAYER */}
      {view === 'error' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-100 p-6">
          <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">Access Denied</h1>
            <p className="text-slate-500 mb-8">{errorMessage}</p>
            <button
              onClick={() => window.location.href = window.location.origin}
              className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl hover:bg-slate-900 transition-colors"
            >
              GO TO HOME
            </button>
          </div>
        </div>
      )}

      {/* 2. VERIFICATION LAYER */}
      {!isVerified && view === 'main' && (
        <VerificationGate 
          onVerified={handleVerified} 
          onGoToVerify={() => setView('verify')} 
        />
      )}

      {view === 'verify' && (
        <VerifyPage onBack={() => setView('main')} />
      )}

      {view === 'display' && (
        <TokenDisplayPage 
          token={token} 
          onFinish={resetToHome} 
        />
      )}

      {/* 3. PROTECTED CONTENT LAYER */}
      <div className={`w-full h-full transition-all duration-1000 ${isVerified ? 'opacity-100' : 'opacity-0 blur-3xl pointer-events-none scale-105'}`}>
        <Navbar onWhatsAppClick={() => setIsModalOpen(true)} />
        
        {isVerified && iframeLoading && (
          <div className="fixed inset-0 z-[40] flex items-center justify-center bg-white">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-2xl shadow-emerald-100" />
              <p className="mt-6 text-slate-800 font-black tracking-widest text-sm uppercase">Loading Secure Instance...</p>
            </div>
          </div>
        )}

        <main className="w-full h-full overflow-hidden">
          <IframeView 
            url="https://gyanbindu-x7b2.onrender.com/" 
            onLoad={() => setIframeLoading(false)} 
          />
        </main>
      </div>

      <WhatsAppModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); localStorage.setItem('wa_shown', 'true'); }} 
      />

    </div>
  );
};

export default App;
