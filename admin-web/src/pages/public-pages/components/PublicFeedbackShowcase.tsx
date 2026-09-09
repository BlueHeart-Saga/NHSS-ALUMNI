import React, { useEffect, useState, useMemo } from 'react';
import {
  MessageSquareQuote, Star, Sparkles, MapPin, CheckCircle2,
  Send, Loader2, User, GraduationCap, ChevronLeft, ChevronRight, Heart
} from 'lucide-react';
import { api } from '../../../services/api';
import { alertService } from '../../../services/alertService';
import { useLanguage } from '../../../context/LanguageContext';
import { FeedbackItem, CreateFeedbackPayload } from '../../../types';
import { getAssetUrl } from '../../../utils/asset';

export const PublicFeedbackShowcase: React.FC = () => {
  const { language } = useLanguage();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Form Fields State (Inline Direct Form)
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [nameTa, setNameTa] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackTextTa, setFeedbackTextTa] = useState('');

  useEffect(() => {
    fetchApprovedFeedbacks();
  }, []);

  // Auto-play timer for feedback carousel (5 seconds interval)
  useEffect(() => {
    if (feedbacks.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % feedbacks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [feedbacks.length, isPaused]);

  const fetchApprovedFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await api.getPublicFeedback({});
      setFeedbacks(data);
      setActiveIndex(0);
    } catch (err) {
      console.error('Failed to fetch public feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeFeedback = useMemo(() => {
    if (feedbacks.length === 0) return null;
    return feedbacks[activeIndex % feedbacks.length];
  }, [feedbacks, activeIndex]);

  // Language-based single comment selection
  const singleCommentText = useMemo(() => {
    if (!activeFeedback) return '';
    if (language === 'ta') {
      return activeFeedback.feedback_text_ta || activeFeedback.feedback_text;
    }
    return activeFeedback.feedback_text || activeFeedback.feedback_text_ta || '';
  }, [activeFeedback, language]);

  // Language-based alumnus name selection
  const displayName = useMemo(() => {
    if (!activeFeedback) return '';
    if (language === 'ta') {
      return activeFeedback.alumni_name_ta || activeFeedback.alumni_name;
    }
    return activeFeedback.alumni_name;
  }, [activeFeedback, language]);

  const handleNext = () => {
    if (feedbacks.length > 0) {
      setActiveIndex((prev) => (prev + 1) % feedbacks.length);
    }
  };

  const handlePrev = () => {
    if (feedbacks.length > 0) {
      setActiveIndex((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !batchYear.trim() || !feedbackText.trim()) {
      alertService.showWarning('Required Fields Missing', 'Please fill in your name, batch year, and opinion.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateFeedbackPayload = {
        alumni_name: name.trim(),
        alumni_name_ta: nameTa.trim() || undefined,
        batch_year: batchYear.trim(),
        location: location.trim() || undefined,
        feedback_type: 'SUGGESTIONS',
        feedback_text: feedbackText.trim(),
        feedback_text_ta: feedbackTextTa.trim() || undefined,
        rating: rating
      };

      await api.createFeedback(payload);
      alertService.showSuccess(
        'Feedback Submitted!',
        'Thank you! Your opinion has been submitted for review.'
      );
      setName('');
      setNameTa('');
      setBatchYear('');
      setLocation('');
      setFeedbackText('');
      setFeedbackTextTa('');
      fetchApprovedFeedbacks();
    } catch (err) {
      alertService.handleApiError(err, 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 py-4 font-sans text-[#111111]">
      
      {/* 1st TOP SIDE: SHARE YOUR OPINIONS & SUGGESTIONS FORM */}
      <div className="max-w-3xl sm:max-w-4xl mx-auto space-y-6 px-4">
        
        {/* Form Clean Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] tracking-tight">
            {language === 'ta' ? 'உங்கள் கருத்துகள் & பரிந்துரைகளைப் பகிருங்கள்' : 'Share Your Opinions & Suggestions'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-xl mx-auto">
            {language === 'ta'
              ? 'பள்ளிக்கால நினைவுகள் மற்றும் நமது அமைப்பைப் பற்றிய கருத்துக்களை இங்கே பதிவிடலாம்.'
              : 'Warmly invite you to share your reflections, memories, and suggestions with our school community.'}
          </p>
        </div>

        {/* Form with Clean Bottom-Border-Only Underline Input Fields */}
        <form onSubmit={handleSubmitFeedback} className="space-y-6 pt-2">
            
          {/* Row 1: Name & Tamil Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Your Name * / பெயர்
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. R. Ramesh"
                className="w-full py-2 bg-transparent border-b-2 border-gray-300 text-sm font-bold text-[#111111] placeholder-gray-400 focus:border-[#F4C542] focus:outline-none transition-colors rounded-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Tamil Name / தமிழ் பெயர்
              </label>
              <input
                type="text"
                value={nameTa}
                onChange={(e) => setNameTa(e.target.value)}
                placeholder="எ.கா. ஆர். ரமேஷ்"
                className="w-full py-2 bg-transparent border-b-2 border-gray-300 text-sm font-bold text-[#111111] placeholder-gray-400 focus:border-[#F4C542] focus:outline-none transition-colors rounded-none"
              />
            </div>
          </div>

          {/* Row 2: Batch Year & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Batch Passing Year * / பேட்ச்
              </label>
              <input
                type="text"
                required
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                placeholder="e.g. 1998"
                className="w-full py-2 bg-transparent border-b-2 border-[#F4C542] text-sm font-bold text-[#111111] placeholder-gray-400 focus:border-[#854D0E] focus:outline-none transition-colors rounded-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Location / வசிக்கும் இடம்
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Chennai, India"
                className="w-full py-2 bg-transparent border-b-2 border-gray-300 text-sm font-bold text-[#111111] placeholder-gray-400 focus:border-[#F4C542] focus:outline-none transition-colors rounded-none"
              />
            </div>
          </div>

          {/* Row 3: Rating Stars Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Rating Stars / மதிப்பீடு (1 - 5)
            </label>
            <div className="flex items-center space-x-2 pt-1 border-b-2 border-gray-100 pb-2">
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

          {/* Row 4: Opinion in English */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Your Opinion &amp; Suggestions (English) * / கருத்துகள் &amp; பரிந்துரைகள்
            </label>
            <textarea
              rows={2}
              required
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your cherished memories, reflections, or suggestions for our school community..."
              className="w-full py-2 bg-transparent border-b-2 border-gray-300 text-sm font-medium text-[#111111] placeholder-gray-400 focus:border-[#F4C542] focus:outline-none transition-colors rounded-none resize-none"
            />
          </div>

          {/* Row 5: Opinion in Tamil */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Opinion in Tamil (Optional) / தமிழ் கருத்துகள்
            </label>
            <textarea
              rows={2}
              value={feedbackTextTa}
              onChange={(e) => setFeedbackTextTa(e.target.value)}
              placeholder="உங்கள் கருத்துக்கள் மற்றும் வாழ்த்துக்களை தமிழில் பதிவிடவும்..."
              className="w-full py-2 bg-transparent border-b-2 border-gray-300 text-sm font-medium text-[#111111] placeholder-gray-400 focus:border-[#F4C542] focus:outline-none transition-colors rounded-none resize-none"
            />
          </div>

          {/* Submit Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 bg-[#111111] hover:bg-black text-[#F4C542] font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2 border border-[#F4C542]/40 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 text-[#F4C542] animate-spin" />
                  <span>Submitting Opinion...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#F4C542]" />
                  <span>{language === 'ta' ? 'கருத்தை சமர்ப்பிக்க' : 'Submit Opinion & Suggestions'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>


      {/* 2nd: OPINIONS & SUGGESTIONS COMMENTS CAROUSEL (SPEECH BUBBLE & AVATARS) */}
      <div className="pt-10 border-t border-gray-200 space-y-8">
        
        <div className="text-center space-y-2 max-w-3xl mx-auto px-4">
         
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] tracking-tight pt-1">
            {language === 'ta' ? 'மாணவர்கள் பகிர்ந்த கருத்துகள் & பரிந்துரைகள்' : 'Shared Opinions & Suggestions'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">
            {language === 'ta'
              ? 'நமது பள்ளி குடும்பத்தின் வளர்ச்சி மற்றும் நினைவுகள் குறித்து பழைய மாணவர்கள் அன்புடன் பகிர்ந்த இதயப்பூர்வமான எண்ணங்கள்.'
              : 'Heartfelt memories, inspiring reflections, and thoughtful suggestions lovingly shared by our alumni family.'}
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#854D0E] animate-spin mx-auto" />
            <p className="text-xs font-semibold text-gray-500">Loading alumni opinions...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="py-14 text-center bg-gray-50/70 rounded-3xl max-w-3xl mx-auto space-y-3 border border-dashed border-gray-300">
            <MessageSquareQuote className="w-10 h-10 text-gray-400 mx-auto" />
            <h4 className="text-base font-bold text-[#111111]">No Feedback Entries Found</h4>
            <p className="text-xs text-gray-500">Be the first alumnus to share your thoughts above!</p>
          </div>
        ) : activeFeedback && (
          <div
            className="max-w-4xl sm:max-w-5xl mx-auto space-y-6 animate-fadeIn px-2 sm:px-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            
            {/* Main Speech Bubble Card */}
            <div className="relative bg-white rounded-3xl p-8 sm:p-12 md:p-14 shadow-2xl border border-gray-100 space-y-5 transition-all">
              
              {/* Top Row: Big Quote Mark & Rating Stars */}
              <div className="flex items-center justify-between">
                <div className="text-6xl font-serif text-amber-300/80 select-none leading-none">
                  “
                </div>
                
                <div className="flex items-center space-x-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < (activeFeedback.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Testimonial Single Language Quote Text */}
              <div className="space-y-3 pl-2 sm:pl-4">
                <p className="text-lg sm:text-xl md:text-2xl text-gray-800 leading-relaxed font-medium italic">
                  &quot;{singleCommentText}&quot;
                </p>
              </div>

              {/* Speech Bubble Pointer Tail pointing down */}
              <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 bg-white border-b border-r border-gray-100 rotate-45 shadow-xs"></div>
            </div>

            {/* Avatar Slider Row & Selected Alumni Details */}
            <div className="pt-6 flex flex-col items-center space-y-5">
              
              <div className="flex items-center justify-center space-x-3 sm:space-x-6 overflow-x-auto py-6 sm:py-8 px-6 max-w-full">
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 transition-all cursor-pointer shrink-0 shadow-md mr-2"
                  title="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {feedbacks.map((fb, idx) => {
                  const isActive = idx === (activeIndex % feedbacks.length);
                  return (
                    <button
                      key={fb.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative rounded-full transition-all duration-300 cursor-pointer shrink-0 mx-2 sm:mx-3 p-1 ${
                        isActive
                          ? 'scale-110 sm:scale-125 z-10 border-3 border-[#F4C542] bg-white shadow-xl'
                          : 'opacity-50 hover:opacity-100 scale-90 sm:scale-100 hover:scale-105 border-2 border-transparent'
                      }`}
                    >
                      <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-[#FFF7D6] border-2 border-white flex items-center justify-center font-extrabold text-base text-[#854D0E]">
                        {fb.photo_url ? (
                          <img src={getAssetUrl(fb.photo_url)} alt={fb.alumni_name} className="w-full h-full object-cover" />
                        ) : (
                          fb.alumni_name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </button>
                  );
                })}

                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 transition-all cursor-pointer shrink-0 shadow-md ml-2"
                  title="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Active Alumni Display Name (Language Based), Batch, and Location info */}
              <div className="text-center space-y-1 animate-fadeIn">
                <h4 className="font-extrabold text-lg sm:text-xl text-[#111111]">
                  {displayName}
                </h4>
                <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-500 font-semibold">
                  <span className="text-[#854D0E] font-bold">Batch {activeFeedback.batch_year}</span>
                  {activeFeedback.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{activeFeedback.location}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
};
