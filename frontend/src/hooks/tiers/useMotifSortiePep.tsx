import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { MotifSortiePepiniere } from "../../types/Admin/Administration";

export function useMotifSortiePep() {
  async function getMotifSortiePep(): Promise<MotifSortiePepiniere[]> {
    try {
      const response = await customRequest.get("/admin/motifs-sortie-pep");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: motifsSortiePepiniere = [], isLoading: isLoadingMotifsSortiePepiniere } = useQuery<
  MotifSortiePepiniere[]
  >({
    queryKey: ["motif_sortie_pep"],
    queryFn: getMotifSortiePep,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { motifsSortiePepiniere, isLoadingMotifsSortiePepiniere };
}
