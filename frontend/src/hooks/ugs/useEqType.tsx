import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { NatureEquipement } from "../../types/ugs/ugs";

export function useEqType() {
  async function allTypeEquipements(): Promise<NatureEquipement[]> {
    try {
      const link = `${
        import.meta.env.VITE_APP_API_URL
      }/admin/nature-equipements`;
      const response = await customRequest.get(link);

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.data.message}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: natureEquipements = [], isLoading: isLoadingNatureEq } =
    useQuery({
      queryKey: ["nature", "equipements", "ug"],
      queryFn: allTypeEquipements,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false
    });

  return { natureEquipements, isLoadingNatureEq };
}
