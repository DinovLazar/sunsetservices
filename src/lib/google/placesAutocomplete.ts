/**
 * Phase B.10 — Google Places Autocomplete helper for quote wizard Step 4.
 *
 * Two exports:
 *   - `parsePlaceToFields(place)` — D6 four-field map. Returns the partial
 *     set of `{street, city, state, zip}` keys whose source components were
 *     present in the Google place result. Keys absent from Google's
 *     `address_components` are absent from the returned object so the
 *     caller can leave existing input values untouched (a partial fill
 *     never wipes manual typing).
 *   - `useGooglePlacesAutocomplete({inputRef, onPlaceSelect})` — React hook
 *     that lazy-loads the Maps JS library on first call, attaches a legacy
 *     `google.maps.places.Autocomplete` instance to the input, and exposes
 *     a state machine for the `data-autocomplete-state` wrapper attribute.
 *
 * Decisions D1-D8 (Phase B.10 plan-of-record, Sunset-Services-Decisions.md
 * 2026-05-19) drive the shape: D1 US-only, D2 legacy `Autocomplete` class
 * via `@googlemaps/js-api-loader`, D3 client-side `NEXT_PUBLIC_*` key with
 * GCP-side referrer restrictions, D4 lazy-load on Step 4 mount, D5 additive
 * (never blocks manual entry), D6 partial-fill map, D7 analytics event,
 * D8 `data-autocomplete-state` markers.
 */

import {useEffect, useRef, useState, type RefObject} from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

export type AddressFields = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type AutocompleteState = 'disabled' | 'loading' | 'ready' | 'error';

export type UseGooglePlacesAutocompleteOptions = {
  inputRef: RefObject<HTMLInputElement | null>;
  onPlaceSelect: (fields: Partial<AddressFields>) => void;
};

export type UseGooglePlacesAutocompleteResult = {
  state: AutocompleteState;
  error?: string;
};

/**
 * D6 — map Google's `address_components` array onto the four wizard fields.
 *
 * Returns only the keys whose source components are present. Missing
 * sub-components → key omitted (NOT empty string), so callers can preserve
 * any existing manual value on those fields. Concretely:
 *
 *   - `street` = `street_number` + ' ' + `route`. Both required; if either
 *     is missing the key is omitted (the visitor likely typed a route-only
 *     query and Google echoed back without a number).
 *   - `city` = `locality.long_name`, falling back to
 *     `sublocality_level_1.long_name` (some unincorporated DuPage areas
 *     surface only the sublocality).
 *   - `state` = `administrative_area_level_1.short_name` (two-letter).
 *   - `zip` = `postal_code.long_name`.
 */
export function parsePlaceToFields(
  place: Pick<google.maps.places.PlaceResult, 'address_components'> | null | undefined,
): Partial<AddressFields> {
  const components = place?.address_components;
  if (!components || !Array.isArray(components)) return {};

  function find(type: string): google.maps.GeocoderAddressComponent | undefined {
    return components!.find((c) => Array.isArray(c.types) && c.types.includes(type));
  }

  const streetNumber = find('street_number')?.long_name;
  const route = find('route')?.long_name;
  const locality = find('locality')?.long_name;
  const sublocality = find('sublocality_level_1')?.long_name;
  const adminArea = find('administrative_area_level_1')?.short_name;
  const postal = find('postal_code')?.long_name;

  const out: Partial<AddressFields> = {};
  if (streetNumber && route) out.street = `${streetNumber} ${route}`;
  const cityValue = locality || sublocality;
  if (cityValue) out.city = cityValue;
  if (adminArea) out.state = adminArea;
  if (postal) out.zip = postal;
  return out;
}

/* ---------- internal loader plumbing ---------- */

type LoaderModule = typeof import('@googlemaps/js-api-loader');
type LoaderInstance = InstanceType<LoaderModule['Loader']>;

// Module-scope singleton so multiple hook calls / StrictMode double-mount
// share one `<script>` tag instead of re-injecting. The legacy
// `js-api-loader` itself dedupes by API key, but `loaderSingleton` here
// keeps that contract local and visible.
let loaderSingleton: LoaderInstance | null = null;
let loaderPromise: Promise<typeof google.maps.places.Autocomplete> | null = null;

function readApiKey(): string {
  // Test-only override: `NEXT_PUBLIC_*` is inlined into the client bundle
  // at build time, so the verification harness can't toggle the disabled
  // branch by changing `next start` env. The override is read from
  // `window.__SUNSET_PLACES_KEY_OVERRIDE__` (set via Playwright's
  // `addInitScript` only — never set in production). When unset (every
  // real-world case), we fall through to the bundled env value.
  if (typeof window !== 'undefined') {
    const win = window as unknown as {__SUNSET_PLACES_KEY_OVERRIDE__?: string};
    if (typeof win.__SUNSET_PLACES_KEY_OVERRIDE__ === 'string') {
      return win.__SUNSET_PLACES_KEY_OVERRIDE__;
    }
  }
  return process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '';
}

async function ensurePlacesLibrary(): Promise<typeof google.maps.places.Autocomplete> {
  if (typeof window === 'undefined') {
    throw new Error('places library cannot load on the server');
  }

  // Already loaded — common after the first Step-4 mount in a session AND
  // the path the verification harness exercises (it pre-seeds
  // `window.google.maps.places.Autocomplete` via `page.addInitScript` so
  // tests are deterministic + don't burn the real GCP quota).
  const existing = (window as any).google?.maps?.places?.Autocomplete as
    | typeof google.maps.places.Autocomplete
    | undefined;
  if (existing) return existing;

  if (loaderPromise) return loaderPromise;

  const apiKey = readApiKey();
  if (!apiKey) throw new Error('NEXT_PUBLIC_GOOGLE_PLACES_API_KEY is not set');

  loaderPromise = (async () => {
    const mod: LoaderModule = await import('@googlemaps/js-api-loader');
    if (!loaderSingleton) {
      loaderSingleton = new mod.Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places'],
      });
    }
    await loaderSingleton.importLibrary('places');
    const ctor = (window as any).google?.maps?.places?.Autocomplete as
      | typeof google.maps.places.Autocomplete
      | undefined;
    if (!ctor) throw new Error('Places library loaded but Autocomplete constructor missing');
    return ctor;
  })();

  try {
    return await loaderPromise;
  } catch (err) {
    // Reset so a subsequent mount can try again (e.g. after a network blip).
    loaderPromise = null;
    throw err;
  }
}

/* ---------- public hook ---------- */

export function useGooglePlacesAutocomplete({
  inputRef,
  onPlaceSelect,
}: UseGooglePlacesAutocompleteOptions): UseGooglePlacesAutocompleteResult {
  // Read at every render — cheap, pure, and lets the test override
  // (`window.__SUNSET_PLACES_KEY_OVERRIDE__`) take effect without remount.
  const apiKey = readApiKey();
  const [state, setState] = useState<AutocompleteState>(() =>
    apiKey ? 'loading' : 'disabled',
  );
  const [error, setError] = useState<string | undefined>(undefined);

  // Latest-callback "useEffectEvent" polyfill — keeps the place_changed
  // listener stable across re-renders while still firing the LATEST
  // consumer callback. Ref-write lives inside a useEffect (per the
  // `react-hooks/refs` rule).
  const onPlaceSelectRef = useRef(onPlaceSelect);
  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
  });

  useEffect(() => {
    if (!apiKey) return;

    let cancelled = false;
    let autocompleteInstance: google.maps.places.Autocomplete | null = null;

    ensurePlacesLibrary()
      .then((Autocomplete) => {
        if (cancelled) return;
        const inputEl = inputRef.current;
        if (!inputEl) {
          setState('error');
          setError('input ref missing');
          return;
        }
        try {
          autocompleteInstance = new Autocomplete(inputEl, {
            componentRestrictions: {country: ['us']},
            fields: ['address_components'],
            types: ['address'],
          });
          autocompleteInstance.addListener('place_changed', () => {
            const place = autocompleteInstance?.getPlace();
            const fields = parsePlaceToFields(place);
            onPlaceSelectRef.current(fields);
          });
          setState('ready');
        } catch (err) {
          setState('error');
          setError(err instanceof Error ? err.message : 'autocomplete attach failed');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setState('error');
        setError(err instanceof Error ? err.message : 'maps load failed');
      });

    return () => {
      cancelled = true;
      // StrictMode double-mount cleanup — drop every listener so the
      // remount doesn't end up with two `place_changed` handlers calling
      // the (now-stale) onPlaceSelect closure.
      const g = (typeof window !== 'undefined' ? (window as any).google : undefined) as
        | typeof google
        | undefined;
      if (g && autocompleteInstance) {
        try {
          g.maps.event.clearInstanceListeners(autocompleteInstance);
        } catch {
          // No-op — listener cleanup is best-effort.
        }
      }
      autocompleteInstance = null;
    };
  }, [apiKey, inputRef]);

  return error ? {state, error} : {state};
}
