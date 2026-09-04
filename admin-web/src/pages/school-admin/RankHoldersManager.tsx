import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Trophy, Award, Star, CheckCircle, XCircle, Upload, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { RankHolder, AlumniProfile } from '../../types';
import { getAssetUrl } from '../../utils/asset';

export const RankHoldersManager: React.FC = () => {
  const [rankHolders, setRankHolders] = useState<RankHolder[]>([]);
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [alumniId, setAlumniId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentNameTa, setStudentNameTa] = useState('');
  const [academicYear, setAcademicYear] = useState('2025–26');
  const [classStandard, setClassStandard] = useState('10th');
  const [rank, setRank] = useState('1st Rank');
  const [achievementType, setAchievementType] = useState('SSLC / Public Examination');
  const [marksPercentage, setMarksPercentage] = useState('95.6%');
  const [totalMarks, setTotalMarks] = useState('');
  const [maxMarks, setMaxMarks] = useState('500');
  const [subjectStream, setSubjectStream] = useState('');
  const [achievementTitle, setAchievementTitle] = useState('School First Rank');
  const [photograph, setPhotograph] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [holdersData, alumniData] = await Promise.all([
        api.getRankHolders().catch(() => []),
        api.searchAlumni().catch(() => [])
      ]);
      setRankHolders(holdersData);
      setAlumniList(alumniData);
    } catch (err) {
      console.error('Failed to fetch rank holders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setAlumniId('');
    setStudentName('');
    setStudentNameTa('');
    setAcademicYear('2025–26');
    setClassStandard('10th');
    setRank('1st Rank');
    setAchievementType('SSLC / Public Examination');
    setMarksPercentage('');
    setTotalMarks('');
    setMaxMarks('500');
    setSubjectStream('');
    setAchievementTitle('School Rank Holder');
    setPhotograph('');
    setDescription('');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (holder: RankHolder) => {
    setEditingId(holder.id);
    setAlumniId(holder.alumni_id || '');
    setStudentName(holder.student_name);
    setStudentNameTa(holder.student_name_ta || '');
    setAcademicYear(holder.academic_year);
    setClassStandard(holder.class_standard);
    setRank(holder.rank);
    setAchievementType(holder.achievement_type || 'SSLC / Public Examination');
    setMarksPercentage(holder.marks_percentage || '');
    setTotalMarks(holder.total_marks || '');
    setMaxMarks(holder.max_marks || '500');
    setSubjectStream(holder.subject_stream || '');
    setAchievementTitle(holder.achievement_title || 'School Rank Holder');
    setPhotograph(holder.photograph || '');
    setDescription(holder.description || '');
    setStatus(holder.status);
    setIsModalOpen(true);
  };

  const handleAlumniSelect = (selectedId: string) => {
    setAlumniId(selectedId);
    if (selectedId) {
      const matched = alumniList.find(a => a.id === selectedId);
      if (matched) {
        setStudentName(matched.full_name);
        if (matched.profile_photo_url) {
          setPhotograph(matched.profile_photo_url);
        }
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotograph(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !academicYear || !classStandard || !rank) {
      alertService.showWarning('Required Fields Missing', 'Please fill in Student Name, Academic Year, Class, and Rank.');
      return;
    }

    setSubmitting(true);
    const payload: Partial<RankHolder> = {
      alumni_id: alumniId || undefined,
      student_name: studentName.trim(),
      student_name_ta: studentNameTa.trim(),
      academic_year: academicYear.trim(),
      class_standard: classStandard.trim(),
      rank,
      achievement_type: achievementType,
      marks_percentage: marksPercentage,
      total_marks: totalMarks.trim(),
      max_marks: maxMarks.trim(),
      subject_stream: subjectStream,
      achievement_title: achievementTitle,
      photograph,
      description,
      status
    };

    try {
      if (editingId) {
        await api.updateRankHolder(editingId, payload);
        alertService.showSuccess('Rank Holder Updated', `"${studentName}" details updated successfully.`);
      } else {
        await api.createRankHolder(payload);
        alertService.showSuccess('Rank Holder Added', `"${studentName}" has been added to Rank Holders.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to save rank holder record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await alertService.showConfirm(
      'Delete Rank Holder?',
      `Are you sure you want to delete "${name}" from rank holders list?`
    );
    if (confirmed) {
      try {
        await api.deleteRankHolder(id);
        alertService.showSuccess('Deleted', `"${name}" removed from rank holders.`);
        fetchData();
      } catch (err) {
        alertService.handleApiError(err, 'Failed to delete rank holder.');
      }
    }
  };

  // Rank Options for Dropdown
  const rankOptions = [
    { label: '1st Rank', value: '1st Rank' },
    { label: '2nd Rank', value: '2nd Rank' },
    { label: '3rd Rank', value: '3rd Rank' },
    { label: 'School First', value: 'School First' },
    { label: 'District First', value: 'District First' },
    { label: 'District Second', value: 'District Second' },
    { label: 'District Third', value: 'District Third' },
    { label: 'State First', value: 'State First' },
    { label: 'State Second', value: 'State Second' },
    { label: 'State Third', value: 'State Third' },
    { label: 'Other Achievement', value: 'Other Achievement' },
  ];

  const classOptions = [
    { label: '10th Standard', value: '10th' },
    { label: '12th Standard', value: '12th' },
    { label: '11th Standard', value: '11th' },
    { label: '9th Standard', value: '9th' },
  ];

  const yearOptions = [
    { label: '2025–2026', value: '2025–26' },
    { label: '2024–2025', value: '2024–25' },
    { label: '2023–2024', value: '2023–24' },
    { label: '2022–2023', value: '2022–23' },
    { label: '2021–2022', value: '2021–22' },
  ];

  const filteredHolders = rankHolders.filter(h => {
    const matchesSearch = !searchTerm ||
      h.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.achievement_title && h.achievement_title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesYear = !selectedYear || h.academic_year === selectedYear;
    return matchesSearch && matchesYear;
  });

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#111111] flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-[#854D0E]" />
            <span>School Rank Holders Management</span>
          </h2>
          <p className="text-xs text-[#6B7280]">Showcase students & alumni who achieved top academic rank excellence</p>
        </div>

        <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Rank Holder
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name, rank, or achievement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#F4C542]"
          />
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={[
              { label: 'All Academic Years', value: '' },
              ...yearOptions
            ]}
          />
        </div>
      </div>

      {/* Table List View */}
      {filteredHolders.length === 0 ? (
        <EmptyState
          title="No Rank Holders Found"
          description="Click 'Add Rank Holder' above to record student academic achievements."
          action={
            <Button onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add First Rank Holder
            </Button>
          }
        />
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#111111]">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E7EB] uppercase text-[11px] font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="p-4">Photo</th>
                  <th className="p-4">Student / Alumni Name</th>
                  <th className="p-4">Academic Year</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Rank</th>
                  <th className="p-4">Score / Marks</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredHolders.map((h) => {
                  const photoSrc = getAssetUrl(h.photograph) || `https://ui-avatars.com/api/?name=${encodeURIComponent(h.student_name)}&background=111111&color=ffffff`;

                  return (
                    <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <img
                          src={photoSrc}
                          alt={h.student_name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      </td>
                      <td className="p-4 font-bold text-[#111111]">
                        {h.student_name}
                        {h.student_name_ta && (
                          <div className="text-[12px] font-medium text-gray-500 mt-0.5">{h.student_name_ta}</div>
                        )}
                        {h.achievement_title && (
                          <div className="text-[11px] text-[#854D0E] font-medium mt-0.5">{h.achievement_title}</div>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-gray-700">{h.academic_year}</td>
                      <td className="p-4 font-semibold text-gray-700">{h.class_standard}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center space-x-1 font-extrabold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-2.5 py-0.5 rounded-full">
                          <Star className="w-3 h-3 text-[#854D0E]" />
                          <span>{h.rank}</span>
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-[#854D0E]">
                        {h.total_marks ? (
                          <span>{h.total_marks}{h.max_marks ? ` / ${h.max_marks}` : ''}</span>
                        ) : (
                          <span>{h.marks_percentage || 'N/A'}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          h.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(h)}
                          className="p-1.5 text-gray-600 hover:text-[#111111] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Rank Holder"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(h.id, h.student_name)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Rank Holder"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT RANK HOLDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border-2 border-[#F4C542] overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-[#854D0E]" />
                <h3 className="text-lg font-bold text-[#111111]">
                  {editingId ? 'Edit Rank Holder' : 'Add School Rank Holder'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-[#111111] p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Select Existing Alumni Profile */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Select Alumni Profile (Optional)
                </label>
                <select
                  value={alumniId}
                  onChange={(e) => handleAlumniSelect(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:border-[#F4C542] focus:outline-none"
                >
                  <option value="">-- Choose Existing Alumni (Autofills details) --</option>
                  {alumniList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name} ({a.passing_year} Batch)
                    </option>
                  ))}
                </select>
              </div>

              {/* Student / Alumni Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Student / Alumni Name *"
                  placeholder="e.g. Arun Kumar"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
                <Input
                  label="Student Name (Tamil)"
                  placeholder="e.g. அருண் குமார்"
                  value={studentNameTa}
                  onChange={(e) => setStudentNameTa(e.target.value)}
                />
              </div>

              {/* Academic Year & Class Standard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Academic Year *"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  options={yearOptions}
                />

                <Select
                  label="Class / Standard *"
                  value={classStandard}
                  onChange={(e) => setClassStandard(e.target.value)}
                  options={classOptions}
                />
              </div>

              {/* Rank & Exam Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Rank *"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  options={rankOptions}
                />

                <Input
                  label="Exam / Achievement *"
                  placeholder="e.g. SSLC / Public Examination"
                  value={achievementType}
                  onChange={(e) => setAchievementType(e.target.value)}
                />
              </div>

              {/* Student Marks & Score Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Total Score / Marks *"
                  placeholder="e.g. 485 or 1150"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                />

                <Input
                  label="Out of (Max Marks)"
                  placeholder="e.g. 500 or 1200"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                />

                <Input
                  label="Percentage / Grade"
                  placeholder="e.g. 97.0% or A+"
                  value={marksPercentage}
                  onChange={(e) => setMarksPercentage(e.target.value)}
                />
              </div>

              <Input
                label="Subject / Stream (Optional)"
                placeholder="e.g. Science Stream / Biology-Maths"
                value={subjectStream}
                onChange={(e) => setSubjectStream(e.target.value)}
              />

              {/* Achievement Title */}
              <Input
                label="Achievement Title"
                placeholder="e.g. School First Rank"
                value={achievementTitle}
                onChange={(e) => setAchievementTitle(e.target.value)}
              />

              {/* Photograph Upload / URL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Photograph Photo
                </label>
                <div className="flex items-center space-x-3">
                  {photograph && (
                    <img src={getAssetUrl(photograph)} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-gray-300" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#111111] file:text-[#F4C542] cursor-pointer"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Short Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief note about the student's achievement..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              {/* Status */}
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                options={[
                  { label: 'Active (Show in Public Portal)', value: 'Active' },
                  { label: 'Inactive (Hidden)', value: 'Inactive' }
                ]}
              />

              {/* Form Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Rank Holder'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
