import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type StudentProfile, type UpdateStudentProfileRequest } from "@viacerta/api-client";

export function useUpdateStudentProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateStudentProfileRequest) => {
      const { data } = await apiAxios.patch<StudentProfile>("/api/v1/portal/students/me/profile", body);
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["portal", "profile"], data);
    },
  });
}
