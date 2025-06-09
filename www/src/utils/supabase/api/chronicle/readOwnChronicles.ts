import { Chronicle } from "@/utils/schemas/Chronicle";
import { createClient } from "@/utils/supabase/client";
import useSWR from "swr";

export async function getChronicles() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error fetching user:", userError);
    return null;
  }

  const { data: chronicles, error } = await supabase
    .from("chronicles")
    .select("*")
    .eq("user_id", user?.id);

  if (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }

  return chronicles as Chronicle[];
}

export const useOwnChroniclesData = () => {
  const { data, error, isLoading } = useSWR("own_chronicles", getChronicles);

  return {
    ownChronicles: data,
    ownChroniclesError: error,
    isOwnChroniclesLoading: isLoading,
  };
};
