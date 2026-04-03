import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);

    if (context === undefined) {
        throw new Error('useToast must be used within a useToast');
    }

    return context;
};

export default function ThemeProvider({ children }: { children: ReactNode }) {
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

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
