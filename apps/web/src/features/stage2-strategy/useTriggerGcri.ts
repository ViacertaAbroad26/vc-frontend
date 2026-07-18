import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

type JobAccepted = ApiComponents["schemas"]["JobAcceptedResponse"];

export function useTriggerGcri() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<JobAccepted>("/api/v1/portal/students/me/gcri/run");
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["studentGcri"] });
    },
  });
}
