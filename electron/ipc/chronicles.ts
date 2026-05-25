import { ipcMain } from 'electron';
import { eq, inArray } from 'drizzle-orm';
import { getDb } from '../db/client';
import { chronicles, vitasShardsDynamic } from '../db/schema';
import type { ChronicleView, NewChronicleInput, ChroniclePatch } from './contracts';

type ChronicleRow = typeof chronicles.$inferSelect;

function toView(row: ChronicleRow): ChronicleView {
  let parsed: number[];
  try {
    const candidate = JSON.parse(row.knots ?? '[]');
    parsed = Array.isArray(candidate)
      ? candidate.map(Number).filter((n) => Number.isFinite(n))
      : [];
  } catch {
    parsed = [];
  }
  return { ...row, knots: parsed };
}

export function registerChronicleHandlers(): void {
  ipcMain.handle('chronicles:list', (): ChronicleView[] => {
    return getDb().select().from(chronicles).all().map(toView);
  });

  ipcMain.handle('chronicles:byId', (_event, id: number): ChronicleView | undefined => {
    const row = getDb().select().from(chronicles).where(eq(chronicles.id, id)).get();
    return row ? toView(row) : undefined;
  });

  ipcMain.handle('chronicles:byVitaId', (_event, vitaId: number): ChronicleView[] => {
    const db = getDb();
    const shardChronicleIds = db
      .select({ chronicleId: vitasShardsDynamic.chronicleId })
      .from(vitasShardsDynamic)
      .where(eq(vitasShardsDynamic.vitaId, vitaId))
      .all()
      .map(r => r.chronicleId);

    if (shardChronicleIds.length === 0) return [];

    return db
      .select()
      .from(chronicles)
      .where(inArray(chronicles.id, shardChronicleIds))
      .all()
      .map(toView);
  });

  ipcMain.handle('chronicles:create', (_event, input: NewChronicleInput): ChronicleView => {
    const row = getDb()
      .insert(chronicles)
      .values({
        ...input,
        knots: JSON.stringify(input.knots ?? []),
      })
      .returning()
      .get();
    return toView(row);
  });

  ipcMain.handle('chronicles:update', (_event, id: number, patch: ChroniclePatch): ChronicleView => {
    const updatePayload: Record<string, unknown> = { ...patch, updatedAt: new Date() };
    if (patch.knots !== undefined) {
      updatePayload.knots = JSON.stringify(patch.knots);
    }
    const row = getDb()
      .update(chronicles)
      .set(updatePayload)
      .where(eq(chronicles.id, id))
      .returning()
      .get();
    return toView(row);
  });

  ipcMain.handle('chronicles:delete', (_event, id: number): void => {
    getDb().delete(chronicles).where(eq(chronicles.id, id)).run();
  });
}
