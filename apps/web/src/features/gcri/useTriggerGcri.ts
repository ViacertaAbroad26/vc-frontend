import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

type RunGcriRequest = ApiComponents["schemas"]["RunGcriRequest"];
type JobAccepted = ApiComponents["schemas"]["JobAcceptedResponse"];

export function useTriggerGcri(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: RunGcriRequest) => {
      const { data } = await apiAxios.post<JobAccepted>(
        `/api/v1/advisor/students/${studentId}/gcri/run`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["advisor", "gcri", studentId] });
    },
  });
}
