import { useCallback, useMemo, useState } from 'react';
import type { ContributionPurpose } from '../types';
export type ReceiptRequired = 'YES' | 'NO';

export interface ContributionFormValues {
  amount: string;
  purpose: string;
  customPurpose: string;
  purposeNote: string;
  contributionDate: string;
  contactNumber: string;
  address: string;
  remarks: string;
  isPublic: boolean;
  receiptRequired: ReceiptRequired;
}

const initialValues = (): ContributionFormValues => ({
  amount: '',
  purpose: 'GENERAL',
  customPurpose: '',
  purposeNote: '',
  contributionDate: new Date().toISOString().slice(0, 10),
  contactNumber: '',
  address: '',
  remarks: '',
  isPublic: false,
  receiptRequired: 'NO',
});

export const isValidContactNumber = (value: string): boolean => {
  const cleaned = value.replace(/[\s\-()]/g, '');
  return /^(?:\+?91|0)?[6-9]\d{9}$/.test(cleaned);
};

export interface ContributionPayload {
  amount: number;
  purpose: ContributionPurpose;
  purpose_note?: string;
  contribution_date: string;
  public_visibility: boolean;
  remarks?: string;
  contact_number: string;
  address?: string;
  specific_purpose?: string;
  receipt_required: boolean;
}

export interface UseContributionFormStateResult {
  values: ContributionFormValues;
  setField: <K extends keyof ContributionFormValues>(key: K, value: ContributionFormValues[K]) => void;
  handlePurposeChange: (value: string) => void;
  reset: () => void;
  validate: () => string | null;
  buildPayload: () => ContributionPayload;
}

export const useContributionFormState = (): UseContributionFormStateResult => {
  const [values, setValues] = useState<ContributionFormValues>(initialValues);

  const setField = useCallback(
    <K extends keyof ContributionFormValues>(key: K, value: ContributionFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handlePurposeChange = useCallback((value: string) => {
    setValues((prev) => ({
      ...prev,
      purpose: value,
      customPurpose: value === 'OTHER' ? prev.customPurpose : '',
    }));
  }, []);

  const reset = useCallback(() => setValues(initialValues()), []);

  const validate = useCallback((): string | null => {
    const amt = parseFloat(values.amount);
    if (!amt || amt <= 0) return 'Please enter a valid contribution amount.';
    if (values.purpose === 'OTHER' && !values.customPurpose.trim()) {
      return 'Please describe the specific purpose for this contribution.';
    }
    if (!values.contactNumber.trim()) {
      return 'Please enter your contact number so the school can reach you about this contribution.';
    }
    if (!isValidContactNumber(values.contactNumber)) {
      return 'Please enter a valid 10-digit mobile number (e.g. 9876543210 or +91 9876543210).';
    }
    return null;
  }, [values]);

  const buildPayload = useCallback((): ContributionPayload => {
    return {
      amount: parseFloat(values.amount) || 0,
      purpose: values.purpose as ContributionPurpose,
      purpose_note: values.purposeNote.trim() || undefined,
      contribution_date: values.contributionDate,
      public_visibility: values.isPublic,
      remarks: values.remarks.trim() || undefined,
      contact_number: values.contactNumber.trim(),
      address: values.address.trim() || undefined,
      specific_purpose:
        values.purpose === 'OTHER' && values.customPurpose.trim()
          ? values.customPurpose.trim()
          : undefined,
      receipt_required: values.receiptRequired === 'YES',
    };
  }, [values]);

  return useMemo(
    () => ({ values, setField, handlePurposeChange, reset, validate, buildPayload }),
    [values, setField, handlePurposeChange, reset, validate, buildPayload]
  );
};