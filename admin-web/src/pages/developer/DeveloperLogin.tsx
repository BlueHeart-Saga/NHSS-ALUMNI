import React, { useState } from 'react';
import { Shield, Phone, KeyRound, ArrowRight, Lock } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { alertService } from '../../services/alertService';

interface DeveloperLoginProps {
  onLoginSuccess: () => void;
}

export const DeveloperLogin: React.FC<DeveloperLoginProps> = ({ onLoginSuccess }) => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'MOBILE' | 'OTP'>('MOBILE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanMobile = mobile.trim();
    if (!cleanMobile) {
      setError('Please enter your Developer Mobile Number.');
      alertService.showError('Mobile Number Required', 'Please enter your registered Developer Mobile Number.');
      return;
    }

    const digitsOnly = cleanMobile.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      const errMsg = `Incomplete mobile number entered ('${cleanMobile}'). Please enter a full 10-digit developer mobile number.`;
      setError(errMsg);
      alertService.showError('Incomplete Mobile Number', errMsg);
      return;
    }

    setLoading(true);

    try {
      if (cleanMobile) localStorage.setItem('developer_mobile', cleanMobile);
      // Pass forDeveloper: true to validate mobile against authorized developer list in backend
      await api.sendOTP(cleanMobile, undefined, false, undefined, false, false, true);
      setOtp('');
      setStep('OTP');
      alertService.showSuccess(
        'Developer Mobile Verified!',
        `Security OTP code sent to developer mobile: ${cleanMobile}`
      );
    } catch (err: any) {
      const errMsg = err.message || 'The mobile number entered is not registered or authorized for Developer Portal access.';
      setError(errMsg);
      alertService.showError(
        'Developer Mobile Not Valid',
        `The mobile number '${cleanMobile}' is not valid or authorized for Developer Portal access. Please enter your registered Developer mobile number.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.verifyOTP(mobile.trim(), otp.trim());
      if (mobile) localStorage.setItem('developer_mobile', mobile.trim());
      alertService.showSuccess('Developer Authenticated', 'Welcome to the Platform Developer Portal!');
      onLoginSuccess();
    } catch (err: any) {
      const errMsg = err.message || 'Invalid developer verification OTP code.';
      setError(errMsg);
      alertService.showError('Verification Failed', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-xs space-y-6 animate-fadeIn">
        {/* Developer Login Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-[#111111] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#111111] shadow-md">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-[11px] font-bold text-[#111111] uppercase tracking-wider mb-2">
            <Lock className="w-3 h-3 text-[#111111]" />
            <span>Developer Portal Access</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">Developer Portal</h1>
          <p className="text-xs text-[#6B7280] mt-1">Multi-Tenant School Creation & Admin Provisioning</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {step === 'MOBILE' ? (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">Developer Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#111111]"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-3 bg-black text-white font-bold hover:bg-black" isLoading={loading}>
              <span>Send Security OTP</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="p-3 bg-gray-50 border border-[#E5E7EB] rounded-xl text-xs text-[#6B7280]">
              Developer OTP sent to <strong className="text-[#111111]">{mobile}</strong>.
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">6-Digit Security Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm font-mono font-bold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#111111]"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-3 bg-[#111111] text-white font-bold hover:bg-black" isLoading={loading}>
              <span>Authorize Developer Access</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <button
              type="button"
              onClick={() => setStep('MOBILE')}
              className="w-full text-center text-xs text-[#6B7280] hover:text-[#111111] font-medium"
            >
              Change Mobile Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
