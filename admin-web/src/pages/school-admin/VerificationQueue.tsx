import React, { useEffect, useState } from 'react';
import { UserCheck, Check, X, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState, LoadingState, TableSkeleton } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { AlumniProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const VerificationQueue: React.FC = () => {
  const { t } = useLanguage();
  const [pendingList, setPendingList] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingVerifications();
      setPendingList(data);
    } catch (err) {
      console.error('Failed to fetch pending applications:', err);
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
      fetchPending();
    } catch (err: any) {
      alertService.handleApiError(err, t('admin_verify_alert_error'));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <TableSkeleton rows={6} />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-[#111111]">{t('admin_verify_page_title')}</h2>
        <p className="text-xs text-[#6B7280]">{t('admin_verify_page_subtitle')}</p>
      </div>

      {pendingList.length === 0 ? (
        <EmptyState
          title={t('admin_verify_empty_title')}
          description={t('admin_verify_empty_desc')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingList.map((item) => (
            <div key={item.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#F4C542] transition-all">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img src={item.profile_photo_url} alt="" className="w-12 h-12 rounded-full border border-[#E5E7EB] object-cover" />
                    <div>
                      <h3 className="font-bold text-[#111111] text-base">{item.full_name}</h3>
                      <span className="text-xs text-[#6B7280]">
                        {t('admin_verify_batch_line')
                          .replace('{batch}', String(item.passing_year))
                          .replace('{section}', String(item.section))}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge status={item.verification_status} />
                    {item.is_rerequest && (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-2xs animate-pulse">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Re-Requested
                      </span>
                    )}
                  </div>
                </div>

                {/* Re-request Note Box */}
                {item.is_rerequest && (
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 rounded-xl p-3 mb-3 text-xs text-amber-950 flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[11px] text-amber-900 flex items-center gap-1">
                        Re-Verification Request
                      </div>
                      <p className="text-[11px] text-amber-800 mt-0.5 font-medium leading-tight">
                        {item.rerequest_note ? `"${item.rerequest_note}"` : 'Applicant requested re-verification review.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Last Contact Message Box */}
                {item.last_contact_message && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 text-xs text-blue-950">
                    <div className="font-bold text-[11px] text-blue-900 flex items-center gap-1.5 mb-0.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>Message: {item.last_contact_subject || 'Support Query'}</span>
                    </div>
                    <p className="text-[11px] text-blue-800 font-normal">"{item.last_contact_message}"</p>
                  </div>
                )}

                <div className="space-y-2 text-xs bg-[#FAFAFA] border border-[#E5E7EB] p-3 rounded-xl mb-4">
                  <div>
                    <span className="text-[#6B7280]">{t('admin_verify_label_admission')}</span>{' '}
                    <strong className="text-[#111111]">{item.admission_number}</strong>
                  </div>
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

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-[#E5E7EB]">
                <Button
                  className="flex-1 w-full sm:w-auto"
                  onClick={() => {
                    setSelectedAlumni(item);
                    setReviewAction('APPROVED');
                    setNotes(t('admin_verify_default_approve_note'));
                  }}
                >
                  <Check className="w-4 h-4 mr-1" />
                  {t('admin_verify_btn_approve')}
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
          ))}
        </div>
      )}

      {/* Review Modal */}
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