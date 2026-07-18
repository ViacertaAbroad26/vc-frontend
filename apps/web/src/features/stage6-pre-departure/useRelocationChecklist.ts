import { useQuery } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

export type StudentPreDeparture = ApiComponents["schemas"]["StudentPreDepartureResponse"];

export function useRelocationChecklist() {
  return useQuery({
    queryKey: ["studentPreDeparture"],
    queryFn: async () => {
      const { data } = await apiAxios.get<StudentPreDeparture>("/api/v1/portal/students/me/pre-departure");
      return data;
    },
  });
}
