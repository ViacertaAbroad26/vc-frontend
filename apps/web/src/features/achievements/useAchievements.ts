import { useQuery } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

export type Achievements = ApiComponents["schemas"]["AchievementsResponse"];

export function useAchievements() {
  return useQuery({
    queryKey: ["studentAchievements"],
    queryFn: async () => {
      const { data } = await apiAxios.get<Achievements>("/api/v1/portal/students/me/achievements");
      return data;
    },
  });
}
