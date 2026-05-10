'use client';

import * as React from 'react';
import {useSearchParams} from 'next/navigation';
import {useTranslations, useLocale} from 'next-intl';
import {useRouter, usePathname} from '@/i18n/navigation';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';

import WizardStepIndicator from './WizardStepIndicator';
import WizardStep1Audience from './WizardStep1Audience';
import WizardStep2Service from './WizardStep2Service';
import WizardStep3Details from './WizardStep3Details';
import WizardStep4Contact, {type Step4Values} from './WizardStep4Contact';
import WizardStep5Review from './WizardStep5Review';
import WizardStickyNav from './WizardStickyNav';
import WizardResumeToast from './WizardResumeToast';
import WizardSavedToast from './WizardSavedToast';

import {
  WIZARD_DEFAULT_STATE,
  WIZARD_STEP_3_FIELDS,
  WIZARD_STEP_4_FIELDS,
  type WizardAudience,
} from '@/data/wizard';
import {
  loadStep1to3,
  saveStep1to3,
  clearStep1to3,
} from '@/lib/wizard/storage';
import {
  validateRequired,
  validateEmail,
  validatePhoneUS,
  validateZip5,
  validateMaxChars,
  validateSelectAtLeastOne,
  validateSelectOne,
} from '@/lib/wizard/validation';
import {WIZARD_EVENTS, fireWizardEvent} from '@/lib/wizard/events';
import {isWizardAutosaveEnabled} from '@/lib/chat/flags';

type Step = 1 | 2 | 3 | 4 | 5;

function clampStep(n: number): Step {
  if (n >= 5) return 5;
  if (n <= 1) return 1;
  return n as Step;
}

/**
 * WizardShell — orchestrates step state, URL sync, autosave, validation,
 * scroll-to-error, and step-transition motion. Phase 1.19 / Phase 1.20.
 *
 * URL is the source of truth for the current step (`?step=N`); React state
 * holds form data. Autosave persists Steps 1–3 only; Step 4 PII never leaves
 * React state.
 */
export default function WizardShell() {
  const t = useTranslations();
  const locale = useLocale() as 'en' | 'es';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();

  // Read URL → step
  const stepParam = parseInt(searchParams.get('step') ?? '1', 10);
  const urlStep = clampStep(Number.isFinite(stepParam) ? stepParam : 1);

  // ----- Form state -----
  const [step1, setStep1] = React.useState<{audience: WizardAudience | ''}>(
    () => ({...WIZARD_DEFAULT_STATE.step1}),
  );
  const [step2, setStep2] = React.useState(() => ({
    selectedSlugs: [...WIZARD_DEFAULT_STATE.step2.selectedSlugs],
    primarySlug: WIZARD_DEFAULT_STATE.step2.primarySlug,
    otherText: WIZARD_DEFAULT_STATE.step2.otherText,
  }));
  const [step3, setStep3] = React.useState<Record<string, string | string[]>>({});
  const [step4, setStep4] = React.useState<Step4Values>(() => ({...WIZARD_DEFAULT_STATE.step4}));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [showResume, setShowResume] = React.useState(false);
  const [showSaved, setShowSaved] = React.useState(false);
  const [completed, setCompleted] = React.useState<Step[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  const formRef = React.useRef<HTMLDivElement>(null);
  const autosaveTimer = React.useRef<number | null>(null);

  // ----- Mount: check for autosaved state -----
  // Effect uses a sync function and queues state updates via React batching so
  // they don't trigger the cascading-render warning. The autosave-load is
  // safe to do post-mount because it only reads from localStorage.
  React.useEffect(() => {
    let cancelled = false;
    const apply = () => {
      if (cancelled) return;
      if (!isWizardAutosaveEnabled()) {
        setHydrated(true);
        return;
      }
      const saved = loadStep1to3();
      if (saved) {
        setShowResume(true);
        fireWizardEvent(WIZARD_EVENTS.RESUME_OFFERED, {locale, lastStep: 3});
      }
      setHydrated(true);
    };
    const id = window.requestAnimationFrame(apply);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- Fire step_viewed event on URL change -----
  React.useEffect(() => {
    fireWizardEvent(WIZARD_EVENTS.STEP_VIEWED(urlStep), {locale, step: urlStep});
  }, [urlStep, locale]);

  // ----- Autosave Steps 1–3 only -----
  React.useEffect(() => {
    if (!hydrated || !isWizardAutosaveEnabled()) return;
    if (autosaveTimer.current != null) {
      window.clearTimeout(autosaveTimer.current);
    }
    autosaveTimer.current = window.setTimeout(() => {
      if (step1.audience || step2.selectedSlugs.length > 0) {
        saveStep1to3({
          step1: {audience: step1.audience as string},
          step2,
          step3,
        });
      }
    }, 1500);
    return () => {
      if (autosaveTimer.current != null) {
        window.clearTimeout(autosaveTimer.current);
        autosaveTimer.current = null;
      }
    };
  }, [hydrated, step1, step2, step3]);

  // ----- Step navigation helpers -----
  function goToStep(target: Step) {
    const url = `${pathname}?step=${target}`;
    router.replace(url, {scroll: false});
    formRef.current?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'start'});
  }

  function handleResume() {
    const saved = loadStep1to3();
    if (saved) {
      setStep1({audience: (saved.step1.audience || '') as WizardAudience | ''});
      setStep2(saved.step2);
      setStep3(saved.step3);
      setCompleted([1, 2]);
    }
    setShowResume(false);
    goToStep(3);
  }

  function handleStartFresh() {
    clearStep1to3();
    setShowResume(false);
    goToStep(1);
  }

  function handleSaveLink() {
    if (isWizardAutosaveEnabled() && (step1.audience || step2.selectedSlugs.length > 0)) {
      saveStep1to3({
        step1: {audience: step1.audience as string},
        step2,
        step3,
      });
    }
    setShowSaved(true);
  }

  // ----- Validation per step -----
  function validateStep(step: Step): {ok: boolean; errors: Record<string, string>} {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!step1.audience) e.audience = t('wizard.error.selectOne');
    } else if (step === 2) {
      const v = validateSelectAtLeastOne(step2.selectedSlugs, step2.otherText);
      if (!v.ok) e.services = t(v.errorKey);
    } else if (step === 3) {
      const audience = step1.audience as WizardAudience;
      const fields = WIZARD_STEP_3_FIELDS[audience];
      fields.forEach((f) => {
        const value = step3[f.id];
        if (f.kind === 'checkbox-group') {
          const arr = Array.isArray(value) ? value : [];
          if (f.minSelected && arr.length < f.minSelected) {
            e[f.id] = t('wizard.error.selectAny');
          }
        } else if ('required' in f && f.required) {
          if (f.kind === 'select' || f.kind === 'radio-group') {
            const r = validateSelectOne(value as string);
            if (!r.ok) e[f.id] = t(r.errorKey);
          } else {
            const r = validateRequired(value as string);
            if (!r.ok) e[f.id] = t(r.errorKey);
          }
        }
        if (f.kind === 'textarea' && typeof value === 'string') {
          const r = validateMaxChars(value, f.maxLength);
          if (!r.ok) e[f.id] = t(r.errorKey, r.errorParams);
        }
      });
    } else if (step === 4) {
      WIZARD_STEP_4_FIELDS.forEach((f) => {
        if (!('required' in f) || !f.required) return;
        const value = step4[f.id as keyof Step4Values] ?? '';
        let r;
        if (f.kind === 'email') r = validateEmail(value);
        else if (f.kind === 'tel') r = validatePhoneUS(value);
        else if (f.kind === 'zip') r = validateZip5(value);
        else if (f.kind === 'state-select' || f.kind === 'select' || f.kind === 'radio-group')
          r = validateSelectOne(value);
        else r = validateRequired(value);
        if (!r.ok) e[f.id] = t(r.errorKey, 'errorParams' in r ? r.errorParams : undefined);
      });
    }
    return {ok: Object.keys(e).length === 0, errors: e};
  }

  function handleNext() {
    const result = validateStep(urlStep as Step);
    if (!result.ok) {
      setErrors(result.errors);
      // Fire field_error events.
      Object.keys(result.errors).forEach((field) => {
        fireWizardEvent(WIZARD_EVENTS.FIELD_ERROR(field), {field});
      });
      // Scroll to first error.
      requestAnimationFrame(() => {
        const firstError = document.querySelector(
          '[role="alert"]',
        ) as HTMLElement | null;
        if (firstError) {
          firstError.scrollIntoView({
            behavior: reducedMotion ? 'auto' : 'smooth',
            block: 'center',
          });
          // Focus the closest focusable preceding sibling-ish.
          const wrapper = firstError.parentElement;
          if (wrapper) {
            const focusable = wrapper.querySelector(
              'input, select, textarea, button',
            ) as HTMLElement | null;
            focusable?.focus();
          }
        }
      });
      return;
    }
    setErrors({});
    setCompleted((prev) => Array.from(new Set([...prev, urlStep as Step])).sort() as Step[]);
    fireWizardEvent(WIZARD_EVENTS.STEP_COMPLETED(urlStep as Step), {step: urlStep, locale});
    if (urlStep < 5) {
      goToStep((urlStep + 1) as Step);
    }
  }

  function handleBack() {
    if (urlStep > 1) {
      goToStep((urlStep - 1) as Step);
    }
  }

  function handleFieldBlur(_id: string) {  // eslint-disable-line @typescript-eslint/no-unused-vars
    // Per D10, on-blur validation re-runs only the current step's validators
    // when there's already an error on this field; otherwise we wait for
    // Next-click. Keeps premium UX pattern from 1.11.
    const result = validateStep(urlStep as Step);
    setErrors((prev) => {
      const next: Record<string, string> = {};
      Object.keys(prev).forEach((k) => {
        if (result.errors[k]) next[k] = result.errors[k];
      });
      return next;
    });
  }

  // ----- Allow deep-link to Step 3 only when autosave hydrated Steps 1–2 -----
  const effectiveStep: Step = React.useMemo(() => {
    if (!hydrated) return urlStep;
    if (urlStep >= 2 && !step1.audience) return 1;
    if (urlStep >= 3 && step2.selectedSlugs.length === 0 && step2.otherText.length === 0)
      return 2;
    return urlStep;
  }, [hydrated, urlStep, step1.audience, step2.selectedSlugs.length, step2.otherText.length]);

  // Fire wizard-abandoned on visibilitychange→hidden once.
  React.useEffect(() => {
    let fired = false;
    function handler() {
      if (document.visibilityState === 'hidden' && !fired) {
        fired = true;
        fireWizardEvent(WIZARD_EVENTS.ABANDONED, {locale, lastStep: urlStep});
      }
    }
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [urlStep, locale]);

  return (
    <>
      <div ref={formRef}>
        <WizardStepIndicator
          current={effectiveStep}
          completed={completed}
          onJump={(n) => {
            if (completed.includes(n)) {
              fireWizardEvent(WIZARD_EVENTS.EDIT_STEP(n), {targetStep: n});
              goToStep(n);
            }
          }}
        />

        {/* Tip card */}
        <div className="card card-cream mt-8" style={{padding: '20px 24px'}}>
          <p
            className="m-0 font-heading font-semibold"
            style={{fontSize: 13, color: 'var(--color-sunset-green-700)'}}
          >
            {t('wizard.tip.title')}
          </p>
          <p
            className="m-0 mt-1"
            style={{fontSize: 14, color: 'var(--color-text-secondary)'}}
          >
            {t('wizard.tip.body')}
          </p>
        </div>

        {/* Step body — opacity-only crossfade per Phase 1.19 §3.13 */}
        <div className="mt-12">
          <AnimatePresence mode="wait">
            <motion.form
              key={effectiveStep}
              initial={{opacity: reducedMotion ? 1 : 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: reducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1]}}
              onSubmit={(e) => {
                e.preventDefault();
                handleNext();
              }}
              noValidate
              aria-labelledby={`wizard-step${effectiveStep}-h2`}
            >
              {effectiveStep === 1 ? (
                <WizardStep1Audience
                  value={step1.audience}
                  onChange={(audience) => setStep1({audience})}
                  error={errors.audience}
                />
              ) : null}
              {effectiveStep === 2 ? (
                <WizardStep2Service
                  audience={step1.audience as WizardAudience}
                  selectedSlugs={step2.selectedSlugs}
                  primarySlug={step2.primarySlug}
                  otherText={step2.otherText}
                  onChange={(next) => setStep2(next)}
                  error={errors.services}
                />
              ) : null}
              {effectiveStep === 3 ? (
                <WizardStep3Details
                  audience={step1.audience as WizardAudience}
                  values={step3}
                  onChange={setStep3}
                  errors={errors}
                  onFieldBlur={handleFieldBlur}
                />
              ) : null}
              {effectiveStep === 4 ? (
                <WizardStep4Contact
                  values={step4}
                  onChange={setStep4}
                  errors={errors}
                  onFieldBlur={handleFieldBlur}
                />
              ) : null}
              {effectiveStep === 5 ? (
                <WizardStep5Review
                  audience={step1.audience as WizardAudience}
                  selectedSlugs={step2.selectedSlugs}
                  primarySlug={step2.primarySlug}
                  otherText={step2.otherText}
                  step3={step3}
                  step4={step4}
                  onEdit={(n) => goToStep(n)}
                />
              ) : null}

              {/* Step nav (only Steps 1-4; Step 5 has its own Submit row) */}
              {effectiveStep < 5 ? (
                <WizardStickyNav
                  step={effectiveStep as 1 | 2 | 3 | 4}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSave={handleSaveLink}
                />
              ) : null}
            </motion.form>
          </AnimatePresence>
        </div>
      </div>

      {showResume ? (
        <WizardResumeToast onResume={handleResume} onDismiss={handleStartFresh} />
      ) : null}
      {showSaved ? <WizardSavedToast onClose={() => setShowSaved(false)} /> : null}
    </>
  );
}
