import { VitaDynamic } from "@/utils/schemas/VitaDynamic";
import { createClient } from "@/utils/supabase/client";

async function createDynamicVita(data: VitaDynamic) {
  const supabase = createClient();

  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data: result, error } = await supabase.from("dynamic_views").insert({
    user_id: userId,
    name: data.name,
    chronicle_relation: data.chronicleRelationId,
    scope: data.scope,
  });

  console.log(result, error);
}

export default createDynamicVita;
