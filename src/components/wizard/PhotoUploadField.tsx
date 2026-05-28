'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import {CloudUpload, X as XIcon, AlertCircle} from 'lucide-react';

import {
  type WizardPhoto,
  type WizardPhotoErrorReason,
} from '@/lib/wizard/photo';
import {
  PHOTO_ALLOWED_MIME,
  PHOTO_MAX_BYTES,
  PHOTO_MAX_COUNT,
  type PhotoMime,
} from '@/lib/quote/photoValidation';
import {WIZARD_EVENTS, fireWizardEvent} from '@/lib/wizard/events';

/**
 * PhotoUploadField — Step 3 photo uploader (Phase B.11).
 *
 * Renders the dropzone + thumbnail grid + per-file remove/retry affordances
 * for the wizard Step 3 photo widget. Uploads land in Sanity via the
 * `/api/quote/photo-upload` route; this component owns the in-memory
 * WizardPhoto[] state machine (D11) and reports up via `onChange`.
 *
 * Behavior:
 *   - Drag-and-drop OR click-to-pick OR hidden-input keyboard-trigger
 *   - Concurrency-capped upload pool (D20 — cap 3)
 *   - AbortController per upload so Remove during upload cancels the
 *     request (D13)
 *   - Per-file retry on the error thumbnail (D12) — no automatic
 *     exponential backoff; one retry per click
 *   - `wizard_photos_uploaded` fires ONCE per batch on `handleFiles`
 *     resolution (D9), NOT per file
 *   - `aria-live="polite"` on the error chip area; `role="region"` +
 *     translated `aria-label` on the dropzone container
 *   - `data-photo-upload-state` attribute exposes ready|disabled for the
 *     verification harness
 */

const CONCURRENCY = 3;

type Props = {
  photos: WizardPhoto[];
  onChange: (next: WizardPhoto[]) => void;
  sessionId: string;
  disabled?: boolean;
};

type UploadOutcome =
  | {ok: true}
  | {ok: false; reason: WizardPhotoErrorReason}
  | {ok: false; reason: 'aborted'};

function newId(): string {
  return globalThis.crypto.randomUUID();
}

function mapServerReason(reason: unknown): WizardPhotoErrorReason {
  if (reason === 'too-large') return 'too-large';
  if (reason === 'wrong-type') return 'wrong-type';
  if (reason === 'too-many') return 'too-many';
  return 'server';
}

export default function PhotoUploadField({
  photos,
  onChange,
  sessionId,
  disabled = false,
}: Props) {
  const t = useTranslations();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  // Ref the latest `photos` so async upload handlers don't clobber each
  // other when multiple concurrent uploads resolve.
  const photosRef = React.useRef(photos);
  React.useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const updatePhotoById = React.useCallback(
    (id: string, transform: (p: WizardPhoto) => WizardPhoto | null): void => {
      const current = photosRef.current;
      const idx = current.findIndex((p) => p.id === id);
      if (idx === -1) return;
      const updated = transform(current[idx]);
      const next =
        updated === null
          ? [...current.slice(0, idx), ...current.slice(idx + 1)]
          : [...current.slice(0, idx), updated, ...current.slice(idx + 1)];
      photosRef.current = next;
      onChange(next);
    },
    [onChange],
  );

  const appendPhotos = React.useCallback(
    (toAdd: WizardPhoto[]): void => {
      const next = [...photosRef.current, ...toAdd];
      photosRef.current = next;
      onChange(next);
    },
    [onChange],
  );

  const uploadOne = React.useCallback(
    async (photoId: string, file: File): Promise<UploadOutcome> => {
      const controller = new AbortController();
      updatePhotoById(photoId, () => ({
        id: photoId,
        status: 'uploading',
        file,
        abort: controller,
      }));

      try {
        const form = new FormData();
        form.append('file', file);
        form.append('sessionId', sessionId);

        const res = await fetch('/api/quote/photo-upload', {
          method: 'POST',
          body: form,
          signal: controller.signal,
        });

        if (!res.ok) {
          let serverReason: unknown = 'server';
          try {
            const body = (await res.json()) as {reason?: unknown};
            serverReason = body.reason;
          } catch {
            // body might be empty/non-JSON — fall back to 'server'
          }
          const errorReason = mapServerReason(serverReason);
          updatePhotoById(photoId, (p) =>
            p.status === 'uploading'
              ? {id: photoId, status: 'error', file, errorReason}
              : p,
          );
          return {ok: false, reason: errorReason};
        }

        const data = (await res.json()) as {
          assetId?: string;
          url?: string;
          dimensions?: {width: number; height: number};
        };
        if (
          typeof data.assetId !== 'string' ||
          typeof data.url !== 'string' ||
          !data.dimensions ||
          typeof data.dimensions.width !== 'number' ||
          typeof data.dimensions.height !== 'number'
        ) {
          updatePhotoById(photoId, (p) =>
            p.status === 'uploading'
              ? {id: photoId, status: 'error', file, errorReason: 'server'}
              : p,
          );
          return {ok: false, reason: 'server'};
        }

        updatePhotoById(photoId, (p) =>
          p.status === 'uploading'
            ? {
                id: photoId,
                status: 'ready',
                assetId: data.assetId as string,
                url: data.url as string,
                dimensions: {
                  width: data.dimensions!.width,
                  height: data.dimensions!.height,
                },
              }
            : p,
        );
        return {ok: true};
      } catch (err) {
        const name = (err as {name?: string})?.name;
        if (name === 'AbortError') {
          // Remove during upload — row is already gone; don't write back.
          return {ok: false, reason: 'aborted'};
        }
        updatePhotoById(photoId, (p) =>
          p.status === 'uploading'
            ? {id: photoId, status: 'error', file, errorReason: 'network'}
            : p,
        );
        return {ok: false, reason: 'network'};
      }
    },
    [sessionId, updatePhotoById],
  );

  const handleFiles = React.useCallback(
    async (rawFiles: File[]) => {
      if (disabled || rawFiles.length === 0) return;

      const startedWith = photosRef.current;
      const remainingCapacity = Math.max(0, PHOTO_MAX_COUNT - startedWith.length);
      if (remainingCapacity === 0) return;

      const allowedMimeSet = new Set<string>(PHOTO_ALLOWED_MIME);
      const accepted = rawFiles.slice(0, remainingCapacity);

      // Pre-flight client checks: oversize + wrong-type land as error rows
      // so the visitor sees what happened (D11). Retry will fail again with
      // the same file, but the visitor can Remove and re-pick.
      type PendingItem =
        | {kind: 'upload'; entry: WizardPhoto; file: File}
        | {kind: 'preflight-error'; entry: WizardPhoto};

      const items: PendingItem[] = accepted.map((file) => {
        const id = newId();
        if (file.size > PHOTO_MAX_BYTES) {
          return {
            kind: 'preflight-error',
            entry: {id, status: 'error', file, errorReason: 'too-large'},
          };
        }
        if (!allowedMimeSet.has(file.type as PhotoMime)) {
          return {
            kind: 'preflight-error',
            entry: {id, status: 'error', file, errorReason: 'wrong-type'},
          };
        }
        return {
          kind: 'upload',
          entry: {id, status: 'pending', file},
          file,
        };
      });

      // Add all entries to state at once (one render).
      appendPhotos(items.map((it) => it.entry));

      // Bounded-parallelism upload pool.
      const uploadQueue = items.filter((it) => it.kind === 'upload') as Extract<
        PendingItem,
        {kind: 'upload'}
      >[];
      let cursor = 0;
      let successCount = 0;

      async function worker(): Promise<void> {
        while (true) {
          const idx = cursor++;
          if (idx >= uploadQueue.length) return;
          const item = uploadQueue[idx];
          const result = await uploadOne(item.entry.id, item.file);
          if (result.ok) successCount++;
        }
      }

      await Promise.all(
        Array.from({length: Math.min(CONCURRENCY, uploadQueue.length || 1)}, () =>
          worker(),
        ),
      );

      // D9 — fire ONCE per batch when at least one upload succeeded.
      // Zero-success batches (all wrong-type or all too-large) don't fire.
      if (successCount > 0) {
        fireWizardEvent(WIZARD_EVENTS.PHOTOS_UPLOADED, {
          step: 3,
          count: successCount,
        });
      }
    },
    [appendPhotos, disabled, uploadOne],
  );

  const handleChooseClick = React.useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      // Reset the input so picking the same file twice re-triggers change.
      e.target.value = '';
      void handleFiles(files);
    },
    [handleFiles],
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files);
      void handleFiles(files);
    },
    [disabled, handleFiles],
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      setDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = React.useCallback(() => {
    setDragOver(false);
  }, []);

  const handleRemove = React.useCallback(
    (id: string) => {
      const target = photosRef.current.find((p) => p.id === id);
      if (target && target.status === 'uploading') {
        target.abort.abort();
      }
      updatePhotoById(id, () => null);
    },
    [updatePhotoById],
  );

  const handleRetry = React.useCallback(
    (id: string) => {
      const target = photosRef.current.find((p) => p.id === id);
      if (!target || target.status !== 'error') return;
      void uploadOne(target.id, target.file);
    },
    [uploadOne],
  );

  // ---------------- Render ----------------
  const usedCount = photos.length;
  const atCap = usedCount >= PHOTO_MAX_COUNT;
  const stateAttr = disabled ? 'disabled' : 'ready';
  const isEmpty = usedCount === 0;
  const errors = photos.filter((p) => p.status === 'error');

  const errorMessageKey = (reason: WizardPhotoErrorReason): string => {
    switch (reason) {
      case 'too-large':
        return 'wizard.step3.photos.errors.tooLarge';
      case 'wrong-type':
        return 'wizard.step3.photos.errors.wrongType';
      case 'too-many':
        return 'wizard.step3.photos.errors.tooMany';
      case 'network':
        return 'wizard.step3.photos.errors.networkError';
      default:
        return 'wizard.step3.photos.errors.uploadFailed';
    }
  };

  return (
    <section
      role="region"
      aria-label={t('wizard.step3.photos.regionLabel')}
      data-photo-upload-state={stateAttr}
      className="lg:col-span-2"
      style={{marginTop: '0.5rem'}}
    >
      <label
        style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: 8,
        }}
      >
        {t('wizard.step3.photos.label')}
      </label>

      {disabled ? (
        <p
          style={{
            margin: 0,
            padding: '1rem',
            fontSize: 14,
            color: 'var(--color-text-secondary)',
            backgroundColor: 'var(--color-bg-cream)',
            border: '1px dashed var(--color-border)',
            borderRadius: 8,
          }}
        >
          {t('wizard.step3.photos.disabledMessage')}
        </p>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/heic,image/webp"
            onChange={handleInputChange}
            hidden
            aria-hidden="true"
          />

          {isEmpty ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                padding: '2rem 1.25rem',
                textAlign: 'center',
                backgroundColor: dragOver
                  ? 'var(--color-bg-cream)'
                  : 'var(--color-bg-cream)',
                border: dragOver
                  ? '2px dashed var(--color-sunset-green-500)'
                  : '2px dashed var(--color-border)',
                borderRadius: 12,
                transition: 'border-color 120ms ease',
              }}
            >
              <CloudUpload
                aria-hidden="true"
                style={{
                  width: 40,
                  height: 40,
                  margin: '0 auto 0.75rem',
                  color: 'var(--color-sunset-green-500)',
                }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                {t('wizard.step3.photos.helperEmpty')}
              </p>
              <p
                style={{
                  margin: '0.5rem 0 1rem',
                  fontSize: 13,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {t('wizard.step3.photos.constraintHint')}
              </p>
              <p
                style={{
                  margin: '0 0 0.75rem',
                  fontSize: 13,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {t('wizard.step3.photos.dropzoneInstruction')}
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleChooseClick}
                data-photo-choose="true"
              >
                {t('wizard.step3.photos.chooseButton')}
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                }}
                className="photo-upload-grid"
                data-photo-grid="true"
              >
                {photos.map((p, i) => (
                  <PhotoThumbnail
                    key={p.id}
                    photo={p}
                    index={i}
                    onRemove={handleRemove}
                    onRetry={handleRetry}
                    t={t}
                  />
                ))}
              </ul>

              <div
                style={{
                  marginTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 13,
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span data-photo-count="true">
                  {t('wizard.step3.photos.helperPopulated', {
                    count: usedCount,
                    used: usedCount,
                    limit: PHOTO_MAX_COUNT,
                  })}
                </span>
                {!atCap ? (
                  <button
                    type="button"
                    onClick={handleChooseClick}
                    data-photo-add-more="true"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--color-sunset-green-700)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {t('wizard.step3.photos.addMoreLink')}
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {/* Live region for per-file errors. aria-live=polite per D10. */}
          <div
            aria-live="polite"
            style={{
              marginTop: errors.length > 0 ? '0.5rem' : 0,
              display: errors.length > 0 ? 'block' : 'none',
            }}
          >
            {errors.map((p) => (
              <p
                key={`err-${p.id}`}
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: 'var(--color-text-error, #b04a4a)',
                }}
              >
                {p.status === 'error' ? t(errorMessageKey(p.errorReason)) : ''}
              </p>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// ---------------- Thumbnail subcomponent ----------------

type ThumbProps = {
  photo: WizardPhoto;
  index: number;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  t: ReturnType<typeof useTranslations>;
};

function PhotoThumbnail({photo, index, onRemove, onRetry, t}: ThumbProps) {
  // Stable preview URL for in-flight rows; the Sanity CDN URL once ready.
  const previewUrl = React.useMemo(() => {
    if (photo.status === 'ready') return photo.url;
    if (photo.status === 'pending' || photo.status === 'uploading' || photo.status === 'error') {
      return URL.createObjectURL(photo.file);
    }
    return '';
  }, [photo]);

  React.useEffect(() => {
    // Revoke object URLs when the photo transitions out of the in-flight
    // family (e.g. on `ready`) to avoid leaking blob references.
    if (photo.status === 'ready') return;
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, photo.status]);

  const isError = photo.status === 'error';
  const isUploading = photo.status === 'uploading' || photo.status === 'pending';
  const ariaLabel = isError
    ? t('wizard.step3.photos.errorAria', {n: index + 1})
    : isUploading
      ? t('wizard.step3.photos.uploadingAria', {n: index + 1})
      : t('wizard.step3.photos.thumbnailAlt', {n: index + 1});

  return (
    <li
      data-photo-status={photo.status}
      data-photo-id={photo.id}
      style={{
        position: 'relative',
        aspectRatio: '4 / 3',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-cream)',
        border: isError
          ? '2px solid var(--color-text-error, #b04a4a)'
          : '1px solid var(--color-border)',
      }}
    >
      {previewUrl ? (
        <button
          type="button"
          onClick={isError ? () => onRetry(photo.id) : undefined}
          disabled={!isError}
          aria-label={ariaLabel}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: isError ? 'pointer' : 'default',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isUploading ? 0.5 : 1,
              transition: 'opacity 180ms ease',
            }}
          />
        </button>
      ) : null}

      {isUploading ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              border: '3px solid rgba(255,255,255,0.5)',
              borderTopColor: 'var(--color-sunset-green-500)',
              borderRadius: '50%',
              animation: 'photo-spin 0.8s linear infinite',
            }}
          />
        </div>
      ) : null}

      {isError ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <AlertCircle
            style={{
              width: 28,
              height: 28,
              color: 'var(--color-text-error, #b04a4a)',
            }}
          />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onRemove(photo.id)}
        aria-label={t('wizard.step3.photos.removeAria', {n: index + 1})}
        data-photo-remove={photo.id}
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 44,
          height: 44,
          minWidth: 44,
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          border: 'none',
          borderRadius: 22,
          color: 'white',
          cursor: 'pointer',
        }}
      >
        <XIcon style={{width: 20, height: 20}} aria-hidden="true" />
      </button>

      <style jsx>{`
        @keyframes photo-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </li>
  );
}
