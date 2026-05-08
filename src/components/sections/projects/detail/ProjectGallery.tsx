'use client';

import * as React from 'react';
import Image from 'next/image';
import type {StaticImageData} from 'next/image';
import {useTranslations} from 'next-intl';
import {X, ChevronLeft, ChevronRight} from 'lucide-react';
import AnimateIn from '@/components/global/motion/AnimateIn';

type GalleryPhoto = {
  asset: StaticImageData;
  alt: string;
};

type ProjectGalleryProps = {
  photos: GalleryPhoto[];
};

/**
 * Project gallery + lightbox — Phase 1.15 §4.4 / D7.B + D8.
 *
 * 4:3 uniform grid (3 cols desktop / 2 cols tablet+mobile). Each photo is
 * a `<button>` that opens a native `<dialog>` lightbox via
 * `dialog.showModal()` — focus-trap is platform-native, Esc closes
 * natively, focus-restore returns to the originating thumbnail button on
 * close.
 *
 * Keyboard contract:
 *   - Esc closes (native).
 *   - ←/→ navigate between images (custom handler).
 *   - Tab cycles within (native).
 * Counter "n / total" sits bottom-center inside the dialog with
 * `aria-live="polite"` so screen readers announce position.
 *
 * Cross-fade: 200ms opacity. Reduced-motion users: instant swap.
 *
 * Same-source rule (handover §4.4 + §5.2): the rendered `<img>` array
 * here and the `CreativeWork.image` schema array on the route consume the
 * same `photos` array — defined once in the route, passed to both.
 */
export default function ProjectGallery({photos}: ProjectGalleryProps) {
  const t = useTranslations('project.gallery');
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const lastTriggerRef = React.useRef<HTMLButtonElement | null>(null);

  const open = React.useCallback((index: number, trigger: HTMLButtonElement) => {
    setCurrentIndex(index);
    lastTriggerRef.current = trigger;
    dialogRef.current?.showModal();
  }, []);

  const close = React.useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // Restore focus to the originating thumbnail when the dialog closes.
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function onClose() {
      lastTriggerRef.current?.focus();
    }
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  // ←/→ navigation while the dialog is open.
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((idx) => (idx - 1 + photos.length) % photos.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex((idx) => (idx + 1) % photos.length);
      }
    }
    dialog.addEventListener('keydown', onKeyDown);
    return () => dialog.removeEventListener('keydown', onKeyDown);
  }, [photos.length]);

  // Backdrop click → close. Native <dialog>'s ::backdrop can be detected by
  // checking if the click hit the dialog element itself (children take focus).
  function onDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      close();
    }
  }

  if (photos.length === 0) return null;

  const total = photos.length;
  const current = photos[currentIndex];

  return (
    <section
      aria-labelledby="project-gallery-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_900px]"
    >
      <div className="mx-auto max-w-[var(--container-wide)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up">
          <h2
            id="project-gallery-h2"
            className="m-0 mb-8 lg:mb-10 font-heading font-bold"
            style={{
              fontSize: 'var(--text-h2)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
            }}
          >
            {t('h2')}
          </h2>
          <ul className="m-0 p-0 list-none grid grid-cols-2 lg:grid-cols-3 gap-3">
            {photos.map((photo, idx) => {
              const eager = idx < 4;
              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={(e) => open(idx, e.currentTarget)}
                    aria-label={`${t('open')} ${idx + 1} / ${total}`}
                    className="block w-full overflow-hidden rounded-xl"
                    style={{
                      aspectRatio: '4 / 3',
                      background: 'var(--color-sunset-green-700)',
                      cursor: 'pointer',
                      padding: 0,
                      border: 'none',
                    }}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={photo.asset}
                        alt={photo.alt}
                        fill
                        {...(eager ? {loading: 'eager' as const} : {loading: 'lazy' as const})}
                        sizes="(max-width: 1023px) 50vw, 33vw"
                        placeholder="blur"
                        style={{objectFit: 'cover'}}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </AnimateIn>
      </div>

      {/* Lightbox dialog */}
      <dialog
        ref={dialogRef}
        onClick={onDialogClick}
        aria-label={t('h2')}
        className="lightbox-dialog m-0 p-0 border-0 max-w-none w-screen h-screen bg-transparent"
        style={{
          maxHeight: '100vh',
          maxWidth: '100vw',
          width: '100vw',
          height: '100vh',
          background: 'transparent',
        }}
      >
        {/* Inner backdrop colour (we let the browser draw ::backdrop in CSS) */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{background: 'rgba(26,26,26,0.92)'}}
        >
          <div
            className="relative"
            style={{maxWidth: 'min(92vw, 1400px)', maxHeight: '88vh'}}
          >
            <Image
              src={current.asset}
              alt={current.alt}
              priority
              sizes="92vw"
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: 'min(92vw, 1400px)',
                maxHeight: '88vh',
                objectFit: 'contain',
              }}
            />
          </div>
          {/* Close */}
          <button
            type="button"
            onClick={close}
            aria-label={t('lightbox.close')}
            className="absolute top-4 right-4 inline-flex items-center justify-center"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              background: 'rgba(26,26,26,0.6)',
              border: '1px solid rgba(250,247,241,0.32)',
              color: 'var(--color-text-on-dark)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <X aria-hidden="true" strokeWidth={1.75} style={{width: 22, height: 22}} />
          </button>
          {/* Prev */}
          {photos.length > 1 ? (
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((idx) => (idx - 1 + photos.length) % photos.length)
              }
              aria-label={t('lightbox.prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '999px',
                background: 'rgba(26,26,26,0.6)',
                border: '1px solid rgba(250,247,241,0.32)',
                color: 'var(--color-text-on-dark)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <ChevronLeft aria-hidden="true" strokeWidth={1.75} style={{width: 24, height: 24}} />
            </button>
          ) : null}
          {photos.length > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((idx) => (idx + 1) % photos.length)}
              aria-label={t('lightbox.next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '999px',
                background: 'rgba(26,26,26,0.6)',
                border: '1px solid rgba(250,247,241,0.32)',
                color: 'var(--color-text-on-dark)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <ChevronRight aria-hidden="true" strokeWidth={1.75} style={{width: 24, height: 24}} />
            </button>
          ) : null}
          {/* Counter */}
          <p
            aria-live="polite"
            className="absolute bottom-6 left-0 right-0 text-center m-0"
            style={{
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              color: 'var(--color-text-on-dark)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {t('lightbox.counter', {n: currentIndex + 1, total})}
          </p>
        </div>
      </dialog>
    </section>
  );
}
