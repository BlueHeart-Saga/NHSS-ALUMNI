import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Award, Download, X, FileText, Clock, CheckCircle2, AlertCircle, Loader2, Sparkles, Send } from 'lucide-react';
import Swal from 'sweetalert2';
import { AlumniContextType } from '../../layouts/AlumniLayout';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface DocumentRequestItem {
  id: string;
  doc_type: string;
  reason: string;
  remarks?: string;
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'COMPLETED' | 'READY_FOR_PICKUP' | 'REJECTED';
  expected_date?: string;
  admin_remarks?: string;
  created_at: string;
}

export const AlumniDocumentsPage: React.FC = () => {
  const { language } = useLanguage();
  const { user, school } = useOutletContext<AlumniContextType>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDocRequestModal, setShowDocRequestModal] = useState(false);
  
  const [docType, setDocType] = useState('Transfer Certificate (TC)');
  const [docReason, setDocReason] = useState('');
  const [docRemarks, setDocRemarks] = useState('');

  const [documentRequests, setDocumentRequests] = useState<DocumentRequestItem[]>([]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getDocumentRequests();
      setDocumentRequests(data || []);
    } catch (err) {
      console.error('Failed to fetch document requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateDocRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docReason.trim()) return;

    setSubmitting(true);
    try {
      await api.createDocumentRequest({
        doc_type: docType,
        reason: docReason.trim(),
        remarks: docRemarks.trim() || undefined
      });

      setShowDocRequestModal(false);
      setDocReason('');
      setDocRemarks('');

      Swal.fire({
        icon: 'success',
        title: language === 'ta' ? 'விண்ணப்பம் சமர்ப்பிக்கப்பட்டது!' : 'Request Submitted Successfully!',
        text: language === 'ta'
          ? 'உங்கள் சான்றிதழ் கோரிக்கை பள்ளி நிர்வாகத்திற்கு அனுப்பப்பட்டுள்ளது.'
          : 'Your document request has been logged. Admin will review and notify expected completion date.',
        confirmButtonColor: '#111111'
      });

      await fetchRequests();
    } catch (err: any) {
      console.error('Document request failed:', err);
      Swal.fire({
        icon: 'error',
        title: language === 'ta' ? 'சமர்ப்பிக்க முடியவில்லை' : 'Submission Failed',
        text: err?.message || 'Could not send document request.',
        confirmButtonColor: '#111111'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'READY_FOR_PICKUP':
        return <span className="font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>{language === 'ta' ? 'தயாராக உள்ளது' : status.replace(/_/g, ' ')}</span></span>;
      case 'COMPLETED':
        return <span className="font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center space-x-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>{language === 'ta' ? 'முடிந்தது' : 'COMPLETED'}</span></span>;
      case 'IN_REVIEW':
        return <span className="font-extrabold px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /><span>{language === 'ta' ? 'பரிசீலனையில்' : 'IN REVIEW'}</span></span>;
      case 'REJECTED':
        return <span className="font-extrabold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 flex items-center space-x-1"><AlertCircle className="w-3.5 h-3.5" /><span>{language === 'ta' ? 'நிராகரிக்கப்பட்டது' : 'REJECTED'}</span></span>;
      default:
        return <span className="font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /><span>{language === 'ta' ? 'நிர்வாகியின் நிலுவையில்' : 'PENDING ADMIN'}</span></span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-[#111111]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
            {language === 'ta' ? 'சான்றிதழ்கள் & ஆவணங்கள் விண்ணப்பம்' : 'Official Certificates & Document Requests'}
          </h2>
          <p className="text-xs text-[#6B7280]">
            {language === 'ta'
              ? 'உறுப்பினர் சான்றிதழ்களைப் பெறவும், பள்ளி நிர்வாகத்திடம் ஆவணங்கள் கோரி விண்ணப்பிக்கவும்'
              : 'Generate digital membership credentials or submit official document requisitions to the school administration'}
          </p>
        </div>
        <button
          onClick={() => setShowDocRequestModal(true)}
          className="w-full sm:w-auto px-5 py-2.5 bg-[#111111] text-white hover:bg-black rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Send className="w-3.5 h-3.5 text-[#F4C542]" />
          <span>{language === 'ta' ? 'புதிய ஆவண விண்ணப்பம்' : 'New Document Request'}</span>
        </button>
      </div>

      {/* Verified Digital Membership Certificate Card */}
      <div className="bg-gradient-to-r from-[#FFF7D6] via-amber-100/70 to-yellow-50 p-4 sm:p-8 rounded-3xl border-2 border-[#F4C542] shadow-md space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-[#111111] rounded-2xl text-[#F4C542] shrink-0">
              <Award className="w-6 sm:w-7 h-6 sm:h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-[#111111]">Official Alumni Digital Membership Certificate</h3>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">VERIFIED</span>
              </div>
              <p className="text-xs text-[#854D0E] font-medium">{school?.name || 'School Alumni Network'}</p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#111111] text-white text-xs font-bold rounded-xl hover:bg-black flex items-center justify-center space-x-2 shadow-sm transition-all shrink-0"
          >
            <Download className="w-4 h-4 text-[#F4C542]" />
            <span>Print / Download PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div className="p-3 bg-white/70 rounded-xl border border-amber-200/60">
            <span className="text-gray-500 font-semibold block text-[10px]">ALUMNI MEMBER</span>
            <p className="font-bold text-[#111111] truncate">{user?.full_name || 'Verified Alumni'}</p>
          </div>
          <div className="p-3 bg-white/70 rounded-xl border border-amber-200/60">
            <span className="text-gray-500 font-semibold block text-[10px]">BATCH YEAR & SECTION</span>
            <p className="font-bold text-[#111111]">Class of {user?.passing_year || 2010} {user?.section ? `(${user.section})` : ''}</p>
          </div>
          <div className="p-3 bg-white/70 rounded-xl border border-amber-200/60">
            <span className="text-gray-500 font-semibold block text-[10px]">ADMISSION NO</span>
            <p className="font-bold text-[#111111]">{user?.admission_number || user?.roll_number || 'N/A'}</p>
          </div>
          <div className="p-3 bg-white/70 rounded-xl border border-amber-200/60">
            <span className="text-gray-500 font-semibold block text-[10px]">CERTIFICATE ID</span>
            <p className="font-bold text-[#111111] font-mono">CERT-{user?.id ? user.id.slice(0, 8).toUpperCase() : 'ALUMNI-2026'}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-[#854D0E] font-medium pt-1 gap-1 sm:gap-0">
          <span>Issued under official authorization of {school?.name || 'School Alumni Platform'}</span>
          <span className="flex items-center space-x-1"><Sparkles className="w-3.5 h-3.5" /><span>Tamper-Proof Digital Credential</span></span>
        </div>
      </div>

      {/* School Document Requests Tracker */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base text-[#111111]">My Requisitions to School Admin</h3>
          <span className="text-xs text-gray-500 font-medium">Total Requests: <strong>{documentRequests.length}</strong></span>
        </div>

        {loading ? (
          <div className="p-8 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-[#854D0E] animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-medium">Loading document requisitions...</p>
          </div>
        ) : documentRequests.length > 0 ? (
          <div className="space-y-3">
            {documentRequests.map(doc => (
              <div key={doc.id} className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] hover:border-amber-200 transition-all space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#111111]">{doc.doc_type}</h4>
                      <p className="text-gray-500 text-[11px]">Requested on {doc.created_at || 'Recently'}</p>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(doc.status)}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200/60 text-[#374151] space-y-1">
                  <p><strong>Purpose / Reason:</strong> {doc.reason}</p>
                  {doc.remarks && <p className="text-gray-500"><strong>Alumni Remarks:</strong> {doc.remarks}</p>}
                  {doc.admin_remarks && (
                    <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-900 mt-2 font-medium">
                      <strong>School Admin Response:</strong> {doc.admin_remarks}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-gray-200 rounded-2xl text-center space-y-3">
            <FileText className="w-8 h-8 text-gray-400 mx-auto" />
            <h4 className="font-bold text-xs text-[#111111]">No Requisitions Logged</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              You haven't submitted any document requests to the school administration yet.
            </p>
            <button
              onClick={() => setShowDocRequestModal(true)}
              className="px-4 py-2 bg-[#111111] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-black"
            >
              Submit First Request
            </button>
          </div>
        )}
      </div>

      {/* Send Document Requisition Modal */}
      {showDocRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateDocRequest} className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl relative text-xs max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setShowDocRequestModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-[#111111] p-1 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-bold text-base text-[#111111]">Request School Document</h3>
              <p className="text-gray-500 text-[11px]">Submit an official enquiry/request directly to the school administrative department.</p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Select Document Type</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value)}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542] font-medium"
              >
                <option value="Transfer Certificate (TC)">Transfer Certificate (TC)</option>
                <option value="Character & Conduct Certificate">Character & Conduct Certificate</option>
                <option value="Academic Marksheet Verification Copy">Academic Marksheet Verification Copy</option>
                <option value="Official Academic Transcript">Official Academic Transcript</option>
                <option value="Bonafide Student Certificate">Bonafide Student Certificate</option>
                <option value="Official Alumni Membership Card/Certificate">Official Alumni Membership Card/Certificate</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Reason for Requisition *</label>
              <textarea
                required
                rows={3}
                value={docReason}
                onChange={e => setDocReason(e.target.value)}
                placeholder="State the purpose (e.g. Higher studies application, job verification, visa process)..."
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              ></textarea>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Additional Remarks (Optional)</label>
              <input
                type="text"
                value={docRemarks}
                onChange={e => setDocRemarks(e.target.value)}
                placeholder="e.g. Need physical copy or courier address details..."
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#111111] text-white font-bold rounded-xl shadow-md hover:bg-black disabled:bg-gray-400 flex items-center justify-center space-x-2 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#F4C542]" />
                  <span>Submitting Requisition...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#F4C542]" />
                  <span>Send Requisition to School Admin</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
