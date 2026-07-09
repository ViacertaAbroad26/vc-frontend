import { useMutation } from "@tanstack/react-query";
import { apiAxios, type IntakeStartResponse, type Persona } from "@viacerta/api-client";

import { saveIntakeCache } from "./intake-cache";

export function useStartIntake() {
  return useMutation({
    mutationFn: async (persona: Persona) => {
      const { data } = await apiAxios.post<IntakeStartResponse>("/api/v1/portal/students/me/intake/start", {
        persona,
      });
      return data;
    },
    onSuccess: (data, persona) => {
      saveIntakeCache(data.submissionId, { persona, form: data.form, answers: {} });
    },
  });
}
