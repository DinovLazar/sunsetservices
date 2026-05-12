import {localizedString, localizedText, localizedBody, localizedSeo} from './objects';
import {service} from './service';
import {project} from './project';
import {blogPost} from './blogPost';
import {resourceArticle} from './resourceArticle';
import {location} from './location';
import {faq} from './faq';
import {review} from './review';
import {team} from './team';
import {quoteLead} from './quoteLead';
import {quoteLeadPartial} from './quoteLeadPartial';
import {contactSubmission} from './contactSubmission';
import {newsletterSubscriber} from './newsletterSubscriber';

export const schemaTypes = [
  // Objects first (they're referenced by documents).
  localizedString,
  localizedText,
  localizedBody,
  localizedSeo,
  // Documents.
  service,
  project,
  blogPost,
  resourceArticle,
  location,
  faq,
  review,
  team,
  // Phase 2.06 — wizard backend.
  quoteLead,
  quoteLeadPartial,
  // Phase 2.08 — contact + newsletter.
  contactSubmission,
  newsletterSubscriber,
];
