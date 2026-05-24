import { TanstackReader } from "@/shared/data/tanstack";

const chronicleEntitiesTable = TanstackReader.Table.table("chronicleEntities");

const useAllChronicleEntitiesReader = TanstackReader.Table.on(
  chronicleEntitiesTable,
)
  .connect(async (client, _currentUser) => {
    const { data, error } = await client
      .from("chronicle_entities")
      .select("*, entity:entities(*)");

    if (error) throw error;
    if (!data || data.length === 0) {
      return null;
    }

    return data;
  })
  .networkKey(() => ["chronicleEntities", "all"])
  .build();

export default useAllChronicleEntitiesReader;
