import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect, useMemo } from 'react';
import { useThemeStore } from './store';

export function MuiThemeAdapter({ children }: { children: React.ReactNode }) {
  const resolved = useThemeStore((s) => s.resolved);

  useEffect(() => {
    const html = document.documentElement;
    if (resolved === 'dark') html.classList.add('dark');
    else html.classList.remove('dark');
  }, [resolved]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode: resolved },
        typography: { fontFamily: "'Geist Sans', system-ui, sans-serif" },
      }),
    [resolved],
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
