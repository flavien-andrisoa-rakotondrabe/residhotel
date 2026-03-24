import type { PageProps } from '@inertiajs/core';
import { usePage } from '@inertiajs/react';

// On définit la structure des traductions envoyées par Laravel
interface TranslationData {
    [file: string]: {
        [key: string]: string;
    };
}

// On étend PageProps pour inclure nos données personnalisées
interface SharedProps extends PageProps {
    translations: TranslationData;
    locale: string;
}

export function useTranslation() {
    // On récupère les props typées depuis Inertia
    const { props } = usePage<SharedProps>();
    const { translations, locale } = props;

    /**
     * Fonction de traduction __()
     * @param key - Format "fichier.cle" (ex: "auth.welcome")
     */
    const __ = (key: string): string => {
        const keys = key.split('.');

        // On parcourt l'objet (ex: translations['auth']['welcome'])
        const result = keys.reduce((obj: any, i: string) => {
            return obj ? obj[i] : null;
        }, translations);

        // Si la clé n'est pas trouvée, on retourne la clé brute
        return result || key;
    };

    return { __, locale };
}
