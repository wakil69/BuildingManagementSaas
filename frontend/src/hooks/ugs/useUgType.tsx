import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { NatureUG } from "../../types/ugs/ugs";

export function useUgType() {
  async function allNat(): Promise<NatureUG[]> {
    try {
      const link = `${import.meta.env.VITE_APP_API_URL}/admin/nature-ug`;
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

  const { data: natureUgs = [], isLoading: isLoadingNatureUgs } = useQuery({
    queryKey: ["nature", "ug"],
    queryFn: allNat,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { natureUgs, isLoadingNatureUgs };
}
