import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiAxios,
  type ConfirmUniversitySelectionRequest,
  type UniversitySelectionResponse,
} from "@viacerta/api-client";

export function useConfirmUniversitySelection(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: ConfirmUniversitySelectionRequest) => {
      const { data } = await apiAxios.post<UniversitySelectionResponse>(
        `/api/v1/advisor/students/${studentId}/university-selection/confirm`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "university-selection", studentId], data);
      void qc.invalidateQueries({ queryKey: ["advisor", "student", studentId] });
      void qc.invalidateQueries({ queryKey: ["advisor", "cases"] });
    },
  });
}
