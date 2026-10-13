import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Delete, Sparkles } from 'lucide-react';

interface PinScreenProps {
  correctPin: string;
  onSuccess: () => void;
}

export const PinScreen: React.FC<PinScreenProps> = ({ correctPin, onSuccess }) => {
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setIsError(false);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setIsError(false);
    setPin('');
  };

  const verifyPin = (candidate: string) => {
    if (candidate === correctPin) {
      setIsError(false);
      onSuccess();
    } else {
      setIsError(true);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin('');
      }, 650);
    }
  };

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 p-4 text-white select-none">
      <div
        className={`w-full max-w-sm rounded-3xl bg-slate-900/90 border border-amber-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-transform ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Academy Emblem Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-lg shadow-amber-500/25 ring-4 ring-amber-400/20">
            <span className="text-2xl font-black tracking-tight text-slate-950">PR</span>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-slate-900 p-1">
              <Lock className="h-3.5 w-3.5 text-amber-400" />
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-wider text-amber-400">PR ACADEMY</h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 mt-0.5">
            Management Portal Access
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-300 border border-slate-700">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Surakshit PIN Pravesh</span>
          </div>
        </div>

        {/* Masked PIN Indicators (strictly masked - no plain text password display) */}
        <div className="mb-6 flex justify-center items-center gap-4 py-2">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-200 ${
                  isFilled
                    ? 'border-amber-400 bg-amber-500/20 shadow-md shadow-amber-500/20 scale-105'
                    : isError
                    ? 'border-rose-500/60 bg-rose-950/20'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
              >
                {isFilled && (
                  <div className="h-4 w-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 shadow-sm animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* Error message if incorrect */}
        <div className="h-6 text-center text-xs mb-3">
          {isError ? (
            <span className="text-rose-400 font-medium">
              Galat PIN! Kripya sahi 4-digit code enter karein.
            </span>
          ) : (
            <span className="text-slate-400">
              4-digit PIN enter karke app open karein
            </span>
          )}
        </div>

        {/* Numeric Keypad for Mobile, iPad and Desktop touch */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num.toString())}
              className="flex h-14 items-center justify-center rounded-2xl bg-slate-800/70 border border-slate-700/60 text-xl font-bold text-white transition-all hover:bg-amber-500/20 hover:border-amber-500/40 hover:scale-[1.03] active:scale-95 focus:outline-none"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="flex h-14 items-center justify-center rounded-2xl bg-slate-800/40 border border-slate-700/40 text-xs font-semibold text-slate-400 transition-all hover:bg-slate-700 hover:text-white active:scale-95"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="flex h-14 items-center justify-center rounded-2xl bg-slate-800/70 border border-slate-700/60 text-xl font-bold text-white transition-all hover:bg-amber-500/20 hover:border-amber-500/40 hover:scale-[1.03] active:scale-95 focus:outline-none"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="flex h-14 items-center justify-center rounded-2xl bg-slate-800/40 border border-slate-700/40 text-slate-300 transition-all hover:bg-rose-500/20 hover:text-rose-400 active:scale-95"
            aria-label="Backspace"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400/70" />
            Dance • Meditation • Acting • Music
          </p>
        </div>
      </div>
    </div>
  );
};
