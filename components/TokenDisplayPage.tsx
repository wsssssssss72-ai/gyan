
import React, { useState } from 'react';

const TokenDisplayPage: React.FC<{ token: string; onFinish: () => void }> = ({ token, onFinish }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[130] bg-emerald-600 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-[4rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] p-10 md:p-16 text-center animate-in zoom-in fade-in duration-500">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 animate-bounce">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">Success!</h1>
        <p className="text-slate-500 text-lg mb-10 font-medium">Copy your token and paste it at the website gate to unlock access.</p>

        <div className="relative mb-10">
          <div className="w-full bg-slate-50 border-4 border-slate-100 rounded-3xl py-8 px-4 text-3xl md:text-4xl font-mono font-black text-slate-800 tracking-tighter shadow-inner">
            {token}
          </div>
          {copied && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-in slide-in-from-bottom-2">
              COPIED TO CLIPBOARD!
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={copy}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-6 rounded-3xl transition-all shadow-xl active:scale-95 text-lg"
          >
            COPY TOKEN
          </button>
          <button
            onClick={onFinish}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-6 rounded-3xl shadow-2xl shadow-emerald-200 transition-all active:scale-95 text-lg"
          >
            GO TO WEBSITE
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenDisplayPage;
