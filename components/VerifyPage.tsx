
import React, { useState } from 'react';
import { ApiService } from '../services/api';

const VerifyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [step, setStep] = useState<'idle' | 'verifying'>('idle');
  const [progress, setProgress] = useState(0);

  const start = async () => {
    setStep('verifying');
    
    // Simulate internal verification/ad delay
    const duration = 3000;
    const interval = 50;
    let current = 0;
    
    const timer = setInterval(async () => {
      current += interval;
      const p = Math.min((current / duration) * 100, 100);
      setProgress(p);

      if (current >= duration) {
        clearInterval(timer);
        try {
          // Perform the strict redirect flow
          await ApiService.mockInitiateRedirect();
        } catch (e) {
          alert("Redirect generation failed. Please refresh.");
          setStep('idle');
        }
      }
    }, interval);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white p-8 md:p-14 text-center">
        {step === 'idle' ? (
          <>
            <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Access Verification</h1>
            <p className="text-slate-500 text-lg mb-10 leading-relaxed max-w-sm mx-auto font-medium">
              Click start to verify. You will be redirected to a secure token generation link.
            </p>
            <button
              onClick={start}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-95 text-xl"
            >
              START VERIFICATION
            </button>
            <button onClick={onBack} className="mt-8 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest text-xs">
              Go Back
            </button>
          </>
        ) : (
          <div className="py-10">
            <div className="relative w-40 h-40 mx-auto mb-10">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * progress) / 100}
                  className="text-blue-600 transition-all duration-100"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-slate-800">
                {Math.round(progress)}%
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-4">Securing Path...</h2>
            <p className="text-slate-500 font-medium">Auto-redirecting to generated short link.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;
