import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { Prescriber } from "../../types/Admin/Administration";

export function usePrescriber() {
  async function getPrescriber(): Promise<Prescriber[]> {
    try {
      const response = await customRequest.get("/admin/prescribers");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: prescribers = [], isLoading: isLoadingPrescriber } = useQuery<
  Prescriber[]
  >({
    queryKey: ["prescribers"],
    queryFn: getPrescriber,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { prescribers, isLoadingPrescriber };
}
