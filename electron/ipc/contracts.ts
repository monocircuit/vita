import type { Vita, NewVita } from '../db/schema';

export type VitaPatch = Partial<Omit<NewVita, 'id' | 'createdAt'>>;

export interface Api {
  vitas: {
    list: () => Promise<Vita[]>;
    byId: (id: number) => Promise<Vita | undefined>;
    create: (input: Omit<NewVita, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Vita>;
    update: (id: number, patch: VitaPatch) => Promise<Vita>;
    delete: (id: number) => Promise<void>;
  };
}
