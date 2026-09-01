import React, { useEffect, useState } from 'react';
import { GraduationCap, Search, Users, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../../components/Modal';

export const PublicBatches: React.FC = () => {
  const { t, language } = useLanguage();
  const [batches, setBatches] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  useEffect(() => {
    api.getPublicBatches().then(setBatches).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredBatches = batches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.passing_year.toString().includes(search)
  );

  return (
    <div className="bg-white text-[#111111] animate-fadeIn">
      {/* Header Banner */}
      <div className="py-10 sm:py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
            {t('batches_title')}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 sm:space-y-10">
        {/* Search Bar */}
        <div className="max-w-lg mx-auto relative">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 absolute left-4 sm:left-5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search_batches_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 sm:pl-14 pr-4 sm:pr-5 py-3 sm:py-4 bg-white border-2 border-[#E5E7EB] rounded-2xl text-sm sm:text-lg font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] shadow-sm"
          />
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredBatches.map((batch) => {
            const coords = batch.coordinator_profiles || [];
            const primaryCoord = coords[0];

            return (
              <div
                key={batch.id}
                className="bg-white border-2 border-[#E5E7EB] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md hover:border-[#F4C542] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden group text-center"
              >
                {/* Bottom-to-Top Glass Fill Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#FFF7D6]/90 via-[#FFF7D6]/30 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none -z-0" />

                <div className="relative z-10 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Top Year Badge */}
                    <div className="flex justify-end mb-2">
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#854D0E] uppercase tracking-wider bg-[#FFF7D6] border border-[#F4C542]/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-2xs">
                        Batch {batch.passing_year}
                      </span>
                    </div>

                    {/* Big Centered Profile Image Header (Click to Preview) */}
                    <div className="flex flex-col items-center justify-center mb-3 sm:mb-4">
                      {primaryCoord && primaryCoord.profile_photo_url ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage({
                              url: primaryCoord.profile_photo_url,
                              title: primaryCoord.full_name,
                              subtitle: `${batch.name} • Batch Coordinator`
                            });
                          }}
                          className="relative cursor-pointer group-hover:scale-105 active:scale-95 transition-transform"
                        >
                          <img
                            src={primaryCoord.profile_photo_url}
                            alt={primaryCoord.full_name}
                            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full shadow-md hover:shadow-xl object-cover hover:brightness-105 transition-all"
                          />
                          {coords.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 bg-[#111111] text-[#F4C542] text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border border-[#F4C542] shadow-sm">
                              +{coords.length - 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#FFF7D6] to-[#FFEAA7] flex items-center justify-center text-[#854D0E] shadow-md group-hover:scale-105 transition-transform">
                          <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-[#854D0E]" />
                        </div>
                      )}

                      {/* Coordinator Name Subtitle */}
                      {primaryCoord && (
                        <span className="text-[11px] sm:text-xs font-semibold text-[#854D0E] mt-2 bg-[#FFF7D6] border border-[#F4C542]/40 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full truncate max-w-[140px] sm:max-w-[200px]">
                          {primaryCoord.full_name}
                        </span>
                      )}
                    </div>

                    {/* Batch Name & Description */}
                    <h3 className="text-base sm:text-xl font-bold text-[#111111] group-hover:text-[#854D0E] transition-colors mb-1 line-clamp-1">
                      {batch.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 mb-4 sm:mb-6">
                      {batch.description || `Class of ${batch.passing_year} Alumni Cohort`}
                    </p>
                  </div>

                  <Link
                    to={`/register?batch=${batch.passing_year}`}
                    className="w-full py-2.5 sm:py-3.5 px-3 sm:px-4 bg-[#F4C542] hover:bg-[#E0B238] text-[#111111] font-bold text-[11px] sm:text-xs uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-1.5 border border-[#F4C542]/60"
                  >
                    <span>{t('view_batch_members')}</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full-size Profile Image Lightbox Preview Modal */}
      {previewImage && (
        <Modal
          isOpen={Boolean(previewImage)}
          onClose={() => setPreviewImage(null)}
          title={previewImage.title}
        >
          <div className="flex flex-col items-center justify-center space-y-4 p-4 text-center">
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[65vh] max-w-full rounded-2xl shadow-2xl object-contain"
            />
            {previewImage.subtitle && (
              <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-4 py-1.5 rounded-full shadow-xs">
                {previewImage.subtitle}
              </span>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
