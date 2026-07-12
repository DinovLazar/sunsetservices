/**
 * Unit tests for the Sanity → Next.js revalidation planner
 * (`revalidateForDocument`).
 *
 * `next/cache`'s `revalidatePath` / `revalidateTag` throw outside a Next
 * request context ("Invariant: static generation store missing"), so we stub
 * the module with a synchronous `module.registerHooks` loader — Node's
 * in-thread, non-experimental hook API. It needs no `--experimental-*` flag
 * and composes with tsx's ESM loader. Every call is recorded so we can assert
 * both the returned plan AND the side effects it drives.
 *
 * Run with (no package.json script — keeps the phase diff to two files):
 *
 *   node --import tsx --test src/lib/sanity/revalidation.test.ts
 *
 * The slug-less cases are the regression guard for the deleted-post bug
 * (observed live 2026-07-12): a post deleted from the Vertex portal kept
 * serving a cached 200 at `/blog/<slug>` for up to 30 min because the
 * slug-less branch returned `[]` (dropping the page instead of purging it)
 * once `dynamicParams = true` put on-demand pages in the full-route cache.
 */
import {test, before, beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import module from 'node:module';
import type {revalidateForDocument as RevalidateForDocument} from './revalidation';

type Call = ['path' | 'tag', ...unknown[]];

// Minimal shape of Node's synchronous module hooks — typed locally because
// this project's @types/node predates `registerHooks`.
type ResolveResult = {url: string; shortCircuit?: boolean; format?: string};
type LoadResult = {format: string; source?: string; shortCircuit?: boolean};
type ModuleHooks = {
  resolve?(
    specifier: string,
    context: unknown,
    nextResolve: (specifier: string, context?: unknown) => ResolveResult,
  ): ResolveResult;
  load?(
    url: string,
    context: unknown,
    nextLoad: (url: string, context?: unknown) => LoadResult,
  ): LoadResult;
};
const nodeModule = module as unknown as {registerHooks: (hooks: ModuleHooks) => void};

const calls: Call[] = [];
(globalThis as {__revalidateCalls?: Call[]}).__revalidateCalls = calls;

// Redirect `next/cache` to an in-memory stub that records calls instead of
// touching Next's cache store (which does not exist in a plain node run).
nodeModule.registerHooks({
  resolve(spec, ctx, next) {
    if (spec === 'next/cache') return {url: 'virtual:next-cache', shortCircuit: true};
    return next(spec, ctx);
  },
  load(url, ctx, next) {
    if (url === 'virtual:next-cache') {
      return {
        format: 'module',
        shortCircuit: true,
        source:
          "export const revalidatePath = (...a) => globalThis.__revalidateCalls.push(['path', ...a]);\n" +
          "export const revalidateTag = (...a) => globalThis.__revalidateCalls.push(['tag', ...a]);\n",
      };
    }
    return next(url, ctx);
  },
});

// Import the module under test AFTER the hook is registered so its top-level
// `import { revalidatePath } from 'next/cache'` binds to the stub. A `before`
// hook (not top-level await) keeps this file valid as CJS output under tsx.
let revalidateForDocument: typeof RevalidateForDocument;

before(async () => {
  ({revalidateForDocument} = await import('./revalidation'));
});

beforeEach(() => {
  calls.length = 0;
});

function revalidatedPathCalls(): string[] {
  return calls.filter((c) => c[0] === 'path').map((c) => c[1] as string);
}
function revalidatedTagCalls(): string[] {
  return calls.filter((c) => c[0] === 'tag').map((c) => c[1] as string);
}

test('blogPost WITH a slug → tags blogPost+faq, index + detail paths in both locales', async () => {
  const result = await revalidateForDocument({_type: 'blogPost', _id: 'b1', slug: 'my-post'});

  assert.equal(result.unhandled, undefined);
  assert.deepEqual(new Set(result.revalidatedTags), new Set(['blogPost', 'faq']));

  for (const p of ['/blog', '/es/blog', '/blog/my-post', '/es/blog/my-post']) {
    assert.ok(result.revalidatedPaths.includes(p), `expected ${p} in ${JSON.stringify(result.revalidatedPaths)}`);
  }

  // With a slug we purge the concrete page — the whole-route literal is a
  // delete-only fallback and must NOT be emitted here.
  assert.ok(!result.revalidatedPaths.includes('/[locale]/blog/[slug]'));

  // The returned plan is exactly what was pushed to next/cache.
  assert.deepEqual(new Set(revalidatedTagCalls()), new Set(result.revalidatedTags));
  assert.deepEqual(new Set(revalidatedPathCalls()), new Set(result.revalidatedPaths));
});

test('blogPost WITHOUT a slug (delete) → purges index + the /[locale]/blog/[slug] route literal', async () => {
  const result = await revalidateForDocument({_type: 'blogPost', _id: 'b1'});

  assert.deepEqual(new Set(result.revalidatedTags), new Set(['blogPost', 'faq']));

  // The blog index still refreshes so the deleted post drops off the listing.
  assert.ok(result.revalidatedPaths.includes('/blog'));
  assert.ok(result.revalidatedPaths.includes('/es/blog'));

  // The load-bearing assertion: the exact route-file literal Task 1 proved
  // Next honours for the `[locale]`-wrapped dynamic route. If the route shape
  // ever changes, this string must be re-verified live.
  assert.ok(
    result.revalidatedPaths.includes('/[locale]/blog/[slug]'),
    `expected route literal /[locale]/blog/[slug], got ${JSON.stringify(result.revalidatedPaths)}`,
  );

  // It must reach revalidatePath verbatim, with the 'page' type (required for
  // a path containing a dynamic segment).
  assert.ok(
    calls.some((c) => c[0] === 'path' && c[1] === '/[locale]/blog/[slug]' && c[2] === 'page'),
    'revalidatePath was not called with the route literal + "page" type',
  );

  // The literal must NOT be run through withLocales — no `/es/[locale]/...`.
  assert.ok(!result.revalidatedPaths.includes('/es/[locale]/blog/[slug]'));
});

test('resourceArticle WITHOUT a slug (delete) → purges index + /[locale]/resources/[slug]', async () => {
  const result = await revalidateForDocument({_type: 'resourceArticle', _id: 'r1'});

  assert.deepEqual(new Set(result.revalidatedTags), new Set(['resourceArticle', 'faq']));
  assert.ok(result.revalidatedPaths.includes('/resources'));
  assert.ok(result.revalidatedPaths.includes('/es/resources'));
  assert.ok(
    result.revalidatedPaths.includes('/[locale]/resources/[slug]'),
    `expected route literal, got ${JSON.stringify(result.revalidatedPaths)}`,
  );
  assert.ok(
    calls.some((c) => c[0] === 'path' && c[1] === '/[locale]/resources/[slug]' && c[2] === 'page'),
  );
  assert.ok(!result.revalidatedPaths.includes('/es/[locale]/resources/[slug]'));
});

test('project WITHOUT a slug (delete) → purges /[locale]/projects/[slug] route literal, no concrete detail leak', async () => {
  const result = await revalidateForDocument({_type: 'project', _id: 'p1'});

  assert.deepEqual(new Set(result.revalidatedTags), new Set(['project']));
  assert.ok(result.revalidatedPaths.includes('/projects'));
  assert.ok(
    result.revalidatedPaths.includes('/[locale]/projects/[slug]'),
    `expected route literal, got ${JSON.stringify(result.revalidatedPaths)}`,
  );
  assert.ok(
    calls.some((c) => c[0] === 'path' && c[1] === '/[locale]/projects/[slug]' && c[2] === 'page'),
  );
  // No concrete `/projects/<slug>` path when the slug is unknown (also keeps
  // the existing test:revalidate harness T7 green).
  assert.ok(!result.revalidatedPaths.some((p) => p.startsWith('/projects/')));
  assert.ok(!result.revalidatedPaths.some((p) => p.startsWith('/es/projects/')));
  assert.ok(!result.revalidatedPaths.includes('/es/[locale]/projects/[slug]'));
});

test('unknown _type → {unhandled:true}, no tags, no paths, no side effects', async () => {
  const result = await revalidateForDocument({_type: 'totallyMadeUpType', _id: 'x'});

  assert.equal(result.unhandled, true);
  assert.deepEqual(result.revalidatedTags, []);
  assert.deepEqual(result.revalidatedPaths, []);
  assert.equal(calls.length, 0, 'unhandled types must not touch next/cache');
});

test('missing _type → throws', async () => {
  await assert.rejects(
    () => revalidateForDocument({} as never),
    /missing _type/,
  );
  assert.equal(calls.length, 0);
});
