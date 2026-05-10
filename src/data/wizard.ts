/**
 * Quote wizard data layer — Phase 1.20.
 *
 * Step-3 audience-conditional field map (D6 matrix from Phase 1.19 §3.5),
 * Step-4 contact field set (D7), and the Step-2 service options derived
 * from `src/data/services.ts`.
 *
 * Pure data; no React. Imported by `WizardStep3Details`, `WizardStep4Contact`,
 * `WizardStep5Review`, and the validation helpers in `src/lib/wizard/`.
 */
import {AUDIENCES, getServicesForAudience, type Audience} from './services';

export type WizardAudience = Audience;

export type WizardOption = {
  id: string;
  labelKey: string;
};

export type WizardFieldDef =
  | {kind: 'text'; id: string; labelKey: string; placeholderKey?: string; required?: boolean; maxLength?: number; autoComplete?: string}
  | {kind: 'textarea'; id: string; labelKey: string; placeholderKey?: string; maxLength: number; required?: boolean}
  | {kind: 'numeric'; id: string; labelKey: string; placeholderKey?: string; required?: boolean; min?: number; max?: number}
  | {kind: 'select'; id: string; labelKey: string; placeholderKey?: string; options: WizardOption[]; required?: boolean}
  | {kind: 'radio-group'; id: string; labelKey: string; options: WizardOption[]; required?: boolean}
  | {kind: 'checkbox-group'; id: string; labelKey: string; options: WizardOption[]; minSelected?: number}
  | {kind: 'tel'; id: string; labelKey: string; required?: boolean}
  | {kind: 'email'; id: string; labelKey: string; required?: boolean}
  | {kind: 'zip'; id: string; labelKey: string; required?: boolean}
  | {kind: 'state-select'; id: string; labelKey: string; required?: boolean};

const TIMELINE_RES: WizardOption[] = [
  {id: 'asap', labelKey: 'wizard.timeline.asap'},
  {id: '1to3', labelKey: 'wizard.timeline.13mo'},
  {id: '3to6', labelKey: 'wizard.timeline.36mo'},
  {id: 'flex', labelKey: 'wizard.timeline.flex'},
];

const TIMELINE_HARDSCAPE: WizardOption[] = [
  {id: 'asap', labelKey: 'wizard.timeline.asap'},
  {id: 'spring', labelKey: 'wizard.timeline.spring'},
  {id: 'summer', labelKey: 'wizard.timeline.summer'},
  {id: 'fall', labelKey: 'wizard.timeline.fall'},
  {id: 'next-year', labelKey: 'wizard.timeline.nextYear'},
  {id: 'flex', labelKey: 'wizard.timeline.flex'},
];

const TIMELINE_COMMERCIAL: WizardOption[] = [
  {id: 'immediate', labelKey: 'wizard.timeline.immediate'},
  {id: '30d', labelKey: 'wizard.timeline.30d'},
  {id: 'quarter', labelKey: 'wizard.timeline.quarter'},
  {id: 'exploratory', labelKey: 'wizard.timeline.exploratory'},
];

const PROJECT_TYPE_RES: WizardOption[] = [
  {id: 'renovation', labelKey: 'wizard.projectType.renovation'},
  {id: 'newInstall', labelKey: 'wizard.projectType.newInstall'},
  {id: 'maintenance', labelKey: 'wizard.projectType.maintenance'},
  {id: 'other', labelKey: 'wizard.projectType.other'},
];

const BUDGET_RES: WizardOption[] = [
  {id: 'under5', labelKey: 'wizard.budget.under5'},
  {id: '5to15', labelKey: 'wizard.budget.5to15'},
  {id: '15to40', labelKey: 'wizard.budget.15to40'},
  {id: '40plus', labelKey: 'wizard.budget.40plus'},
  {id: 'unsure', labelKey: 'wizard.budget.unsure'},
];

const BUDGET_HARDSCAPE: WizardOption[] = [
  {id: 'under15', labelKey: 'wizard.budget.under15'},
  {id: '15to40', labelKey: 'wizard.budget.15to40'},
  {id: '40to80', labelKey: 'wizard.budget.40to80'},
  {id: '80plus', labelKey: 'wizard.budget.80plus'},
  {id: 'unsure', labelKey: 'wizard.budget.unsure'},
];

const BEDROOMS: WizardOption[] = [
  {id: '1', labelKey: 'wizard.bedrooms.1'},
  {id: '2', labelKey: 'wizard.bedrooms.2'},
  {id: '3', labelKey: 'wizard.bedrooms.3'},
  {id: '4', labelKey: 'wizard.bedrooms.4'},
  {id: '5+', labelKey: 'wizard.bedrooms.5plus'},
];

const CONTRACT: WizardOption[] = [
  {id: 'oneTime', labelKey: 'wizard.step3.commercial.contract.oneTime'},
  {id: 'seasonal', labelKey: 'wizard.step3.commercial.contract.seasonal'},
  {id: 'annual', labelKey: 'wizard.step3.commercial.contract.annual'},
];

const FREQUENCY: WizardOption[] = [
  {id: 'weekly', labelKey: 'wizard.step3.commercial.frequency.weekly'},
  {id: 'biweekly', labelKey: 'wizard.step3.commercial.frequency.biweekly'},
  {id: 'monthly', labelKey: 'wizard.step3.commercial.frequency.monthly'},
  {id: 'onDemand', labelKey: 'wizard.step3.commercial.frequency.onDemand'},
  {id: 'unsure', labelKey: 'wizard.step3.commercial.frequency.unsure'},
];

const SPACE_TYPE: WizardOption[] = [
  {id: 'patio', labelKey: 'wizard.step3.hardscape.spaceType.patio'},
  {id: 'driveway', labelKey: 'wizard.step3.hardscape.spaceType.driveway'},
  {id: 'pool', labelKey: 'wizard.step3.hardscape.spaceType.pool'},
  {id: 'multi', labelKey: 'wizard.step3.hardscape.spaceType.multi'},
];

const SURFACE: WizardOption[] = [
  {id: 'paver', labelKey: 'wizard.step3.hardscape.surface.paver'},
  {id: 'stone', labelKey: 'wizard.step3.hardscape.surface.stone'},
  {id: 'concrete', labelKey: 'wizard.step3.hardscape.surface.concrete'},
  {id: 'undecided', labelKey: 'wizard.step3.hardscape.surface.undecided'},
];

const HARDSCAPE_FEATURES: WizardOption[] = [
  {id: 'fire', labelKey: 'wizard.step3.hardscape.features.fire'},
  {id: 'retainingWall', labelKey: 'wizard.step3.hardscape.features.retainingWall'},
  {id: 'seatingWall', labelKey: 'wizard.step3.hardscape.features.seatingWall'},
  {id: 'lighting', labelKey: 'wizard.step3.hardscape.features.lighting'},
  {id: 'kitchen', labelKey: 'wizard.step3.hardscape.features.kitchen'},
  {id: 'pergola', labelKey: 'wizard.step3.hardscape.features.pergola'},
];

const BEST_TIME: WizardOption[] = [
  {id: 'morning', labelKey: 'wizard.bestTime.morning'},
  {id: 'afternoon', labelKey: 'wizard.bestTime.afternoon'},
  {id: 'evening', labelKey: 'wizard.bestTime.evening'},
  {id: 'anytime', labelKey: 'wizard.bestTime.anytime'},
];

const CONTACT_METHOD: WizardOption[] = [
  {id: 'email', labelKey: 'wizard.contactMethod.email'},
  {id: 'phone', labelKey: 'wizard.contactMethod.phone'},
  {id: 'text', labelKey: 'wizard.contactMethod.text'},
];

/** US state options for Step 4. Illinois is the default selection. */
export const US_STATES: ReadonlyArray<{value: string; label: string}> = [
  {value: 'AL', label: 'Alabama'}, {value: 'AK', label: 'Alaska'},
  {value: 'AZ', label: 'Arizona'}, {value: 'AR', label: 'Arkansas'},
  {value: 'CA', label: 'California'}, {value: 'CO', label: 'Colorado'},
  {value: 'CT', label: 'Connecticut'}, {value: 'DE', label: 'Delaware'},
  {value: 'DC', label: 'District of Columbia'},
  {value: 'FL', label: 'Florida'}, {value: 'GA', label: 'Georgia'},
  {value: 'HI', label: 'Hawaii'}, {value: 'ID', label: 'Idaho'},
  {value: 'IL', label: 'Illinois'}, {value: 'IN', label: 'Indiana'},
  {value: 'IA', label: 'Iowa'}, {value: 'KS', label: 'Kansas'},
  {value: 'KY', label: 'Kentucky'}, {value: 'LA', label: 'Louisiana'},
  {value: 'ME', label: 'Maine'}, {value: 'MD', label: 'Maryland'},
  {value: 'MA', label: 'Massachusetts'}, {value: 'MI', label: 'Michigan'},
  {value: 'MN', label: 'Minnesota'}, {value: 'MS', label: 'Mississippi'},
  {value: 'MO', label: 'Missouri'}, {value: 'MT', label: 'Montana'},
  {value: 'NE', label: 'Nebraska'}, {value: 'NV', label: 'Nevada'},
  {value: 'NH', label: 'New Hampshire'}, {value: 'NJ', label: 'New Jersey'},
  {value: 'NM', label: 'New Mexico'}, {value: 'NY', label: 'New York'},
  {value: 'NC', label: 'North Carolina'}, {value: 'ND', label: 'North Dakota'},
  {value: 'OH', label: 'Ohio'}, {value: 'OK', label: 'Oklahoma'},
  {value: 'OR', label: 'Oregon'}, {value: 'PA', label: 'Pennsylvania'},
  {value: 'RI', label: 'Rhode Island'}, {value: 'SC', label: 'South Carolina'},
  {value: 'SD', label: 'South Dakota'}, {value: 'TN', label: 'Tennessee'},
  {value: 'TX', label: 'Texas'}, {value: 'UT', label: 'Utah'},
  {value: 'VT', label: 'Vermont'}, {value: 'VA', label: 'Virginia'},
  {value: 'WA', label: 'Washington'}, {value: 'WV', label: 'West Virginia'},
  {value: 'WI', label: 'Wisconsin'}, {value: 'WY', label: 'Wyoming'},
];

/** Step-3 audience-conditional fields per Phase 1.19 D6 matrix. */
export const WIZARD_STEP_3_FIELDS: Record<WizardAudience, WizardFieldDef[]> = {
  residential: [
    {kind: 'numeric', id: 'propertySize', labelKey: 'wizard.field.propertySize', placeholderKey: 'wizard.field.propertySize.placeholder'},
    {kind: 'select', id: 'bedrooms', labelKey: 'wizard.field.bedrooms', placeholderKey: 'wizard.field.bedrooms.placeholder', options: BEDROOMS},
    {kind: 'radio-group', id: 'projectType', labelKey: 'wizard.field.projectType', options: PROJECT_TYPE_RES, required: true},
    {kind: 'select', id: 'timeline', labelKey: 'wizard.field.timeline', placeholderKey: 'wizard.field.timeline.placeholder', options: TIMELINE_RES, required: true},
    {kind: 'select', id: 'budget', labelKey: 'wizard.field.budget', placeholderKey: 'wizard.field.budget.placeholder', options: BUDGET_RES, required: true},
    {kind: 'textarea', id: 'notes', labelKey: 'wizard.field.notes', placeholderKey: 'wizard.field.notes.placeholder', maxLength: 500},
  ],
  commercial: [
    {kind: 'numeric', id: 'numProperties', labelKey: 'wizard.step3.commercial.numProperties'},
    {kind: 'numeric', id: 'numBuildings', labelKey: 'wizard.step3.commercial.numBuildings'},
    {kind: 'radio-group', id: 'contract', labelKey: 'wizard.step3.commercial.contract.label', options: CONTRACT, required: true},
    {kind: 'select', id: 'frequency', labelKey: 'wizard.step3.commercial.frequency.label', placeholderKey: 'wizard.field.frequency.placeholder', options: FREQUENCY},
    {kind: 'select', id: 'timeline', labelKey: 'wizard.field.timeline', placeholderKey: 'wizard.field.timeline.placeholder', options: TIMELINE_COMMERCIAL, required: true},
    {kind: 'textarea', id: 'notes', labelKey: 'wizard.field.notes', placeholderKey: 'wizard.field.notes.placeholder', maxLength: 500},
  ],
  hardscape: [
    {kind: 'checkbox-group', id: 'spaceType', labelKey: 'wizard.step3.hardscape.spaceType.label', options: SPACE_TYPE, minSelected: 1},
    {kind: 'text', id: 'dimensions', labelKey: 'wizard.step3.hardscape.dimensions', placeholderKey: 'wizard.step3.hardscape.dimensions.placeholder', maxLength: 80},
    {kind: 'radio-group', id: 'surface', labelKey: 'wizard.step3.hardscape.surface.label', options: SURFACE, required: true},
    {kind: 'checkbox-group', id: 'features', labelKey: 'wizard.step3.hardscape.features.label', options: HARDSCAPE_FEATURES},
    {kind: 'select', id: 'budget', labelKey: 'wizard.field.budget', placeholderKey: 'wizard.field.budget.placeholder', options: BUDGET_HARDSCAPE, required: true},
    {kind: 'select', id: 'timeline', labelKey: 'wizard.field.timeline', placeholderKey: 'wizard.field.timeline.placeholder', options: TIMELINE_HARDSCAPE, required: true},
    {kind: 'textarea', id: 'notes', labelKey: 'wizard.field.notes', placeholderKey: 'wizard.field.notes.placeholder', maxLength: 500},
  ],
};

/** Step-4 contact fields per Phase 1.19 D7. Audience-agnostic. */
export const WIZARD_STEP_4_FIELDS: WizardFieldDef[] = [
  {kind: 'text', id: 'firstName', labelKey: 'wizard.field.firstName', required: true, maxLength: 50, autoComplete: 'given-name'},
  {kind: 'text', id: 'lastName', labelKey: 'wizard.field.lastName', required: true, maxLength: 50, autoComplete: 'family-name'},
  {kind: 'email', id: 'email', labelKey: 'wizard.field.email', required: true},
  {kind: 'tel', id: 'phone', labelKey: 'wizard.field.phone', required: true},
  {kind: 'text', id: 'street', labelKey: 'wizard.field.street', placeholderKey: 'wizard.field.street.placeholder', required: true, maxLength: 120, autoComplete: 'street-address'},
  {kind: 'text', id: 'unit', labelKey: 'wizard.field.unit', maxLength: 30, autoComplete: 'address-line2'},
  {kind: 'text', id: 'city', labelKey: 'wizard.field.city', required: true, maxLength: 60, autoComplete: 'address-level2'},
  {kind: 'state-select', id: 'state', labelKey: 'wizard.field.state', required: true},
  {kind: 'zip', id: 'zip', labelKey: 'wizard.field.zip', required: true},
  {kind: 'radio-group', id: 'bestTime', labelKey: 'wizard.field.bestTime', options: BEST_TIME},
  {kind: 'radio-group', id: 'contactMethod', labelKey: 'wizard.field.contactMethod', options: CONTACT_METHOD},
];

/** Returns Step-2 service options for the selected audience. */
export function getServiceOptionsForAudience(
  audience: WizardAudience,
): ReadonlyArray<{slug: string; name: {en: string; es: string}}> {
  return getServicesForAudience(audience).map((s) => ({slug: s.slug, name: s.name}));
}

export const WIZARD_AUDIENCES = AUDIENCES;

/** Default state values used when hydrating from a fresh session. */
export const WIZARD_DEFAULT_STATE: {
  step1: {audience: WizardAudience | ''};
  step2: {selectedSlugs: string[]; primarySlug: string; otherText: string};
  step3: Record<string, string | string[]>;
  step4: {
    firstName: string; lastName: string; email: string; phone: string;
    street: string; unit: string; city: string; state: string; zip: string;
    bestTime: string; contactMethod: string;
  };
} = {
  step1: {audience: ''},
  step2: {selectedSlugs: [], primarySlug: '', otherText: ''},
  step3: {},
  step4: {
    firstName: '', lastName: '', email: '', phone: '',
    street: '', unit: '', city: '', state: 'IL', zip: '',
    bestTime: '', contactMethod: '',
  },
};
