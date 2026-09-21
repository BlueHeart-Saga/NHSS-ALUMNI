import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus, HandHeart, Edit3, Trash2, ExternalLink, UploadCloud, X,
  CheckCircle2, XCircle, GripVertical,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { useLanguage } from '../../context/LanguageContext';
import type { Sponsor } from '../../types';

interface FormState {
  id?: string;
  name: string;
  name_ta: string;
  description: string;
  description_ta: string;
  logo_url: string;
  website_url: string;
  financial_year: string;
  amount: number | '';
  sponsored_item: string;
  is_published: boolean;
}

const EMPTY: FormState = {
  name: '',
  name_ta: '',
  description: '',
  description_ta: '',
  logo_url: '',
  website_url: '',
  financial_year: '',
  amount: '',
  sponsored_item: '',
  is_published: false,
};

const StatusPill: React.FC<{ sponsor: Sponsor }> = ({ sponsor }) => {
  const status =
    sponsor.approval_status ||
    (sponsor.is_published ? 'PUBLISHED' : 'PENDING');

  const styles =
    status === 'PUBLISHED'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : status === 'REJECTED'
      ? 'bg-rose-50 text-rose-800 border-rose-200'
      : 'bg-amber-50 text-amber-800 border-amber-200';

  const label =
    status === 'PUBLISHED' ? 'Published' : status === 'REJECTED' ? 'Rejected' : 'Pending';

  return (
    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles}`}>
      {label}
    </span>
  );
};

export const SponsorManager: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [fyFilter, setFyFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Drag-and-drop state
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  // ── Reject modal state ───────────────────────────────────────────────────
  const [rejectTarget, setRejectTarget] = useState<Sponsor | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminSponsors();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const list = fyFilter === 'ALL' ? items : items.filter((s) => s.financial_year === fyFilter);
    return [...list].sort((a, b) => {
      const da = a.display_order ?? 0;
      const db = b.display_order ?? 0;
      if (da !== db) return da - db;
      const ca = a.created_at || '';
      const cb = b.created_at || '';
      return ca < cb ? -1 : ca > cb ? 1 : 0;
    });
  }, [items, fyFilter]);

  const fyOptions = useMemo(() => {
    return Array.from(new Set(items.map((s) => s.financial_year))).sort().reverse();
  }, [items]);

  const openCreate = () => {
    setForm({
      ...EMPTY,
      financial_year:
        new Date().getMonth() >= 3
          ? `${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`
          : `${new Date().getFullYear() - 1} - ${new Date().getFullYear()}`,
    });
    setModalOpen(true);
  };

  const openEdit = (item: Sponsor) => {
    setForm({
      id: item.id,
      name: item.name,
      name_ta: item.name_ta || '',
      description: item.description || '',
      description_ta: item.description_ta || '',
      logo_url: item.logo_url || '',
      website_url: item.website_url || '',
      financial_year: item.financial_year,
      amount: item.amount ?? '',
      sponsored_item: item.sponsored_item || '',
      is_published: item.is_published,
    });
    setModalOpen(true);
  };

  const handleLogoUpload = async (file: File) => {
    try {
      setLogoUploading(true);
      const result = await api.uploadSponsorLogo(file);
      setForm((current) => ({ ...current, logo_url: result.logo_url }));
    } catch (err) {
      alertService.handleApiError(err, 'Failed to upload sponsor logo');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alertService.showError('Missing', t('admin_sponsors_alert_missing_name'));
    if (!form.financial_year.trim()) return alertService.showError('Missing', t('admin_sponsors_alert_missing_fy'));

    setSaving(true);
    try {
      const payload: Partial<Sponsor> = {
        name: form.name.trim(),
        name_ta: form.name_ta.trim() || undefined,
        description: form.description.trim() || undefined,
        description_ta: form.description_ta.trim() || undefined,
        logo_url: form.logo_url || undefined,
        website_url: form.website_url.trim() || undefined,
        financial_year: form.financial_year.trim(),
        amount: form.amount === '' ? undefined : Number(form.amount),
        sponsored_item: form.sponsored_item.trim() || undefined,
        is_published: form.is_published,
        approval_status: 'PUBLISHED',
      };
      if (form.id) {
        await api.updateSponsor(form.id, payload);
      } else {
        await api.createSponsor(payload);
      }
      api.clearCache();
      alertService.showSuccess(
        t('admin_sponsors_alert_saved_title'),
        t('admin_sponsors_alert_saved_body')
      );
      setModalOpen(false);
      load();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to save sponsor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Sponsor) => {
    if (!window.confirm(t('admin_sponsors_confirm_delete'))) return;
    try {
      await api.deleteSponsor(item.id);
      api.clearCache();
      alertService.showSuccess(
        t('admin_sponsors_alert_deleted_title'),
        t('admin_sponsors_alert_deleted_body')
      );
      load();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to delete sponsor');
    }
  };

  const handleApprove = async (item: Sponsor) => {
    if (actioningId) return;
    setActioningId(item.id);
    try {
      await api.updateSponsor(item.id, {
        approval_status: 'PUBLISHED',
        is_published: true,
        rejection_reason: '',
      } as Partial<Sponsor>);
      api.clearCache();
      alertService.showSuccess('Approved', `"${item.name}" is now published.`);
      load();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to approve sponsor');
    } finally {
      setActioningId(null);
    }
  };

  // ── Open the reject modal (replaces window.prompt) ────────────────────────
  const openRejectModal = (item: Sponsor) => {
    if (actioningId) return;
    setRejectTarget(item);
    setRejectReason('');
  };

  const closeRejectModal = () => {
    if (rejectSubmitting) return;
    setRejectTarget(null);
    setRejectReason('');
  };

  const submitReject = async () => {
    if (!rejectTarget || rejectSubmitting) return;
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      alertService.showError('Reason required', 'Please enter the reason for rejecting this sponsor.');
      return;
    }
    setRejectSubmitting(true);
    setActioningId(rejectTarget.id);
    try {
      await api.updateSponsor(rejectTarget.id, {
        approval_status: 'REJECTED',
        is_published: false,
        rejection_reason: trimmed,
      } as Partial<Sponsor>);
      api.clearCache();
      alertService.showSuccess('Rejected', `"${rejectTarget.name}" is not publicly visible.`);
      closeRejectModal();
      load();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to reject sponsor');
    } finally {
      setRejectSubmitting(false);
      setActioningId(null);
    }
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    try {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
    } catch {}
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== dropTargetId) setDropTargetId(id);
  };

  const handleDragLeave = () => setDropTargetId(null);

  const handleDragEnd = () => {
    setDragId(null);
    setDropTargetId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = dragId;
    setDragId(null);
    setDropTargetId(null);

    if (!sourceId || sourceId === targetId) return;

    const currentFiltered = [...filtered];
    const sourceIdx = currentFiltered.findIndex((s) => s.id === sourceId);
    const targetIdx = currentFiltered.findIndex((s) => s.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const [moved] = currentFiltered.splice(sourceIdx, 1);
    currentFiltered.splice(targetIdx, 0, moved);

    const visibleIds = new Set(currentFiltered.map((s) => s.id));

    const fullSorted = [...items].sort((a, b) => {
      const da = a.display_order ?? 0;
      const db = b.display_order ?? 0;
      if (da !== db) return da - db;
      const ca = a.created_at || '';
      const cb = b.created_at || '';
      return ca < cb ? -1 : ca > cb ? 1 : 0;
    });

    const visibleQueue = [...currentFiltered];
    const newGlobalOrder: Sponsor[] = [];
    for (const s of fullSorted) {
      if (visibleIds.has(s.id)) {
        newGlobalOrder.push(visibleQueue.shift()!);
      } else {
        newGlobalOrder.push(s);
      }
    }

    const reordered = newGlobalOrder.map((s, idx) => ({ ...s, display_order: idx + 1 }));
    setItems(reordered);

    setReordering(true);
    try {
      await api.reorderAdminSponsors(
        reordered.map((s) => ({ id: s.id, display_order: s.display_order }))
      );
      api.clearCache();
      await load();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to save the new order');
      await load();
    } finally {
      setReordering(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-50 via-white to-amber-50/40 p-6 rounded-3xl border border-[#E5E7EB] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-[#F4C542] rounded-xl text-[#111111]">
              <HandHeart className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-bold text-[#111111]">{t('admin_sponsors_page_title')}</h2>
          </div>
          <p className="text-xs text-[#6B7280] mt-1 ml-10">{t('admin_sponsors_page_subtitle')}</p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto shadow-md">
          <Plus className="w-4 h-4 mr-1.5" />
          {t('admin_sponsors_btn_add')}
        </Button>
      </div>

      {fyOptions.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6B7280]">{t('admin_sponsors_filter_fy_label')}</span>
          <select
            value={fyFilter}
            onChange={(e) => setFyFilter(e.target.value)}
            className="text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 focus:outline-none focus:border-[#F4C542]"
          >
            <option value="ALL">All</option>
            {fyOptions.map((fy) => (
              <option key={fy} value={fy}>{fy}</option>
            ))}
          </select>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title={t('admin_sponsors_empty_title')}
          description={t('admin_sponsors_empty_desc')}
          action={<Button onClick={openCreate}>{t('admin_sponsors_btn_add')}</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const status = item.approval_status || (item.is_published ? 'PUBLISHED' : 'PENDING');
            const isPublished = status === 'PUBLISHED';
            const isRejected = status === 'REJECTED';
            const showApproveBtn = !isPublished;
            const showRejectBtn = !isRejected;
            const isBusy = actioningId === item.id;
            const isDragging = dragId === item.id;
            const isDropTarget = dropTargetId === item.id && dragId !== item.id;

            return (
              <div
                key={item.id}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, item.id)}
                className={
                  'bg-white border rounded-2xl p-4 transition-all shadow-xs ' +
                  (isDropTarget
                    ? 'border-[#F4C542] border-dashed border-2 bg-[#FFFDF5] scale-[1.01]'
                    : 'border-[#E5E7EB] hover:border-[#F4C542]') +
                  (isDragging ? ' opacity-40' : '')
                }
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onDragEnd={handleDragEnd}
                      title="Drag to reorder"
                      aria-label="Drag to reorder"
                      className="p-1 -ml-1 text-gray-300 hover:text-[#854D0E] cursor-grab active:cursor-grabbing transition-colors shrink-0"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <div className="w-14 h-14 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-center shrink-0 p-2">
                      {item.logo_url ? (
                        <img src={item.logo_url} alt={item.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[#854D0E] font-extrabold text-lg">{item.name.charAt(0)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    {showApproveBtn && (
                      <button
                        type="button"
                        onClick={() => handleApprove(item)}
                        disabled={isBusy}
                        title="Approve / Publish"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {showRejectBtn && (
                      <button
                        type="button"
                        onClick={() => openRejectModal(item)}
                        disabled={isBusy}
                        title="Reject / Unpublish"
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-[#111111] truncate">{item.name}</h3>
                {item.description && (
                  <p className="text-[11px] text-[#6B7280] mt-1 line-clamp-2">{item.description}</p>
                )}
                {item.sponsored_item && (
                  <p className="text-[11px] text-[#4B5563] mt-1 truncate">{item.sponsored_item}</p>
                )}

                <div className="mt-3 pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-[#4B5563]">{item.financial_year}</span>
                  <StatusPill sponsor={item} />
                </div>

                {item.website_url && (
                  <a
                    href={item.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-[11px] text-blue-600 hover:underline inline-flex items-center space-x-1"
                  >
                    <span>{t('audit_sponsors_visit')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {item.rejection_reason && isRejected && (
                  <p className="mt-2 text-[10px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1">
                    <strong>Reason:</strong> {item.rejection_reason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {reordering && (
        <div className="fixed bottom-6 right-6 bg-[#111111] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg">
          Saving order…
        </div>
      )}

      {/* ── Reject Sponsor Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={closeRejectModal}
        title="Reject Sponsor"
      >
        {rejectTarget && (
          <div className="space-y-4">
            <p className="text-xs text-[#6B7280] -mt-1">
              Sponsor: <strong className="text-[#111111]">{rejectTarget.name}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Reason for Rejection <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                disabled={rejectSubmitting}
                placeholder="Enter the reason for rejecting this sponsor..."
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F4C542] resize-none disabled:opacity-60"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={closeRejectModal}
                disabled={rejectSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={submitReject}
                isLoading={rejectSubmitting}
                disabled={rejectSubmitting || !rejectReason.trim()}
              >
                Reject Sponsor
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit modal — unchanged */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? t('admin_sponsors_modal_title_edit') : t('admin_sponsors_modal_title_create')}
      >
        <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('admin_sponsors_form_name')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label={t('admin_sponsors_form_name_ta')}
              value={form.name_ta}
              onChange={(e) => setForm({ ...form, name_ta: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#111111]">{t('admin_sponsors_form_logo')}</label>
            {form.logo_url ? (
              <div className="relative w-28 h-28 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-2">
                <img src={form.logo_url} alt={form.name || 'Sponsor logo'} className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, logo_url: '' })}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-white border border-[#E5E7EB] text-gray-500 hover:text-rose-600"
                  aria-label="Remove sponsor logo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 h-20 rounded-xl border border-dashed border-[#D1D5DB] bg-[#FAFAFA] text-xs text-[#6B7280] cursor-pointer hover:border-[#F4C542]">
                <UploadCloud className="w-4 h-4" />
                <span>{logoUploading ? 'Uploading...' : 'Upload logo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={logoUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleLogoUpload(file);
                    e.currentTarget.value = '';
                  }}
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('admin_sponsors_form_website')}
              value={form.website_url}
              onChange={(e) => setForm({ ...form, website_url: e.target.value })}
            />
            <Input
              label={t('admin_sponsors_form_fy')}
              placeholder="2025 - 2026"
              value={form.financial_year}
              onChange={(e) => setForm({ ...form, financial_year: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('admin_sponsors_form_amount')}
              placeholder="e.g. ₹50,000"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value === '' ? '' : Number(e.target.value) })}
            />
            <Input
              label={t('admin_sponsors_form_sponsored_item')}
              placeholder="e.g. 200 Laptops"
              value={form.sponsored_item}
              onChange={(e) => setForm({ ...form, sponsored_item: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">
              {t('admin_sponsors_form_description')}
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F4C542]"
            />
          </div>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="w-4 h-4 text-[#F4C542] rounded"
            />
            <span className="text-xs font-semibold text-[#111111]">
              {t('admin_sponsors_form_published')}
            </span>
          </label>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={saving}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};