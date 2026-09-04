import { defineConfig } from 'vite';

/**
 * The page that browses the addons.
 *
 * Vite 8 bundles with Rolldown, which is why there is no Rollup configuration
 * here to speak of. The addons themselves are not bundled — they are
 * TypeScript that Fathom's own in-page compiler reads, so what ships beside the
 * page is their source, gathered by `scripts/bundle-addons.ts`.
 */
export default defineConfig({
    base: './',
    build: {
        target: 'es2023',
        // Emptying it would take the bundles built in the step before this one.
        emptyOutDir: false,
    },
});
