import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { LegalForm } from "../../types/Admin/Administration";

export function useLegalForms() {
  async function getLegalForms(): Promise<LegalForm[]> {
    try {
      const response = await customRequest.get("/admin/legal-forms");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: legalForms = [], isLoading: isLoadingLegalForms } = useQuery<
  LegalForm[]
  >({
    queryKey: ["legal_forms"],
    queryFn: getLegalForms,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { legalForms, isLoadingLegalForms };
}
