import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { alertService } from '../../services/alertService';
import { ShieldCheck, Building2, User, Mail, Phone, Briefcase, MapPin, MessageSquare, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export const SchoolAdminRequest: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobilePrefix, setMobilePrefix] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [responsibility, setResponsibility] = useState('Principal');
  const [schoolName, setSchoolName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullMobile = `${mobilePrefix} ${mobileNumber}`.trim();

    if (!fullName || !email || !mobileNumber || !schoolName || !city || !state) {
      alertService.showError('Required Fields Missing', 'Please fill in all required fields marked with * to submit your request.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/public/school-admin-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          mobile: fullMobile,
          responsibility: responsibility,
          school_name: schoolName,
          city: city,
          state: state,
          country: country,
          message: message
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to submit enquiry request.');
      }

      setIsSuccess(true);
      alertService.showSuccess(
        'Request Submitted Successfully!',
        'Our platform engineering team will review your school details and contact you shortly with your admin access setup.'
      );
    } catch (err: any) {
      alertService.showError('Submission Error', err.message || 'An error occurred while submitting your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#F4C542] selection:text-[#111111]">
      <div className="max-w-2xl w-full mx-auto">
        {/* Back Link */}
        <Link
          to="/admin/login"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-500 hover:text-[#111111] transition-colors mb-6 uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to School Admin Login</span>
        </Link>

        {/* Form Container Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-10 shadow-xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF7D6] border border-[#F4C542] flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-8 h-8 text-[#854D0E]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
              Request School Admin Access
            </h2>
            <p className="text-sm text-gray-600 font-normal max-w-md mx-auto leading-relaxed">
              Tell us about your school and we'll help you set up your official alumni platform.
            </p>
          </div>

          {isSuccess ? (
            <div className="p-8 bg-[#FFF7D6] border border-[#F4C542] rounded-2xl text-center space-y-4 animate-fadeIn">
              <CheckCircle2 className="w-12 h-12 text-[#854D0E] mx-auto" />
              <h3 className="text-xl font-bold text-[#111111]">Enquiry Received!</h3>
              <p className="text-sm text-gray-800 leading-relaxed font-normal">
                Thank you, <strong>{fullName}</strong>. We have received your request for <strong>{schoolName}</strong>. Our developer platform team will verify your details and email your access credentials.
              </p>
              <div className="pt-2">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#111111] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  Return to Admin Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* SECTION 1: YOUR DETAILS */}
              <div className="space-y-4">
                <div className="border-b border-[#E5E7EB] pb-2 flex items-center space-x-2">
                  <User className="w-4 h-4 text-[#854D0E]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    1. Your Personal Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] focus:ring-2 focus:ring-[#F4C542]/20 transition-all font-normal"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="principal@school.edu.in"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] focus:ring-2 focus:ring-[#F4C542]/20 transition-all font-normal"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={mobilePrefix}
                        onChange={(e) => setMobilePrefix(e.target.value)}
                        className="px-3 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-xs font-semibold text-gray-700 focus:bg-white focus:border-[#F4C542]"
                      >
                        <option value="+91">+91 (IN)</option>
                        <option value="+1">+1 (US)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+971">+971 (UAE)</option>
                        <option value="+65">+65 (SG)</option>
                      </select>
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="9876543210"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] focus:ring-2 focus:ring-[#F4C542]/20 transition-all font-normal"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Your Responsibility */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Your Responsibility <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        required
                        value={responsibility}
                        onChange={(e) => setResponsibility(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] focus:ring-2 focus:ring-[#F4C542]/20 transition-all font-normal appearance-none"
                      >
                        <option value="Principal">Principal</option>
                        <option value="Alumni Coordinator">Alumni Coordinator</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: SCHOOL DETAILS */}
              <div className="space-y-4">
                <div className="border-b border-[#E5E7EB] pb-2 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-[#854D0E]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    2. School Details
                  </h3>
                </div>

                {/* School Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    School Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. St. Xavier Higher Secondary School"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] focus:ring-2 focus:ring-[#F4C542]/20 transition-all font-normal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Madurai"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] transition-all font-normal"
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Tamil Nadu"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] transition-all font-normal"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="India"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] transition-all font-normal"
                    />
                  </div>
                </div>

                {/* Additional Message */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Additional Details / Message
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share total estimated alumni count or specific requirements..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-sm text-[#111111] focus:bg-white focus:border-[#F4C542] transition-all font-normal"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 border border-[#111111] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#F4C542]" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 font-normal">
                  Already have an approved account?{' '}
                  <Link to="/admin/login" className="text-[#854D0E] font-semibold hover:underline">
                    Sign in to School Admin Portal
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
