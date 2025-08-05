import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";
import { StudyLevel } from "../../types/Admin/Administration";

export function useStudyLevels() {
  async function getStudyLevels(): Promise<StudyLevel[]> {
    try {
      const response = await customRequest.get("/admin/study-levels");

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  const { data: studyLevels = [], isLoading: isLoadingStudyLevels } = useQuery<
    StudyLevel[]
  >({
    queryKey: ["study_levels"],
    queryFn: getStudyLevels,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return { studyLevels, isLoadingStudyLevels };
}
