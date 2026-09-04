import { describe, expect, it } from 'vitest';
import { say, sayTechnique, WORDS } from '../../src/site/words.ts';

describe('what the page says', () => {
    it('fills the braces a phrase leaves for it', () => {
        expect(say('en', 'lines', { count: '43' })).toBe('43 lines');
    });

    it('says it in the language asked for', () => {
        expect(say('pt-BR', 'lines', { count: '43' })).toBe('43 linhas');
    });

    it('leaves a brace it was given nothing for, rather than emptying it', () => {
        // An empty gap reads as a finished sentence with a word missing. The
        // placeholder showing is a bug anybody can see.
        expect(say('en', 'lines')).toBe('{count} lines');
    });

    it('says the same things in both languages', () => {
        expect(Object.keys(WORDS['pt-BR'])).toEqual(Object.keys(WORDS.en));
    });
});

describe('what a technique is called', () => {
    it('is the English the scanner produced, in English', () => {
        expect(sayTechnique('en', 'a histogram')).toBe('a histogram');
    });

    it('is translated where the page has words for it', () => {
        expect(sayTechnique('pt-BR', 'a histogram')).toBe('um histograma');
    });

    it('carries the count through the file one', () => {
        expect(sayTechnique('pt-BR', 'across 3 files')).toBe('em 3 arquivos');
    });

    it('falls back to the English for a technique nobody translated', () => {
        // A signal added to the scanner and not here shows in English rather
        // than vanishing, which is the failure a reader can act on.
        expect(sayTechnique('pt-BR', 'something new')).toBe('something new');
    });
});
