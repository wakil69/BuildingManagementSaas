import { useQuery } from "@tanstack/react-query";
import customRequest from "../../routes/api/api";

export interface UserProfile {
  userInfos: {
    email: string;
    role: string;
    first_name: string;
    last_name: string;
  };
  checkNotifications: boolean;
}

export function useProfile() {
  const getUserInfos = async (): Promise<UserProfile> => {
    try {
      const response = await customRequest.get(`/users/`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
  };

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: getUserInfos,
    retry: false,
  });

  return { profile, isLoadingUser: isLoading, isErrorUser: isError };
}
