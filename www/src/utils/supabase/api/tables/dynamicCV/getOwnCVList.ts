import { createClient } from "../../../client";

export async function getCV() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error fetching user:", userError);
    return null;
  }

  const {
    data: chronicles,
    error,
    status,
  } = await supabase.from("dynamic_views").select("*").eq("", user?.id);

  if (error) {
    console.error("Error fetching CVs:", error);
    return [];
  }

  return chronicles;
}
