import React, { useEffect, useMemo, useState } from 'react';
import {
  HandCoins, Search, CheckCircle2, XCircle, Edit3, Trash2,
  Eye, EyeOff, TrendingUp, Clock, User, Calendar, Phone, FileText, Plus
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { useLanguage } from '../../context/LanguageContext';
import type { Contribution, ContributionStatus } from '../../types';
import { AdminContributionModal } from './AdminContributionModal';

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

const PURPOSE_KEYS: Record<string, string> = {
  GENERAL: 'contribution_purpose_general',
  SCHOLARSHIP: 'contribution_purpose_scholarship',
  INFRASTRUCTURE: 'contribution_purpose_infrastructure',
  EVENT: 'contribution_purpose_event',
  OTHER: 'contribution_purpose_other',
};

/** Small helper to render a clean "Not provided" fallback. */
const valueOrFallback = (value?: string | number | null): string => {
  if (value === null || value === undefined) return 'Not provided';
  const str = String(value).trim();
  return str.length === 0 ? 'Not provided' : str;
};

/** Tri-state renderer for the receipt_required boolean field. */
const receiptOrFallback = (value?: boolean | null): string => {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return 'Not provided';
};

export const ContributionManager: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<Contribution[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [fyFilter, setFyFilter] = useState<string>('ALL');
  const [editItem, setEditItem] = useState<Contribution | null>(null);
  const [detailsItem, setDetailsItem] = useState<Contribution | null>(null);
  const [saving, setSaving] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [list, ana] = await Promise.all([
        api.getAdminContributions(),
        api.getContributionAnalytics(),
      ]);
      setItems(list);
      setAnalytics(ana);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (fyFilter !== 'ALL' && c.financial_year !== fyFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.contributor_name.toLowerCase().includes(q) ||
          (c.payment_reference || '').toLowerCase().includes(q) ||
          (c.purpose || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, statusFilter, fyFilter, search]);

  const totals = useMemo(() => {
    const completed = filtered.filter((c) => c.status === 'COMPLETED');
    return {
      collected: completed.reduce((s, c) => s + (c.amount || 0), 0),
      count: filtered.length,
      completedCount: completed.length,
      pendingCount: filtered.filter((c) => c.status === 'PENDING').length,
    };
  }, [filtered]);

  const fyOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((c) => c.financial_year && set.add(c.financial_year));
    return Array.from(set).sort().reverse();
  }, [items]);

  const handleStatusChange = async (c: Contribution, status: ContributionStatus) => {
    try {
      await api.updateContributionAdmin(c.id, { status });
      api.clearCache();
      alertService.showSuccess(
        t('admin_contributions_alert_updated_title'),
        t('admin_contributions_alert_updated_body')
      );
      load();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to update status');
    }
  };

  const handleToggleVisibility = async (c: Contribution) => {
    try {
      await api.updateContributionAdmin(c.id, { public_visibility: !c.public_visibility });
      api.clearCache();
      load();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to update visibility');
    }
  };

  const handleDelete = async (c: Contribution) => {
    if (!window.confirm(t('admin_contributions_confirm_delete'))) return;
    try {
      await api.deleteContributionAdmin(c.id);
      api.clearCache();
      alertService.showSuccess(
        t('admin_contributions_alert_deleted_title'),
        t('admin_contributions_alert_deleted_body')
      );
      load();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to delete');
    }
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await api.updateContributionAdmin(editItem.id, {
        amount: editItem.amount,
        purpose: editItem.purpose,
        status: editItem.status,
        contribution_date: editItem.contribution_date,
        financial_year: editItem.financial_year,
        payment_reference: editItem.payment_reference,
        admin_remarks: editItem.admin_remarks,
        public_visibility: editItem.public_visibility,
      });
      api.clearCache();
      alertService.showSuccess(
        t('admin_contributions_alert_updated_title'),
        t('admin_contributions_alert_updated_body')
      );
      setEditItem(null);
      load();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50/40 p-6 rounded-3xl border border-[#E5E7EB] shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-[#F4C542] rounded-xl text-[#111111]">
            <HandCoins className="w-5 h-5" />
          </span>
          <h2 className="text-2xl font-bold text-[#111111]">{t('admin_contributions_page_title')}</h2>
        </div>
        <p className="text-xs text-[#6B7280] mt-1 ml-10">{t('admin_contributions_page_subtitle')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#6B7280] mb-2">
            <span className="text-[11px] font-semibold uppercase">{t('admin_contributions_stat_total')}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-[#111111]">₹ {fmtINR(totals.collected)}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#6B7280] mb-2">
            <span className="text-[11px] font-semibold uppercase">{t('admin_contributions_stat_count')}</span>
            <HandCoins className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-[#111111]">{totals.count}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#6B7280] mb-2">
            <span className="text-[11px] font-semibold uppercase">{t('admin_contributions_stat_completed')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-[#111111]">{totals.completedCount}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#6B7280] mb-2">
            <span className="text-[11px] font-semibold uppercase">{t('admin_contributions_stat_pending')}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-extrabold text-[#111111]">{totals.pendingCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin_contributions_search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
          />
        </div>

        {/* + Add Contribution */}
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold text-xs rounded-xl shadow-sm transition-all active:scale-[0.98] w-full md:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Contribution
        </button>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 focus:outline-none focus:border-[#F4C542] w-full md:w-auto"
        >
          <option value="ALL">{t('admin_contributions_filter_all_status')}</option>
          <option value="PENDING">PENDING</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <select
          value={fyFilter}
          onChange={(e) => setFyFilter(e.target.value)}
          className="text-xs bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 focus:outline-none focus:border-[#F4C542] w-full md:w-auto"
        >
          <option value="ALL">{t('admin_contributions_filter_all_fy')}</option>
          {fyOptions.map((fy) => (
            <option key={fy} value={fy}>{fy}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title={t('admin_contributions_empty_title')}
          description={t('admin_contributions_empty_desc')}
        />
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  <th className="px-4 py-3">{t('admin_contributions_col_contributor')}</th>
                  <th className="px-4 py-3">{t('admin_contributions_col_batch')}</th>
                  <th className="px-4 py-3 text-right">{t('admin_contributions_col_amount')}</th>
                  <th className="px-4 py-3">{t('admin_contributions_col_date')}</th>
                  <th className="px-4 py-3">{t('admin_contributions_col_fy')}</th>
                  <th className="px-4 py-3">{t('admin_contributions_col_purpose')}</th>
                  <th className="px-4 py-3">{t('admin_contributions_col_status')}</th>
                  <th className="px-4 py-3 text-center">{t('admin_contributions_col_visibility')}</th>
                  <th className="px-4 py-3 text-right">{t('admin_contributions_col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6] text-xs">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 font-semibold text-[#111111]">{c.contributor_name}</td>
                    <td className="px-4 py-3 text-[#4B5563]">{c.batch_year || '—'}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#111111]">
                      {fmtINR(c.amount)}
                    </td>
                    <td className="px-4 py-3 text-[#4B5563]">{c.contribution_date || '—'}</td>
                    <td className="px-4 py-3 text-[#4B5563]">{c.financial_year || '—'}</td>
                    <td className="px-4 py-3 text-[#4B5563]">
                      {t(PURPOSE_KEYS[c.purpose || 'GENERAL'] || 'contribution_purpose_general')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          c.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : c.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleVisibility(c)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          c.public_visibility
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={t('admin_contributions_action_toggle_visibility')}
                      >
                        {c.public_visibility ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-1">
                        {/* View Details */}
                        <button
                          onClick={() => setDetailsItem(c)}
                          className="p-1.5 text-[#854D0E] hover:bg-[#FFF7D6] rounded-lg"
                          title="View Details"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {c.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleStatusChange(c, 'COMPLETED')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title={t('admin_contributions_action_approve')}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {c.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleStatusChange(c, 'REJECTED')}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title={t('admin_contributions_action_reject')}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditItem({ ...c })}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title={t('admin_contributions_action_edit')}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          title={t('admin_contributions_action_delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Details Modal ──────────────────────────────────────────────────── */}
      {detailsItem && (
        <Modal
          isOpen={!!detailsItem}
          onClose={() => setDetailsItem(null)}
          title="Contribution Details"
        >
          <p className="text-xs text-[#6B7280] -mt-1 mb-4">
            Complete contribution information submitted by the alumni
          </p>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden">
              <div className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#FFFDF5] to-white border-b border-[#E5E7EB]">
                <span className="w-6 h-6 rounded-lg bg-[#FFF7D6] border border-[#F4C542]/50 flex items-center justify-center text-[#854D0E]">
                  <User className="w-3.5 h-3.5" />
                </span>
                <h4 className="text-xs font-extrabold text-[#111111] uppercase tracking-wider">Contributor</h4>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                  <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">Name</span>
                  <span className="text-[#111111] break-words">{valueOrFallback(detailsItem.contributor_name)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                  <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">Batch</span>
                  <span className="text-[#111111] break-words">{valueOrFallback(detailsItem.batch_year)}</span>
                </div>
              </div>
            </div>

            <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden">
              <div className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#FFFDF5] to-white border-b border-[#E5E7EB]">
                <span className="w-6 h-6 rounded-lg bg-[#FFF7D6] border border-[#F4C542]/50 flex items-center justify-center text-[#854D0E]">
                  <HandCoins className="w-3.5 h-3.5" />
                </span>
                <h4 className="text-xs font-extrabold text-[#111111] uppercase tracking-wider">Contribution</h4>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                  <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">Amount</span>
                  <span className="text-[#111111] break-words">₹ {fmtINR(detailsItem.amount || 0)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                  <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">Purpose</span>
                  <span className="text-[#111111] break-words">
                    {t(PURPOSE_KEYS[detailsItem.purpose || 'GENERAL'] || 'contribution_purpose_general')}
                  </span>
                </div>
                {detailsItem.purpose === 'OTHER' && (
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                    <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">Specific Purpose</span>
                    <span className="text-[#111111] break-words">{valueOrFallback(detailsItem.specific_purpose)}</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                  <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">Purpose Note</span>
                  <span className="text-[#111111] break-words">{valueOrFallback(detailsItem.purpose_note)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                  <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">Contribution Date</span>
                  <span className="text-[#111111] break-words">{valueOrFallback(detailsItem.contribution_date)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                  <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">Financial Year</span>
                  <span className="text-[#111111] break-words">{valueOrFallback(detailsItem.financial_year)}</span>
                </div>
              </div>
            </div>

            <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden">
              <div className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#FFFDF5] to-white border-b border-[#E5E7EB]">
                <span className="w-6 h-6 rounded-lg bg-[#FFF7D6] border border-[#F4C542]/50 flex items-center justify-center text-[#854D0E]">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <h4 className="text-xs font-extrabold text-[#111111] uppercase tracking-wider">Contact Information</h4>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                  <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">Contact Number</span>
                  <span className="text-[#111111] break-words">{valueOrFallback(detailsItem.contact_number)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                  <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">Address</span>
                  <span className="text-[#111111] break-words">{valueOrFallback(detailsItem.address)}</span>
                </div>
              </div>
            </div>

            <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden">
              <div className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#FFFDF5] to-white border-b border-[#E5E7EB]">
                <span className="w-6 h-6 rounded-lg bg-[#FFF7D6] border border-[#F4C542]/50 flex items-center justify-center text-[#854D0E]">
                  <FileText className="w-3.5 h-3.5" />
                </span>
                <h4 className="text-xs font-extrabold text-[#111111] uppercase tracking-wider">Additional Information</h4>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                  <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">Remarks</span>
                  <span className="text-[#111111] break-words">{valueOrFallback(detailsItem.remarks)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                  <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">
                    Show my name in public Top Contributors list
                  </span>
                  <span className="text-[#111111] break-words">
                    {detailsItem.public_visibility ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                  <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">Receipt Required</span>
                  <span className="text-[#111111] break-words">{receiptOrFallback(detailsItem.receipt_required)}</span>
                </div>
                {detailsItem.admin_remarks && (
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                    <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">Admin Remarks</span>
                    <span className="text-[#111111] break-words">{detailsItem.admin_remarks}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden">
              <div className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#FFFDF5] to-white border-b border-[#E5E7EB]">
                <span className="w-6 h-6 rounded-lg bg-[#FFF7D6] border border-[#F4C542]/50 flex items-center justify-center text-[#854D0E]">
                  <Calendar className="w-3.5 h-3.5" />
                </span>
                <h4 className="text-xs font-extrabold text-[#111111] uppercase tracking-wider">Status</h4>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                  <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">Current Status</span>
                  <span className="text-[#111111] break-words">{detailsItem.status}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                  <span className="sm:w-44 shrink-0 font-semibold text-[#6B7280]">Submitted On</span>
                  <span className="text-[#111111] break-words">
                    {valueOrFallback(
                      detailsItem.created_at ? detailsItem.created_at.slice(0, 10) : undefined
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setDetailsItem(null)}>Close</Button>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {editItem && (
        <Modal
          isOpen={!!editItem}
          onClose={() => setEditItem(null)}
          title={t('admin_contributions_modal_title')}
        >
          <div className="space-y-3">
            <Input
              label={t('admin_contributions_form_amount')}
              type="number"
              value={editItem.amount}
              onChange={(e) => setEditItem({ ...editItem, amount: Number(e.target.value) })}
            />
            <Select
              label={t('admin_contributions_form_purpose')}
              value={editItem.purpose}
              onChange={(e) => setEditItem({ ...editItem, purpose: e.target.value as any })}
              options={[
                { label: t('contribution_purpose_general'), value: 'GENERAL' },
                { label: t('contribution_purpose_scholarship'), value: 'SCHOLARSHIP' },
                { label: t('contribution_purpose_infrastructure'), value: 'INFRASTRUCTURE' },
                { label: t('contribution_purpose_event'), value: 'EVENT' },
                { label: t('contribution_purpose_other'), value: 'OTHER' },
              ]}
            />
            <Select
              label={t('admin_contributions_form_status')}
              value={editItem.status}
              onChange={(e) => setEditItem({ ...editItem, status: e.target.value as any })}
              options={[
                { label: 'PENDING', value: 'PENDING' },
                { label: 'COMPLETED', value: 'COMPLETED' },
                { label: 'REJECTED', value: 'REJECTED' },
              ]}
            />
            <Input
              label={t('admin_contributions_form_date')}
              type="date"
              value={editItem.contribution_date || ''}
              onChange={(e) => setEditItem({ ...editItem, contribution_date: e.target.value })}
            />
            <Input
              label={t('admin_contributions_form_fy')}
              value={editItem.financial_year || ''}
              onChange={(e) => setEditItem({ ...editItem, financial_year: e.target.value })}
            />
            <Input
              label={t('admin_contributions_form_reference')}
              value={editItem.payment_reference || ''}
              onChange={(e) => setEditItem({ ...editItem, payment_reference: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                {t('admin_contributions_form_admin_remarks')}
              </label>
              <textarea
                rows={2}
                value={editItem.admin_remarks || ''}
                onChange={(e) => setEditItem({ ...editItem, admin_remarks: e.target.value })}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F4C542]"
              />
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editItem.public_visibility}
                onChange={(e) => setEditItem({ ...editItem, public_visibility: e.target.checked })}
                className="w-4 h-4 text-[#F4C542] rounded"
              />
              <span className="text-xs font-semibold text-[#111111]">
                {t('admin_contributions_form_public')}
              </span>
            </label>
            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setEditItem(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} isLoading={saving}>Save</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Contribution Modal */}
      <AdminContributionModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmitted={() => {
          api.clearCache();
          load();
        }}
      />
    </div>
  );
};