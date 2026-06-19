/**
 * Strip a leading Markdown heading marker (e.g. "### ") from FAQ question
 * text.
 *
 * Some Sanity FAQ documents carry a leading "### " in the `question` field
 * that leaked verbatim into the rendered question heading AND into the
 * `FAQPage` JSON-LD `Question.name` (Goran pre-launch QA B-09 §3.10). The
 * question is already rendered inside a real heading element, so the marker
 * is pure noise. Only a *leading* heading marker is stripped; any inline
 * "#" elsewhere in the text is preserved.
 */
export function stripFaqHeadingMarker(s: string): string {
  return s.replace(/^\s*#{1,6}\s+/, '');
}
