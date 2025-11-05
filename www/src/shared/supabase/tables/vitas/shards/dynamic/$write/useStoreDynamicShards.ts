import { createClient } from "@/shared/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useStoreDynamicShards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const client = createClient();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vitas", "shards", "dynamic"],
      });
    },
  });
};

export default useStoreDynamicShards;
