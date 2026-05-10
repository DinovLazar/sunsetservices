'use client';

import * as React from 'react';
import Image, {type StaticImageData} from 'next/image';
import {Check} from 'lucide-react';
import {useTranslations} from 'next-intl';
import residentialSrc from '@/assets/home/audience-residential.jpg';
import commercialSrc from '@/assets/home/audience-commercial.jpg';
import hardscapeSrc from '@/assets/home/audience-hardscape.jpg';
import type {WizardAudience} from '@/data/wizard';

const TILES: ReadonlyArray<{key: WizardAudience; src: StaticImageData}> = [
  {key: 'residential', src: residentialSrc},
  {key: 'commercial', src: commercialSrc},
  {key: 'hardscape', src: hardscapeSrc},
];

type Props = {
  value: WizardAudience | '';
  onChange: (next: WizardAudience) => void;
  error?: string;
};

/**
 * Step 1 — audience tile select. Phase 1.19 §3.3, D4.
 *
 * Three large 4:3 photo tiles reusing the Phase 1.06 audience-entries assets.
 * Hidden `<input type="radio">` is the source of truth; clicking the tile
 * (which is its `<label>`) selects the radio. Selected tile gets a 2px green
 * ring + a 32px circle check chip in its bottom-right.
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
          {t('wizard.audience.legend')}
        </legend>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          {TILES.map(({key, src}) => {
            const selected = value === key;
            const inputId = `wiz-step1-${key}`;
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
                  name="wizard-audience"
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
                    alt={t(`wizard.audience.${key}.alt`)}
                    fill
                    placeholder="blur"
                    sizes="(max-width: 1023px) 100vw, 33vw"
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
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-card)',
                      }}
                    >
                      <Check size={18} color="#FFFFFF" strokeWidth={3} />
                    </span>
                  ) : null}
                </div>
                <div className="p-6 lg:p-8">
                  <h3 className="m-0" style={{fontSize: 'var(--text-h4)', fontWeight: 600}}>
                    {t(`wizard.audience.${key}.title`)}
                  </h3>
                  <p
                    className="m-0 mt-2"
                    style={{fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)'}}
                  >
                    {t(`wizard.audience.${key}.dek`)}
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
