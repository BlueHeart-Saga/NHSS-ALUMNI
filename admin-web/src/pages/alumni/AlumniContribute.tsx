import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HandCoins, Send } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  embedded?: boolean;
  onSubmitted?: () => void;
}

/** Factory for a completely fresh form state. */
const makeInitialState = () => ({
  amount: '',
  purpose: 'GENERAL',
  customPurpose: '',
  purposeNote: '',
  contributionDate: new Date().toISOString().slice(0, 10),
  contactNumber: '',
  address: '',
  remarks: '',
  isPublic: false,
  receiptRequired: 'NO' as 'YES' | 'NO',
});

export const AlumniContribute: React.FC<Props> = ({ embedded = false, onSubmitted }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // ── Form state ────────────────────────────────────────────────────────────
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('GENERAL');
  const [customPurpose, setCustomPurpose] = useState('');
  const [purposeNote, setPurposeNote] = useState('');
  const [contributionDate, setContributionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [receiptRequired, setReceiptRequired] = useState<'YES' | 'NO'>('NO');

  const [submitting, setSubmitting] = useState(false);

  // ── Reset all form fields to their initial values ─────────────────────────
  const resetForm = useCallback(() => {
    const initial = makeInitialState();
    setAmount(initial.amount);
    setPurpose(initial.purpose);
    setCustomPurpose(initial.customPurpose);
    setPurposeNote(initial.purposeNote);
    setContributionDate(initial.contributionDate);
    setContactNumber(initial.contactNumber);
    setAddress(initial.address);
    setRemarks(initial.remarks);
    setIsPublic(initial.isPublic);
    setReceiptRequired(initial.receiptRequired);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePurposeChange = (value: string) => {
    setPurpose(value);
    if (value !== 'OTHER') {
      setCustomPurpose('');
    }
  };

  const isValidContact = (value: string): boolean => {
    const cleaned = value.replace(/[\s\-()]/g, '');
    return /^(?:\+?91|0)?[6-9]\d{9}$/.test(cleaned);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Prevent double submission while a request is already in flight
    if (submitting) return;

    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      alertService.showError('Invalid Amount', 'Please enter a valid contribution amount.');
      return;
    }
    if (purpose === 'OTHER' && !customPurpose.trim()) {
      alertService.showError(
        'Please Specify Purpose',
        'Please describe the specific purpose for this contribution.'
      );
      return;
    }
    if (!contactNumber.trim()) {
      alertService.showError(
        'Contact Number Required',
        'Please enter your contact number so the school can reach you about this contribution.'
      );
      return;
    }
    if (!isValidContact(contactNumber)) {
      alertService.showError(
        'Invalid Contact Number',
        'Please enter a valid 10-digit mobile number (e.g. 9876543210 or +91 9876543210).'
      );
      return;
    }

    setSubmitting(true);
    try {
      await api.createContribution({
        amount: amt,
        purpose: purpose as any,
        purpose_note: purposeNote || undefined,
        contribution_date: contributionDate,
        public_visibility: isPublic,
        remarks: remarks.trim() || undefined,
        contact_number: contactNumber.trim(),
        address: address.trim() || undefined,
        specific_purpose:
          purpose === 'OTHER' && customPurpose.trim()
            ? customPurpose.trim()
            : undefined,
        receipt_required: receiptRequired === 'YES',
      });

      // ── Success path: only reset AFTER the API confirms creation ──────────
      alertService.showSuccess(
        t('alumni_contribute_success_title'),
        t('alumni_contribute_success_body')
      );

      // 1) Clear every field so if the form is reopened it starts fresh
      resetForm();

      // 2) Notify the parent — in embedded/modal mode this closes the modal
      //    and refreshes the "My Contributions" list.
      if (embedded) {
        onSubmitted?.();
      } else {
        navigate('/alumni/support/contributions');
      }
    } catch (err) {
      // ── Error path: keep the form open and preserve entered values ────────
      alertService.handleApiError(err, 'Failed to submit contribution');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
      {!embedded && (
        <button
          onClick={() => navigate('/alumni/support')}
          className="inline-flex items-center text-xs font-semibold text-[#6B7280] hover:text-[#111111]"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
      )}

      {!embedded && (
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-xl flex items-center justify-center">
            <HandCoins className="w-5 h-5 text-[#854D0E]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111]">
              {t('alumni_contribute_title')}
            </h1>
            <p className="text-xs text-[#6B7280]">{t('alumni_contribute_subtitle')}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <Input
          label={t('alumni_contribute_form_amount')}
          type="number"
          placeholder={t('alumni_contribute_form_amount_placeholder')}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Select
          label={t('alumni_contribute_form_purpose')}
          value={purpose}
          onChange={(e) => handlePurposeChange(e.target.value)}
          options={[
            { label: t('contribution_purpose_general'), value: 'GENERAL' },
            { label: t('contribution_purpose_scholarship'), value: 'SCHOLARSHIP' },
            { label: t('contribution_purpose_infrastructure'), value: 'INFRASTRUCTURE' },
            { label: t('contribution_purpose_event'), value: 'EVENT' },
            { label: t('contribution_purpose_other'), value: 'OTHER' },
          ]}
        />

        {purpose === 'OTHER' && (
          <div className="animate-fadeIn">
            <Input
              label="Please Specify Purpose *"
              placeholder="e.g. Medical support, Library books, Sports equipment..."
              value={customPurpose}
              onChange={(e) => setCustomPurpose(e.target.value)}
            />
          </div>
        )}

        <Input
          label={t('alumni_contribute_form_purpose_note')}
          value={purposeNote}
          onChange={(e) => setPurposeNote(e.target.value)}
        />

        <Input
          label={t('alumni_contribute_form_date')}
          type="date"
          value={contributionDate}
          onChange={(e) => setContributionDate(e.target.value)}
        />

        <Input
          label="Contact Number *"
          type="tel"
          inputMode="tel"
          placeholder="e.g. 9876543210 or +91 9876543210"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1.5">
            Address <span className="text-[#6B7280] font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address..."
            className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F4C542]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1.5">
            {t('alumni_contribute_form_remarks')}
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F4C542]"
          />
        </div>

        <label className="flex items-center space-x-2 cursor-pointer bg-[#FFFDF5] border border-amber-200 rounded-xl p-3">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 text-[#F4C542] rounded"
          />
          <span className="text-xs font-semibold text-[#111111]">
            {t('alumni_contribute_form_public')}
          </span>
        </label>

        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1.5">
            Receipt Required? <span className="text-[#6B7280] font-normal">(optional)</span>
          </label>
          <div className="flex gap-2">
            {(['YES', 'NO'] as const).map((opt) => {
              const active = receiptRequired === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setReceiptRequired(opt)}
                  disabled={submitting}
                  className={
                    'px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-[0.98] disabled:opacity-50 ' +
                    (active
                      ? 'bg-[#F4C542] border-[#F4C542] text-[#111111] shadow-sm'
                      : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:border-[#F4C542]')
                  }
                >
                  {opt === 'YES' ? 'Yes' : 'No'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <Button onClick={handleSubmit} isLoading={submitting} disabled={submitting}>
            <Send className="w-4 h-4 mr-1.5" />
            {submitting ? t('alumni_contribute_submitting') : t('alumni_contribute_submit')}
          </Button>
        </div>
      </div>
    </div>
  );
};