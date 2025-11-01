import { useQuery } from "@tanstack/react-query";
import { fetchOwn } from "../$read";

const useOwnChronicles = () => {
  const query = useQuery({
    queryKey: ["chronicles", "net", "own"],
    queryFn: fetchOwn,
  });
};
