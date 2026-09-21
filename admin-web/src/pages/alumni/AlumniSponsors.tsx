import React, { useEffect, useState } from 'react';
import { Edit3, ExternalLink, HandHeart, Plus, Trash2, UploadCloud, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { EmptyState, LoadingState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { useLanguage } from '../../context/LanguageContext';
import type { Sponsor } from '../../types';

interface Props {
  mine?: boolean;
  /** When true, hides the list and auto-opens the add form (used inside a Modal). */
  formOnly?: boolean;
  /** Called after a successful save when in formOnly mode. */
  onSubmitted?: () => void;
}

type FormState = {
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
};

const emptyForm = (): FormState => ({
  name: '',
  name_ta: '',
  description: '',
  description_ta: '',
  logo_url: '',
  website_url: '',
  financial_year:
    new Date().getMonth() >= 3
      ? `${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`
      : `${new Date().getFullYear() - 1} - ${new Date().getFullYear()}`,
  amount: '',
  sponsored_item: '',
});

const formatAmount = (amount?: number) =>
  amount == null
    ? 'N/A'
    : new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }).format(amount);

export const AlumniSponsors: React.FC<Props> = ({
  mine = false,
  formOnly = false,
  onSubmitted,
}) => {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const currentFinancialYear = () => {
    const year = new Date().getFullYear();
    return new Date().getMonth() >= 3
      ? `${year} - ${year + 1}`
      : `${year - 1} - ${year}`;
  };

  const load = async () => {
    setLoading(true);
    try {
      setItems(
        mine
          ? await api.getMySponsors()
          : await api.getPublicSponsors(currentFinancialYear())
      );
    } catch (error) {
      console.error(error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mine]);

  // Auto-open the form when rendered in formOnly mode (inside the Modal)
  useEffect(() => {
    if (formOnly) {
      setForm(emptyForm());
      setFormOpen(true);
    }
  }, [formOnly]);

  const save = async () => {
    if (!form.name.trim() || !form.financial_year.trim()) {
      alertService.showError(
        t('alumni_sponsors_missing_title'),
        t('alumni_sponsors_missing_body')
      );
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        name_ta: form.name_ta.trim() || undefined,
        description: form.description.trim() || undefined,
        description_ta: form.description_ta.trim() || undefined,
        logo_url: form.logo_url || undefined,
        website_url: form.website_url.trim() || undefined,
        financial_year: form.financial_year.trim(),
        amount: form.amount === '' ? undefined : Number(form.amount),
        sponsored_item: form.sponsored_item.trim() || undefined,
      };
      if (form.id) await api.updateMySponsor(form.id, payload);
      else await api.createMySponsor(payload);
      api.clearCache();
      alertService.showSuccess(
        t('alumni_sponsors_saved_title'),
        t('alumni_sponsors_saved_body')
      );
      setForm(emptyForm());
      setFormOpen(false);
      await load();
      // Notify the parent (used to close the Modal + refresh aggregates)
      if (formOnly) onSubmitted?.();
    } catch (error) {
      alertService.handleApiError(error, t('alumni_sponsors_save_error'));
    } finally {
      setSaving(false);
    }
  };

  const edit = (item: Sponsor) => {
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
    });
    setFormOpen(true);
  };

  const remove = async (item: Sponsor) => {
    if (!window.confirm(t('alumni_sponsors_delete_confirm'))) return;
    try {
      await api.deleteMySponsor(item.id);
      api.clearCache();
      await load();
    } catch (error) {
      alertService.handleApiError(error, t('alumni_sponsors_delete_error'));
    }
  };

  const uploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const result = await api.uploadMySponsorLogo(file);
      setForm((current) => ({ ...current, logo_url: result.logo_url }));
    } catch (error) {
      alertService.handleApiError(error, t('alumni_sponsors_upload_error'));
    } finally {
      setUploading(false);
    }
  };

  // In formOnly mode we only render the form (used inside a Modal).
  // We skip the list-level loading state so the form appears instantly.
  if (loading && !formOnly) return <LoadingState />;

  return (
    <div className="space-y-4">
      {!formOnly && !mine && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#111111]">
              {t('alumni_sponsors_title')}
            </h2>
            <p className="text-xs text-[#6B7280]">{t('alumni_sponsors_subtitle')}</p>
          </div>
          <Button
            onClick={() => {
              setForm(emptyForm());
              setFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t('alumni_sponsors_add')}
          </Button>
        </div>
      )}
      {!formOnly && mine && (
        <div>
          <h2 className="text-lg font-extrabold text-[#111111]"></h2>
          
        </div>
      )}

      {formOpen && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#111111]">
              {form.id ? t('alumni_sponsors_edit') : t('alumni_sponsors_add')}
            </h3>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                if (formOnly) onSubmitted?.();
              }}
              className="p-1 text-gray-500 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('alumni_sponsors_name')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label={t('alumni_sponsors_name_ta')}
              value={form.name_ta}
              onChange={(e) => setForm({ ...form, name_ta: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('alumni_sponsors_financial_year')}
              value={form.financial_year}
              onChange={(e) =>
                setForm({ ...form, financial_year: e.target.value })
              }
            />
            <Input
              label={t('alumni_sponsors_amount')}
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) =>
                setForm({
                  ...form,
                  amount: e.target.value === '' ? '' : Number(e.target.value),
                })
              }
            />
          </div>

          <Input
            label={t('alumni_sponsors_item')}
            value={form.sponsored_item}
            onChange={(e) =>
              setForm({ ...form, sponsored_item: e.target.value })
            }
          />

          <Input
            label={t('alumni_sponsors_website')}
            value={form.website_url}
            onChange={(e) => setForm({ ...form, website_url: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <textarea
              aria-label={t('alumni_sponsors_description')}
              placeholder={t('alumni_sponsors_description')}
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F4C542]"
            />
            <textarea
              aria-label={t('alumni_sponsors_description_ta')}
              placeholder={t('alumni_sponsors_description_ta')}
              rows={3}
              value={form.description_ta}
              onChange={(e) =>
                setForm({ ...form, description_ta: e.target.value })
              }
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F4C542]"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-xl text-xs cursor-pointer">
              <UploadCloud className="w-4 h-4 text-[#854D0E]" />
              {uploading
                ? t('alumni_sponsors_uploading')
                : t('alumni_sponsors_upload_logo')}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadLogo(file);
                  e.currentTarget.value = '';
                }}
              />
            </label>
            {form.logo_url && (
              <img
                src={form.logo_url}
                alt={form.name}
                className="w-12 h-12 rounded-lg object-contain border border-gray-200"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => {
                setFormOpen(false);
                if (formOnly) onSubmitted?.();
              }}
            >
              {t('alumni_sponsors_cancel')}
            </Button>
            <Button onClick={() => void save()} isLoading={saving}>
              {t('alumni_sponsors_submit')}
            </Button>
          </div>
        </div>
      )}

      {!formOnly &&
        (items.length === 0 ? (
          <EmptyState
            title={mine ? t('alumni_my_sponsors_empty') : t('alumni_sponsors_empty')}
            description=""
            action={
              !mine ? (
                <Button
                  onClick={() => {
                    setForm(emptyForm());
                    setFormOpen(true);
                  }}
                >
                  {t('alumni_sponsors_add')}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] p-2 flex items-center justify-center">
                    {item.logo_url ? (
                      <img
                        src={item.logo_url}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <HandHeart className="w-6 h-6 text-[#854D0E]" />
                    )}
                  </div>
                  {mine && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => edit(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(item)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="mt-3 font-bold text-sm text-[#111111]">
                  {language === 'ta' && item.name_ta ? item.name_ta : item.name}
                </h3>
                {item.description && (
                  <p className="mt-1 text-xs text-[#6B7280] line-clamp-2">
                    {language === 'ta' && item.description_ta
                      ? item.description_ta
                      : item.description}
                  </p>
                )}
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px]">
                  <span className="text-gray-500">{item.financial_year}</span>
                  <span className="text-right font-bold text-[#854D0E]">
                    {formatAmount(item.amount)}
                  </span>
                  <span className="text-gray-600 col-span-2">
                    {item.sponsored_item || '—'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full ${
                      item.is_published
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {item.is_published
                      ? t('alumni_sponsors_published')
                      : t('alumni_sponsors_pending')}
                  </span>
                  {item.website_url && (
                    <a
                      href={item.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 inline-flex items-center gap-1"
                    >
                      {t('alumni_sponsors_website')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};