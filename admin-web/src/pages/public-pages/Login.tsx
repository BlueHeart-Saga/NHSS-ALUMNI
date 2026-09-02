import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { alertService } from '../../services/alertService';
import { getRedirectPathForRoles } from '../../utils/roleRedirect';

interface LoginProps {
  onLoginSuccess?: (path?: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (api.getToken()) {
      api.getMe()
        .then((u) => {
          if (u && u.roles) {
            const target = getRedirectPathForRoles(u.roles, u.verification_status === 'NOT_REGISTERED');
            navigate(target);
          }
        })
        .catch(() => {});
    }
  }, [navigate]);

  const handleVerifyCredentialsAndSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your Admin Email Address and Password.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Verify credentials and request OTP dispatch to email via SMTP
      await api.sendOTP(email.trim(), undefined, true, password);
      setOtp('');
      setStep('OTP');
      alertService.showSuccess(
        'Credentials Verified!',
        `Your password is correct. A 6-digit verification OTP code has been sent to ${email.trim()}.`
      );
    } catch (err: any) {
      setError(err.message || 'Invalid email address or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      // Step 2: Verify 6-Digit OTP code and issue JWT token
      const res = await api.verifyAdminOTP(email.trim(), otp.trim());
      const targetPath = getRedirectPathForRoles(res.roles, res.registration_required);

      if (targetPath === '/developer') {
        alertService.showSuccess('Developer Authenticated', 'Welcome to the Platform Developer Portal!');
      } else {
        alertService.showSuccess('School Admin Login Verified', 'Welcome back to your School Admin Dashboard!');
      }

      if (onLoginSuccess) {
        onLoginSuccess(targetPath);
      } else {
        navigate(targetPath);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-sans selection:bg-[#F4C542] selection:text-[#111111]">
      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-8 shadow-xl">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#FFF7D6] border-2 border-[#F4C542] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 text-[#854D0E]">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#854D0E]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111]">School Admin Portal</h1>
          <p className="text-xs text-[#6B7280] mt-1">Authorized School Administrator Verification</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 leading-relaxed animate-fadeIn">
            {error}
          </div>
        )}

        {step === 'CREDENTIALS' ? (
          <form onSubmit={handleVerifyCredentialsAndSendOTP} className="space-y-5">
            <Input
              label="Admin Email Address *"
              type="email"
              placeholder="admin@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Account Password *"
              type="password"
              placeholder="Enter your account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full py-3 bg-[#111111] text-[#F4C542] hover:bg-black font-bold cursor-pointer border border-[#111111]" isLoading={loading}>
              <span>Verify &amp; Send OTP Code</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="p-3 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-xl text-xs text-[#854D0E] font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#854D0E] shrink-0" />
              <span>Password verified! OTP code sent to <strong>{email}</strong>.</span>
            </div>

            <Input
              label="6-Digit Verification Code *"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />

            <Button type="submit" className="w-full py-3 bg-[#111111] text-[#F4C542] hover:bg-black font-bold cursor-pointer border border-[#111111]" isLoading={loading}>
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              <span>Verify OTP &amp; Access Dashboard</span>
            </Button>

            <button
              type="button"
              onClick={() => setStep('CREDENTIALS')}
              className="w-full text-xs font-semibold text-[#6B7280] hover:text-[#111111] text-center pt-2 cursor-pointer"
            >
              ← Change Email or Password
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-2">
          <p className="text-xs text-gray-500 font-normal">
            Need an admin account for your school?
          </p>
          <Link
            to="/admin/request-access"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#854D0E] hover:underline uppercase tracking-wider"
          >
            <ShieldCheck className="w-4 h-4 text-[#854D0E]" />
            <span>Request School Admin Access →</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
