import { useThemeStore, type ThemeMode } from '@/shared/theme/store';

export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const resolved = useThemeStore((s) => s.resolved);
  const setMode = useThemeStore((s) => s.setMode);

  const toggleTheme = () => {
    setMode(resolved === 'dark' ? 'light' : 'dark');
  };

  return {
    theme: mode,
    resolvedTheme: resolved,
    setTheme: setMode as (mode: ThemeMode) => void,
    toggleTheme,
    isDark: resolved === 'dark',
  } as const;
}
