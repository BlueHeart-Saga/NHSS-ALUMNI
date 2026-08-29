import React, { useState } from 'react';
import { QrCode, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { api } from '../services/api';
import { CheckinResult } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSuccessCheckin?: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  eventId,
  onSuccessCheckin
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScanOrSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await api.scanQRToken(tokenInput.trim(), eventId);
      setResult(res);
      setTokenInput('');
      if (onSuccessCheckin) onSuccessCheckin();
    } catch (err: any) {
      setErrorMsg(err.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Check-in Terminal">
      <div className="space-y-6">
        {/* Visual Scanner Area */}
        <div className="bg-[#FAFAFA] border-2 border-dashed border-[#F4C542] rounded-2xl p-8 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#FFF7D6] border border-[#F4C542] flex items-center justify-center mb-3">
            <QrCode className="w-8 h-8 text-[#111111]" />
          </div>
          <p className="text-sm font-semibold text-[#111111]">Point camera or scan event ticket</p>
          <span className="text-xs text-[#6B7280]">Supports optical QR scanners & digital tickets</span>
        </div>

        {/* Success Alert */}
        {result && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start space-x-3 animate-fadeIn">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-900 text-sm">{result.message}</h4>
              <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                {result.alumni_name} ({result.batch_name}) • Checked in at {result.checked_in_at}
              </p>
              <span className="inline-block mt-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Guests expected: {result.total_guests}
              </span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start space-x-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-900 text-sm">Check-in Rejected</h4>
              <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Manual Token / Scanner Paste Form */}
        <form onSubmit={handleScanOrSubmit} className="space-y-4">
          <Input
            label="Scan Result or Encrypted QR Token"
            placeholder="Paste or scan QR token code here..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            autoFocus
          />

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close Terminal
            </Button>
            <Button type="submit" isLoading={loading}>
              <Search className="w-4 h-4 mr-1" />
              Verify & Check In
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
