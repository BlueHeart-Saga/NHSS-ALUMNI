import React, { useEffect, useState } from 'react';
import { Save, School } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { LoadingState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { SchoolProfile } from '../../types';

export const SchoolSettings: React.FC = () => {
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getSchoolProfile();
      setProfile(data);
      setName(data.name);
      setDescription(data.description || '');
      setAddress(data.address || '');
      setWebsite(data.website || '');
      setContactPhone(data.contact_phone || '');
      setContactEmail(data.contact_email || '');
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSchoolProfile({
        name,
        description,
        address,
        website,
        contact_phone: contactPhone,
        contact_email: contactEmail
      });
      alertService.showSuccess('School Profile Updated', 'Institutional branding and contact details updated successfully.');
      loadProfile();
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to update school profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-[#111111]">School Settings & Branding</h2>
        <p className="text-xs text-[#6B7280]">Primary school profile details displayed across the alumni platform</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-xs space-y-6">
        <Input
          label="School Official Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-[#111111] mb-1.5">School Motto & Overview</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542]"
          />
        </div>

        <Input
          label="Campus Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Website URL"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <Input
            label="Contact Phone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
          <Input
            label="Contact Email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
          <Button type="submit" isLoading={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            Save Profile Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
