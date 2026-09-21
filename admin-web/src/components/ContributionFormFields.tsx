import React from 'react';
import { Input, Select } from './Input';
import { useLanguage } from '../context/LanguageContext';
import type {
  ContributionFormValues,
  ReceiptRequired,
} from '../hooks/useContributionFormState';

interface Props {
  values: ContributionFormValues;
  setField: <K extends keyof ContributionFormValues>(
    key: K,
    value: ContributionFormValues[K]
  ) => void;
  handlePurposeChange: (value: string) => void;
  disabled?: boolean;
}

export const ContributionFormFields: React.FC<Props> = ({
  values,
  setField,
  handlePurposeChange,
  disabled = false,
}) => {
  const { t } = useLanguage();

  return (
    <>
      {/* 1. Amount */}
      <Input
        label={t('alumni_contribute_form_amount')}
        type="number"
        placeholder={t('alumni_contribute_form_amount_placeholder')}
        value={values.amount}
        onChange={(e) => setField('amount', e.target.value)}
        disabled={disabled}
      />

      {/* 2. Purpose */}
      <Select
        label={t('alumni_contribute_form_purpose')}
        value={values.purpose}
        onChange={(e) => handlePurposeChange(e.target.value)}
        disabled={disabled}
        options={[
          { label: t('contribution_purpose_general'), value: 'GENERAL' },
          { label: t('contribution_purpose_scholarship'), value: 'SCHOLARSHIP' },
          { label: t('contribution_purpose_infrastructure'), value: 'INFRASTRUCTURE' },
          { label: t('contribution_purpose_event'), value: 'EVENT' },
          { label: t('contribution_purpose_other'), value: 'OTHER' },
        ]}
      />

      {/* 2b. Conditional — Please Specify Purpose (only when "Other") */}
      {values.purpose === 'OTHER' && (
        <div className="animate-fadeIn">
          <Input
            label="Please Specify Purpose *"
            placeholder="e.g. Medical support, Library books, Sports equipment..."
            value={values.customPurpose}
            onChange={(e) => setField('customPurpose', e.target.value)}
            disabled={disabled}
          />
        </div>
      )}

      {/* 3. Purpose Note */}
      <Input
        label={t('alumni_contribute_form_purpose_note')}
        value={values.purposeNote}
        onChange={(e) => setField('purposeNote', e.target.value)}
        disabled={disabled}
      />

      {/* 4. Contribution Date */}
      <Input
        label={t('alumni_contribute_form_date')}
        type="date"
        value={values.contributionDate}
        onChange={(e) => setField('contributionDate', e.target.value)}
        disabled={disabled}
      />

      {/* 5. Contact Number */}
      <Input
        label="Contact Number *"
        type="tel"
        inputMode="tel"
        placeholder="e.g. 9876543210 or +91 9876543210"
        value={values.contactNumber}
        onChange={(e) => setField('contactNumber', e.target.value)}
        disabled={disabled}
      />

      {/* 6. Address */}
      <div>
        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
          Address <span className="text-[#6B7280] font-normal">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={values.address}
          onChange={(e) => setField('address', e.target.value)}
          disabled={disabled}
          placeholder="Enter your address..."
          className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F4C542] disabled:opacity-60"
        />
      </div>

      {/* 7. Remarks */}
      <div>
        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
          {t('alumni_contribute_form_remarks')}
        </label>
        <textarea
          rows={2}
          value={values.remarks}
          onChange={(e) => setField('remarks', e.target.value)}
          disabled={disabled}
          className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F4C542] disabled:opacity-60"
        />
      </div>

      {/* 8. Public visibility */}
      <label className="flex items-center space-x-2 cursor-pointer bg-[#FFFDF5] border border-amber-200 rounded-xl p-3">
        <input
          type="checkbox"
          checked={values.isPublic}
          onChange={(e) => setField('isPublic', e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 text-[#F4C542] rounded"
        />
        <span className="text-xs font-semibold text-[#111111]">
          {t('alumni_contribute_form_public')}
        </span>
      </label>

      {/* 9. Receipt Required */}
      <div>
        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
          Receipt Required? <span className="text-[#6B7280] font-normal">(optional)</span>
        </label>
        <div className="flex gap-2">
          {(['YES', 'NO'] as ReceiptRequired[]).map((opt) => {
            const active = values.receiptRequired === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setField('receiptRequired', opt)}
                disabled={disabled}
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
    </>
  );
};