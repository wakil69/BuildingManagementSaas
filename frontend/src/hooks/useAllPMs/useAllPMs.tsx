import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { SearchCompany } from "../../types/types";

export function useAllPMs(searchPM: string) {
  async function getAllPMs(): Promise<SearchCompany[]> {
    try {
      const response = await customRequest.get("/admin/all-pm", {
        params: {
          search: searchPM
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

  const { data: allPMs = [], isLoading: isLoadingAllPMs } = useQuery<
  SearchCompany[]
  >({
    queryKey: ["all_pms", searchPM],
    queryFn: getAllPMs,
    enabled: searchPM.length > 3,
    refetchOnWindowFocus: false,
  });

  return { allPMs, isLoadingAllPMs };
}
