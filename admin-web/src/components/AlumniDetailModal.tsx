import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Droplet, HandHeart,
  Heart, ShieldCheck, Calendar, Lock, ExternalLink, MessageCircle, UserPlus, CheckCircle2, Clock, Building2, UserCheck
} from 'lucide-react';
import { AlumniProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { formatDateDDMMYYYY } from '../utils/dateUtils';

interface AlumniDetailModalProps {
  alumni: AlumniProfile | null;
  onClose: () => void;
  isOwnAccount?: boolean;
  connectionStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | string;
  onConnectClick?: (alumni: AlumniProfile) => void;
}

export const AlumniDetailModal: React.FC<AlumniDetailModalProps> = ({
  alumni,
  onClose,
  isOwnAccount = false,
  connectionStatus = 'NONE',
  onConnectClick
}) => {
  const { t, language } = useLanguage();

  useEffect(() => {
    if (!alumni) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [alumni]);

  if (!alumni) return null;

  // Enforce Privacy Rules:
  // 1. Phone number is shown ONLY if phone_visible === true OR if viewing own profile
  const canSeePhone = Boolean(isOwnAccount || alumni.phone_visible === true);
  // 2. Email is shown ONLY if email_visible !== false OR if viewing own profile
  const canSeeEmail = Boolean(isOwnAccount || alumni.email_visible !== false);

  // Format WhatsApp Link
  const rawWhatsapp = alumni.whatsapp_number || (canSeePhone ? alumni.mobile : '');
  const cleanWhatsapp = rawWhatsapp ? rawWhatsapp.replace(/[^0-9]/g, '') : '';
  const whatsappUrl = cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}` : null;

  // Format DoB
  const dobValue = alumni.dob || alumni.date_of_birth;
  const formattedDob = dobValue ? formatDateDDMMYYYY(dobValue) : null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl my-auto max-h-[90vh] overflow-y-auto scrollbar-thin text-xs text-[#111111]" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-gray-400 hover:text-[#111111] p-1.5 rounded-full hover:bg-gray-100 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Banner & Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-5 border-b border-gray-100 pb-5 text-center sm:text-left">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FFF7D6] border-2 border-[#F4C542] overflow-hidden flex items-center justify-center shrink-0 shadow-md">
              {alumni.profile_photo_url ? (
                <img src={alumni.profile_photo_url} alt={alumni.full_name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-[#854D0E]" />
              )}
            </div>
            {isOwnAccount && (
              <span className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-white">
                YOU
              </span>
            )}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="font-extrabold text-lg sm:text-xl text-[#111111] truncate">{alumni.full_name}</h3>
              <span className="inline-block font-extrabold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3 py-1 rounded-full text-xs self-center sm:self-auto shadow-2xs">
                Class of {alumni.passing_year}
              </span>
            </div>

            {(alumni.name_ta || alumni.full_name_ta) && (
              <p className="text-xs text-gray-500 font-serif font-semibold">{alumni.name_ta || alumni.full_name_ta}</p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
              <span className="inline-flex items-center space-x-1 font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px]">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>VERIFIED ALUMNUS</span>
              </span>

              {alumni.blood_group && (
                <span className="inline-flex items-center space-x-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px]">
                  <Droplet className="w-3 h-3 fill-rose-600 text-rose-600 shrink-0" />
                  <span>{alumni.blood_group}</span>
                </span>
              )}

              {alumni.is_volunteer === 'YES' && (
                <span className="inline-flex items-center space-x-1 font-extrabold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px]">
                  <HandHeart className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span>VOLUNTEER</span>
                </span>
              )}

              {alumni.willing_to_donate === 'YES' && (
                <span className="inline-flex items-center space-x-1 font-extrabold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-2.5 py-0.5 rounded-full text-[10px]">
                  <Heart className="w-3 h-3 fill-[#854D0E] shrink-0" />
                  <span>DONOR</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Academic Roster Details Card */}
        <div className="bg-[#FAFAFA] border border-gray-200 rounded-2xl p-4 text-xs space-y-2">
          <div className="font-extrabold text-[#854D0E] uppercase tracking-wider text-[11px] flex items-center">
            <GraduationCap className="w-4 h-4 mr-1.5 text-[#854D0E]" />
            <span>Academic Identity</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-gray-700">
            <div>
              <span className="text-gray-400 block text-[10px]">Passing Year</span>
              <span className="font-bold text-[#111111]">{alumni.passing_year || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Leaving Class</span>
              <span className="font-bold text-[#111111]">{alumni.leaving_class || '10th Standard'}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Section</span>
              <span className="font-bold text-[#111111]">{alumni.section || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Roll Number</span>
              <span className="font-bold text-[#111111]">{alumni.roll_no || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SECTION 1: CONTACT INFORMATION */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-2xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-700" />
              <span>Contact Information</span>
            </h4>

            <div className="space-y-2 text-xs">
              {/* Phone */}
              <div>
                <span className="text-gray-400 block text-[10px]">Phone Number</span>
                {canSeePhone ? (
                  <a href={`tel:${alumni.mobile}`} className="font-bold text-[#111111] hover:text-amber-800 flex items-center space-x-1 mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{alumni.mobile}</span>
                  </a>
                ) : (
                  <span className="font-semibold text-gray-400 italic flex items-center space-x-1 mt-0.5">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Private (Hidden by alumnus)</span>
                  </span>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <span className="text-gray-400 block text-[10px]">WhatsApp Number</span>
                {canSeePhone ? (
                  alumni.whatsapp_number || alumni.mobile ? (
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="font-bold text-[#111111]">{alumni.whatsapp_number || alumni.mobile}</span>
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Chat</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )
                ) : (
                  <span className="font-semibold text-gray-400 italic flex items-center space-x-1 mt-0.5">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Private (Hidden)</span>
                  </span>
                )}
              </div>

              {/* Email */}
              <div>
                <span className="text-gray-400 block text-[10px]">Email Address</span>
                {canSeeEmail ? (
                  alumni.email ? (
                    <a href={`mailto:${alumni.email}`} className="font-bold text-[#111111] hover:text-amber-800 flex items-center space-x-1 mt-0.5 truncate">
                      <Mail className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span className="truncate">{alumni.email}</span>
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )
                ) : (
                  <span className="font-semibold text-gray-400 italic flex items-center space-x-1 mt-0.5">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Private (Hidden by alumnus)</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: PERSONAL & FAMILY DETAILS */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-2xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-700" />
              <span>Personal & Family Details</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">Date of Birth</span>
                <span className="font-bold text-[#111111]">{formattedDob || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Gender</span>
                <span className="font-bold text-[#111111] uppercase">{alumni.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Father's Name</span>
                <span className="font-bold text-[#111111]">{alumni.father_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Mother's Name</span>
                <span className="font-bold text-[#111111]">{alumni.mother_name || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: ADDRESS & LOCATION */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-2xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-700" />
              <span>Address & Native Location</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">Current Location</span>
                <span className="font-bold text-[#111111]">
                  {alumni.current_city ? `${alumni.current_city}${alumni.state || alumni.current_state ? `, ${alumni.state || alumni.current_state}` : ''}${alumni.country ? `, ${alumni.country}` : ''}` : 'N/A'}
                </span>
              </div>
              {alumni.address && (
                <div>
                  <span className="text-gray-400 block text-[10px]">Residential Address</span>
                  <span className="font-medium text-gray-700 leading-relaxed block">{alumni.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: EMPLOYMENT & HIGHER EDUCATION */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-2xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-700" />
              <span>Employment & Education</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">Employment Status</span>
                <span className="font-bold text-[#111111]">{alumni.employment_status || 'Employed / Active'}</span>
              </div>
              {(alumni.profession || alumni.company) && (
                <div>
                  <span className="text-gray-400 block text-[10px]">Profession & Company</span>
                  <span className="font-bold text-[#111111]">
                    {alumni.profession} {alumni.company ? `@ ${alumni.company}` : ''}
                  </span>
                </div>
              )}
              {alumni.college_name && (
                <div>
                  <span className="text-gray-400 block text-[10px]">Higher Education</span>
                  <span className="font-bold text-[#111111]">
                    {alumni.degree ? `${alumni.degree} - ` : ''}{alumni.college_name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        {(alumni.linkedin_url || alumni.instagram_url) && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
            {alumni.linkedin_url && (
              <a
                href={alumni.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0A66C2] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all shadow-2xs"
              >
                <span>LinkedIn Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {alumni.instagram_url && (
              <a
                href={alumni.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all shadow-2xs"
              >
                <span>Instagram Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-gray-200">
          {isOwnAccount ? (
            <div className="w-full py-3 bg-gray-100 border border-gray-300 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-default">
              <UserCheck className="w-4 h-4 text-gray-500" />
              <span>This is your own profile</span>
            </div>
          ) : connectionStatus === 'ACCEPTED' ? (
            <div className="w-full py-3 bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-default">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Connected Friend</span>
            </div>
          ) : connectionStatus === 'PENDING' ? (
            <div className="w-full py-3 bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-default">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Connection Request Sent (Pending Approval)</span>
            </div>
          ) : (
            onConnectClick && (
              <button
                type="button"
                onClick={() => {
                  onConnectClick(alumni);
                  onClose();
                }}
                className="w-full py-3 bg-[#111111] text-[#F4C542] hover:bg-black rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#F4C542]" />
                <span>Connect with Alumnus</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
