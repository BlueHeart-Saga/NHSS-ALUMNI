import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Trophy, Award, Star, CheckCircle, XCircle, Upload, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { RankHolder, AlumniProfile } from '../../types';
import { getAssetUrl } from '../../utils/asset';
import { useLanguage } from '../../context/LanguageContext';

// Rank options — value stays English for DB, label is translated at render
const RANK_OPTIONS: { value: string; labelKey: string }[] = [
  { value: '1st Rank',            labelKey: 'admin_rank_opt_1st' },
  { value: '2nd Rank',            labelKey: 'admin_rank_opt_2nd' },
  { value: '3rd Rank',            labelKey: 'admin_rank_opt_3rd' },
  { value: 'School First',        labelKey: 'admin_rank_opt_school_first' },
  { value: 'District First',      labelKey: 'admin_rank_opt_district_first' },
  { value: 'District Second',     labelKey: 'admin_rank_opt_district_second' },
  { value: 'District Third',      labelKey: 'admin_rank_opt_district_third' },
  { value: 'State First',         labelKey: 'admin_rank_opt_state_first' },
  { value: 'State Second',        labelKey: 'admin_rank_opt_state_second' },
  { value: 'State Third',         labelKey: 'admin_rank_opt_state_third' },
  { value: 'Other Achievement',   labelKey: 'admin_rank_opt_other' },
];

// Class options — value stays English for DB
const CLASS_OPTIONS: { value: string; labelKey: string }[] = [
  { value: '10th', labelKey: 'admin_rank_class_10' },
  { value: '12th', labelKey: 'admin_rank_class_12' },
  { value: '11th', labelKey: 'admin_rank_class_11' },
  { value: '9th',  labelKey: 'admin_rank_class_9' },
];

// Year options — value stays English for DB
const YEAR_OPTIONS: { value: string; labelKey: string }[] = [
  { value: '2025–26', labelKey: 'admin_rank_year_2025_26' },
  { value: '2024–25', labelKey: 'admin_rank_year_2024_25' },
  { value: '2023–24', labelKey: 'admin_rank_year_2023_24' },
  { value: '2022–23', labelKey: 'admin_rank_year_2022_23' },
  { value: '2021–22', labelKey: 'admin_rank_year_2021_22' },
];

// Maps DB value → translation key for rank display in the table
const RANK_DISPLAY_KEY: Record<string, string> = {
  '1st Rank': 'admin_rank_opt_1st',
  '2nd Rank': 'admin_rank_opt_2nd',
  '3rd Rank': 'admin_rank_opt_3rd',
  'School First': 'admin_rank_opt_school_first',
  'District First': 'admin_rank_opt_district_first',
  'District Second': 'admin_rank_opt_district_second',
  'District Third': 'admin_rank_opt_district_third',
  'State First': 'admin_rank_opt_state_first',
  'State Second': 'admin_rank_opt_state_second',
  'State Third': 'admin_rank_opt_state_third',
  'Other Achievement': 'admin_rank_opt_other',
};

// Maps DB class value → translation key
const CLASS_DISPLAY_KEY: Record<string, string> = {
  '10th': 'admin_rank_class_10',
  '12th': 'admin_rank_class_12',
  '11th': 'admin_rank_class_11',
  '9th':  'admin_rank_class_9',
};

export const RankHoldersManager: React.FC = () => {
  const { t } = useLanguage();
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
      alertService.showWarning(
        t('admin_rank_alert_required_title'),
        t('admin_rank_alert_required_body')
      );
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
        alertService.showSuccess(
          t('admin_rank_alert_updated_title'),
          t('admin_rank_alert_updated_body').replace('{name}', studentName)
        );
      } else {
        await api.createRankHolder(payload);
        alertService.showSuccess(
          t('admin_rank_alert_added_title'),
          t('admin_rank_alert_added_body').replace('{name}', studentName)
        );
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alertService.handleApiError(err, t('admin_rank_alert_save_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await alertService.showConfirm(
      t('admin_rank_alert_delete_confirm_title'),
      t('admin_rank_alert_delete_confirm_body').replace('{name}', name)
    );
    if (confirmed) {
      try {
        await api.deleteRankHolder(id);
        alertService.showSuccess(
          t('admin_rank_alert_deleted_title'),
          t('admin_rank_alert_deleted_body').replace('{name}', name)
        );
        fetchData();
      } catch (err) {
        alertService.handleApiError(err, t('admin_rank_alert_delete_error'));
      }
    }
  };

  // Localized dropdown options
  const rankOptions = RANK_OPTIONS.map(o => ({ label: t(o.labelKey), value: o.value }));
  const classOptions = CLASS_OPTIONS.map(o => ({ label: t(o.labelKey), value: o.value }));
  const yearOptions = YEAR_OPTIONS.map(o => ({ label: t(o.labelKey), value: o.value }));

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
            <span>{t('admin_rank_page_title')}</span>
          </h2>
          <p className="text-xs text-[#6B7280]">{t('admin_rank_page_subtitle')}</p>
        </div>

        <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          {t('admin_rank_add_btn')}
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={t('admin_rank_search_placeholder')}
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
              { label: t('admin_rank_all_years'), value: '' },
              ...yearOptions
            ]}
          />
        </div>
      </div>

      {/* Table List View */}
      {filteredHolders.length === 0 ? (
        <EmptyState
          title={t('admin_rank_empty_title')}
          description={t('admin_rank_empty_description')}
          action={
            <Button onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4 mr-1.5" />
              {t('admin_rank_empty_add_btn')}
            </Button>
          }
        />
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#111111]">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E7EB] uppercase text-[11px] font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="p-4">{t('admin_rank_col_photo')}</th>
                  <th className="p-4">{t('admin_rank_col_name')}</th>
                  <th className="p-4">{t('admin_rank_col_year')}</th>
                  <th className="p-4">{t('admin_rank_col_class')}</th>
                  <th className="p-4">{t('admin_rank_col_rank')}</th>
                  <th className="p-4">{t('admin_rank_col_score')}</th>
                  <th className="p-4">{t('admin_rank_col_status')}</th>
                  <th className="p-4 text-right">{t('admin_rank_col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredHolders.map((h) => {
                  const photoSrc = getAssetUrl(h.photograph) || `https://ui-avatars.com/api/?name=${encodeURIComponent(h.student_name)}&background=111111&color=ffffff`;
                  const rankKey = RANK_DISPLAY_KEY[h.rank];
                  const rankLabel = rankKey ? t(rankKey) : h.rank;

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
                          <span>{rankLabel}</span>
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
                          {h.status === 'Active' ? t('admin_rank_status_active') : t('admin_rank_status_inactive')}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(h)}
                          className="p-1.5 text-gray-600 hover:text-[#111111] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title={t('admin_rank_action_edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(h.id, h.student_name)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title={t('admin_rank_action_delete')}
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
                  {editingId ? t('admin_rank_modal_title_edit') : t('admin_rank_modal_title_add')}
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
                  {t('admin_rank_form_alumni_select_label')}
                </label>
                <select
                  value={alumniId}
                  onChange={(e) => handleAlumniSelect(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:border-[#F4C542] focus:outline-none"
                >
                  <option value="">{t('admin_rank_form_alumni_select_placeholder')}</option>
                  {alumniList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {t('admin_rank_form_alumni_option_format')
                        .replace('{name}', a.full_name)
                        .replace('{year}', String(a.passing_year))}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student / Alumni Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('admin_rank_form_name_label')}
                  placeholder={t('admin_rank_form_name_placeholder')}
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
                <Input
                  label={t('admin_rank_form_name_ta_label')}
                  placeholder={t('admin_rank_form_name_ta_placeholder')}
                  value={studentNameTa}
                  onChange={(e) => setStudentNameTa(e.target.value)}
                />
              </div>

              {/* Academic Year & Class Standard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label={t('admin_rank_form_year_label')}
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  options={yearOptions}
                />

                <Select
                  label={t('admin_rank_form_class_label')}
                  value={classStandard}
                  onChange={(e) => setClassStandard(e.target.value)}
                  options={classOptions}
                />
              </div>

              {/* Rank & Exam Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label={t('admin_rank_form_rank_label')}
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  options={rankOptions}
                />

                <Input
                  label={t('admin_rank_form_exam_label')}
                  placeholder={t('admin_rank_form_exam_placeholder')}
                  value={achievementType}
                  onChange={(e) => setAchievementType(e.target.value)}
                />
              </div>

              {/* Student Marks & Score Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label={t('admin_rank_form_total_marks_label')}
                  placeholder={t('admin_rank_form_total_marks_placeholder')}
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                />

                <Input
                  label={t('admin_rank_form_max_marks_label')}
                  placeholder={t('admin_rank_form_max_marks_placeholder')}
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                />

                <Input
                  label={t('admin_rank_form_percentage_label')}
                  placeholder={t('admin_rank_form_percentage_placeholder')}
                  value={marksPercentage}
                  onChange={(e) => setMarksPercentage(e.target.value)}
                />
              </div>

              <Input
                label={t('admin_rank_form_stream_label')}
                placeholder={t('admin_rank_form_stream_placeholder')}
                value={subjectStream}
                onChange={(e) => setSubjectStream(e.target.value)}
              />

              {/* Achievement Title */}
              <Input
                label={t('admin_rank_form_title_label')}
                placeholder={t('admin_rank_form_title_placeholder')}
                value={achievementTitle}
                onChange={(e) => setAchievementTitle(e.target.value)}
              />

              {/* Photograph Upload / URL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('admin_rank_form_photo_label')}
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
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('admin_rank_form_description_label')}</label>
                <textarea
                  rows={2}
                  placeholder={t('admin_rank_form_description_placeholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              {/* Status */}
              <Select
                label={t('admin_rank_form_status_label')}
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                options={[
                  { label: t('admin_rank_form_status_active_option'), value: 'Active' },
                  { label: t('admin_rank_form_status_inactive_option'), value: 'Inactive' }
                ]}
              />

              {/* Form Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  {t('admin_rank_form_cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? t('admin_rank_form_saving') : t('admin_rank_form_save')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};