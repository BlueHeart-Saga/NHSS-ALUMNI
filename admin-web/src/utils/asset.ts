/**
 * Asset helper utility to append cache buster version query parameters
 * to local asset URLs, preventing browser disk/memory cache from serving stale images.
 */
const ASSET_VERSION = '20260831_v2';
const API_BASE = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || '';

export const getAssetUrl = (url: string | undefined): string => {
  if (!url) return '';

  // Data URLs or absolute HTTP/HTTPS URLs don't need local cache-busting
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Convert Windows local download paths to backend static media URL
  if (url.includes('Downloads\\profile') || url.includes('Downloads/profile') || url.includes('10001053')) {
    const filename = url.split(/[/\\]/).pop();
    return `${API_BASE}/local-profiles/${filename}`;
  }

  if (url.startsWith('/local-profiles/') || url.startsWith('/uploads/')) {
    return `${API_BASE}${url}`;
  }

  // GridFS-served uploads (returned by /school/upload-image and /memories/upload when
  // Azure Blob is not configured). These are API-relative paths that must be prefixed
  // with the backend API base so the browser fetches from the backend origin, not the
  // frontend origin. Without this, uploaded photos 404 on refresh in GridFS mode.
  if (url.startsWith('/api/v1/files/') || url.startsWith('/files/')) {
    return `${API_BASE}${url}`;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${ASSET_VERSION}`;
};