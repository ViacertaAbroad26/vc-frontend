import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type StudentProfile } from "@viacerta/api-client";

export function useSubmitProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<StudentProfile>("/api/v1/portal/students/me/profile/submit");
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["portal", "profile"], data);
    },
  });
}
