import { FALLBACK_IMAGE } from '../constants/images';

export function validateImageUrl(
  imageUrl: string | null | undefined
): string {
  if (!imageUrl) return FALLBACK_IMAGE;

  if (!imageUrl.startsWith('http')) return FALLBACK_IMAGE;

  if (imageUrl.includes('...')) return FALLBACK_IMAGE;

  if (imageUrl.includes('no-title-provided')) return FALLBACK_IMAGE;

  if (imageUrl.endsWith('.gif')) {
  return FALLBACK_IMAGE;
}


  return imageUrl;
}