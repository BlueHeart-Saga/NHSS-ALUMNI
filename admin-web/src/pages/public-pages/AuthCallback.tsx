import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Loader2 } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const photo = searchParams.get('photo');
    const registrationRequired = searchParams.get('registration_required') === 'true';
    const resumeStep = parseInt(searchParams.get('resume_step') || '3', 10);
    const error = searchParams.get('error');

    if (error) {
      alertService.showError('Authentication Failed', decodeURIComponent(error));
      navigate('/login');
      return;
    }

    if (token) {
      api.setToken(token);
      alertService.showSuccess('Google Sign In Successful', `Welcome back, ${name || email || 'Alumni'}!`);
      
      if (registrationRequired) {
        navigate('/register', {
          state: {
            email: email,
            fullName: name,
            profilePhotoUrl: photo,
            resumeStep: resumeStep,
            isGoogleAuth: true
          }
        });
      } else {
        navigate('/alumni');
      }
    } else {
      alertService.showError('Authentication Failed', 'No access token received from Google authentication.');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-lg max-w-md w-full text-center space-y-4">
        <Loader2 className="w-12 h-12 text-[#F4C542] animate-spin mx-auto" />
        <h2 className="text-xl font-normal text-[#111111] tracking-tight">Authenticating with Google...</h2>
        <p className="text-sm text-gray-500 font-normal">
          Please wait while we verify your account credentials and complete your sign in.
        </p>
      </div>
    </div>
  );
};
