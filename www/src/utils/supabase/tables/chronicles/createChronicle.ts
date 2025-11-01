import { iTChronicle } from "@/utils/supabase/tables/chronicles/mapping";
import { createClient } from "@/utils/supabase/client";

async function createChronicle(data: iTChronicle) {
  const supabase = createClient();

  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  await supabase.from("chronicles").insert({
    user_id: userId,
    ...data,
  });
}

export default createChronicle;
