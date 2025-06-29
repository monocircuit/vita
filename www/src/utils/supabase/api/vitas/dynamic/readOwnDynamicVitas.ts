import { VitaDynamic } from "@/utils/schemas/VitaDynamic";
import { createClient } from "@/utils/supabase/client";
import useSWR from "swr";

async function readOwnDynamicVitas() {
  const supabase = createClient();

  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("dynamic_views")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return data as VitaDynamic[];
}

export default readOwnDynamicVitas;

export const useOwnDynamicVitas = () => {
  const { data, error, isLoading } = useSWR(
    "own_dynamic_vitas",
    readOwnDynamicVitas,
  );

  return {
    ownDynamicVitas: data,
    ownDynamicVitasError: error,
    areOwnDynamicVitasLoading: isLoading,
  };
};
