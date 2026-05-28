/**
 * Phase B.11 — shared validation primitives for the wizard photo upload.
 *
 * Used by `/api/quote/photo-upload` (server side) and `PhotoUploadField`
 * (client side, pre-flight feedback). The magic-bytes sniffer is the
 * security-relevant check — the route trusts THIS, NOT the client-
 * supplied `Content-Type` header, per D6 + D16.
 *
 * Constants:
 *   - PHOTO_MAX_BYTES = 10 MB (D3)
 *   - PHOTO_MAX_COUNT = 10 per session (D3)
 *   - PHOTO_ALLOWED_MIME = JPEG / PNG / HEIC / WebP (D6)
 *
 * Magic-bytes table (D18):
 *   - JPEG: FF D8 FF
 *   - PNG:  89 50 4E 47 0D 0A 1A 0A
 *   - WebP: 52 49 46 46 ?? ?? ?? ?? 57 45 42 50  ("RIFF…WEBP")
 *   - HEIC: ?? ?? ?? ?? 66 74 79 70 <brand>      ("…ftyp<brand>")
 *           with <brand> ∈ {heic, heix, mif1, msf1, heim, heis, hevc, hevx}
 *
 * No external dependency — pure byte-level checks. ~40 LoC of inline logic.
 */

export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const PHOTO_MAX_COUNT = 10;

export const PHOTO_ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/webp',
] as const;

export type PhotoMime = (typeof PHOTO_ALLOWED_MIME)[number];

const HEIC_BRANDS = new Set(['heic', 'heix', 'mif1', 'msf1', 'heim', 'heis', 'hevc', 'hevx']);

/**
 * Inspect the first 12 bytes of `buf` and return the inferred image MIME
 * type, or `null` if the bytes don't match any allowed format. Caller is
 * responsible for first guarding `buf.length >= 12` (this function does
 * that defensively too — short buffers return `null`).
 */
export function sniffPhotoMime(buf: Buffer | Uint8Array): PhotoMime | null {
  if (buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP: bytes 0-3 = "RIFF", bytes 8-11 = "WEBP"
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return 'image/webp';
  }

  // HEIC: bytes 4-7 = "ftyp", bytes 8-11 = brand ∈ HEIC_BRANDS
  if (
    buf[4] === 0x66 &&
    buf[5] === 0x74 &&
    buf[6] === 0x79 &&
    buf[7] === 0x70
  ) {
    const brand = String.fromCharCode(buf[8], buf[9], buf[10], buf[11]);
    if (HEIC_BRANDS.has(brand)) {
      return 'image/heic';
    }
  }

  return null;
}

/**
 * True when `byteLength` is in `(0, PHOTO_MAX_BYTES]`. Used both client-
 * side (pre-flight) and server-side (post-multipart-parse).
 */
export function validatePhotoSize(byteLength: number): boolean {
  return byteLength > 0 && byteLength <= PHOTO_MAX_BYTES;
}

/**
 * Map a sniffed MIME to a Sanity asset filename extension. Sanity
 * normalizes `image/jpeg` to a `.jpg` extension on its CDN URL; we mirror
 * that here so the on-Sanity filename is conventional.
 */
export function mimeToExtension(mime: PhotoMime): 'jpg' | 'png' | 'heic' | 'webp' {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/heic':
      return 'heic';
    case 'image/webp':
      return 'webp';
  }
}
