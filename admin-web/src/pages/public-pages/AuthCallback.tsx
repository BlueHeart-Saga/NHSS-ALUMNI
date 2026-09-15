import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Loader2, Phone, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { getRedirectPathForRoles } from '../../utils/roleRedirect';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileInput, setMobileInput] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<{ path: string; state?: any } | null>(null);

  const [authDetails, setAuthDetails] = useState<{
    email: string;
    name: string;
    photo: string;
  }>({ email: '', name: '', photo: '' });

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email') || '';
    const name = searchParams.get('name') || '';
    const photo = searchParams.get('photo') || '';
    const registrationRequired = searchParams.get('registration_required') === 'true';
    const resumeStep = parseInt(searchParams.get('resume_step') || '2', 10);
    const error = searchParams.get('error');

    setAuthDetails({ email, name, photo });

    if (error) {
      alertService.showError('Authentication Failed', decodeURIComponent(error));
      navigate('/login');
      return;
    }

    if (!token) {
      alertService.showError('Authentication Failed', 'No access token received from Google authentication.');
      navigate('/login');
      return;
    }

    api.setToken(token);

    api.getMe()
      .then((u) => {
        const targetPath = getRedirectPathForRoles(u.roles, registrationRequired);
        const nextState = {
          email: email || u.email,
          fullName: name || u.full_name,
          profilePhotoUrl: photo || u.profile_photo_url,
          resumeStep: resumeStep,
          isGoogleAuth: true
        };

        // If user does not have a mobile number registered yet, prompt modal to gather mobile number
        if (!u.mobile) {
          setLoading(false);
          setPendingTarget({ path: targetPath, state: nextState });
          setShowMobileModal(true);
        } else {
          alertService.showSuccess('Google Sign In Successful', `Welcome back, ${u.full_name || name || 'User'}!`);
          if (targetPath === '/register') {
            navigate('/register', { state: { ...nextState, mobile: u.mobile } });
          } else {
            navigate(targetPath);
          }
        }
      })
      .catch(() => {
        // Fallback if getMe encounters error
        const targetPath = registrationRequired ? '/register' : '/alumni';
        setLoading(false);
        setPendingTarget({
          path: targetPath,
          state: {
            email,
            fullName: name,
            profilePhotoUrl: photo,
            resumeStep,
            isGoogleAuth: true
          }
        });
        setShowMobileModal(true);
      });
  }, [searchParams, navigate]);

  const handleLinkMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = mobileInput.replace(/\D/g, '');
    if (cleanDigits.length !== 10 || !['6', '7', '8', '9'].includes(cleanDigits[0])) {
      setMobileError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    setMobileError('');
    setLinkingLoading(true);

    try {
      await api.linkMobile(cleanDigits);
      alertService.showSuccess('Mobile Linked', 'Your mobile number has been registered successfully.');
      setShowMobileModal(false);

      if (pendingTarget) {
        if (pendingTarget.path === '/register') {
          navigate('/register', {
            state: {
              ...pendingTarget.state,
              mobile: cleanDigits
            }
          });
        } else {
          navigate(pendingTarget.path);
        }
      } else {
        navigate('/alumni');
      }
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to link mobile number.');
    } finally {
      setLinkingLoading(false);
    }
  };

  const handleSkipMobile = () => {
    setShowMobileModal(false);
    if (pendingTarget) {
      navigate(pendingTarget.path, { state: pendingTarget.state });
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
      {loading && !showMobileModal && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-8 shadow-lg max-w-md w-full text-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#F4C542] animate-spin mx-auto" />
          <h2 className="text-xl font-normal text-[#111111] tracking-tight">Authenticating with Google...</h2>
          <p className="text-sm text-gray-500 font-normal">
            Please wait while we verify your account credentials and complete your sign in.
          </p>
        </div>
      )}

      {/* Google Auth Mobile Number Prompt Modal */}
      <Modal
        isOpen={showMobileModal}
        onClose={handleSkipMobile}
        title="Complete Account Setup"
      >
        <div className="space-y-4">
          {/* User Google profile info preview */}
          <div className="flex items-center gap-3 p-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl">
            <img
              src={authDetails.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(authDetails.name || 'User')}&background=F4C542&color=111111`}
              alt={authDetails.name}
              className="w-12 h-12 rounded-full border border-[#E5E7EB] object-cover shrink-0 shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[#111111] truncate">{authDetails.name || 'Google User'}</div>
              <div className="text-xs text-[#6B7280] truncate">{authDetails.email}</div>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/50 px-2 py-0.5 rounded-full">
              <span>Google</span>
            </div>
          </div>

          <div className="text-xs text-[#6B7280] leading-relaxed">
            NHSS Alumni uses mobile numbers as the primary identity for SMS OTP verification, cohort updates, and get-together invitations. Please enter your mobile number.
          </div>

          <form onSubmit={handleLinkMobileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Mobile Number (இந்தியா) <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-[#111111] border-r border-[#E5E7EB] pr-2 pointer-events-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setMobileInput(val);
                    if (mobileError) setMobileError('');
                  }}
                  placeholder="98765 43210"
                  className="w-full pl-16 pr-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-semibold tracking-wider text-[#111111] focus:outline-none focus:border-[#F4C542] focus:ring-1 focus:ring-[#F4C542]"
                  autoFocus
                  required
                />
              </div>
              {mobileError && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{mobileError}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={handleSkipMobile}
                className="text-xs text-[#6B7280] hover:text-[#111111] underline cursor-pointer"
              >
                Set up later
              </button>
              <Button type="submit" disabled={linkingLoading || mobileInput.length < 10}>
                {linkingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Link Mobile & Continue</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
