import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { StatutPostPepineire } from "../../types/Admin/Administration";

export function useStatutsPostPep() {
  async function getStatutsPostPep(): Promise<StatutPostPepineire[]> {
    try {
      const response = await customRequest.get("/admin/statuts-post-pepiniere");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: statutsPostPepiniere = [], isLoading: isLoadingStatutsPostPepiniere } = useQuery<
  StatutPostPepineire[]
  >({
    queryKey: ["statuts_post_pep"],
    queryFn: getStatutsPostPep,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { statutsPostPepiniere, isLoadingStatutsPostPepiniere };
}
