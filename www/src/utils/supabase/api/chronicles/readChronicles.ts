import { createClient } from "../../client";

export async function readChronicles() {
  const supabase = createClient();

  const { data: chronicles, error } = await supabase
    .from("chronicles")
    .select("*");

  if (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }

  return chronicles.map(chronicle => {
    return { ...chronicle, id: String(chronicle.id) };
  });
}
