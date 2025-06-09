import { Chronicle } from "@/utils/schemas/Chronicle";
import { createClient } from "@/utils/supabase/client";

async function createChronicle(data: Chronicle) {
  const supabase = createClient();

  const user_id = (await supabase.auth.getUser()).data.user?.id;

  console.log(data);

  if (!user_id) {
    throw new Error("User not authenticated");
  }

  await supabase.from("chronicles").insert({
    user_id,
    ...data,
  });
}

export default createChronicle;
