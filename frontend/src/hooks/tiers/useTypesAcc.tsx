import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { TypeAccompagnement } from "../../types/Admin/Administration";

export function useTypesAcc() {
  async function getTypesAcc(): Promise<TypeAccompagnement[]> {
    try {
      const response = await customRequest.get("/admin/types-accompagnements");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: typesAcc = [], isLoading: isLoadingTypesAcc } = useQuery<
  TypeAccompagnement[]
  >({
    queryKey: ["types_accompagnement"],
    queryFn: getTypesAcc,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { typesAcc, isLoadingTypesAcc };
}
