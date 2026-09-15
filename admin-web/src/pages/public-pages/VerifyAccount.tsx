import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Phone, Lock, ArrowRight, CheckCircle2, 
  AlertCircle, RefreshCw, KeyRound, Eye, EyeOff, UserCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { alertService } from '../../services/alertService';

type ActivationStep = 'WELCOME' | 'ENTER_OTP' | 'CREATE_PASSWORD' | 'SUCCESS';

interface TokenInfo {
  valid: boolean;
  full_name: string;
  school_name?: string;
  mobile?: string;
  expires_at?: string;
}

export const VerifyAccount: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryToken = new URLSearchParams(location.search).get('token') || '';

  const [token] = useState<string>(queryToken.trim());
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [validating, setValidating] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [step, setStep] = useState<ActivationStep>('WELCOME');
  const [otp, setOtp] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [formError, setFormError] = useState<string | null>(null);

  // Validate invitation token on mount
  useEffect(() => {
    if (!token) {
      setValidating(false);
      setValidationError('No invitation token found in this link. Please check your SMS message or contact your school administrator.');
      return;
    }

    const checkToken = async () => {
      try {
        setValidating(true);
        const res = await api.validateInvitationToken(token);
        setTokenInfo(res);
        setStep('WELCOME');
      } catch (err: any) {
        console.error('Token validation failed:', err);
        setValidationError(
          err.message || 'This invitation link is invalid or has expired. Please contact your school administrator for a new invitation link.'
        );
      } finally {
        setValidating(false);
      }
    };

    checkToken();
  }, [token]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Step 1 -> Step 2: Send OTP
  const handleSendOTP = async () => {
    setFormError(null);
    setLoading(true);
    try {
      await api.sendInvitationOTP(token);
      setStep('ENTER_OTP');
      setResendCooldown(30);
      alertService.showSuccess(
        'SMS OTP Sent!',
        `A 6-digit verification code has been dispatched via SMS to ${tokenInfo?.mobile || 'your mobile phone'}.`
      );
    } catch (err: any) {
      setFormError(err.message || 'Failed to send SMS OTP. Please try again.');
      alertService.showError('OTP Dispatch Failed', err.message || 'Unable to send SMS OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> Step 3: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setFormError('Please enter the 6-digit OTP code sent to your phone.');
      return;
    }

    setLoading(true);
    try {
      await api.verifyInvitationOTP(token, cleanOtp);
      setStep('CREATE_PASSWORD');
      alertService.showSuccess('Phone Verified!', 'Your mobile number is verified. Now create your account password.');
    } catch (err: any) {
      setFormError(err.message || 'Invalid or expired OTP code.');
      alertService.showError('Verification Failed', err.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 -> Step 4: Create Password & Activate Account
  const handleActivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    try {
      await api.activateAccountWithInvitation(token, password);
      setStep('SUCCESS');
      alertService.showSuccess(
        'Account Activated!',
        'Your alumni account is now fully active. You can now log in with your mobile number.'
      );
    } catch (err: any) {
      setFormError(err.message || 'Failed to activate account. Please try again.');
      alertService.showError('Activation Failed', err.message || 'Account activation error.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Loading State
  if (validating) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-[#FFF7D6] border-2 border-[#F4C542] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-spin">
            <RefreshCw className="w-8 h-8 text-[#854D0E]" />
          </div>
          <h2 className="text-xl font-bold text-[#111111] mb-2">Validating Invitation...</h2>
          <p className="text-sm text-[#6B7280]">Please wait while we verify your invitation link.</p>
        </div>
      </div>
    );
  }

  // 2. Error State (Invalid / Expired Token)
  if (validationError || !tokenInfo?.valid) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white border border-[#FCA5A5] rounded-3xl p-6 sm:p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-[#FEE2E2] border-2 border-[#EF4444] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#B91C1C]">
            <AlertCircle className="w-8 h-8 text-[#DC2626]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111] mb-2">Invalid or Expired Link</h1>
          <p className="text-sm text-[#4B5563] mb-6 leading-relaxed">
            {validationError || 'This activation link has expired or has already been used to activate an account.'}
          </p>
          <div className="space-y-3">
            <Link to="/login">
              <Button variant="primary" fullWidth>
                Go to Alumni Login
              </Button>
            </Link>
            <Link to="/">
              <Button variant="secondary" fullWidth>
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-sans selection:bg-[#F4C542] selection:text-[#111111]">
      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-8 shadow-xl">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#FFF7D6] border-2 border-[#F4C542] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#854D0E]">
            {step === 'SUCCESS' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            ) : step === 'CREATE_PASSWORD' ? (
              <KeyRound className="w-8 h-8 text-[#854D0E]" />
            ) : (
              <UserCheck className="w-8 h-8 text-[#854D0E]" />
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111]">
            {step === 'SUCCESS'
              ? 'Account Activated!'
              : step === 'CREATE_PASSWORD'
              ? 'Create Account Password'
              : step === 'ENTER_OTP'
              ? 'Verify Your Mobile Phone'
              : `Welcome, ${tokenInfo.full_name}!`}
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            {tokenInfo.school_name || 'NHSS Alumni Network'} • Member Account Activation
          </p>
        </div>

        {/* Progress Tracker */}
        {step !== 'SUCCESS' && (
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'WELCOME' ? 'bg-[#F4C542] text-[#111111]' : 'bg-emerald-500 text-white'
              }`}>
                {step === 'WELCOME' ? '1' : '✓'}
              </div>
              <span className="text-[10px] text-[#6B7280] mt-1">Welcome</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${step !== 'WELCOME' ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'ENTER_OTP' ? 'bg-[#F4C542] text-[#111111]' : step === 'CREATE_PASSWORD' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step === 'CREATE_PASSWORD' ? '✓' : '2'}
              </div>
              <span className="text-[10px] text-[#6B7280] mt-1">OTP Verify</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${step === 'CREATE_PASSWORD' ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'CREATE_PASSWORD' ? 'bg-[#F4C542] text-[#111111]' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <span className="text-[10px] text-[#6B7280] mt-1">Password</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {formError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{formError}</span>
          </div>
        )}

        {/* STEP 1: WELCOME & PHONE CONFIRMATION */}
        {step === 'WELCOME' && (
          <div className="space-y-5">
            <div className="bg-[#FFFDF5] border border-[#F4C542]/40 rounded-2xl p-4 text-xs text-[#854D0E] leading-relaxed">
              <p className="font-semibold text-sm mb-1 text-[#713F12]">Alumni Pre-Registration</p>
              Your alumni member profile has been created by the school administrator. To activate your account and set your login password, please verify your registered mobile number via SMS OTP.
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <span className="text-xs text-gray-500 block mb-1">Registered Mobile Number</span>
              <div className="flex items-center gap-2 font-mono font-semibold text-gray-900 text-base">
                <Phone className="w-4 h-4 text-[#854D0E]" />
                <span>{tokenInfo.mobile || 'Registered Phone'}</span>
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">A 6-digit SMS verification code will be sent to this number.</span>
            </div>

            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={handleSendOTP}
              disabled={loading}
              className="mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending SMS OTP...
                </>
              ) : (
                <>
                  Send SMS Verification Code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* STEP 2: ENTER & VERIFY OTP */}
        {step === 'ENTER_OTP' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                6-Digit SMS Verification Code
              </label>
              <div className="relative">
                <Input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="font-mono text-center tracking-widest text-lg font-bold"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-[#6B7280] mt-1.5 text-center">
                OTP sent to <span className="font-semibold text-gray-800">{tokenInfo.mobile}</span> (Valid for 10 minutes)
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || otp.length !== 6}
              className="mt-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying OTP...
                </>
              ) : (
                <>
                  Verify OTP Code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={resendCooldown > 0 || loading}
                className="text-xs font-medium text-[#854D0E] hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {resendCooldown > 0
                  ? `Resend OTP code in ${resendCooldown}s`
                  : "Didn't receive code? Resend SMS OTP"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: CREATE PASSWORD */}
        {step === 'CREATE_PASSWORD' && (
          <form onSubmit={handleActivateAccount} className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Mobile verified! Now create a secure login password for your alumni account.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || password.length < 6 || password !== confirmPassword}
              className="mt-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Activating Account...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Create Password &amp; Activate Account
                </>
              )}
            </Button>
          </form>
        )}

        {/* STEP 4: SUCCESS CARD */}
        {step === 'SUCCESS' && (
          <div className="text-center space-y-5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 leading-relaxed text-left">
              <p className="font-semibold text-sm mb-1 text-emerald-900">Your account is ready!</p>
              Your phone number has been verified and your account password has been created. You can now access your alumni dashboard and connect with batchmates.
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 text-left">
              <span className="font-semibold block text-gray-800 mb-0.5">Your Login Credential:</span>
              Registered Mobile: <span className="font-mono font-semibold text-gray-900">{tokenInfo.mobile}</span>
            </div>

            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2"
            >
              Proceed to Alumni Login
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};
