import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { SecteurActivite } from "../../types/Admin/Administration";

export function useSecteursActivites() {
  async function getSecteursActivites(): Promise<SecteurActivite[]> {
    try {
      const response = await customRequest.get("/admin/secteurs-activites");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: secteursActivites = [], isLoading: isLoadingSecteursActivites } = useQuery<
  SecteurActivite[]
  >({
    queryKey: ["secteurs_activites"],
    queryFn: getSecteursActivites,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { secteursActivites, isLoadingSecteursActivites };
}
