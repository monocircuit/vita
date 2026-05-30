import type { ReactElement } from 'react';
import { Alert, Button, LinearProgress, Snackbar, Stack } from '@mui/material';
import { useUpdater } from './useUpdater';

export function UpdateToast(): ReactElement | null {
  const { status, quitAndInstall, openReleasesPage, checkNow } = useUpdater();

  if (status.state === 'idle' || status.state === 'checking' || status.state === 'not-available') {
    return null;
  }

  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

  if (status.state === 'error') {
    return (
      <Snackbar open anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="warning" variant="filled">
          <Stack direction="row" spacing={2} alignItems="center">
            <span>Update-Prüfung fehlgeschlagen.</span>
            <Button size="small" color="inherit" onClick={() => void checkNow()}>
              Erneut versuchen
            </Button>
          </Stack>
        </Alert>
      </Snackbar>
    );
  }

  if (status.state === 'available') {
    return (
      <Snackbar open anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="info" variant="filled">
          Update <strong>v{status.version}</strong> wird geladen…
        </Alert>
      </Snackbar>
    );
  }

  if (status.state === 'downloading') {
    return (
      <Snackbar open anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="info" variant="filled" sx={{ minWidth: 280 }}>
          <Stack spacing={1}>
            <span>Update lädt — {status.percent} %</span>
            <LinearProgress variant="determinate" value={status.percent} />
          </Stack>
        </Alert>
      </Snackbar>
    );
  }

  // state === 'downloaded'
  if (isMac) {
    return (
      <Snackbar open anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled">
          <Stack direction="row" spacing={2} alignItems="center">
            <span>
              Update <strong>v{status.version}</strong> verfügbar.
            </span>
            <Button size="small" color="inherit" onClick={() => void openReleasesPage()}>
              Von GitHub laden
            </Button>
          </Stack>
        </Alert>
      </Snackbar>
    );
  }

  return (
    <Snackbar open anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Alert severity="success" variant="filled">
        <Stack direction="row" spacing={2} alignItems="center">
          <span>
            Update <strong>v{status.version}</strong> bereit.
          </span>
          <Button size="small" color="inherit" onClick={() => void quitAndInstall()}>
            Jetzt neu starten
          </Button>
        </Stack>
      </Alert>
    </Snackbar>
  );
}
