/**
 * Sanity asset ID format constraint — Phase B.11 D23.
 *
 * Sanity image asset IDs follow `image-<sha1>-<WxH>-<ext>`:
 *   - literal `image-` prefix
 *   - lowercase hex hash (SHA-1 = 40 chars today; the regex is permissive
 *     to survive any future hash-function change)
 *   - dash
 *   - dimensions: `<width>x<height>` (positive integers)
 *   - dash
 *   - lowercase extension
 *
 * The B.11 extension allowlist is the four accepted MIMEs (jpg / png /
 * heic / webp) plus `jpeg` as a defensive synonym even though Sanity
 * normalizes to `jpg` in practice. Used by `/api/quote` and
 * `/api/quote/partial` to reject tampered `photoAssetIds[]` submissions
 * before passing the value to `client.create` / `client.patch.set`.
 */
export const SANITY_ASSET_ID_REGEX =
  /^image-[a-f0-9]+-\d+x\d+-(jpg|jpeg|png|heic|webp)$/i;

export function isSanityAssetId(id: unknown): id is string {
  return typeof id === 'string' && SANITY_ASSET_ID_REGEX.test(id);
}
