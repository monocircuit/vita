import Engine from "@/utils/processing/engines/dynamic/Engine";
import Butterfly, { ButterflyCell } from "@/utils/structures/Butterfly";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { i$VitaShardsDynamic, iTVitaFragmentDynamic } from "./_mapping";
import zod from "zod";

export function useCreateVitaShardsDynamic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vitaId,
      shards,
    }: {
      vitaId: number | string;
      shards: iTVitaFragmentDynamic[];
    }) => {
      const supabase = createClient();

      /* Runtime Validation of the passed shards */
      const parsed = zod.array(i$VitaShardsDynamic).safeParse(shards);
      console.log(parsed.error?.message);
      if (!parsed.success) {
        throw new Error("Invalid fragments payload: " + parsed.error.message);
      }

      // 2) Optional: SQL-sichere Umformung (falls deine SQL mit ->> arbeitet)
      const payload = parsed.data.map(r => ({
        chronicle_id: String(r.chronicle_id),
        y: r.y,
        x: r.x.map(String),
        prev: r.prev_id === null ? null : String(r.prev_id),
        next: r.next_id === null ? null : String(r.next_id),
      }));

      // 3) RPC-Call
      const { data, error } = await supabase.rpc(
        "replace_vitas_shards_dynamic",
        {
          p_vita_id: String(vitaId), // BIGINT sicher als String
          p_rows: payload, // JSONB array
        },
      );
      if (error) throw new Error(error.message);
      return data; // ggf. zurückgeben, falls du das Ergebnis brauchst
    },

    onSuccess: (_data, { vitaId }) => {
      // zielgerichtet invalidieren (inkl. vitaId als key-part)
      queryClient.invalidateQueries({
        queryKey: ["vitas_shards_dynamic", String(vitaId)],
      });
    },
  });
}
