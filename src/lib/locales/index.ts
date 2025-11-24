import esTranslations from './es.json';
import enTranslations from './en.json';

export const translations = {
    es: esTranslations,
    en: enTranslations,
};

export type Locale = 'es' | 'en';
export type TranslationKeys = typeof esTranslations;
