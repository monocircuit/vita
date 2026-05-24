import { TanstackWriter } from "@/shared/data/tanstack";

const vitasTable = TanstackWriter.table("vitas", {
  primaryKeyParts: ["id"],
  baseKey: () => ["vitas"],
});

const useVitaWriter = TanstackWriter.on(vitasTable).build();

export default useVitaWriter;
