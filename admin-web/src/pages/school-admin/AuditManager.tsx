import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus, FileText, Edit3, Trash2, Upload, CheckCircle2,
  ClipboardList, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { useLanguage } from '../../context/LanguageContext';
import type { AuditStatement, MeetingMinute } from '../../types';

/* ============================================================
 * SECTION A — AUDIT STATEMENTS
 * ============================================================ */
interface AuditFormState {
  id?: string;
  title: string;
  title_ta: string;
  description: string;
  description_ta: string;
  financial_year: string;
  period_start: string;
  period_end: string;
  posted_date: string;
  pdf_url: string;
  pdf_file_name: string;
  pdf_file_size: number;
  is_published: boolean;
  display_order: number;
}

const EMPTY_AUDIT_FORM: AuditFormState = {
  title: '',
  title_ta: '',
  description: '',
  description_ta: '',
  financial_year: '',
  period_start: '',
  period_end: '',
  posted_date: '',
  pdf_url: '',
  pdf_file_name: '',
  pdf_file_size: 0,
  is_published: false,
  display_order: 1,
};

/* ============================================================
 * SECTION B — MEETING MINUTES
 * ============================================================ */
interface MeetingFormState {
  id?: string;
  title: string;
  title_ta: string;
  meeting_date: string;
  meeting_time: string;
  meeting_type: string;
  notes: string;
  notes_ta: string;
  pdf_url: string;
  pdf_file_name: string;
  pdf_file_size: number;
  is_published: boolean;
  display_order: number;
}

const EMPTY_MEETING_FORM: MeetingFormState = {
  title: '',
  title_ta: '',
  meeting_date: '',
  meeting_time: '',
  meeting_type: '',
  notes: '',
  notes_ta: '',
  pdf_url: '',
  pdf_file_name: '',
  pdf_file_size: 0,
  is_published: false,
  display_order: 1,
};

const AUDIT_PAGE_SIZE = 3;

export const AuditManager: React.FC = () => {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);

  // Audit statements state
  const [items, setItems] = useState<AuditStatement[]>([]);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditSaving, setAuditSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [auditForm, setAuditForm] = useState<AuditFormState>(EMPTY_AUDIT_FORM);
  const [auditPage, setAuditPage] = useState(1);

  // Meeting minutes state
  const [meetings, setMeetings] = useState<MeetingMinute[]>([]);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingSaving, setMeetingSaving] = useState(false);
  const [uploadingMeetingPdf, setUploadingMeetingPdf] = useState(false);
  const [meetingForm, setMeetingForm] = useState<MeetingFormState>(EMPTY_MEETING_FORM);

  const load = async () => {
    try {
      setLoading(true);
      const [audits, mtgs] = await Promise.all([
        api.getAdminAuditStatements().catch(() => [] as AuditStatement[]),
        api.getAdminMeetingMinutes().catch(() => [] as MeetingMinute[]),
      ]);
      setItems(audits);
      setMeetings(mtgs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const auditTotalPages = Math.max(1, Math.ceil(items.length / AUDIT_PAGE_SIZE));
  const safeAuditPage = Math.min(auditPage, auditTotalPages);
  const pagedAuditItems = useMemo(
    () => items.slice((safeAuditPage - 1) * AUDIT_PAGE_SIZE, safeAuditPage * AUDIT_PAGE_SIZE),
    [items, safeAuditPage]
  );

  useEffect(() => {
    if (auditPage > auditTotalPages) setAuditPage(auditTotalPages);
  }, [auditPage, auditTotalPages]);

  /* ============================================================
   * AUDIT STATEMENT HANDLERS
   * ============================================================ */
  const openCreateAudit = () => {
    setAuditForm(EMPTY_AUDIT_FORM);
    setAuditModalOpen(true);
  };

  const openEditAudit = (item: AuditStatement) => {
    setAuditForm({
      id: item.id,
      title: item.title,
      title_ta: item.title_ta || '',
      description: item.description || '',
      description_ta: item.description_ta || '',
      financial_year: item.financial_year,
      period_start: item.period_start,
      period_end: item.period_end,
      posted_date: item.posted_date || '',
      pdf_url: item.pdf_url || '',
      pdf_file_name: item.pdf_file_name || '',
      pdf_file_size: item.pdf_file_size || 0,
      is_published: item.is_published,
      display_order: item.display_order,
    });
    setAuditModalOpen(true);
  };

  const handleAuditPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alertService.showError('Invalid File', t('admin_audit_pdf_only'));
      return;
    }
    try {
      setUploadingPdf(true);
      const res = await api.uploadAuditPdf(file);
      setAuditForm((prev) => ({
        ...prev,
        pdf_url: res.pdf_url,
        pdf_file_name: res.file_name,
        pdf_file_size: res.file_size,
      }));
      alertService.showSuccess('Uploaded', 'PDF uploaded successfully.');
    } catch (err) {
      alertService.handleApiError(err, 'Failed to upload PDF');
    } finally {
      setUploadingPdf(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAuditSave = async () => {
    if (!auditForm.title.trim()) return alertService.showError('Missing', t('admin_audit_alert_missing_title'));
    if (!auditForm.financial_year.trim()) return alertService.showError('Missing', t('admin_audit_alert_missing_fy'));
    if (!auditForm.period_start.trim() || !auditForm.period_end.trim())
      return alertService.showError('Missing', t('admin_audit_alert_missing_period'));
    if (!auditForm.pdf_url) return alertService.showError('Missing', t('admin_audit_alert_missing_pdf'));

    setAuditSaving(true);
    try {
      const payload: Partial<AuditStatement> = {
        title: auditForm.title.trim(),
        title_ta: auditForm.title_ta.trim() || undefined,
        description: auditForm.description.trim() || undefined,
        description_ta: auditForm.description_ta.trim() || undefined,
        financial_year: auditForm.financial_year.trim(),
        period_start: auditForm.period_start.trim(),
        period_end: auditForm.period_end.trim(),
        posted_date: auditForm.posted_date.trim() || undefined,
        pdf_url: auditForm.pdf_url,
        pdf_file_name: auditForm.pdf_file_name,
        pdf_file_size: auditForm.pdf_file_size,
        is_published: auditForm.is_published,
        display_order: auditForm.display_order,
      };

      if (auditForm.id) {
        await api.updateAuditStatement(auditForm.id, payload);
      } else {
        await api.createAuditStatement(payload);
      }

      api.clearCache();
      alertService.showSuccess(
        t('admin_audit_alert_saved_title'),
        t('admin_audit_alert_saved_body')
      );
      setAuditModalOpen(false);
      load();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to save audit statement');
    } finally {
      setAuditSaving(false);
    }
  };

  const handleAuditDelete = async (item: AuditStatement) => {
    if (!window.confirm(t('admin_audit_confirm_delete'))) return;
    try {
      await api.deleteAuditStatement(item.id);
      api.clearCache();
      alertService.showSuccess(
        t('admin_audit_alert_deleted_title'),
        t('admin_audit_alert_deleted_body')
      );
      load();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to delete');
    }
  };

  /* ============================================================
   * MEETING MINUTES HANDLERS
   * ============================================================ */
  const openCreateMeeting = () => {
    setMeetingForm(EMPTY_MEETING_FORM);
    setMeetingModalOpen(true);
  };

  const openEditMeeting = (item: MeetingMinute) => {
    setMeetingForm({
      id: item.id,
      title: item.title,
      title_ta: item.title_ta || '',
      meeting_date: item.meeting_date,
      meeting_time: item.meeting_time || '',
      meeting_type: item.meeting_type || '',
      notes: item.notes || '',
      notes_ta: item.notes_ta || '',
      pdf_url: item.pdf_url || '',
      pdf_file_name: item.pdf_file_name || '',
      pdf_file_size: item.pdf_file_size || 0,
      is_published: item.is_published,
      display_order: item.display_order,
    });
    setMeetingModalOpen(true);
  };

  const handleMeetingPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alertService.showError('Invalid File', 'Only PDF files are accepted.');
      return;
    }
    try {
      setUploadingMeetingPdf(true);
      const res = await api.uploadMeetingMinutesPdf(file);
      setMeetingForm((prev) => ({
        ...prev,
        pdf_url: res.pdf_url,
        pdf_file_name: res.file_name,
        pdf_file_size: res.file_size,
      }));
      alertService.showSuccess('PDF Uploaded', 'The PDF has been attached to this meeting record.');
    } catch (err) {
      alertService.handleApiError(err, 'Failed to upload PDF');
    } finally {
      setUploadingMeetingPdf(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleMeetingSave = async () => {
    if (!meetingForm.title.trim()) return alertService.showError('Missing', 'Please enter a meeting title.');
    if (!meetingForm.meeting_date.trim()) return alertService.showError('Missing', 'Please enter the meeting date.');
    if (!meetingForm.notes.trim()) return alertService.showError('Missing', 'Please enter the meeting notes / resolutions.');

    setMeetingSaving(true);
    try {
      const payload: Partial<MeetingMinute> = {
        title: meetingForm.title.trim(),
        title_ta: meetingForm.title_ta.trim() || undefined,
        meeting_date: meetingForm.meeting_date.trim(),
        meeting_time: meetingForm.meeting_time.trim() || undefined,
        meeting_type: meetingForm.meeting_type.trim() || undefined,
        notes: meetingForm.notes,
        notes_ta: meetingForm.notes_ta || undefined,
        pdf_url: meetingForm.pdf_url || undefined,
        pdf_file_name: meetingForm.pdf_file_name || undefined,
        pdf_file_size: meetingForm.pdf_file_size || undefined,
        is_published: meetingForm.is_published,
        display_order: meetingForm.display_order,
      };

      if (meetingForm.id) {
        await api.updateMeetingMinute(meetingForm.id, payload);
      } else {
        await api.createMeetingMinute(payload);
      }

      api.clearCache();
      alertService.showSuccess('Saved', 'Meeting record saved successfully.');
      setMeetingModalOpen(false);
      load();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to save meeting record');
    } finally {
      setMeetingSaving(false);
    }
  };

  const handleMeetingDelete = async (item: MeetingMinute) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteMeetingMinute(item.id);
      api.clearCache();
      alertService.showSuccess('Deleted', 'Meeting record removed.');
      load();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to delete meeting record');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — AUDIT & FINANCIAL STATEMENTS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-50 via-white to-amber-50/40 p-6 rounded-3xl border border-[#E5E7EB] shadow-xs">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-[#F4C542] rounded-xl text-[#111111]">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold text-[#111111]">{t('admin_audit_page_title')}</h2>
            </div>
            <p className="text-xs text-[#6B7280] mt-1 ml-10">{t('admin_audit_page_subtitle')}</p>
          </div>
          <Button onClick={openCreateAudit} className="w-full sm:w-auto shadow-md">
            <Plus className="w-4 h-4 mr-1.5" />
            {t('admin_audit_btn_add')}
          </Button>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title={t('admin_audit_empty_title')}
            description={t('admin_audit_empty_desc')}
            action={<Button onClick={openCreateAudit}>{t('admin_audit_btn_add')}</Button>}
          />
        ) : (
          <>
            <div className="space-y-3">
              {pagedAuditItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-[#F4C542] transition-all"
                >
                  <div className="w-11 h-11 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#854D0E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-[#111111] truncate">{item.title}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.is_published
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {item.is_published ? t('admin_audit_badge_published') : t('admin_audit_badge_draft')}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {item.financial_year} · {item.period_start} - {item.period_end}
                      {item.posted_date && ` · ${item.posted_date}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => openEditAudit(item)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAuditDelete(item)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {auditTotalPages > 1 && (
              <div className="flex items-center justify-between bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3">
                <span className="text-xs text-[#6B7280]">
                  Showing{' '}
                  <strong className="text-[#111111]">{(safeAuditPage - 1) * AUDIT_PAGE_SIZE + 1}</strong>–
                  <strong className="text-[#111111]">{Math.min(safeAuditPage * AUDIT_PAGE_SIZE, items.length)}</strong>{' '}
                  of <strong className="text-[#111111]">{items.length}</strong> reports
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                    disabled={safeAuditPage === 1}
                    className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#111111] hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: auditTotalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setAuditPage(n)}
                      className={
                        'min-w-[32px] px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ' +
                        (n === safeAuditPage
                          ? 'bg-[#F4C542] border-[#F4C542] text-[#111111]'
                          : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:border-[#F4C542]')
                      }
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAuditPage((p) => Math.min(auditTotalPages, p + 1))}
                    disabled={safeAuditPage === auditTotalPages}
                    className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#111111] hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — ASSOCIATION MEETING MINUTES & RESOLUTIONS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-50 via-white to-amber-50/40 p-6 rounded-3xl border border-[#E5E7EB] shadow-xs">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-[#F4C542] rounded-xl text-[#111111]">
                <ClipboardList className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold text-[#111111]">
                Association Meeting Minutes &amp; Resolutions
              </h2>
            </div>
            <p className="text-xs text-[#6B7280] mt-1 ml-10">
              Publish, update, and manage official meeting records of the NHSS Alumni Association
            </p>
          </div>
          <Button onClick={openCreateMeeting} className="w-full sm:w-auto shadow-md">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Meeting Record
          </Button>
        </div>

        {meetings.length === 0 ? (
          <EmptyState
            title="No Meeting Records Yet"
            description="Create your first Association Meeting Minutes record to publish it on the public Audit page."
            action={<Button onClick={openCreateMeeting}>Add Meeting Record</Button>}
          />
        ) : (
          <div className="space-y-3">
            {meetings.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-[#F4C542] transition-all"
              >
                <div className="w-11 h-11 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-xl flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-[#854D0E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-sm text-[#111111] truncate">{item.title}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.is_published
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {item.meeting_date}
                    {item.meeting_time && ` · ${item.meeting_time}`}
                    {item.meeting_type && ` · ${item.meeting_type}`}
                  </p>
                  {item.notes && (
                    <p className="text-[11px] text-[#94A3B8] mt-1 truncate">
                      {item.notes.slice(0, 120)}
                      {item.notes.length > 120 ? '…' : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  {item.pdf_url && (
                    <a
                      href={item.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-[#854D0E] hover:bg-[#FFF7D6] rounded-xl transition-colors"
                      title="View PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => openEditMeeting(item)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMeetingDelete(item)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          AUDIT STATEMENT CREATE / EDIT MODAL
      ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        title={auditForm.id ? t('admin_audit_modal_title_edit') : t('admin_audit_modal_title_create')}
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('admin_audit_form_title_en')}
              value={auditForm.title}
              onChange={(e) => setAuditForm({ ...auditForm, title: e.target.value })}
            />
            <Input
              label={t('admin_audit_form_title_ta')}
              value={auditForm.title_ta}
              onChange={(e) => setAuditForm({ ...auditForm, title_ta: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label={t('admin_audit_form_fy')}
              placeholder={t('admin_audit_form_fy_placeholder')}
              value={auditForm.financial_year}
              onChange={(e) => setAuditForm({ ...auditForm, financial_year: e.target.value })}
            />
            <Input
              label={t('admin_audit_form_period_start')}
              placeholder={t('admin_audit_form_period_start_placeholder')}
              value={auditForm.period_start}
              onChange={(e) => setAuditForm({ ...auditForm, period_start: e.target.value })}
            />
            <Input
              label={t('admin_audit_form_period_end')}
              placeholder={t('admin_audit_form_period_end_placeholder')}
              value={auditForm.period_end}
              onChange={(e) => setAuditForm({ ...auditForm, period_end: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('admin_audit_form_posted_date')}
              placeholder={t('admin_audit_form_posted_date_placeholder')}
              value={auditForm.posted_date}
              onChange={(e) => setAuditForm({ ...auditForm, posted_date: e.target.value })}
            />
            <Input
              label={t('admin_audit_form_order')}
              type="number"
              value={auditForm.display_order}
              onChange={(e) => setAuditForm({ ...auditForm, display_order: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">
              {t('admin_audit_form_desc_en')}
            </label>
            <textarea
              rows={2}
              value={auditForm.description}
              onChange={(e) => setAuditForm({ ...auditForm, description: e.target.value })}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F4C542]"
            />
          </div>

          <div className="bg-[#FFFDF5] border border-amber-200 rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-bold text-[#111111]">{t('admin_audit_form_pdf')}</label>
            {auditForm.pdf_url ? (
              <div className="flex items-center justify-between bg-white border border-emerald-200 rounded-xl p-3">
                <div className="flex items-center space-x-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#111111] truncate">
                      {auditForm.pdf_file_name || t('admin_audit_pdf_attached')}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {(auditForm.pdf_file_size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <label className="cursor-pointer text-xs font-bold text-blue-600 hover:underline shrink-0 ml-2">
                  {t('admin_audit_pdf_replace')}
                  <input type="file" accept="application/pdf" className="hidden" onChange={handleAuditPdfUpload} />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-[#F4C542] hover:bg-[#FFFDF5] transition-colors">
                <Upload className="w-6 h-6 text-[#854D0E] mb-2" />
                <span className="text-xs font-semibold text-[#111111]">
                  {uploadingPdf ? t('admin_audit_pdf_uploading') : t('admin_audit_pdf_upload')}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5">{t('admin_audit_pdf_only')}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleAuditPdfUpload}
                  disabled={uploadingPdf}
                />
              </label>
            )}
          </div>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={auditForm.is_published}
              onChange={(e) => setAuditForm({ ...auditForm, is_published: e.target.checked })}
              className="w-4 h-4 text-[#F4C542] rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-[#111111]">
              {t('admin_audit_form_published')}
            </span>
          </label>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setAuditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAuditSave} isLoading={auditSaving}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════
          MEETING MINUTES CREATE / EDIT MODAL
      ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={meetingModalOpen}
        onClose={() => setMeetingModalOpen(false)}
        title={meetingForm.id ? 'Edit Meeting Record' : 'Add Meeting Record'}
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <Input
            label="Meeting Title *"
            placeholder="e.g. First Online Meeting of NHSS Alumni Association Administrators"
            value={meetingForm.title}
            onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
          />
          <Input
            label="Meeting Title (Tamil)"
            value={meetingForm.title_ta}
            onChange={(e) => setMeetingForm({ ...meetingForm, title_ta: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Meeting Date *"
              type="date"
              value={meetingForm.meeting_date}
              onChange={(e) => setMeetingForm({ ...meetingForm, meeting_date: e.target.value })}
            />
            <Input
              label="Meeting Time"
              placeholder="e.g. 12:00 PM – 1:45 PM"
              value={meetingForm.meeting_time}
              onChange={(e) => setMeetingForm({ ...meetingForm, meeting_time: e.target.value })}
            />
            <Input
              label="Meeting Type / Mode"
              placeholder="e.g. Online Meeting"
              value={meetingForm.meeting_type}
              onChange={(e) => setMeetingForm({ ...meetingForm, meeting_type: e.target.value })}
            />
          </div>

          {/* PDF attachment — optional, no auto-extraction */}
          <div className="bg-[#FFFDF5] border border-amber-200 rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-bold text-[#111111]">
              Meeting Minutes PDF (optional attachment)
            </label>
            {meetingForm.pdf_url ? (
              <div className="flex items-center justify-between bg-white border border-emerald-200 rounded-xl p-3">
                <div className="flex items-center space-x-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#111111] truncate">
                      {meetingForm.pdf_file_name || 'PDF attached'}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {(meetingForm.pdf_file_size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <label className="cursor-pointer text-xs font-bold text-blue-600 hover:underline shrink-0 ml-2">
                  Replace
                  <input type="file" accept="application/pdf" className="hidden" onChange={handleMeetingPdfUpload} />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-[#F4C542] hover:bg-[#FFFDF5] transition-colors">
                <Upload className="w-6 h-6 text-[#854D0E] mb-2" />
                <span className="text-xs font-semibold text-[#111111]">
                  {uploadingMeetingPdf ? 'Uploading…' : 'Upload PDF (optional)'}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5">
                  PDF only, up to 30MB · Stored as an attachment for public viewing
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleMeetingPdfUpload}
                  disabled={uploadingMeetingPdf}
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1.5">
              Meeting Notes / Resolutions *
            </label>
            <textarea
              rows={14}
              value={meetingForm.notes}
              onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
              placeholder="Type or paste the meeting resolutions here. One resolution per line. Tamil text is supported."
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs leading-relaxed focus:outline-none focus:border-[#F4C542] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1.5">
              Meeting Notes (Tamil, optional)
            </label>
            <textarea
              rows={4}
              value={meetingForm.notes_ta}
              onChange={(e) => setMeetingForm({ ...meetingForm, notes_ta: e.target.value })}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs leading-relaxed focus:outline-none focus:border-[#F4C542] font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Display Order"
              type="number"
              value={meetingForm.display_order}
              onChange={(e) => setMeetingForm({ ...meetingForm, display_order: Number(e.target.value) || 1 })}
            />
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={meetingForm.is_published}
                  onChange={(e) => setMeetingForm({ ...meetingForm, is_published: e.target.checked })}
                  className="w-4 h-4 text-[#F4C542] rounded cursor-pointer"
                />
                <span className="text-xs font-semibold text-[#111111]">
                  Publish on public Audit page
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setMeetingModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleMeetingSave} isLoading={meetingSaving}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};