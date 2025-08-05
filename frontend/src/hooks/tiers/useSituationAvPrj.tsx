import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { SituationAvPrj } from "../../types/Admin/Administration";

export function useSituationAvPrj() {
  async function getSituationAvPrj(): Promise<SituationAvPrj[]> {
    try {
      const response = await customRequest.get("/admin/situation-before-prjs");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: situationAvPrj = [], isLoading: isLoadingSituationAvPrj } = useQuery<
  SituationAvPrj[]
  >({
    queryKey: ["situation_avant_projet"],
    queryFn: getSituationAvPrj,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { situationAvPrj, isLoadingSituationAvPrj };
}
