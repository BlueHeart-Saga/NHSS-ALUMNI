/**
 * Asset helper utility to append cache buster version query parameters
 * to local asset URLs, preventing browser disk/memory cache from serving stale images.
 */
const ASSET_VERSION = '20260831_1';

export const getAssetUrl = (url: string | undefined): string => {
  if (!url) return '';
  // Data URLs or absolute HTTP/HTTPS URLs don't need local cache-busting
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${ASSET_VERSION}`;
};
