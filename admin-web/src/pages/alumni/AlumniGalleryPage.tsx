import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { api } from '../../services/api';
import { Memory } from '../../types';
import { AlumniContextType } from '../../layouts/AlumniLayout';
import { useLanguage } from '../../context/LanguageContext';

export const AlumniGalleryPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useOutletContext<AlumniContextType>();
  const [memories, setMemories] = useState<Memory[]>([]);

  const [showUploadMemoryModal, setShowUploadMemoryModal] = useState(false);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryAlbum, setMemoryAlbum] = useState('Alumni Gathering');
  const [memoryDescription, setMemoryDescription] = useState('');
  const [memoryFileUrl, setMemoryFileUrl] = useState('');

  useEffect(() => {
    api.getMemories()
      .then(setMemories)
      .catch(console.error);
  }, []);

  const handleUploadMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryTitle) return;
    const newMem: Memory = {
      id: `mem-${Date.now()}`,
      title: memoryTitle,
      album_name: memoryAlbum,
      description: memoryDescription,
      image_url: memoryFileUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
      uploader_name: user?.full_name || 'Alumni Member',
      uploader_id: user?.id,
      status: 'SUBMITTED',
      created_at: new Date().toISOString()
    };
    setMemories([newMem, ...memories]);
    setShowUploadMemoryModal(false);
    setMemoryTitle('');
    setMemoryDescription('');
    setMemoryFileUrl('');
    Swal.fire({
      icon: 'info',
      title: language === 'ta' ? 'நினைவு அனுப்பப்பட்டது!' : 'Memory Submitted!',
      text: language === 'ta' ? 'உங்கள் பதிவு நிர்வாகியின் சரிபார்ப்பிற்குப் பின் வெளியிடப்படும்.' : 'Your photo memory has been submitted for moderation. It will appear once approved by admin.',
      confirmButtonColor: '#111111'
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#111111]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#111111]">
            {language === 'ta' ? 'புகைப்பட கேலரி & நினைவுகள்' : 'Photo Gallery & Memories'}
          </h2>
          <p className="text-xs text-[#6B7280]">
            {language === 'ta'
              ? 'பள்ளி நினைவுகள், புகைப்படங்களைப் பகிர்ந்து கொள்ளுங்கள்'
              : 'Relive school memories, reunion photos, and submit your own old photographs'}
          </p>
        </div>
        <button
          onClick={() => setShowUploadMemoryModal(true)}
          className="px-5 py-2.5 bg-[#111111] text-white hover:bg-gray-800 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>{language === 'ta' ? 'புகைப்படம் பதிவேற்று' : 'Submit Memory Photo'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {memories.length > 0 ? (
          memories.map(mem => (
            <div key={mem.id} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <img src={mem.image_url} alt={mem.title} className="w-full h-48 object-cover" />
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-xs text-[#111111]">{mem.title}</h4>
                <p className="text-[11px] text-gray-500">{language === 'ta' ? `பதிவேற்றியவர் ${mem.uploader_name}` : `Uploaded by ${mem.uploader_name}`}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 sm:col-span-2 md:col-span-3 p-12 bg-white rounded-2xl border border-[#E5E7EB] text-center shadow-sm">
            <p className="text-xs text-[#6B7280]">{language === 'ta' ? 'புகைப்படங்கள் எதுவும் பதிவேற்றப்படவில்லை.' : 'No photo memories uploaded to gallery yet.'}</p>
          </div>
        )}
      </div>

      {/* Submit Memory Modal */}
      {showUploadMemoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUploadMemorySubmit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <button type="button" onClick={() => setShowUploadMemoryModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-[#111111]">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-[#111111]">
              {language === 'ta' ? 'பள்ளி புகைப்படத்தைப் பதிவேற்று' : 'Submit School Memory Photo'}
            </h3>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">{language === 'ta' ? 'தலைப்பு' : 'Memory Title'}</label>
              <input
                type="text"
                required
                value={memoryTitle}
                onChange={e => setMemoryTitle(e.target.value)}
                placeholder="e.g. Sports Day 2017 Winning Relay Team"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Album Category</label>
              <select
                value={memoryAlbum}
                onChange={e => setMemoryAlbum(e.target.value)}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none"
              >
                <option value="School Photos">School Photos</option>
                <option value="Alumni Events">Alumni Events</option>
                <option value="Batch Photos">Batch Photos</option>
                <option value="Memories">Memories</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Image URL or File Link</label>
              <input
                type="text"
                value={memoryFileUrl}
                onChange={e => setMemoryFileUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or paste image link"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Description / Memories Caption</label>
              <textarea
                rows={3}
                value={memoryDescription}
                onChange={e => setMemoryDescription(e.target.value)}
                placeholder="Tell us the story behind this photo..."
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#111111] text-white font-bold rounded-xl shadow-sm hover:bg-gray-800"
            >
              Submit Photo Memory
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
