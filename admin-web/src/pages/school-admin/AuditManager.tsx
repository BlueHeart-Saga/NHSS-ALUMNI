import React, { useEffect, useState } from 'react';
import { Plus, FileText, Edit3, Trash2, Upload, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { useLanguage } from '../../context/LanguageContext';
import type { AuditStatement } from '../../types';

interface FormState {
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

const EMPTY_FORM: FormState = {
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

export const AuditManager: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<AuditStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminAuditStatements();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item: AuditStatement) => {
    setForm({
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
    setModalOpen(true);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alertService.showError('Invalid File', t('admin_audit_pdf_only'));
      return;
    }
    try {
      setUploadingPdf(true);
      const res = await api.uploadAuditPdf(file);
      setForm((prev) => ({
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

    const handleSave = async () => {
    if (!form.title.trim()) return alertService.showError('Missing', t('admin_audit_alert_missing_title'));
    if (!form.financial_year.trim()) return alertService.showError('Missing', t('admin_audit_alert_missing_fy'));
    if (!form.period_start.trim() || !form.period_end.trim())
      return alertService.showError('Missing', t('admin_audit_alert_missing_period'));
    if (!form.pdf_url) return alertService.showError('Missing', t('admin_audit_alert_missing_pdf'));

    setSaving(true);
    try {
      const payload: Partial<AuditStatement> = {
        title: form.title.trim(),
        title_ta: form.title_ta.trim() || undefined,
        description: form.description.trim() || undefined,
        description_ta: form.description_ta.trim() || undefined,
        financial_year: form.financial_year.trim(),
        period_start: form.period_start.trim(),
        period_end: form.period_end.trim(),
        posted_date: form.posted_date.trim() || undefined,
        pdf_url: form.pdf_url,
        pdf_file_name: form.pdf_file_name,
        pdf_file_size: form.pdf_file_size,
        is_published: form.is_published,
        display_order: form.display_order,
      };

      if (form.id) {
        await api.updateAuditStatement(form.id, payload);
      } else {
        await api.createAuditStatement(payload);
      }

      // Invalidate frontend cache so the public Audit page sees the change immediately
      api.clearCache();

      alertService.showSuccess(
        t('admin_audit_alert_saved_title'),
        t('admin_audit_alert_saved_body')
      );
      setModalOpen(false);
      load();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to save audit statement');
    } finally {
      setSaving(false);
    }
  };

    const handleDelete = async (item: AuditStatement) => {
    if (!window.confirm(t('admin_audit_confirm_delete'))) return;
    try {
      await api.deleteAuditStatement(item.id);

      // Invalidate frontend cache so the public Audit page sees the change immediately
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
  
  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
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
        <Button onClick={openCreate} className="w-full sm:w-auto shadow-md">
          <Plus className="w-4 h-4 mr-1.5" />
          {t('admin_audit_btn_add')}
        </Button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <EmptyState
          title={t('admin_audit_empty_title')}
          description={t('admin_audit_empty_desc')}
          action={<Button onClick={openCreate}>{t('admin_audit_btn_add')}</Button>}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
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
                  onClick={() => openEdit(item)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item)}
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

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? t('admin_audit_modal_title_edit') : t('admin_audit_modal_title_create')}
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('admin_audit_form_title_en')}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              label={t('admin_audit_form_title_ta')}
              value={form.title_ta}
              onChange={(e) => setForm({ ...form, title_ta: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label={t('admin_audit_form_fy')}
              placeholder={t('admin_audit_form_fy_placeholder')}
              value={form.financial_year}
              onChange={(e) => setForm({ ...form, financial_year: e.target.value })}
            />
            <Input
              label={t('admin_audit_form_period_start')}
              placeholder={t('admin_audit_form_period_start_placeholder')}
              value={form.period_start}
              onChange={(e) => setForm({ ...form, period_start: e.target.value })}
            />
            <Input
              label={t('admin_audit_form_period_end')}
              placeholder={t('admin_audit_form_period_end_placeholder')}
              value={form.period_end}
              onChange={(e) => setForm({ ...form, period_end: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('admin_audit_form_posted_date')}
              placeholder={t('admin_audit_form_posted_date_placeholder')}
              value={form.posted_date}
              onChange={(e) => setForm({ ...form, posted_date: e.target.value })}
            />
            <Input
              label={t('admin_audit_form_order')}
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">
              {t('admin_audit_form_desc_en')}
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F4C542]"
            />
          </div>

          {/* PDF Upload */}
          <div className="bg-[#FFFDF5] border border-amber-200 rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-bold text-[#111111]">{t('admin_audit_form_pdf')}</label>
            {form.pdf_url ? (
              <div className="flex items-center justify-between bg-white border border-emerald-200 rounded-xl p-3">
                <div className="flex items-center space-x-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#111111] truncate">
                      {form.pdf_file_name || t('admin_audit_pdf_attached')}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {(form.pdf_file_size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <label className="cursor-pointer text-xs font-bold text-blue-600 hover:underline shrink-0 ml-2">
                  {t('admin_audit_pdf_replace')}
                  <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
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
                  onChange={handlePdfUpload}
                  disabled={uploadingPdf}
                />
              </label>
            )}
          </div>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="w-4 h-4 text-[#F4C542] rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-[#111111]">
              {t('admin_audit_form_published')}
            </span>
          </label>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} isLoading={saving}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};