import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiAxios,
  type UniversitySelectionResponse,
  type UpdateUniversitySelectionRequest,
} from "@viacerta/api-client";

export function useUpdateUniversitySelection(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateUniversitySelectionRequest) => {
      const { data } = await apiAxios.patch<UniversitySelectionResponse>(
        `/api/v1/advisor/students/${studentId}/university-selection`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "university-selection", studentId], data);
    },
  });
}
