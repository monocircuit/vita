import { createClient } from "../../client";

export async function getCVList() {
  const supabase = createClient();

  const { data: chronicles, error } = await supabase
    .from("dynamic_views")
    .select("*");
  if (error) {
    console.error("Error fetching CVs:", error);
    return [];
  }

  return chronicles;
}
