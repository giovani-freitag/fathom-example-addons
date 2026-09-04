/**
 * What the page says, in each language it says it in.
 *
 * Keyed rather than duplicated into two pages: the page is one screen of
 * chrome around source it does not own, and a second copy of the markup would
 * be a second place for a link to go stale.
 */

export type Language = 'en' | 'pt-BR';

/** The default, and what an unwritten language falls back to. */
export const FALLBACK: Language = 'en';

export const WORDS = {
    en: {
        eyebrow: 'Worked examples',
        title: 'Fathom addons',
        lede: 'Indicators you can read, take apart and change. Each one is TypeScript '
            + 'that {fathom} compiles in the page — no build step stands between this '
            + 'source and the chart.',
        openTheChart: 'Open the chart',
        writeYourOwn: 'Write your own',
        source: 'Source',
        threeWaysIn: 'Three ways in',
        wayPasteTitle: 'Paste the address.',
        wayPasteBody: 'In the chart, press {writeAReading}, then the cloud button. '
            + 'Fathom lists every file and its size before it fetches a byte.',
        writeAReading: 'Write a reading',
        wayFileTitle: 'Take the one file.',
        wayFileBody: 'Each {release} carries a {bundle} per addon, for the open button.',
        release: 'release',
        wayHandTitle: 'Copy it by hand.',
        wayHandBody: 'The source is below, whole. That is what runs.',
        copy: 'Copy',
        copied: 'Copied',
        copyByHand: 'Copy it by hand',
        copyAddress: 'Copy address',
        copyFile: 'Copy {path}',
        lines: '{count} lines',
        whatItShows: 'What it shows',
        footer: 'MIT. Take these apart — an addon that teaches something these do '
            + 'not is {welcome}.',
        welcome: 'welcome',
        inLanguage: 'Language',
    },
    'pt-BR': {
        eyebrow: 'Exemplos prontos',
        title: 'Addons do Fathom',
        lede: 'Indicadores que você pode ler, desmontar e mudar. Cada um é TypeScript '
            + 'que o {fathom} compila na própria página — nenhum passo de build fica '
            + 'entre este código e o gráfico.',
        openTheChart: 'Abrir o gráfico',
        writeYourOwn: 'Escrever o seu',
        source: 'Código',
        threeWaysIn: 'Três formas de entrar',
        wayPasteTitle: 'Cole o endereço.',
        wayPasteBody: 'No gráfico, aperte {writeAReading} e depois o botão de nuvem. '
            + 'O Fathom lista cada arquivo e seu tamanho antes de buscar um byte.',
        writeAReading: 'Escrever uma leitura',
        wayFileTitle: 'Pegue o arquivo único.',
        wayFileBody: 'Cada {release} traz um {bundle} por addon, para o botão de abrir.',
        release: 'release',
        wayHandTitle: 'Copie à mão.',
        wayHandBody: 'O código está abaixo, inteiro. É ele que roda.',
        copy: 'Copiar',
        copied: 'Copiado',
        copyByHand: 'Copie à mão',
        copyAddress: 'Copiar endereço',
        copyFile: 'Copiar {path}',
        lines: '{count} linhas',
        whatItShows: 'O que ele mostra',
        footer: 'MIT. Desmonte à vontade — um addon que ensine algo que estes não '
            + 'ensinam é {welcome}.',
        welcome: 'bem-vindo',
        inLanguage: 'Idioma',
    },
} as const satisfies Record<Language, Record<string, string>>;

/** What each technique a page names is called, in each language. */
export const SIGNAL_WORDS = {
    'across {count} files': { 'pt-BR': 'em {count} arquivos' },
    'a coarser rung': { 'pt-BR': 'um tempo gráfico maior' },
    'reaches back': { 'pt-BR': 'alcança para trás' },
    'warm-up declared': { 'pt-BR': 'aquecimento declarado' },
    'a choice': { 'pt-BR': 'uma escolha' },
    'a number knob': { 'pt-BR': 'um botão numérico' },
    'a switch': { 'pt-BR': 'um interruptor' },
    'a histogram': { 'pt-BR': 'um histograma' },
    'its own band': { 'pt-BR': 'faixa própria' },
    'over the price': { 'pt-BR': 'sobre o preço' },
    'shading between': { 'pt-BR': 'preenchimento entre linhas' },
    'says when it has not settled': { 'pt-BR': 'avisa quando não assentou' },
    'NaN where there is no answer': { 'pt-BR': 'NaN onde não há resposta' },
    'two languages': { 'pt-BR': 'dois idiomas' },
    'the taker split': { 'pt-BR': 'a divisão por agressor' },
} as const;

/**
 * The language to open in.
 *
 * The reader's own choice first, then what the browser asks for, then English.
 *
 * @returns Which language to render.
 */
export function openingLanguage(): Language {
    try {
        const chosen = globalThis.localStorage?.getItem('fathom.addons.language');
        if (chosen === 'en' || chosen === 'pt-BR') {
            return chosen;
        }
    } catch {
        // A browser told to keep no site data. English, then.
    }

    return globalThis.navigator?.language?.startsWith('pt') === true ? 'pt-BR' : FALLBACK;
}

/**
 * One phrase, with its placeholders filled.
 *
 * @param language - Which language to say it in.
 * @param key - Which phrase.
 * @param values - What to put in its `{braces}`, where it has any.
 * @returns The phrase.
 */
export function say(
    language: Language,
    key: keyof typeof WORDS['en'],
    values: Readonly<Record<string, string>> = {},
): string {
    // No fallback for a missing key: both dictionaries are held to the same
    // shape by the type and by a test, so a key in one is a key in the other.
    return WORDS[language][key]
        .replaceAll(/\{(\w+)\}/g, (whole, name: string) => values[name] ?? whole);
}

/**
 * A technique's name in the reader's language.
 *
 * @param language - Which language.
 * @param says - The technique, as the scanner named it in English.
 * @returns The name to show.
 */
export function sayTechnique(language: Language, says: string): string {
    if (language === FALLBACK) {
        return says;
    }

    const counted = /^across (\d+) files$/.exec(says);
    if (counted !== null) {
        return SIGNAL_WORDS['across {count} files']['pt-BR'].replace('{count}', counted[1]!);
    }

    const held = (SIGNAL_WORDS as Record<string, { 'pt-BR': string } | undefined>)[says];
    return held?.['pt-BR'] ?? says;
}
