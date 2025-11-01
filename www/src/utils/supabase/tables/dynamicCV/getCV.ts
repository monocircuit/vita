import { createClient } from "../../client";

export async function getCV(name: string, Userid: string) {
  const supabase = await createClient();
  const { data: cv, error } = await supabase.rpc("getcv", {
    inputname: name,
    inputuserid: id,
  });

  if (error) {
    console.error("Error fetching cv:", error);
    return [];
  }

  return cv;
}
