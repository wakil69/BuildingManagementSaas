import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { CodeAPE } from "../../types/tiers/tiers";

export function useCodeAPEList() {
  async function getCodeAPEList(): Promise<CodeAPE[]> {
    try {
      const response = await customRequest.get("/tiers/code-ape");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: codeAPEList = [], isLoading: isLoadingCodeAPEList } = useQuery<
  CodeAPE[]
  >({
    queryKey: ["code_ape_list"],
    queryFn: getCodeAPEList,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { codeAPEList, isLoadingCodeAPEList };
}
