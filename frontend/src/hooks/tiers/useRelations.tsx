import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { RelationPMPP } from "../../types/Admin/Administration";

export function useRelationsPMPP() {
  async function getRelationsPMPP(): Promise<RelationPMPP[]> {
    try {
      const response = await customRequest.get("/admin/relations-pm-pp");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: relationsPMPP = [], isLoading: isLoadingRelationsPMPP } = useQuery<
  RelationPMPP[]
  >({
    queryKey: ["relations_pm_pp"],
    queryFn: getRelationsPMPP,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { relationsPMPP, isLoadingRelationsPMPP };
}
