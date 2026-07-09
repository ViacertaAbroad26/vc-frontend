import { useQuery } from "@tanstack/react-query";
import { apiAxios, type StudentProfile } from "@viacerta/api-client";

export function useStudentProfile() {
  return useQuery({
    queryKey: ["portal", "profile"],
    queryFn: async () => {
      const { data } = await apiAxios.get<StudentProfile>("/api/v1/portal/students/me/profile");
      return data;
    },
  });
}
