import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type SubmitIntakeResponse } from "@viacerta/api-client";
import { useNavigate } from "react-router-dom";

import { clearIntakeCache } from "./intake-cache";

export function useIntakeSubmit(submissionId: string) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<SubmitIntakeResponse>(
        `/api/v1/portal/students/me/intake/${submissionId}/submit`,
      );
      return data;
    },
    onSuccess: () => {
      clearIntakeCache(submissionId);
      qc.invalidateQueries({ queryKey: ["journey"] });
      navigate("/journey", { replace: true });
    },
  });
}
