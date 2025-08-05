import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { Batiment } from "../../types/Admin/Administration";

export function useBatiments() {
  async function getBatiments(): Promise<Batiment[]> {
    try {
      const response = await customRequest.get("/admin/batiments");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: batiments = [], isLoading: isLoadingBatiments } = useQuery<
    Batiment[]
  >({
    queryKey: ["Batiments"],
    queryFn: getBatiments,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { batiments, isLoadingBatiments };
}
