import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { SujetAccompagnement } from "../../types/Admin/Administration";

export function useSujetsAcc() {
  async function getSujetsAcc(): Promise<SujetAccompagnement[]> {
    try {
      const response = await customRequest.get("/admin/sujets-accompagnements");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: sujetsAcc = [], isLoading: isLoadingSujetsAcc } = useQuery<
  SujetAccompagnement[]
  >({
    queryKey: ["sujets_accompagnement"],
    queryFn: getSujetsAcc,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { sujetsAcc, isLoadingSujetsAcc };
}
