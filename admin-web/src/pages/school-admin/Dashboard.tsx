import React, { useEffect, useState } from 'react';
import { 
  Users, UserCheck, GraduationCap, Calendar, CheckCircle2, ArrowRight,
  Info, Check, Phone, Mail, Briefcase, ExternalLink, ShieldCheck, Loader2
} from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { LoadingState, StatsGridSkeleton, TableSkeleton } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { DashboardReport, AlumniProfile, EventItem } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
    const { t, language } = useLanguage();
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [pendingList, setPendingList] = useState<AlumniProfile[]>([]);
  const [upcomingEvent, setUpcomingEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [confirmingAlumni, setConfirmingAlumni] = useState<AlumniProfile | null>(null);
  const [approvalNote, setApprovalNote] = useState(() => t('admin_dashboard_approval_default_note'));
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [repRes, pendRes, evRes] = await Promise.allSettled([
        api.getDashboardReport(),
        api.getPendingVerifications(),
        api.getEvents()
      ]);

      if (repRes.status === 'fulfilled') {
        setReport(repRes.value);
      } else if (repRes.status === 'rejected') {
        console.error('Failed to load dashboard report stats:', repRes.reason);
      }

      if (pendRes.status === 'fulfilled') {
        if (Array.isArray(pendRes.value)) {
          setPendingList(pendRes.value.slice(0, 5));
        }
      } else if (pendRes.status === 'rejected') {
        console.error('Failed to load pending verifications queue:', pendRes.reason);
        setPendingList([]);
      }

      if (evRes.status === 'fulfilled' && Array.isArray(evRes.value) && evRes.value.length > 0) {
        setUpcomingEvent(evRes.value[0]);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmApproval = async () => {
    if (!confirmingAlumni) return;
    try {
      setConfirmLoading(true);
      await api.verifyAlumni(confirmingAlumni.id, 'APPROVED', approvalNote);
      alertService.showSuccess(
        t('admin_dashboard_alert_approved_title'),
        t('admin_dashboard_alert_approved_body').replace('{name}', confirmingAlumni.full_name)
      );
      setConfirmingAlumni(null);
      setSelectedAlumni(null);
      loadDashboardData();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_dashboard_alert_approval_error'));
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <StatsGridSkeleton count={5} />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title={t('admin_dashboard_stat_total_alumni')}
          value={report?.total_alumni || 0}
          subtitle={t('admin_dashboard_stat_total_alumni_sub')}
          icon={Users}
        />
        <StatsCard
          title={t('admin_dashboard_stat_verified')}
          value={report?.verified_alumni || 0}
          subtitle={t('admin_dashboard_stat_verified_sub')}
          icon={UserCheck}
        />
        <StatsCard
          title={t('admin_dashboard_stat_pending')}
          value={report?.pending_alumni || 0}
          subtitle={t('admin_dashboard_stat_pending_sub')}
          icon={UserCheck}
        />
        <StatsCard
          title={t('admin_dashboard_stat_cohorts')}
          value={report?.active_batches || 0}
          subtitle={t('admin_dashboard_stat_cohorts_sub')}
          icon={GraduationCap}
        />
        <StatsCard
          title={t('admin_dashboard_stat_turnout')}
          value={`${report?.attendance_turnout_percentage || 0}%`}
          subtitle={t('admin_dashboard_stat_turnout_sub')}
          icon={Calendar}
        />
      </div>

      {/* Hero Upcoming Event Banner */}
      {upcomingEvent && (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFF7D6] rounded-full blur-3xl -z-10"></div>
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#FFF7D6] border border-[#F4C542]/60 text-[#854D0E] px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <span>{t('admin_dashboard_event_badge')}</span>
            </div>
            <h2 className="text-2xl font-bold text-[#111111]">
              {language === 'ta' && (upcomingEvent as any).title_ta
                ? (upcomingEvent as any).title_ta
                : upcomingEvent.title}
            </h2>
            <p className="text-sm text-[#6B7280] mt-1 max-w-2xl">{upcomingEvent.description}</p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 text-xs font-semibold text-[#111111]">
              <span className="bg-[#FAFAFA] border border-[#E5E7EB] px-3 py-1.5 rounded-xl">
                📅 {upcomingEvent.event_date} ({upcomingEvent.start_time})
              </span>
              <span className="bg-[#FAFAFA] border border-[#E5E7EB] px-3 py-1.5 rounded-xl">
                📍 {upcomingEvent.venue}
              </span>
              <span className="bg-[#FAFAFA] border border-[#E5E7EB] px-3 py-1.5 rounded-xl text-[#854D0E]">
                👥 {t('admin_dashboard_event_confirmed')
                  .replace('{attending}', String(upcomingEvent.attending_count))
                  .replace('{guests}', String(upcomingEvent.total_guests))}
              </span>
            </div>
          </div>

          <div className="flex items-center w-full sm:w-auto">
            <Button onClick={() => navigate(`/school-admin/events/${upcomingEvent.id}`)} className="w-full sm:w-auto">
              {t('admin_dashboard_event_view_rsvp')}
            </Button>
          </div>
        </div>
      )}

      {/* Pending Applications Review Widget */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-lg text-[#111111]">{t('admin_dashboard_queue_title')}</h3>
            <p className="text-xs text-[#6B7280]">{t('admin_dashboard_queue_subtitle')}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/school-admin/verification')} className="w-full sm:w-auto">
            <span>{t('admin_dashboard_queue_view_all').replace('{count}', String(report?.pending_alumni || 0))}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {pendingList.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#6B7280]">
            {t('admin_dashboard_queue_empty')}
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {pendingList.map((a) => (
              <div key={a.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 hover:bg-[#FAFAFA] px-2 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <img
                    src={a.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.full_name || 'Alumni')}&background=F3F4F6&color=111827`}
                    alt=""
                    className="w-10 h-10 rounded-full border border-[#E5E7EB] object-cover shrink-0"
                  />
                  <div>
                    <div className="text-sm font-bold text-[#111111]">{a.full_name}</div>
                    <div className="text-xs text-[#6B7280]">
                      {t('admin_dashboard_queue_meta')
                        .replace('{batch}', String(a.passing_year))
                        .replace('{adm}', String(a.admission_number))
                        .replace('{mobile}', String(a.mobile))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedAlumni(a)}
                    className="p-1.5 text-[#6B7280] hover:text-[#111111] hover:bg-[#E5E7EB]/60 rounded-lg transition-colors cursor-pointer"
                    title={t('admin_dashboard_queue_view_details')}
                    aria-label={t('admin_dashboard_queue_view_details')}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <Badge status={a.verification_status} />
                  <Button
                    size="sm"
                    onClick={() => {
                      setConfirmingAlumni(a);
                      setApprovalNote(
                        `${t('admin_dashboard_approval_default_note')} - ${new Date().toLocaleDateString()}`
                      );
                    }}
                  >
                    {t('admin_dashboard_queue_approve')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1. Alumni Full Details Modal (View All Data via 'i' icon) */}
      <Modal
        isOpen={Boolean(selectedAlumni)}
        onClose={() => setSelectedAlumni(null)}
        title={t('admin_dashboard_detail_modal_title')}
      >
        {selectedAlumni && (
          <div className="space-y-5">
            {/* Header Profile Card */}
            <div className="flex items-center gap-4 bg-[#FAFAFA] border border-[#E5E7EB] p-4 rounded-2xl">
              <img
                src={selectedAlumni.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAlumni.full_name || 'Alumni')}&background=F4C542&color=111111`}
                alt={selectedAlumni.full_name}
                className="w-16 h-16 rounded-full border border-[#E5E7EB] object-cover shrink-0 shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-[#111111] truncate">{selectedAlumni.full_name}</h4>
                  <Badge status={selectedAlumni.verification_status} />
                </div>
                <div className="text-xs text-[#6B7280] mt-0.5">
                  {t('admin_dashboard_detail_batch_line')
                    .replace('{batch}', String(selectedAlumni.passing_year))
                    .replace('{section}', selectedAlumni.section ? t('admin_dashboard_detail_section_suffix').replace('{section}', String(selectedAlumni.section)) : '')
                    .replace('{adm}', String(selectedAlumni.admission_number || t('admin_dashboard_detail_na')))}
                </div>
                {selectedAlumni.profession && (
                  <div className="text-xs text-[#854D0E] font-medium mt-1">
                    💼 {selectedAlumni.profession} {selectedAlumni.company ? t('admin_dashboard_detail_company_prefix').replace('{company}', selectedAlumni.company) : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Segmented Details Grid */}
            <div className="space-y-4 text-xs">
              {/* Contact & Personal Information */}
              <div className="border border-[#E5E7EB] rounded-xl p-3.5 space-y-2.5 bg-white">
                <div className="font-bold text-xs uppercase tracking-wider text-[#854D0E] flex items-center gap-1.5 border-b border-[#F1F5F9] pb-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('admin_dashboard_detail_section_contact')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[#6B7280]">{t('admin_dashboard_detail_label_mobile')}</span>
                    <div className="font-semibold text-[#111111]">{selectedAlumni.mobile || '—'}</div>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">{t('admin_dashboard_detail_label_email')}</span>
                    <div className="font-semibold text-[#111111] truncate">{selectedAlumni.email || '—'}</div>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">{t('admin_dashboard_detail_label_gender')}</span>
                    <div className="font-semibold text-[#111111]">{selectedAlumni.gender || '—'}</div>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">{t('admin_dashboard_detail_label_dob')}</span>
                    <div className="font-semibold text-[#111111]">{selectedAlumni.dob || selectedAlumni.date_of_birth || '—'}</div>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">{t('admin_dashboard_detail_label_blood')}</span>
                    <div className="font-semibold text-[#111111]">{selectedAlumni.blood_group || '—'}</div>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">{t('admin_dashboard_detail_label_city')}</span>
                    <div className="font-semibold text-[#111111]">{selectedAlumni.current_city || '—'} {selectedAlumni.country ? `(${selectedAlumni.country})` : ''}</div>
                  </div>
                  {selectedAlumni.address && (
                    <div className="sm:col-span-2">
                      <span className="text-[#6B7280]">{t('admin_dashboard_detail_label_address')}</span>
                      <div className="font-semibold text-[#111111]">{selectedAlumni.address}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* School & Academic Information */}
              <div className="border border-[#E5E7EB] rounded-xl p-3.5 space-y-2.5 bg-white">
                <div className="font-bold text-xs uppercase tracking-wider text-[#854D0E] flex items-center gap-1.5 border-b border-[#F1F5F9] pb-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{t('admin_dashboard_detail_section_academic')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[#6B7280]">{t('admin_dashboard_detail_label_passing_year')}</span>
                    <div className="font-semibold text-[#111111]">
                      {t('admin_dashboard_detail_class_of').replace('{year}', String(selectedAlumni.passing_year))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">{t('admin_dashboard_detail_label_admission_no')}</span>
                    <div className="font-semibold text-[#111111]">{selectedAlumni.admission_number || t('admin_dashboard_detail_na')}</div>
                  </div>
                  {selectedAlumni.degree && (
                    <div>
                      <span className="text-[#6B7280]">{t('admin_dashboard_detail_label_higher_ed')}</span>
                      <div className="font-semibold text-[#111111]">{selectedAlumni.degree} {selectedAlumni.stream ? `(${selectedAlumni.stream})` : ''}</div>
                    </div>
                  )}
                  {selectedAlumni.college_name && (
                    <div>
                      <span className="text-[#6B7280]">{t('admin_dashboard_detail_label_college')}</span>
                      <div className="font-semibold text-[#111111]">{selectedAlumni.college_name}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Background */}
              {(selectedAlumni.profession || selectedAlumni.company || selectedAlumni.linkedin_url) && (
                <div className="border border-[#E5E7EB] rounded-xl p-3.5 space-y-2.5 bg-white">
                  <div className="font-bold text-xs uppercase tracking-wider text-[#854D0E] flex items-center gap-1.5 border-b border-[#F1F5F9] pb-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{t('admin_dashboard_detail_section_professional')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[#6B7280]">{t('admin_dashboard_detail_label_profession')}</span>
                      <div className="font-semibold text-[#111111]">{selectedAlumni.profession || '—'}</div>
                    </div>
                    <div>
                      <span className="text-[#6B7280]">{t('admin_dashboard_detail_label_company')}</span>
                      <div className="font-semibold text-[#111111]">{selectedAlumni.company || '—'}</div>
                    </div>
                    {selectedAlumni.designation && (
                      <div>
                        <span className="text-[#6B7280]">{t('admin_dashboard_detail_label_designation')}</span>
                        <div className="font-semibold text-[#111111]">{selectedAlumni.designation}</div>
                      </div>
                    )}
                    {selectedAlumni.linkedin_url && (
                      <div>
                        <span className="text-[#6B7280]">{t('admin_dashboard_detail_label_linkedin')}</span>
                        <div>
                          <a
                            href={selectedAlumni.linkedin_url.startsWith('http') ? selectedAlumni.linkedin_url : `https://${selectedAlumni.linkedin_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#854D0E] underline font-semibold flex items-center gap-1"
                          >
                            <span>{t('admin_dashboard_detail_profile_link')}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E5E7EB]">
              <Button variant="secondary" onClick={() => setSelectedAlumni(null)}>
                {t('admin_dashboard_detail_close')}
              </Button>
              <Button
                onClick={() => {
                  const toApprove = selectedAlumni;
                  setSelectedAlumni(null);
                  setConfirmingAlumni(toApprove);
                  setApprovalNote(
                    `${t('admin_dashboard_approval_default_note')} - ${new Date().toLocaleDateString()}`
                  );
                }}
              >
                <Check className="w-4 h-4 mr-1.5" />
                <span>{t('admin_dashboard_detail_approve_btn')}</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 2. Approve Confirmation Modal */}
      <Modal
        isOpen={Boolean(confirmingAlumni)}
        onClose={() => !confirmLoading && setConfirmingAlumni(null)}
        title={t('admin_dashboard_confirm_modal_title')}
      >
        {confirmingAlumni && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-2xl text-xs text-[#854D0E]">
              <ShieldCheck className="w-5 h-5 shrink-0 text-[#854D0E] mt-0.5" />
              <div>
                <p className="font-bold text-[#111111] text-sm">
                  {t('admin_dashboard_confirm_heading').replace('{name}', confirmingAlumni.full_name)}
                </p>
                <p className="mt-1 text-[#6B7280]">
                  {t('admin_dashboard_confirm_body')}{' '}
                  {t('admin_dashboard_confirm_meta')
                    .replace('{batch}', String(confirmingAlumni.passing_year))
                    .replace('{adm}', String(confirmingAlumni.admission_number || t('admin_dashboard_detail_na')))}
                </p>
                <p className="mt-1.5 text-xs text-[#854D0E] font-medium">
                  {t('admin_dashboard_confirm_note')}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                {t('admin_dashboard_confirm_notes_label')}
              </label>
              <input
                type="text"
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder={t('admin_dashboard_confirm_notes_placeholder')}
                className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#F4C542] focus:ring-1 focus:ring-[#F4C542]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E5E7EB]">
              <Button
                variant="secondary"
                disabled={confirmLoading}
                onClick={() => setConfirmingAlumni(null)}
              >
                {t('admin_dashboard_confirm_cancel')}
              </Button>
              <Button
                disabled={confirmLoading}
                onClick={handleConfirmApproval}
              >
                {confirmLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    <span>{t('admin_dashboard_confirm_approving')}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    <span>{t('admin_dashboard_confirm_submit')}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};