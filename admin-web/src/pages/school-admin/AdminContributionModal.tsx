import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Send, User, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { ContributionFormFields } from '../../components/ContributionFormFields';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { useLanguage } from '../../context/LanguageContext';
import { useContributionFormState } from '../../hooks/useContributionFormState';
import type { AlumniProfile } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

const isValidMobile = (value: string) => /^(?:\+?91|0)?[6-9]\d{9}$/.test(value.replace(/[\s\-()]/g, ''));

export const AdminContributionModal: React.FC<Props> = ({ isOpen, onClose, onSubmitted }) => {
  const { t } = useLanguage();
  const form = useContributionFormState();

  // Contributor state
  const [selectedContributor, setSelectedContributor] = useState<AlumniProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AlumniProfile[]>([]);
  const [searching, setSearching] = useState(false);

  // Inline "Add New Contributor" form
  const [showNewContributorForm, setShowNewContributorForm] = useState(false);
  const [newContributor, setNewContributor] = useState({
    full_name: '',
    mobile: '',
    email: '',
    passing_year: '',
    gender: 'Male',
  });
  const [creatingContributor, setCreatingContributor] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Reset everything each time the modal opens
  useEffect(() => {
    if (isOpen) {
      form.reset();
      setSelectedContributor(null);
      setSearchQuery('');
      setSearchResults([]);
      setShowNewContributorForm(false);
      setNewContributor({ full_name: '', mobile: '', email: '', passing_year: '', gender: 'Male' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Debounced alumni search
  useEffect(() => {
    if (!isOpen || selectedContributor) return;
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    let mounted = true;
    setSearching(true);
    const timer = setTimeout(() => {
      api.searchAlumni(q, undefined, 'ALL')
        .then((res) => mounted && setSearchResults((res || []).slice(0, 20)))
        .catch(() => mounted && setSearchResults([]))
        .finally(() => mounted && setSearching(false));
    }, 250);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, isOpen, selectedContributor]);

  const pickContributor = useCallback((a: AlumniProfile) => {
    setSelectedContributor(a);
    if (a.mobile) form.setField('contactNumber', a.mobile);
    if (a.address) form.setField('address', a.address);
    setSearchQuery('');
    setSearchResults([]);
  }, [form]);

  const clearContributor = useCallback(() => {
    setSelectedContributor(null);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const handleCreateContributor = useCallback(async () => {
    if (creatingContributor) return;
    const name = newContributor.full_name.trim();
    const mobile = newContributor.mobile.trim();
    if (!name) return alertService.showError('Name required', 'Please enter the contributor full name.');
    if (!isValidMobile(mobile)) {
      return alertService.showError('Invalid Mobile', 'Please enter a valid 10-digit Indian mobile number.');
    }
    const passingYear = Number(newContributor.passing_year);
    if (!passingYear || passingYear < 1900 || passingYear > 2100) {
      return alertService.showError('Invalid Batch Year', 'Please enter a valid passing year (e.g. 1998).');
    }

    setCreatingContributor(true);
    try {
      const created = await api.adminCreateAlumni({
        full_name: name,
        mobile,
        email: newContributor.email.trim() || undefined,
        gender: newContributor.gender,
        passing_year: passingYear,
        verification_status: 'APPROVED',
      });
      alertService.showSuccess('Contributor Added', `${name} has been added to the alumni roster.`);
      setShowNewContributorForm(false);
      pickContributor(created as AlumniProfile);
    } catch (err) {
      alertService.handleApiError(err, 'Failed to create contributor.');
    } finally {
      setCreatingContributor(false);
    }
  }, [creatingContributor, newContributor, pickContributor]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    if (!selectedContributor) {
      alertService.showError('Contributor required', 'Please select or add the alumni who made this contribution.');
      return;
    }
    const error = form.validate();
    if (error) return alertService.showError('Please check the form', error);

    setSubmitting(true);
    try {
      await api.createAdminContribution({
        ...form.buildPayload(),
        alumni_id: selectedContributor.id,
        status: 'COMPLETED',
      });
      alertService.showSuccess('Contribution added successfully', 'The contribution has been recorded on behalf of the alumni.');
      onSubmitted();
      onClose();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to add contribution.');
    } finally {
      setSubmitting(false);
    }
  }, [submitting, selectedContributor, form, onSubmitted, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={() => !submitting && onClose()} title="Add Alumni Contribution">
      <p className="text-xs text-[#6B7280] -mt-1 mb-4">
        Record a contribution received from an alumni.
      </p>

      <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
        {/* Contributor picker */}
        <div className="bg-[#FFFDF5] border border-[#F4C542]/40 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-[#111111] uppercase tracking-wider">
              Contributor *
            </label>
            {!selectedContributor && !showNewContributorForm && (
              <button
                type="button"
                onClick={() => setShowNewContributorForm(true)}
                className="text-[11px] font-bold text-[#854D0E] hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add New Contributor
              </button>
            )}
          </div>

          {selectedContributor ? (
            <div className="flex items-center justify-between bg-white border border-[#E5E7EB] rounded-xl p-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#FFF7D6] border border-[#F4C542]/50 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#854D0E]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#111111] truncate">
                    {selectedContributor.full_name}
                  </div>
                  <div className="text-[11px] text-[#6B7280] truncate">
                    {selectedContributor.passing_year ? `Batch ${selectedContributor.passing_year} • ` : ''}
                    {selectedContributor.mobile || selectedContributor.email || ''}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={clearContributor}
                className="p-1.5 text-gray-500 hover:text-rose-600 rounded-lg"
                title="Change contributor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : showNewContributorForm ? (
            <div className="space-y-3 bg-white border border-[#E5E7EB] rounded-xl p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Name *"
                  value={newContributor.full_name}
                  onChange={(e) => setNewContributor((p) => ({ ...p, full_name: e.target.value }))}
                />
                <Input
                  label="Mobile Number *"
                  type="tel"
                  value={newContributor.mobile}
                  onChange={(e) => setNewContributor((p) => ({ ...p, mobile: e.target.value }))}
                  placeholder="9876543210 or +91 9876543210"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Email"
                  type="email"
                  value={newContributor.email}
                  onChange={(e) => setNewContributor((p) => ({ ...p, email: e.target.value }))}
                />
                <Input
                  label="Passing Year *"
                  type="number"
                  value={newContributor.passing_year}
                  onChange={(e) => setNewContributor((p) => ({ ...p, passing_year: e.target.value }))}
                  placeholder="e.g. 1998"
                />
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5">Gender</label>
                  <select
                    value={newContributor.gender}
                    onChange={(e) => setNewContributor((p) => ({ ...p, gender: e.target.value }))}
                    className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F4C542]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setShowNewContributorForm(false)}
                  disabled={creatingContributor}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateContributor}
                  isLoading={creatingContributor}
                  disabled={creatingContributor}
                >
                  Create &amp; Select
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search alumni by name / batch / email / mobile..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
                />
              </div>
              {searchQuery.trim().length >= 2 && (
                <div className="max-h-52 overflow-y-auto bg-white border border-[#E5E7EB] rounded-xl divide-y divide-[#F3F4F6]">
                  {searching ? (
                    <div className="px-3 py-3 text-[11px] text-[#6B7280]">Searching…</div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-3 py-3 text-[11px] text-[#6B7280]">
                      No matching alumni. Use <strong>Add New Contributor</strong> above.
                    </div>
                  ) : (
                    searchResults.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => pickContributor(a)}
                        className="w-full text-left px-3 py-2 hover:bg-[#FFFDF5]"
                      >
                        <div className="text-xs font-semibold text-[#111111]">{a.full_name}</div>
                        <div className="text-[10px] text-[#6B7280]">
                          {a.passing_year ? `Batch ${a.passing_year} • ` : ''}
                          {a.mobile || a.email || '—'}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Shared contribution fields — identical to alumni form */}
        <ContributionFormFields
          values={form.values}
          setField={form.setField}
          handlePurposeChange={form.handlePurposeChange}
          disabled={submitting}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} isLoading={submitting} disabled={submitting}>
          <Send className="w-4 h-4 mr-1.5" />
          Add Contribution
        </Button>
      </div>
    </Modal>
  );
};