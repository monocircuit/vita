import { TanstackReader } from "@/shared/data/tanstack";

const entitiesTable = TanstackReader.Table.table("entities");

const useAllEntitiesReader = TanstackReader.Table.on(entitiesTable)
  .connect(async (client, _currentUser) => {
    const { data, error } = await client.from("entities").select("*");

    if (error) throw error;
    if (!data || data.length === 0) {
      return null;
    }

    return data;
  })
  .networkKey(() => ["entities", "all"])
  .build();

export default useAllEntitiesReader;
