import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";

export function useAuth() {
  const checkAuthenticated = async () => {
    try {
      const response = await customRequest.get(`/users/is-authenticated`);

      return response.data;
    } catch (error: any) {
      alert(error.message);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["check_authenticated"],
    queryFn: checkAuthenticated,
  });

  return { isAuthenticated: data?.isAuthenticated, isLoadingAuth: isLoading };
}
