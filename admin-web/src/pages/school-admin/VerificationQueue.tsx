import React, { useEffect, useState } from 'react';
import {
  UserCheck, Check, X, ShieldAlert, Sparkles, MessageSquare, AlertCircle, RefreshCw, Info,
  Phone, Mail, MapPin, GraduationCap, Building2, Briefcase, Globe, Heart, HeartHandshake, FileText, User
} from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState, TableSkeleton } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { AlumniProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const VerificationQueue: React.FC = () => {
  const { t, language } = useLanguage();
  const [queueList, setQueueList] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'RE_REQUEST' | 'PENDING' | 'REJECTED'>('ALL');

  // Decision Modal State (Approve/Reject confirmation)
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Full Details View Modal State ('i' icon button click)
  const [viewingAlumni, setViewingAlumni] = useState<AlumniProfile | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingVerifications();
      setQueueList(data);
    } catch (err) {
      console.error('Failed to fetch verification queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumni || !reviewAction) return;

    setActionLoading(true);
    try {
      await api.verifyAlumni(selectedAlumni.id, reviewAction, notes);

      const isApproved = reviewAction === 'APPROVED';
      alertService.showSuccess(
        isApproved
          ? t('admin_verify_alert_approved_title')
          : t('admin_verify_alert_rejected_title'),
        (isApproved
          ? t('admin_verify_alert_approved_body')
          : t('admin_verify_alert_rejected_body')
        ).replace('{name}', selectedAlumni.full_name)
      );

      setSelectedAlumni(null);
      setReviewAction(null);
      setNotes('');
      if (viewingAlumni && viewingAlumni.id === selectedAlumni.id) {
        setViewingAlumni(null);
      }
      fetchQueue();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_verify_alert_error'));
    } finally {
      setActionLoading(false);
    }
  };

  const reRequestCount = queueList.filter((item) => item.is_rerequest).length;
  const pendingCount = queueList.filter((item) => item.verification_status === 'PENDING').length;
  const rejectedCount = queueList.filter((item) => item.verification_status === 'REJECTED').length;

  const filteredQueue = queueList.filter((item) => {
    if (activeTab === 'RE_REQUEST') return Boolean(item.is_rerequest);
    if (activeTab === 'PENDING') return item.verification_status === 'PENDING';
    if (activeTab === 'REJECTED') return item.verification_status === 'REJECTED';
    return true;
  });

  if (loading) return <TableSkeleton rows={6} />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">{t('admin_verify_page_title')}</h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">{t('admin_verify_page_subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={fetchQueue}
          disabled={loading}
          className="px-3.5 py-2 bg-white border border-gray-200 hover:border-[#111111] rounded-xl text-xs font-bold text-gray-700 hover:text-[#111111] flex items-center space-x-1.5 transition-all shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{language === 'ta' ? 'புதுப்பிக்குக' : 'Refresh Queue'}</span>
        </button>
      </div>

      {/* Filter Tabs Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'ALL'
              ? 'bg-[#111111] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span>{language === 'ta' ? 'அனைத்து விண்ணப்பங்களும்' : 'All Queue'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-200 text-gray-800 font-bold ml-1">
            {queueList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RE_REQUEST')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'RE_REQUEST'
              ? 'bg-[#F4C542] text-[#111111] ring-2 ring-[#F4C542]/50 shadow-xs'
              : 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{language === 'ta' ? 'மீண்டும் விண்ணப்பித்தவை' : 'Re-Requested'}</span>
          {reRequestCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-black animate-pulse ml-1">
              {reRequestCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'PENDING'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span>{language === 'ta' ? 'நிலுவையில் உள்ளவை' : 'Pending Review'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold ml-1">
            {pendingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REJECTED')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'REJECTED'
              ? 'bg-gray-600 text-white shadow-xs'
              : 'bg-gray-100 border border-gray-300 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <span>{language === 'ta' ? 'முந்தைய நிராகரிப்புகள் (Old Data)' : 'Previously Rejected'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-200 text-gray-700 font-bold ml-1">
            {rejectedCount}
          </span>
        </button>
      </div>

      {/* Grid Container */}
      {filteredQueue.length === 0 ? (
        <EmptyState
          title={t('admin_verify_empty_title')}
          description={t('admin_verify_empty_desc')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQueue.map((item) => {
            const isReRequest = Boolean(item.is_rerequest);
            const isRejected = item.verification_status === 'REJECTED';

            return (
              <div
                key={item.id}
                className={`rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all ${
                  isReRequest
                    ? 'bg-gradient-to-b from-amber-50/50 to-white border-2 border-amber-400 ring-4 ring-amber-300/20 shadow-md'
                    : isRejected
                    ? 'bg-gray-50/90 border-2 border-gray-300 text-gray-600 opacity-90'
                    : 'bg-white border border-[#E5E7EB] hover:border-[#F4C542]'
                }`}
              >
                <div>
                  {/* Top Header Card Info with 'i' Details Button */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={item.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.full_name || 'Alumni')}&background=F3F4F6&color=111827`}
                        alt=""
                        className="w-12 h-12 rounded-full border border-[#E5E7EB] object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className={`font-bold text-base truncate ${isRejected ? 'text-gray-700' : 'text-[#111111]'}`}>
                          {item.full_name}
                        </h3>
                        <span className="text-xs text-gray-500 font-medium block">
                          Batch of {item.passing_year}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                      <div className="flex items-center space-x-1.5">
                        {/* 'i' Info Button to open full alumni information modal */}
                        <button
                          type="button"
                          onClick={() => setViewingAlumni(item)}
                          className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 shadow-2xs"
                          title={language === 'ta' ? 'முழு விவரங்களை அணுகிப் பார்க்க' : 'View All Alumni Details Information'}
                          aria-label="View Full Alumni Details"
                        >
                          <Info className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="text-[10px] font-extrabold text-amber-900 hidden sm:inline">
                            {language === 'ta' ? 'விவரங்கள்' : 'Details'}
                          </span>
                        </button>
                        <Badge status={item.verification_status} />
                      </div>

                      {isReRequest && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-2xs animate-pulse">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Re-Requested #{item.rerequest_count || 1}
                        </span>
                      )}
                      {isRejected && (
                        <span className="bg-gray-200 text-gray-700 border border-gray-300 font-extrabold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider">
                          Old Data
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Re-request Note Banner Box */}
                  {isReRequest && (
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 rounded-xl p-3 mb-3 text-xs text-amber-950 flex items-start space-x-2 shadow-2xs">
                      <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-extrabold text-[11px] text-amber-900 flex items-center gap-1 uppercase tracking-wider">
                          {language === 'ta'
                            ? `மீண்டும் சரிபார்ப்பு காரணம் (முயற்சி #${item.rerequest_count || 1}):`
                            : `Re-Verification Request Reason (Attempt #${item.rerequest_count || 1}):`}
                        </div>
                        <p className="text-[11px] text-amber-900 mt-0.5 font-medium leading-relaxed">
                          "{item.rerequest_note || 'Alumnus requested re-verification review of registration profile.'}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason Notice Box (For Old Data / Rejected items) */}
                  {isRejected && (
                    <div className="bg-gray-100 border border-gray-300 rounded-xl p-3 mb-3 text-xs text-gray-700 flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[11px] text-gray-800 uppercase tracking-wider">
                          {language === 'ta' ? 'முந்தைய நிராகரிப்பு காரணம்:' : 'Previous Rejection Reason:'}
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5 font-normal">
                          "{item.rejection_reason || item.verification_notes || 'Details did not match school records.'}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Last Support Contact Message Box */}
                  {item.last_contact_message && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 text-xs text-blue-950">
                      <div className="font-bold text-[11px] text-blue-900 flex items-center gap-1.5 mb-0.5">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span>Support Query: {item.last_contact_subject || 'Registration Help'}</span>
                      </div>
                      <p className="text-[11px] text-blue-800 font-normal">"{item.last_contact_message}"</p>
                    </div>
                  )}

                  {/* Detail Overview Card */}
                  <div className={`space-y-2 text-xs p-3 rounded-xl mb-4 border ${isRejected ? 'bg-gray-100/60 border-gray-200' : 'bg-[#FAFAFA] border-[#E5E7EB]'}`}>
                    <div>
                      <span className="text-[#6B7280]">{t('admin_verify_label_mobile')}</span>{' '}
                      <strong className="text-[#111111]">{item.mobile}</strong>
                    </div>
                    <div>
                      <span className="text-[#6B7280]">{t('admin_verify_label_email')}</span>{' '}
                      <strong className="text-[#111111]">{item.email}</strong>
                    </div>
                    {item.current_city && (
                      <div>
                        <span className="text-[#6B7280]">{t('admin_verify_label_city')}</span>{' '}
                        <strong className="text-[#111111]">{item.current_city}</strong>
                      </div>
                    )}
                    {item.profession && (
                      <div>
                        <span className="text-[#6B7280]">{t('admin_verify_label_profession')}</span>{' '}
                        <strong className="text-[#111111]">{item.profession}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-[#E5E7EB]">
                  <Button
                    className="flex-1 w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white font-extrabold"
                    onClick={() => {
                      setSelectedAlumni(item);
                      setReviewAction('APPROVED');
                      setNotes(t('admin_verify_default_approve_note'));
                    }}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {isRejected
                      ? (language === 'ta' ? 'மீண்டும் சரிபார்த்து அனுமதி' : 'Re-Evaluate & Approve')
                      : t('admin_verify_btn_approve')}
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-rose-600 hover:bg-rose-50 border-rose-200 w-full sm:w-auto"
                    onClick={() => {
                      setSelectedAlumni(item);
                      setReviewAction('REJECTED');
                      setNotes(t('admin_verify_default_reject_note'));
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    {t('admin_verify_btn_reject')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ====================================================== */}
      {/* 1. FULL ALUMNI DETAILS INFORMATION MODAL ('i' icon click) */}
      {/* ====================================================== */}
      <Modal
        isOpen={Boolean(viewingAlumni)}
        onClose={() => setViewingAlumni(null)}
        title={language === 'ta' ? 'முன்னாள் மாணவர் முழு சுயவிவர விவரங்கள்' : 'Full Alumni Member Profile & Registration Details'}
      >
        {viewingAlumni && (
          <div className="space-y-5 text-xs max-h-[80vh] overflow-y-auto pr-1">
            {/* Header Profile Card */}
            <div className="flex items-center gap-4 bg-[#FAFAFA] border border-[#E5E7EB] p-4 rounded-2xl">
              <img
                src={viewingAlumni.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewingAlumni.full_name || 'Alumni')}&background=F4C542&color=111111`}
                alt={viewingAlumni.full_name}
                className="w-16 h-16 rounded-full border border-[#E5E7EB] object-cover shrink-0 shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-extrabold text-[#111111] truncate">{viewingAlumni.full_name}</h4>
                  {viewingAlumni.name_ta && (
                    <span className="text-xs text-gray-600 font-semibold">({viewingAlumni.name_ta})</span>
                  )}
                  <Badge status={viewingAlumni.verification_status} />
                  {viewingAlumni.is_rerequest && (
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Re-Requested
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">
                  Batch of {viewingAlumni.passing_year} • {viewingAlumni.school_name || 'NHS School'}
                </div>
                {viewingAlumni.profession && (
                  <div className="text-xs text-[#854D0E] font-semibold mt-1">
                    💼 {viewingAlumni.profession} {viewingAlumni.company ? `at ${viewingAlumni.company}` : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Re-request Note Banner Box */}
            {viewingAlumni.is_rerequest && (
              <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-950 flex items-start space-x-2 shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-xs text-amber-900 uppercase tracking-wider">
                    {language === 'ta'
                      ? `மீண்டும் சரிபார்ப்பு கோரிக்கை காரணம் (முயற்சி #${viewingAlumni.rerequest_count || 1}):`
                      : `Re-Verification Request Reason (Attempt #${viewingAlumni.rerequest_count || 1}):`}
                  </div>
                  <p className="text-xs text-amber-900 mt-1 font-medium leading-relaxed">
                    "{viewingAlumni.rerequest_note || 'Applicant requested re-verification review of registration profile.'}"
                  </p>
                </div>
              </div>
            )}

            {/* Rejection Reason Notice Box (If Previously Rejected) */}
            {viewingAlumni.verification_status === 'REJECTED' && (
              <div className="bg-gray-100 border border-gray-300 rounded-2xl p-3.5 text-xs text-gray-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">
                    {language === 'ta' ? 'முந்தைய நிராகரிப்பு காரணம்:' : 'Previous Rejection Reason:'}
                  </div>
                  <p className="text-xs text-gray-700 mt-1 font-normal">
                    "{viewingAlumni.rejection_reason || viewingAlumni.verification_notes || 'Registration details did not match official school records.'}"
                  </p>
                </div>
              </div>
            )}

            {/* 1. Contact & Personal Details */}
            <div className="border border-[#E5E7EB] rounded-2xl p-4 space-y-3 bg-white shadow-2xs">
              <div className="font-extrabold text-xs uppercase tracking-wider text-[#854D0E] flex items-center gap-2 border-b border-gray-100 pb-2">
                <User className="w-4 h-4 text-[#854D0E]" />
                <span>{language === 'ta' ? '1. தொடர்புகொள்ளும் & தனிப்பட்ட விவரங்கள்' : '1. Contact & Personal Information'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'கைபேசி எண்:' : 'Mobile Phone:'}</span>
                  <div className="font-semibold text-[#111111]">{viewingAlumni.mobile || '—'}</div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'மின்னஞ்சல் முகவரி:' : 'Email Address:'}</span>
                  <div className="font-semibold text-[#111111] truncate">{viewingAlumni.email || '—'}</div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'பாலினம்:' : 'Gender:'}</span>
                  <div className="font-semibold text-[#111111]">{viewingAlumni.gender || '—'}</div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'பிறந்த தேதி:' : 'Date of Birth:'}</span>
                  <div className="font-semibold text-[#111111]">{viewingAlumni.dob || viewingAlumni.date_of_birth || '—'}</div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'இரத்த வகை:' : 'Blood Group:'}</span>
                  <div className="font-semibold text-[#111111]">{viewingAlumni.blood_group || '—'}</div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'தந்தை / தாய் பெயர்:' : 'Parent Names:'}</span>
                  <div className="font-semibold text-[#111111]">
                    {viewingAlumni.father_name ? `F: ${viewingAlumni.father_name}` : ''} {viewingAlumni.mother_name ? `| M: ${viewingAlumni.mother_name}` : ''} {!viewingAlumni.father_name && !viewingAlumni.mother_name ? '—' : ''}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'தற்போதைய நகரம் & மாநிலம்:' : 'Current City & State:'}</span>
                  <div className="font-semibold text-[#111111]">
                    {viewingAlumni.current_city || 'N/A'}, {viewingAlumni.current_state || viewingAlumni.state || 'N/A'} ({viewingAlumni.country || 'India'})
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'முழு முகவரி:' : 'Full Address:'}</span>
                  <div className="font-semibold text-[#111111]">{viewingAlumni.address || '—'}</div>
                </div>
              </div>
            </div>

            {/* 2. School Education Details */}
            <div className="border border-[#E5E7EB] rounded-2xl p-4 space-y-3 bg-white shadow-2xs">
              <div className="font-extrabold text-xs uppercase tracking-wider text-[#854D0E] flex items-center gap-2 border-b border-gray-100 pb-2">
                <GraduationCap className="w-4 h-4 text-[#854D0E]" />
                <span>{language === 'ta' ? '2. பள்ளி கல்வி వివరங்கள்' : '2. School Education Details'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'பள்ளியின் பெயர்:' : 'School Name:'}</span>
                  <div className="font-semibold text-[#111111]">{viewingAlumni.school_name || 'NHS School'}</div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'படித்த தொகுதி ஆண்டு (10th Batch):' : 'Alumni Batch Year (10th):'}</span>
                  <div className="font-bold text-[#854D0E]">Batch of {viewingAlumni.passing_year || 2010}</div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'சேர்ந்த ஆண்டு:' : 'Joining / Admission Year:'}</span>
                  <div className="font-semibold text-[#111111]">{viewingAlumni.joining_year || viewingAlumni.admission_year || '—'}</div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'வெளியேறிய வகுப்பு:' : 'Leaving Class:'}</span>
                  <div className="font-semibold text-[#111111]">{viewingAlumni.leaving_class || '10th'} Standard</div>
                </div>
              </div>
            </div>

            {/* 3. Higher Education Details */}
            <div className="border border-[#E5E7EB] rounded-2xl p-4 space-y-3 bg-white shadow-2xs">
              <div className="font-extrabold text-xs uppercase tracking-wider text-[#854D0E] flex items-center gap-2 border-b border-gray-100 pb-2">
                <Building2 className="w-4 h-4 text-[#854D0E]" />
                <span>{language === 'ta' ? '3. உயர் கல்வி விவரங்கள்' : '3. Higher Education Details'}</span>
              </div>
              {viewingAlumni.no_higher_education === 'YES' || viewingAlumni.no_higher_education === 'true' ? (
                <div className="p-3 bg-gray-50 rounded-xl text-gray-600 font-medium">
                  {language === 'ta' ? 'உயர் கல்வி பயிலவில்லை (No Higher Education)' : 'Did not pursue Higher Education.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'கல்லூரி பெயர்:' : 'College / Institution:'}</span>
                    <div className="font-semibold text-[#111111]">{viewingAlumni.college_name || viewingAlumni.institution_name || '—'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'பட்டப்படிப்பு & துறை:' : 'Degree & Stream:'}</span>
                    <div className="font-semibold text-[#111111]">
                      {viewingAlumni.degree || viewingAlumni.custom_degree || '—'} {viewingAlumni.stream || viewingAlumni.department ? `(${viewingAlumni.stream || viewingAlumni.department})` : ''}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'கல்லூரி காலம்:' : 'College Duration:'}</span>
                    <div className="font-semibold text-[#111111]">
                      {viewingAlumni.college_joining_year || '—'} - {viewingAlumni.college_passing_year || '—'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Professional Career & Contact Links */}
            <div className="border border-[#E5E7EB] rounded-2xl p-4 space-y-3 bg-white shadow-2xs">
              <div className="font-extrabold text-xs uppercase tracking-wider text-[#854D0E] flex items-center gap-2 border-b border-gray-100 pb-2">
                <Briefcase className="w-4 h-4 text-[#854D0E]" />
                <span>{language === 'ta' ? '4. தொழில் / பணி விவரங்கள்' : '4. Professional Details'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'பணி நிலை:' : 'Employment Status:'}</span>
                  <div className="font-semibold text-[#111111]">{viewingAlumni.employment_status || '—'}</div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'நிறுவனம் / தொழில்:' : 'Company / Organization:'}</span>
                  <div className="font-semibold text-[#111111]">{viewingAlumni.company || viewingAlumni.company_name || '—'}</div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'பதவி:' : 'Designation / Position:'}</span>
                  <div className="font-semibold text-[#111111]">{viewingAlumni.profession || viewingAlumni.designation || '—'}</div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'மொத்த அனுபவம்:' : 'Total Experience:'}</span>
                  <div className="font-semibold text-[#111111]">{viewingAlumni.total_experience || viewingAlumni.experience_years || '—'}</div>
                </div>
              </div>
            </div>

            {/* 5. Volunteer & Donation Preferences */}
            <div className="border border-[#E5E7EB] rounded-2xl p-4 space-y-3 bg-white shadow-2xs">
              <div className="font-extrabold text-xs uppercase tracking-wider text-[#854D0E] flex items-center gap-2 border-b border-gray-100 pb-2">
                <HeartHandshake className="w-4 h-4 text-[#854D0E]" />
                <span>{language === 'ta' ? '5. தன்னார்வ & நிதி ஆதரவு விருப்பங்கள்' : '5. Volunteer & Donation Support'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'தன்னார்வலராகச் செயல்பட விருப்பம்:' : 'Willing to Volunteer:'}</span>
                  <div className="font-bold text-[#111111]">
                    {viewingAlumni.is_volunteer === 'YES' || (viewingAlumni.is_volunteer as unknown) === true ? '✅ YES / ஆம்' : 'NO / இல்லை'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">{language === 'ta' ? 'பள்ளிக்கு நன்கொடை அளிக்க விருப்பம்:' : 'Willing to Donate:'}</span>
                  <div className="font-bold text-[#111111]">
                    {viewingAlumni.willing_to_donate === 'YES' || (viewingAlumni.willing_to_donate as unknown) === true ? '✅ YES / ஆம்' : 'NO / இல்லை'}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={() => setViewingAlumni(null)} className="w-full sm:w-auto">
                {language === 'ta' ? 'மூடுக (Close)' : 'Close Details'}
              </Button>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <Button
                  className="bg-[#10B981] hover:bg-[#059669] text-white font-extrabold w-full sm:w-auto"
                  onClick={() => {
                    setSelectedAlumni(viewingAlumni);
                    setReviewAction('APPROVED');
                    setNotes(t('admin_verify_default_approve_note'));
                  }}
                >
                  <Check className="w-4 h-4 mr-1" />
                  {language === 'ta' ? 'கணக்கை அனுமதிக்குக' : 'Approve Profile'}
                </Button>
                <Button
                  variant="secondary"
                  className="text-rose-600 hover:bg-rose-50 border-rose-200 w-full sm:w-auto"
                  onClick={() => {
                    setSelectedAlumni(viewingAlumni);
                    setReviewAction('REJECTED');
                    setNotes(t('admin_verify_default_reject_note'));
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  {language === 'ta' ? 'நிராகரிக்குக' : 'Reject Profile'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Decision Review Modal */}
      <Modal
        isOpen={Boolean(selectedAlumni)}
        onClose={() => setSelectedAlumni(null)}
        title={reviewAction === 'APPROVED' ? t('admin_verify_modal_confirm_approval') : t('admin_verify_modal_confirm_rejection')}
      >
        <form onSubmit={handleDecisionSubmit} className="space-y-4">
          <div className="p-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-xs">
            {t('admin_verify_modal_applicant_line')
              .replace('{name}', selectedAlumni?.full_name || '')
              .replace('{batch}', String(selectedAlumni?.passing_year || ''))}
          </div>

          <Input
            label={reviewAction === 'APPROVED' ? t('admin_verify_modal_notes_label') : t('admin_verify_modal_reject_reason_label')}
            placeholder={reviewAction === 'APPROVED' ? t('admin_verify_modal_notes_placeholder') : t('admin_verify_modal_reject_reason_placeholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
          />

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setSelectedAlumni(null)}>
              {t('admin_verify_modal_cancel')}
            </Button>
            <Button
              type="submit"
              variant={reviewAction === 'APPROVED' ? 'primary' : 'danger'}
              isLoading={actionLoading}
            >
              {t('admin_verify_modal_confirm_btn')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};