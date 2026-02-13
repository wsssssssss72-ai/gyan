
import React, { useState } from 'react';
import { ApiService } from '../services/api';

interface VerificationGateProps {
  onVerified: () => void;
  onGoToVerify: () => void;
}

const VerificationGate: React.FC<VerificationGateProps> = ({ onVerified, onGoToVerify }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!token) return setError('Please enter token');
    setLoading(true);
    setError('');

    try {
      const res = await ApiService.validateToken(token.trim());
      if (res.success) {
        onVerified();
      } else {
        setError(res.message || 'Verification failed');
      }
    } catch (e) {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200 animate-pulse">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-3xl font-black text-slate-800 mb-2">Gate Locked</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">Enter your 24-hour verification token to unlock the premium content.</p>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="VX-XXXXX-XXXXX-XXXX"
                className={`w-full px-6 py-5 bg-slate-50 border-2 ${error ? 'border-red-500 animate-shake' : 'border-slate-100'} rounded-2xl text-center font-mono font-bold tracking-widest text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all`}
              />
              {error && <p className="mt-2 text-sm text-red-500 font-bold">{error}</p>}
            </div>

            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'VERIFY & UNLOCK'}
            </button>

            <div className="pt-6 border-t border-slate-50">
              <p className="text-sm text-slate-400 mb-2">Need a new token?</p>
              <button
                onClick={onGoToVerify}
                className="text-emerald-600 font-black hover:text-emerald-700 flex items-center justify-center gap-1 mx-auto group"
              >
                <span>Generate Token Now</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationGate;
