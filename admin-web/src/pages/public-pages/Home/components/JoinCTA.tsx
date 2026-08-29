import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface JoinCTAProps {
  schoolName: string;
  onJoinClick: () => void;
}

export const JoinCTA: React.FC<JoinCTAProps> = ({ schoolName, onJoinClick }) => {
  return (
    <section className="py-24 bg-white text-[#111111] relative overflow-hidden border-b border-[#E5E7EB]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        <div className="inline-flex items-center space-x-2 bg-[#FFF7D6] border-2 border-[#F4C542] text-[#854D0E] px-5 py-2 rounded-full text-sm font-semibold uppercase tracking-wider">
          <Sparkles className="w-5 h-5 text-[#F4C542]" />
          <span>BECOME PART OF THE NETWORK</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#111111]">
          Haven't registered yet?
        </h2>

        <p className="text-lg sm:text-xl text-gray-600 font-normal max-w-2xl mx-auto leading-relaxed">
          Join your batchmates on the official <strong className="text-[#111111] font-semibold">{schoolName}</strong> Alumni Platform. Verify your profile to access reunions, rosters, and memory galleries.
        </p>

        <div className="pt-4 flex justify-center">
          <button
            onClick={onJoinClick}
            className="px-12 py-5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-semibold text-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-3 border border-[#E0B030]"
          >
            <span>Join the Alumni Network</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        <div className="pt-4 flex items-center justify-center space-x-2 text-base text-gray-500 font-semibold">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Fast 1-minute mobile OTP verification</span>
        </div>
      </div>
    </section>
  );
};
