import React, { useEffect, useState } from 'react';
import { 
  Users, UserCheck, GraduationCap, Calendar, CheckCircle2, ArrowRight,
  Info, Check, Phone, Mail, Briefcase, ExternalLink, ShieldCheck, Loader2
} from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { LoadingState, StatsGridSkeleton, TableSkeleton } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { DashboardReport, AlumniProfile, EventItem } from '../../types';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [pendingList, setPendingList] = useState<AlumniProfile[]>([]);
  const [upcomingEvent, setUpcomingEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [confirmingAlumni, setConfirmingAlumni] = useState<AlumniProfile | null>(null);
  const [approvalNote, setApprovalNote] = useState('Approved by school admin from dashboard');
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [repRes, pendRes, evRes] = await Promise.allSettled([
        api.getDashboardReport(),
        api.getPendingVerifications(),
        api.getEvents()
      ]);

      if (repRes.status === 'fulfilled') {
        setReport(repRes.value);
      } else if (repRes.status === 'rejected') {
        console.error('Failed to load dashboard report stats:', repRes.reason);
      }

      if (pendRes.status === 'fulfilled') {
        if (Array.isArray(pendRes.value)) {
          setPendingList(pendRes.value.slice(0, 5));
        }
      } else if (pendRes.status === 'rejected') {
        console.error('Failed to load pending verifications queue:', pendRes.reason);
        setPendingList([]);
      }

      if (evRes.status === 'fulfilled' && Array.isArray(evRes.value) && evRes.value.length > 0) {
        setUpcomingEvent(evRes.value[0]);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmApproval = async () => {
    if (!confirmingAlumni) return;
    try {
      setConfirmLoading(true);
      await api.verifyAlumni(confirmingAlumni.id, 'APPROVED', approvalNote);
      alertService.showSuccess(
        'Alumni Approved Successfully',
        `Alumni registration for ${confirmingAlumni.full_name} has been approved and confirmation notification sent.`
      );
      setConfirmingAlumni(null);
      setSelectedAlumni(null);
      loadDashboardData();
    } catch (err: any) {
      alertService.handleApiError(err, 'Approval failed.');
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <StatsGridSkeleton count={5} />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Alumni"
          value={report?.total_alumni || 0}
          subtitle="Configured school registry"
          icon={Users}
        />
        <StatsCard
          title="Verified Alumni"
          value={report?.verified_alumni || 0}
          subtitle="Approved active members"
          icon={UserCheck}
        />
        <StatsCard
          title="Pending Applications"
          value={report?.pending_alumni || 0}
          subtitle="Awaiting admin review"
          icon={UserCheck}
        />
        <StatsCard
          title="Active Cohorts"
          value={report?.active_batches || 0}
          subtitle="2005 - 2025 Batches"
          icon={GraduationCap}
        />
        <StatsCard
          title="Turnout Rate"
          value={`${report?.attendance_turnout_percentage || 0}%`}
          subtitle="Event check-in ratio"
          icon={Calendar}
        />
      </div>

      {/* Hero Upcoming Event Banner */}
      {upcomingEvent && (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFF7D6] rounded-full blur-3xl -z-10"></div>
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#FFF7D6] border border-[#F4C542]/60 text-[#854D0E] px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <span>FEATURED GET-TOGETHER REUNION</span>
            </div>
            <h2 className="text-2xl font-bold text-[#111111]">{upcomingEvent.title}</h2>
            <p className="text-sm text-[#6B7280] mt-1 max-w-2xl">{upcomingEvent.description}</p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 text-xs font-semibold text-[#111111]">
              <span className="bg-[#FAFAFA] border border-[#E5E7EB] px-3 py-1.5 rounded-xl">
                📅 {upcomingEvent.event_date} ({upcomingEvent.start_time})
              </span>
              <span className="bg-[#FAFAFA] border border-[#E5E7EB] px-3 py-1.5 rounded-xl">
                📍 {upcomingEvent.venue}
              </span>
              <span className="bg-[#FAFAFA] border border-[#E5E7EB] px-3 py-1.5 rounded-xl text-[#854D0E]">
                👥 {upcomingEvent.attending_count} Confirmed ({upcomingEvent.total_guests} total guests)
              </span>
            </div>
          </div>

          <div className="flex items-center w-full sm:w-auto">
            <Button onClick={() => navigate(`/school-admin/events/${upcomingEvent.id}`)} className="w-full sm:w-auto">
              View RSVP Roster
            </Button>
          </div>
        </div>
      )}

      {/* Pending Applications Review Widget */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-lg text-[#111111]">Pending Alumni Verification Queue</h3>
            <p className="text-xs text-[#6B7280]">Recent applications requiring school admin verification</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/school-admin/verification')} className="w-full sm:w-auto">
            <span>View All ({report?.pending_alumni || 0})</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {pendingList.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#6B7280]">
            ✓ No pending applications requiring review!
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {pendingList.map((a) => (
              <div key={a.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 hover:bg-[#FAFAFA] px-2 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <img
                    src={a.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.full_name || 'Alumni')}&background=F3F4F6&color=111827`}
                    alt=""
                    className="w-10 h-10 rounded-full border border-[#E5E7EB] object-cover shrink-0"
                  />
                  <div>
                    <div className="text-sm font-bold text-[#111111]">{a.full_name}</div>
                    <div className="text-xs text-[#6B7280]">
                      Batch {a.passing_year} • Adm No: {a.admission_number} • {a.mobile}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedAlumni(a)}
                    className="p-1.5 text-[#6B7280] hover:text-[#111111] hover:bg-[#E5E7EB]/60 rounded-lg transition-colors cursor-pointer"
                    title="View Full Application Details"
                    aria-label="View Application Details"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <Badge status={a.verification_status} />
                  <Button
                    size="sm"
                    onClick={() => {
                      setConfirmingAlumni(a);
                      setApprovalNote(`Approved by school admin from dashboard on ${new Date().toLocaleDateString()}`);
                    }}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1. Alumni Full Details Modal (View All Data via 'i' icon) */}
      <Modal
        isOpen={Boolean(selectedAlumni)}
        onClose={() => setSelectedAlumni(null)}
        title="Alumni Registration Application Details"
      >
        {selectedAlumni && (
          <div className="space-y-5">
            {/* Header Profile Card */}
            <div className="flex items-center gap-4 bg-[#FAFAFA] border border-[#E5E7EB] p-4 rounded-2xl">
              <img
                src={selectedAlumni.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAlumni.full_name || 'Alumni')}&background=F4C542&color=111111`}
                alt={selectedAlumni.full_name}
                className="w-16 h-16 rounded-full border border-[#E5E7EB] object-cover shrink-0 shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-[#111111] truncate">{selectedAlumni.full_name}</h4>
                  <Badge status={selectedAlumni.verification_status} />
                </div>
                <div className="text-xs text-[#6B7280] mt-0.5">
                  Batch <strong>{selectedAlumni.passing_year}</strong> {selectedAlumni.section ? `• Sec ${selectedAlumni.section}` : ''} • Adm No: <strong>{selectedAlumni.admission_number || 'N/A'}</strong>
                </div>
                {selectedAlumni.profession && (
                  <div className="text-xs text-[#854D0E] font-medium mt-1">
                    💼 {selectedAlumni.profession} {selectedAlumni.company ? `at ${selectedAlumni.company}` : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Segmented Details Grid */}
            <div className="space-y-4 text-xs">
              {/* Contact & Personal Information */}
              <div className="border border-[#E5E7EB] rounded-xl p-3.5 space-y-2.5 bg-white">
                <div className="font-bold text-xs uppercase tracking-wider text-[#854D0E] flex items-center gap-1.5 border-b border-[#F1F5F9] pb-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Contact & Personal Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[#6B7280]">Mobile Number:</span>
                    <div className="font-semibold text-[#111111]">{selectedAlumni.mobile || '—'}</div>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Email Address:</span>
                    <div className="font-semibold text-[#111111] truncate">{selectedAlumni.email || '—'}</div>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Gender:</span>
                    <div className="font-semibold text-[#111111]">{selectedAlumni.gender || '—'}</div>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Date of Birth:</span>
                    <div className="font-semibold text-[#111111]">{selectedAlumni.dob || selectedAlumni.date_of_birth || '—'}</div>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Blood Group:</span>
                    <div className="font-semibold text-[#111111]">{selectedAlumni.blood_group || '—'}</div>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Current City / Location:</span>
                    <div className="font-semibold text-[#111111]">{selectedAlumni.current_city || '—'} {selectedAlumni.country ? `(${selectedAlumni.country})` : ''}</div>
                  </div>
                  {selectedAlumni.address && (
                    <div className="sm:col-span-2">
                      <span className="text-[#6B7280]">Residential Address:</span>
                      <div className="font-semibold text-[#111111]">{selectedAlumni.address}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* School & Academic Information */}
              <div className="border border-[#E5E7EB] rounded-xl p-3.5 space-y-2.5 bg-white">
                <div className="font-bold text-xs uppercase tracking-wider text-[#854D0E] flex items-center gap-1.5 border-b border-[#F1F5F9] pb-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Academic & School Records</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[#6B7280]">Passing Year (Batch):</span>
                    <div className="font-semibold text-[#111111]">Class of {selectedAlumni.passing_year}</div>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Admission Number:</span>
                    <div className="font-semibold text-[#111111]">{selectedAlumni.admission_number || 'N/A'}</div>
                  </div>
                  {selectedAlumni.degree && (
                    <div>
                      <span className="text-[#6B7280]">Higher Education / Degree:</span>
                      <div className="font-semibold text-[#111111]">{selectedAlumni.degree} {selectedAlumni.stream ? `(${selectedAlumni.stream})` : ''}</div>
                    </div>
                  )}
                  {selectedAlumni.college_name && (
                    <div>
                      <span className="text-[#6B7280]">College / Institution:</span>
                      <div className="font-semibold text-[#111111]">{selectedAlumni.college_name}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Background */}
              {(selectedAlumni.profession || selectedAlumni.company || selectedAlumni.linkedin_url) && (
                <div className="border border-[#E5E7EB] rounded-xl p-3.5 space-y-2.5 bg-white">
                  <div className="font-bold text-xs uppercase tracking-wider text-[#854D0E] flex items-center gap-1.5 border-b border-[#F1F5F9] pb-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Professional Background</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[#6B7280]">Profession:</span>
                      <div className="font-semibold text-[#111111]">{selectedAlumni.profession || '—'}</div>
                    </div>
                    <div>
                      <span className="text-[#6B7280]">Company / Employer:</span>
                      <div className="font-semibold text-[#111111]">{selectedAlumni.company || '—'}</div>
                    </div>
                    {selectedAlumni.designation && (
                      <div>
                        <span className="text-[#6B7280]">Designation:</span>
                        <div className="font-semibold text-[#111111]">{selectedAlumni.designation}</div>
                      </div>
                    )}
                    {selectedAlumni.linkedin_url && (
                      <div>
                        <span className="text-[#6B7280]">LinkedIn:</span>
                        <div>
                          <a
                            href={selectedAlumni.linkedin_url.startsWith('http') ? selectedAlumni.linkedin_url : `https://${selectedAlumni.linkedin_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#854D0E] underline font-semibold flex items-center gap-1"
                          >
                            <span>Profile Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E5E7EB]">
              <Button variant="secondary" onClick={() => setSelectedAlumni(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  const toApprove = selectedAlumni;
                  setSelectedAlumni(null);
                  setConfirmingAlumni(toApprove);
                  setApprovalNote(`Approved by school admin from dashboard on ${new Date().toLocaleDateString()}`);
                }}
              >
                <Check className="w-4 h-4 mr-1.5" />
                <span>Approve Application</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 2. Approve Confirmation Modal */}
      <Modal
        isOpen={Boolean(confirmingAlumni)}
        onClose={() => !confirmLoading && setConfirmingAlumni(null)}
        title="Confirm Alumni Approval"
      >
        {confirmingAlumni && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-2xl text-xs text-[#854D0E]">
              <ShieldCheck className="w-5 h-5 shrink-0 text-[#854D0E] mt-0.5" />
              <div>
                <p className="font-bold text-[#111111] text-sm">
                  Approve {confirmingAlumni.full_name}?
                </p>
                <p className="mt-1 text-[#6B7280]">
                  Are you sure you want to approve this registration application?
                  Batch <strong>{confirmingAlumni.passing_year}</strong> • Admission No: <strong>{confirmingAlumni.admission_number || 'N/A'}</strong>
                </p>
                <p className="mt-1.5 text-xs text-[#854D0E] font-medium">
                  ✓ This will activate their verified alumni profile and dispatch an approval notification.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Verification Notes (Optional)
              </label>
              <input
                type="text"
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="e.g. Verified from school permanent record register"
                className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#F4C542] focus:ring-1 focus:ring-[#F4C542]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E5E7EB]">
              <Button
                variant="secondary"
                disabled={confirmLoading}
                onClick={() => setConfirmingAlumni(null)}
              >
                Cancel
              </Button>
              <Button
                disabled={confirmLoading}
                onClick={handleConfirmApproval}
              >
                {confirmLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    <span>Approving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    <span>Confirm & Approve</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
