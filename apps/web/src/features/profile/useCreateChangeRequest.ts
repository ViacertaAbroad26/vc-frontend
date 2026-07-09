import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type CreateProfileChangeRequestRequest, type ProfileChangeRequest } from "@viacerta/api-client";

export function useCreateChangeRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateProfileChangeRequestRequest) => {
      const { data } = await apiAxios.post<ProfileChangeRequest>(
        "/api/v1/portal/students/me/profile/change-requests",
        body,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portal", "profile", "change-requests"] });
    },
  });
}
