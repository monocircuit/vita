import { createClient } from "../../client";

export async function getChronicles() {
  const supabase = createClient();

  const { data: chronicles, error } = await supabase
    .from("chronicles")
    .select("*");

  if (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }

  return chronicles;
}
