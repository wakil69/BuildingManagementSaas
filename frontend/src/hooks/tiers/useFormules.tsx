import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { Formule } from "../../types/Admin/Administration";

export function useFormulesTypes() {
  async function getFormulesTypes(): Promise<Formule[]> {
    try {
      const response = await customRequest.get("/admin/formules");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: formulesTypes = [], isLoading: isLoadingFormulesTypes } = useQuery<
  Formule[]
  >({
    queryKey: ["formules"],
    queryFn: getFormulesTypes,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { formulesTypes, isLoadingFormulesTypes };
}
