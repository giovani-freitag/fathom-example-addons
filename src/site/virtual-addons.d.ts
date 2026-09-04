/** The module `scripts/addons-plugin.ts` serves at build time. */
declare module 'virtual:addons' {
    export const ADDONS: readonly import('./shown-addon.ts').ShownAddon[];
}
