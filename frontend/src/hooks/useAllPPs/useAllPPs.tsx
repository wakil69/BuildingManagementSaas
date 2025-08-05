import { useQuery } from "@tanstack/react-query";
import { SearchPP } from "../../types/types";
import customRequest from "../../routes/api/api";

export function useAllPPs(searchPP: string) {
  async function getAllPPs(): Promise<SearchPP[]> {
    try {
      const response = await customRequest.get("/admin/all-pp", {
        params: {
          search: searchPP
        }
      });

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: allPPs = [], isLoading: isLoadingAllPPs } = useQuery<
  SearchPP[]
  >({
    queryKey: ["all_PPs", searchPP],
    queryFn: getAllPPs,
    enabled: searchPP.length > 3,
    refetchOnWindowFocus: false,
  });

  return { allPPs, isLoadingAllPPs };
}
