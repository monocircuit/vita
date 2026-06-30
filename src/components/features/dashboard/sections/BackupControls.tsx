import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { db } from '@/shared/data/db';
import { downloadBackup, importBackup } from '@/shared/data/db/backup';
import { mono } from './utils';

const buttonStyle: React.CSSProperties = {
  ...mono,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  padding: '10px 16px',
  border: '1px solid #303030',
  background: 'transparent',
  color: 'var(--color-fg, #101010)',
  cursor: 'pointer',
};

/**
 * Backup controls. Since all data lives only in this browser, these are the
 * user's path to a backup and to moving data between browsers/devices.
 */
export default function BackupControls() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    setStatus(null);
    try {
      await downloadBackup(db);
      setStatus('Backup heruntergeladen.');
    } catch (err) {
      setStatus(`Fehler beim Export: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const confirmed = window.confirm(
      'Alle aktuellen lokalen Daten werden durch das Backup ersetzt. Fortfahren?',
    );
    if (!confirmed) return;

    setBusy(true);
    setStatus(null);
    try {
      const text = await file.text();
      await importBackup(db, text);
      await queryClient.invalidateQueries();
      setStatus('Backup eingespielt.');
    } catch (err) {
      setStatus(`Fehler beim Import: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: '32px max(32px,5%) 48px', maxWidth: 720 }}>
      <h2 style={{ ...mono, fontSize: 12, letterSpacing: '0.1em', marginBottom: 8 }}>
        DATEN &amp; BACKUP
      </h2>
      <p style={{ ...mono, fontSize: 11, color: '#606060', lineHeight: 1.6, marginBottom: 20 }}>
        Alle Daten werden ausschließlich lokal in diesem Browser gespeichert — es gibt keinen
        Server. Lade regelmäßig ein Backup herunter, um deine Vitas zu sichern oder auf ein
        anderes Gerät zu übertragen.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" style={buttonStyle} onClick={handleExport} disabled={busy}>
          Backup herunterladen
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          Backup einspielen
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
      </div>

      {status && (
        <p style={{ ...mono, fontSize: 11, color: '#606060', marginTop: 16 }}>{status}</p>
      )}
    </div>
  );
}
