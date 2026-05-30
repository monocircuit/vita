import type {
  Vita, NewVita,
  Chronicle, NewChronicle,
  Entity, NewEntity,
  ChronicleEntity,
  ChronicleRelation, NewChronicleRelation,
  DynamicVita, NewDynamicVita,
  DynamicVitaPath, NewDynamicVitaPath,
  VitaShardDynamic, NewVitaShardDynamic,
  Address, NewAddress,
  Country, Continent,
} from '../db/schema';

export type ChronicleView = Omit<Chronicle, 'knots'> & { knots: number[] };
export type NewChronicleInput = Omit<NewChronicle, 'id' | 'createdAt' | 'updatedAt' | 'knots'> & {
  knots?: number[];
};
export type ChroniclePatch = Partial<NewChronicleInput>;

export type VitaPatch = Partial<Omit<NewVita, 'id' | 'createdAt'>>;
export type EntityPatch = Partial<Omit<NewEntity, 'id' | 'createdAt'>>;
export type AddressPatch = Partial<Omit<NewAddress, 'id'>>;

export type ShardReplaceInput = Omit<NewVitaShardDynamic, 'id' | 'vitaId'>[];

export interface Api {
  vitas: {
    list: () => Promise<Vita[]>;
    byId: (id: number) => Promise<Vita | undefined>;
    create: (input: Omit<NewVita, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Vita>;
    update: (id: number, patch: VitaPatch) => Promise<Vita>;
    delete: (id: number) => Promise<void>;
  };
  chronicles: {
    list: () => Promise<ChronicleView[]>;
    byId: (id: number) => Promise<ChronicleView | undefined>;
    byVitaId: (vitaId: number) => Promise<ChronicleView[]>;
    create: (input: NewChronicleInput) => Promise<ChronicleView>;
    update: (id: number, patch: ChroniclePatch) => Promise<ChronicleView>;
    delete: (id: number) => Promise<void>;
  };
  entities: {
    list: () => Promise<Entity[]>;
    byId: (id: number) => Promise<Entity | undefined>;
    create: (input: Omit<NewEntity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Entity>;
    update: (id: number, patch: EntityPatch) => Promise<Entity>;
    delete: (id: number) => Promise<void>;
  };
  chronicleEntities: {
    list: () => Promise<ChronicleEntity[]>;
    linkMany: (chronicleId: number, entityIds: number[]) => Promise<ChronicleEntity[]>;
    unlink: (chronicleId: number, entityId: number) => Promise<void>;
    unlinkAllForChronicle: (chronicleId: number) => Promise<void>;
  };
  chronicleRelations: {
    listByChronicleId: (chronicleId: number) => Promise<ChronicleRelation[]>;
    create: (input: NewChronicleRelation) => Promise<ChronicleRelation>;
    delete: (chronicleId: number, ancestor: number) => Promise<void>;
  };
  dynamicVitas: {
    list: () => Promise<DynamicVita[]>;
    create: (input: Omit<NewDynamicVita, 'id' | 'createdAt' | 'updatedAt'>) => Promise<DynamicVita>;
    update: (id: number, patch: Partial<NewDynamicVita>) => Promise<DynamicVita>;
    delete: (id: number) => Promise<void>;
  };
  dynamicVitaPaths: {
    listByDynamicVitaId: (dynamicVitaId: number) => Promise<DynamicVitaPath[]>;
    upsert: (input: NewDynamicVitaPath) => Promise<DynamicVitaPath>;
    delete: (dynamicVitaId: number, chronicleId: number) => Promise<void>;
  };
  shards: {
    byVitaId: (vitaId: number) => Promise<VitaShardDynamic[]>;
    replaceForVita: (vitaId: number, shards: ShardReplaceInput) => Promise<VitaShardDynamic[]>;
  };
  addresses: {
    list: () => Promise<Address[]>;
    create: (input: Omit<NewAddress, 'id'>) => Promise<Address>;
    update: (id: number, patch: AddressPatch) => Promise<Address>;
  };
  countries: {
    list: () => Promise<Country[]>;
  };
  continents: {
    list: () => Promise<Continent[]>;
  };
  updater: UpdaterApi;
}

export type UpdateStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'available'; version: string }
  | { state: 'not-available' }
  | { state: 'downloading'; percent: number }
  | { state: 'downloaded'; version: string }
  | { state: 'error'; message: string };

export interface UpdaterApi {
  onStatus(callback: (status: UpdateStatus) => void): () => void;
  checkNow(): Promise<void>;
  quitAndInstall(): Promise<void>;
  openReleasesPage(): Promise<void>;
}
