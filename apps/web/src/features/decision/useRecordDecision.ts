import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type DecisionRequest, type DecisionResponse } from "@viacerta/api-client";
import { useNavigate } from "react-router-dom";

export function useRecordDecision() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (body: DecisionRequest) => {
      const { data } = await apiAxios.post<DecisionResponse>("/api/v1/portal/students/me/decision", body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journey"] });
      navigate("/journey", { replace: true });
    },
  });
}
