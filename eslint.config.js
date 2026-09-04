import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist', 'types/fathom.d.ts'] },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                // The config itself is not in the tsconfig's own include, so
                // the service is told about it by hand.
                projectService: { allowDefaultProject: ['eslint.config.js'] },
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: { '@stylistic': stylistic },
        rules: {
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
            '@stylistic/indent': ['error', 4],
            '@stylistic/comma-dangle': ['error', 'always-multiline'],
            '@stylistic/eol-last': ['error', 'always'],
            '@stylistic/max-len': ['error', { code: 110, ignoreUrls: true }],
        },
    },
    {
        // A reading is code somebody reads to learn from, so it is held to the
        // same bar as the rest — but it is written against a surface that hands
        // back plain numbers, and a `readonly parameters = []` is not a mistake.
        files: ['readings/**/*.ts'],
        rules: { '@typescript-eslint/no-unsafe-assignment': 'off' },
    },
);
