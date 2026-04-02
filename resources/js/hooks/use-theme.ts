import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

export function useTheme() {
    // Initialisation : on récupère le choix stocké ou "system" par défaut
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem('theme') as Theme) || 'system',
    );

    useEffect(() => {
        const root = window.document.documentElement;

        // Fonction qui applique réellement la classe CSS
        const applyTheme = (t: Theme) => {
            root.classList.remove('light', 'dark');

            if (t === 'system') {
                const systemTheme = window.matchMedia(
                    '(prefers-color-scheme: dark)',
                ).matches
                    ? 'dark'
                    : 'light';
                root.classList.add(systemTheme);
            } else {
                root.classList.add(t);
            }
        };

        applyTheme(theme);
        localStorage.setItem('theme', theme);

        // Optionnel : Écouter le changement de thème du système en temps réel
        if (theme === 'system') {
            const mediaQuery = window.matchMedia(
                '(prefers-color-scheme: dark)',
            );
            const handleChange = () => applyTheme('system');
            mediaQuery.addEventListener('change', handleChange);

            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    return { theme, setTheme };
}
