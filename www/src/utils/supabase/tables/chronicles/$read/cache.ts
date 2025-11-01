import { oTChronicle } from "@/utils/supabase/tables/chronicles/mapping";
import { BaseCache } from "@/utils/tanstack/cache/BaseCache";

export const ChronicleBaseCache = new BaseCache<oTChronicle>({
  database: {
    primaryKeyParts: ["id"],
  },
  caching: {
    indexKeys: ["id", "user_id"],
    queryKey: ["chronicles"],
  },
});

ChronicleBaseCache.upsert({}, ["user_id"]);
