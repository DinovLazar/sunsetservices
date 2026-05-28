/**
 * Wizard Step 3 photo state types — Phase B.11.
 *
 * Two layers:
 * - `WizardPhoto` — runtime React state union (D11). Carries the in-flight
 *   `File` + `AbortController` for cancel-during-upload (D13). Owned by a
 *   sibling `step3Photos` useState in `WizardShell` — NOT nested under
 *   `step3`. See `Sunset-Services-Decisions.md` 2026-05-27 execution-time
 *   off-spec note for the state-shape fork: D14/D15 said `step3.photos`
 *   but the live `step3` is `Record<string, string | string[]>` with no
 *   slot to nest into.
 * - `PersistedWizardPhoto` — narrowed shape that goes into the
 *   `sunset_wizard_progress_v2` localStorage autosave (D14, D15). Only
 *   `ready` rows persist. `narrowStep3PhotosForPersist` strips in-flight
 *   rows + transient fields before serialization. `widenPersistedPhotos`
 *   reinflates the persisted rows back into `WizardPhoto` `ready`
 *   variants on resume.
 */

export type PhotoDimensions = {
  width: number;
  height: number;
};

export type WizardPhotoErrorReason =
  | 'too-large'
  | 'wrong-type'
  | 'too-many'
  | 'network'
  | 'server';

export type WizardPhoto =
  | {id: string; status: 'pending'; file: File}
  | {id: string; status: 'uploading'; file: File; abort: AbortController}
  | {
      id: string;
      status: 'ready';
      assetId: string;
      url: string;
      dimensions: PhotoDimensions;
    }
  | {id: string; status: 'error'; file: File; errorReason: WizardPhotoErrorReason};

export type PersistedWizardPhoto = {
  id: string;
  assetId: string;
  url: string;
  dimensions: PhotoDimensions;
  status: 'ready';
};

/**
 * Narrow runtime photos to the persisted shape for localStorage write.
 * Drops in-flight + error rows per D14. Strips `file` + `abort` +
 * `errorReason` — none of those survive serialization anyway, but being
 * explicit keeps the storage contract typed.
 */
export function narrowStep3PhotosForPersist(
  photos: WizardPhoto[],
): PersistedWizardPhoto[] {
  const out: PersistedWizardPhoto[] = [];
  for (const photo of photos) {
    if (photo.status === 'ready') {
      out.push({
        id: photo.id,
        assetId: photo.assetId,
        url: photo.url,
        dimensions: {
          width: photo.dimensions.width,
          height: photo.dimensions.height,
        },
        status: 'ready',
      });
    }
  }
  return out;
}

/**
 * Reinflate persisted rows back into the runtime union on resume. All
 * rows come back as `ready` because `narrowStep3PhotosForPersist` only
 * writes `ready` rows.
 */
export function widenPersistedPhotos(
  persisted: PersistedWizardPhoto[],
): WizardPhoto[] {
  return persisted.map((p) => ({
    id: p.id,
    status: 'ready' as const,
    assetId: p.assetId,
    url: p.url,
    dimensions: {width: p.dimensions.width, height: p.dimensions.height},
  }));
}

/**
 * Defensive runtime validator for read-time parsing of localStorage data
 * that may have been tampered with (the autosave is plaintext per the
 * Phase 1.20 D9 trade-off). Returns the array with any invalid rows
 * silently dropped, or `[]` on total parse failure. Matches the
 * "narrow-only" persisted contract — anything other than `ready` is
 * dropped on the way in too.
 */
export function parsePersistedPhotos(raw: unknown): PersistedWizardPhoto[] {
  if (!Array.isArray(raw)) return [];
  const out: PersistedWizardPhoto[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    if (r.status !== 'ready') continue;
    if (typeof r.id !== 'string' || r.id.length === 0) continue;
    if (typeof r.assetId !== 'string' || r.assetId.length === 0) continue;
    if (typeof r.url !== 'string' || r.url.length === 0) continue;
    if (!r.dimensions || typeof r.dimensions !== 'object') continue;
    const d = r.dimensions as Record<string, unknown>;
    if (typeof d.width !== 'number' || typeof d.height !== 'number') continue;
    if (!Number.isFinite(d.width) || !Number.isFinite(d.height)) continue;
    if (d.width <= 0 || d.height <= 0) continue;
    out.push({
      id: r.id,
      assetId: r.assetId,
      url: r.url,
      dimensions: {width: d.width, height: d.height},
      status: 'ready',
    });
  }
  return out;
}
