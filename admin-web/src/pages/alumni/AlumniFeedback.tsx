import React, { useEffect, useState } from 'react';
import {
  MessageSquareQuote, Plus, Star, CheckCircle2, Clock, XCircle,
  Sparkles, Send, X, Loader2, AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { useLanguage } from '../../context/LanguageContext';
import { FeedbackItem, CreateFeedbackPayload } from '../../types';

const CATEGORIES = [
  { key: 'SUGGESTIONS', label: 'Suggestions / பரிந்துரைகள்' },
  { key: 'APPRECIATION', label: 'Appreciation / பாராட்டுக்கள்' },
  { key: 'MEMORIES', label: 'School Memories / நினைவுகள்' },
  { key: 'WEBSITE', label: 'Website Portal / இணையதளம்' },
  { key: 'ASSOCIATION', label: 'Alumni Association / சங்கம்' },
  { key: 'EVENTS', label: 'Events & Reunions / நிகழ்ச்சிகள்' },
  { key: 'OTHER', label: 'Other / பிற' },
];

export const AlumniFeedback: React.FC = () => {
  const { language } = useLanguage();
  const [myFeedbacks, setMyFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [nameTa, setNameTa] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [location, setLocation] = useState('');
  const [feedbackType, setFeedbackType] = useState('SUGGESTIONS');
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackTextTa, setFeedbackTextTa] = useState('');

  useEffect(() => {
    fetchMyFeedbacks();
  }, []);

  const fetchMyFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await api.getMyFeedback();
      setMyFeedbacks(data);
    } catch (err) {
      console.error('Failed to fetch user feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !batchYear.trim() || !feedbackText.trim()) {
      alertService.showWarning('Missing Information', 'Please provide your name, batch year, and feedback.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateFeedbackPayload = {
        alumni_name: name.trim(),
        alumni_name_ta: nameTa.trim() || undefined,
        batch_year: batchYear.trim(),
        location: location.trim() || undefined,
        feedback_type: feedbackType,
        feedback_text: feedbackText.trim(),
        feedback_text_ta: feedbackTextTa.trim() || undefined,
        rating: rating
      };

      await api.createFeedback(payload);
      alertService.showSuccess(
        'Feedback Submitted!',
        'Your opinion has been submitted successfully and is pending admin approval.'
      );
      setIsModalOpen(false);
      setName('');
      setNameTa('');
      setBatchYear('');
      setLocation('');
      setFeedbackText('');
      setFeedbackTextTa('');
      fetchMyFeedbacks();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-[#111111] p-1 sm:p-0">

      {/* Page Header */}
      <div className="bg-[#111111] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-[#F4C542]/40">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-6 -translate-y-6">
          <MessageSquareQuote className="w-64 h-64 text-[#F4C542]" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#F4C542]/20 border border-[#F4C542] rounded-full text-xs font-extrabold text-[#F4C542] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? ' கருத்துகள்' : 'Alumni Feedback & Opinions'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {language === 'ta' ? 'எனது கருத்துகள் & பரிந்துரைகள்' : 'My Opinions & Feedback (கருத்துகள்)'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              {language === 'ta'
                ? 'உங்கள் பள்ளிக்கால நினைவுகள், அமைப்பைப் பற்றிய கருத்துகள் மற்றும் பரிந்துரைகளைப் பகிருங்கள்.'
                : 'Submit your thoughts, feedback, and school memories. Monitor status updates from administration.'}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#F4C542] hover:bg-[#e0b236] text-[#111111] font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer inline-flex items-center justify-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#111111]" />
            <span>{language === 'ta' ? '+ புதிய கருத்து பதிவு' : '+ Submit Opinion'}</span>
          </button>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-extrabold text-base text-[#111111]">
            {language === 'ta' ? 'நான் சமர்ப்பித்த கருத்துகள்' : 'My Submission Status'}
          </h3>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Total: {myFeedbacks.length}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-2">
            <Loader2 className="w-7 h-7 text-[#854D0E] animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-semibold">Loading your submissions...</p>
          </div>
        ) : myFeedbacks.length === 0 ? (
          <div className="py-12 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-3">
            <MessageSquareQuote className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs font-semibold text-gray-600">
              {language === 'ta' ? 'நீங்கள் இன்னும் எந்த கருத்தையும் சமர்ப்பிக்கவில்லை.' : 'You have not submitted any feedback yet.'}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-[#111111] text-[#F4C542] font-bold text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ta' ? 'கருத்து பதிவு செய்க' : 'Submit First Feedback'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myFeedbacks.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-[#F4C542] transition-all space-y-3 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/60 px-2.5 py-0.5 rounded-full uppercase">
                      {item.feedback_type}
                    </span>
                    <div className="flex items-center space-x-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < (item.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {item.status === 'APPROVED' ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold bg-green-100 text-green-800 border border-green-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approved & Published</span>
                      </span>
                    ) : item.status === 'REJECTED' ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-300">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Not Approved</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Admin Review</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50/80 p-4 rounded-xl space-y-1.5 border border-gray-100">
                  <p className="text-xs sm:text-sm text-[#111111] italic font-medium">
                    &quot;{item.feedback_text}&quot;
                  </p>
                  {item.feedback_text_ta && (
                    <p className="text-xs text-[#854D0E] font-semibold pt-1 border-t border-gray-200/50">
                      &quot;{item.feedback_text_ta}&quot;
                    </p>
                  )}
                </div>

                {item.admin_remarks && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 space-y-1">
                    <div className="font-extrabold flex items-center gap-1 text-red-900">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Admin Remarks / குறிப்பு:</span>
                    </div>
                    <p>{item.admin_remarks}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <span>Batch: <strong className="text-[#111111]">{item.batch_year}</strong></span>
                  <span>Submitted: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border-2 border-[#111111] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-xl font-bold text-[#111111] flex items-center gap-2">
                  <MessageSquareQuote className="w-6 h-6 text-[#854D0E]" />
                  <span>Submit Alumni Opinion</span>
                  <span className="text-xs font-semibold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-2.5 py-0.5 rounded-full">
                    கருத்துகள்
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Share your opinion or feedback with management and alumni community.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Your Name * / பெயர்
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. R. Ramesh"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Tamil Name / தமிழ் பெயர்
                  </label>
                  <input
                    type="text"
                    value={nameTa}
                    onChange={(e) => setNameTa(e.target.value)}
                    placeholder="எ.கா. ஆர். ரமேஷ்"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Batch Year * / பேட்ச்
                  </label>
                  <input
                    type="text"
                    required
                    value={batchYear}
                    onChange={(e) => setBatchYear(e.target.value)}
                    placeholder="e.g. 1998"
                    className="w-full px-3.5 py-2.5 bg-amber-50/60 border border-[#F4C542] rounded-xl text-xs text-[#111111] font-semibold focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Location / வசிக்கும் இடம்
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Madurai, India"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-[#111111] focus:bg-white focus:outline-none"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Rating Stars (1 - 5)
                  </label>
                  <div className="flex items-center space-x-1.5 pt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-125"
                      >
                        <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Your Opinion / Feedback (English) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your opinion or feedback..."
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Opinion in Tamil (Optional) / தமிழ் கருத்து
                </label>
                <textarea
                  rows={2}
                  value={feedbackTextTa}
                  onChange={(e) => setFeedbackTextTa(e.target.value)}
                  placeholder="உங்கள் கருத்துக்களை தமிழில் பதிவிடவும்..."
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#111111] font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs rounded-xl shadow-md inline-flex items-center space-x-1.5"
                >
                  <Send className="w-4 h-4 text-[#F4C542]" />
                  <span>Submit for Review</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
