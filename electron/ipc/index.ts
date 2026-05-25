import { registerVitaHandlers } from './vitas';
import { registerChronicleHandlers } from './chronicles';
import { registerEntityHandlers } from './entities';
import { registerChronicleEntityHandlers } from './chronicleEntities';
import { registerChronicleRelationHandlers } from './chronicleRelations';
import { registerDynamicVitaHandlers } from './dynamicVitas';
import { registerDynamicVitaPathHandlers } from './dynamicVitaPaths';
import { registerShardHandlers } from './shards';
import { registerAddressHandlers } from './addresses';
import { registerLocationHandlers } from './locations';

export function registerIpcHandlers(): void {
  registerVitaHandlers();
  registerChronicleHandlers();
  registerEntityHandlers();
  registerChronicleEntityHandlers();
  registerChronicleRelationHandlers();
  registerDynamicVitaHandlers();
  registerDynamicVitaPathHandlers();
  registerShardHandlers();
  registerAddressHandlers();
  registerLocationHandlers();
}
