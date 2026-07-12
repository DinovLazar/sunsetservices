'use client';

import * as React from 'react';
import Image, {type StaticImageData} from 'next/image';
import {Check} from 'lucide-react';
import {useTranslations} from 'next-intl';
import residentialSrc from '@/assets/home/audience-residential.jpg';
import hardscapeSrc from '@/assets/home/audience-hardscape.jpg';
import waterproofingSrc from '@/assets/division/hero-waterproofing.jpg';
import snowRemovalSrc from '@/assets/division/hero-snow-removal.jpg';
import trenchlessSrc from '@/assets/service/hero-trenching-excavation.jpg';
import type {WizardDivision} from '@/data/wizard';

/**
 * Phase M.01e-pt2 — Step 1 is now the 5-division tile picker.
 * Polish-01: tiles are keyed per division instead of aliasing the 3 generic
 * audience photos (waterproofing/snow-removal/trenchless all showed the wrong
 * division's image). Waterproofing + snow-removal use their division-landing
 * heroes (stock-bridge photos — replace-by 2026-10-01 / 2027-01-31, see
 * docs/stock-bridge/stock-image-manifest.md); trenchless uses the real
 * open-trench/underground-utility photo (`hero-trenching-excavation.jpg`),
 * which matches the tile's alt text. (The homepage divisions card still points
 * at the driveways placeholder — sync it separately if the two should match.)
 * Strings come
 * from `wizard.division.<slug>.*` (parity with the M.01e
 * `home.divisions.<slug>.*` block on the homepage).
 */
const DIVISION_PHOTO: Record<WizardDivision, StaticImageData> = {
  landscape: residentialSrc,
  hardscape: hardscapeSrc,
  waterproofing: waterproofingSrc,
  'snow-removal': snowRemovalSrc,
  trenchless: trenchlessSrc,
};

const TILE_ORDER: readonly WizardDivision[] = [
  'landscape',
  'hardscape',
  'waterproofing',
  'snow-removal',
  'trenchless',
];

type Props = {
  value: WizardDivision | '';
  onChange: (next: WizardDivision) => void;
  error?: string;
};

/**
 * Step 1 — division tile select. Phase M.01e-pt2.
 *
 * Five large 4:3 photo tiles, one per division (see `DIVISION_PHOTO`
 * above). Hidden `<input type="radio">` is the source
 * of truth; clicking the tile (which is its `<label>`) selects the radio.
 * Selected tile gets a 2px green ring + a 32px circle check chip in its
 * bottom-right.
 */
export default function WizardStep1Audience({value, onChange, error}: Props) {
  const t = useTranslations();
  const errorId = error ? 'wiz-step1-error' : undefined;

  return (
    <div>
      <h2
        id="wizard-step1-h2"
        className="m-0 font-heading"
        style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 600,
          letterSpacing: 'var(--tracking-snug)',
        }}
      >
        {t('wizard.step1.title')}
      </h2>
      <p
        className="m-0 mt-2"
        style={{
          fontSize: 'var(--text-body-lg)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {t('wizard.step1.helper')}
      </p>

      <fieldset
        className="mt-8"
        style={{border: 'none', padding: 0, margin: 0}}
        aria-describedby={errorId}
      >
        <legend
          className="visually-hidden"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            margin: -1,
            padding: 0,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            border: 0,
          }}
        >
          {t('wizard.division.legend')}
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {TILE_ORDER.map((key) => {
            const selected = value === key;
            const inputId = `wiz-step1-${key}`;
            const src = DIVISION_PHOTO[key];
            return (
              <label
                key={key}
                htmlFor={inputId}
                className="card card-photo block"
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                  border: '2px solid',
                  borderColor: selected
                    ? 'var(--color-sunset-green-500)'
                    : 'transparent',
                  outline: selected ? 'none' : undefined,
                  padding: 0,
                }}
              >
                <input
                  id={inputId}
                  type="radio"
                  name="wizard-division"
                  value={key}
                  checked={selected}
                  onChange={() => onChange(key)}
                  style={{
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    padding: 0,
                    margin: -1,
                    overflow: 'hidden',
                    clip: 'rect(0,0,0,0)',
                    whiteSpace: 'nowrap',
                    border: 0,
                  }}
                />
                <div
                  className="relative w-full"
                  style={{aspectRatio: '4 / 3'}}
                >
                  <Image
                    src={src}
                    alt={t(`wizard.division.${key}.alt`)}
                    fill
                    placeholder="blur"
                    sizes="(max-width: 767px) 100vw, 50vw"
                    style={{objectFit: 'cover'}}
                  />
                  {selected ? (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        right: 12,
                        bottom: 12,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--color-sunset-green-500)',
                        color: 'var(--color-text-on-green)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-card)',
                      }}
                    >
                      <Check size={18} strokeWidth={3} />
                    </span>
                  ) : null}
                </div>
                <div className="p-6 lg:p-8">
                  <h3 className="m-0" style={{fontSize: 'var(--text-h4)', fontWeight: 600}}>
                    {t(`wizard.division.${key}.title`)}
                  </h3>
                  <p
                    className="m-0 mt-2"
                    style={{fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)'}}
                  >
                    {t(`wizard.division.${key}.dek`)}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      {error ? (
        <p id={errorId} role="alert" className="field-error mt-4">
          {error}
        </p>
      ) : null}
    </div>
  );
}
