import {localizedString, localizedText, localizedBody, localizedSeo} from './objects';
import {service} from './service';
import {project} from './project';
import {blogPost} from './blogPost';
import {resourceArticle} from './resourceArticle';
import {location} from './location';
import {faq} from './faq';
import {review} from './review';
import {team} from './team';

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
];
