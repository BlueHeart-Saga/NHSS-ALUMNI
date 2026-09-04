import React, { useEffect, useState } from 'react';
import { UserCheck, Check, X, ShieldAlert } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState, LoadingState, TableSkeleton } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { AlumniProfile } from '../../types';

export const VerificationQueue: React.FC = () => {
  const [pendingList, setPendingList] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingVerifications();
      setPendingList(data);
    } catch (err) {
      console.error('Failed to fetch pending applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumni || !reviewAction) return;

    setActionLoading(true);
    try {
      await api.verifyAlumni(selectedAlumni.id, reviewAction, notes);
      alertService.showSuccess(
        reviewAction === 'APPROVED' ? 'Alumni Approved & Verification Email Sent' : 'Application Rejected',
        `Alumni registration for ${selectedAlumni.full_name} has been ${reviewAction === 'APPROVED' ? 'approved and notification email dispatched' : 'rejected'} successfully.`
      );
      setSelectedAlumni(null);
      setReviewAction(null);
      setNotes('');
      fetchPending();
    } catch (err: any) {
      alertService.handleApiError(err, 'Unable to submit verification decision.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <TableSkeleton rows={6} />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-[#111111]">Alumni Verification Queue</h2>
        <p className="text-xs text-[#6B7280]">Review pending registration applications against school records</p>
      </div>

      {pendingList.length === 0 ? (
        <EmptyState
          title="Verification Queue Empty"
          description="All alumni registration applications have been verified. Excellent work!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingList.map((item) => (
            <div key={item.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#F4C542] transition-all">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img src={item.profile_photo_url} alt="" className="w-12 h-12 rounded-full border border-[#E5E7EB] object-cover" />
                    <div>
                      <h3 className="font-bold text-[#111111] text-base">{item.full_name}</h3>
                      <span className="text-xs text-[#6B7280]">Batch {item.passing_year} (Sec {item.section})</span>
                    </div>
                  </div>
                  <Badge status={item.verification_status} />
                </div>

                <div className="space-y-2 text-xs bg-[#FAFAFA] border border-[#E5E7EB] p-3 rounded-xl mb-4">
                  <div><span className="text-[#6B7280]">Admission No:</span> <strong className="text-[#111111]">{item.admission_number}</strong></div>
                  <div><span className="text-[#6B7280]">Mobile:</span> <strong className="text-[#111111]">{item.mobile}</strong></div>
                  <div><span className="text-[#6B7280]">Email:</span> <strong className="text-[#111111]">{item.email}</strong></div>
                  {item.current_city && <div><span className="text-[#6B7280]">City:</span> <strong className="text-[#111111]">{item.current_city}</strong></div>}
                  {item.profession && <div><span className="text-[#6B7280]">Profession:</span> <strong className="text-[#111111]">{item.profession}</strong></div>}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-[#E5E7EB]">
                <Button
                  className="flex-1 w-full sm:w-auto"
                  onClick={() => {
                    setSelectedAlumni(item);
                    setReviewAction('APPROVED');
                    setNotes('Verified against permanent school roster');
                  }}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  className="text-rose-600 hover:bg-rose-50 border-rose-200 w-full sm:w-auto"
                  onClick={() => {
                    setSelectedAlumni(item);
                    setReviewAction('REJECTED');
                    setNotes('Records could not be matched with school files');
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={Boolean(selectedAlumni)}
        onClose={() => setSelectedAlumni(null)}
        title={`Confirm ${reviewAction === 'APPROVED' ? 'Approval' : 'Rejection'}`}
      >
        <form onSubmit={handleDecisionSubmit} className="space-y-4">
          <div className="p-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-xs">
            Applicant: <strong>{selectedAlumni?.full_name}</strong> (Batch {selectedAlumni?.passing_year})
          </div>

          <Input
            label="Verification Notes"
            placeholder="Reason or verification note..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
          />

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setSelectedAlumni(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={reviewAction === 'APPROVED' ? 'primary' : 'danger'}
              isLoading={actionLoading}
            >
              Confirm Decision
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
