import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Link as LinkIcon, 
  Check, 
  X
} from 'lucide-react';
import { api } from '../services/api';
import { alertService } from '../services/alertService';

interface ImageUploadAndEditProps {
  label?: string;
  sublabel?: string;
  value?: string;
  onChange: (url: string) => void;
  aspectRatioPreset?: '16:9' | '4:3' | '1:1' | 'free';
  maxSizeMB?: number;
  optional?: boolean;
}

export const ImageUploadAndEdit: React.FC<ImageUploadAndEditProps> = ({
  label = "Notice Poster / Flyer Image",
  sublabel = "PNG, JPG, WebP up to 8MB.",
  value = "",
  onChange,
  maxSizeMB = 8,
  optional = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUrlInputMode, setIsUrlInputMode] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [previewLightbox, setPreviewLightbox] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alertService.showError('Invalid File', 'Please select a valid image file (PNG, JPG, JPEG, WebP).');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      alertService.showError('File Too Large', `Image size must be less than ${maxSizeMB}MB.`);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(30);

      const res = await api.uploadSchoolImage(file);
      setUploadProgress(90);

      const uploadedUrl = res.url || (res as any).image_url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
        setUploadProgress(100);
        alertService.showSuccess('Uploaded Successfully', 'Image uploaded successfully.');
      } else {
        throw new Error('Image upload failed: no URL returned from server.');
      }
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to upload image.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleTriggerReplace = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    onChange(customUrlInput.trim());
    setIsUrlInputMode(false);
    setCustomUrlInput('');
  };

  const handleClearImage = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      {/* Header Label Row */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#111111] flex items-center space-x-1.5">
          <ImageIcon className="w-4 h-4 text-[#854D0E]" />
          <span>{label}</span>
        </label>
        {optional && (
          <span className="text-[10px] text-amber-700 bg-[#FFF7D6] px-2 py-0.5 rounded-md font-semibold border border-[#F4C542]/50">
            Optional
          </span>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Case 1: Image Already Present */}
      {value ? (
        <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] bg-gray-900 shadow-sm transition-all hover:border-[#F4C542]">
          {/* Image Preview Container */}
          <div className="relative aspect-[16/9] max-h-56 w-full flex items-center justify-center bg-black/90 overflow-hidden group">
            <img
              src={value}
              alt="Uploaded poster"
              className="w-full h-full object-contain"
            />

            {/* Status indicator badge top-left */}
            <div className="absolute top-2.5 left-2.5 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-xs flex items-center space-x-1">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Image Attached</span>
            </div>

            {/* Preview button top-right */}
            <button
              type="button"
              onClick={() => setPreviewLightbox(true)}
              className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black text-white rounded-lg transition-colors cursor-pointer"
              title="Preview Fullscreen"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Uploading indicator over existing image */}
            {uploading && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white space-y-2 z-10">
                <div className="w-8 h-8 border-2 border-[#F4C542] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold">Uploading new image...</span>
              </div>
            )}
          </div>

          {/* Action Control Bar Below Preview */}
          <div className="p-3 bg-[#FAFAFA] border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleTriggerReplace}
                className="px-4 py-2 bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace / Change Image</span>
              </button>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setPreviewLightbox(true)}
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                title="View Fullscreen"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClearImage}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                title="Remove Image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Case 2: No Image - Drag & Drop Upload Zone */
        <div className="space-y-2">
          {!isUrlInputMode ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleTriggerReplace}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#F4C542] bg-[#FFF7D6]/40 scale-[1.01]'
                  : 'border-gray-300 hover:border-[#F4C542] bg-[#FAFAFA] hover:bg-[#FFFDF5]'
              } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              {uploading ? (
                <div className="flex flex-col items-center justify-center space-y-2 py-2">
                  <div className="w-9 h-9 border-3 border-[#F4C542] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-[#111111]">
                    Uploading Image ({uploadProgress}%)...
                  </span>
                  <div className="w-48 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#F4C542] h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/60 flex items-center justify-center mb-1">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-[#111111]">
                    Click to upload or drag & drop image
                  </div>
                  <div className="text-[11px] text-gray-500 max-w-xs leading-relaxed">
                    {sublabel}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Paste Direct Image URL Option */
            <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-4 space-y-2">
              <label className="text-xs font-semibold text-gray-700 block">
                Paste direct Image URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/poster.jpg"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#F4C542]"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-4 py-2 bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Set URL
                </button>
              </div>
            </div>
          )}

          {/* Toggle URL vs File upload */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsUrlInputMode(!isUrlInputMode)}
              className="text-[11px] font-semibold text-amber-900 hover:text-amber-700 flex items-center space-x-1 cursor-pointer"
            >
              <LinkIcon className="w-3 h-3" />
              <span>{isUrlInputMode ? 'Switch to File Upload' : 'Or paste Image URL directly'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {previewLightbox && value && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewLightbox(false)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 p-2 cursor-pointer flex items-center space-x-1 text-xs font-semibold"
            >
              <X className="w-5 h-5" />
              <span>Close</span>
            </button>
            <img
              src={value}
              alt="Fullscreen Preview"
              className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};
