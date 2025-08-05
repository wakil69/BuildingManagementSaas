import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { SituationSocioPro } from "../../types/tiers/tiers";

export function useSituationSocioPro() {
  async function getSituationSocioPro(): Promise<SituationSocioPro[]> {
    try {
      const response = await customRequest.get("/tiers/categories-socio-pro");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: situationSocioPro = [], isLoading: isLoadingSituationSocioPro } = useQuery<
  SituationSocioPro[]
  >({
    queryKey: ["situation_socio_pro"],
    queryFn: getSituationSocioPro,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { situationSocioPro, isLoadingSituationSocioPro };
}
