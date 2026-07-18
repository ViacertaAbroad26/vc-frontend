import { Card, CardBody, Chip, PageHeader, Spinner } from "@viacerta/ui";
import { Award, Lock } from "lucide-react";

import { useAchievements } from "./useAchievements";

export function AchievementsView() {
  const { data, isLoading } = useAchievements();

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Achievements" description="Badges earned as you complete each stage of your journey." />

      <div className="flex items-center gap-3">
        <Chip icon={Award}>{data.levelLabel}</Chip>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.achievements.map((a) => (
          <Card key={a.stage} className={a.earned ? "" : "opacity-60"}>
            <CardBody className="flex flex-col items-center gap-2 text-center">
              <span
                className={
                  "flex h-14 w-14 items-center justify-center rounded-full " +
                  (a.earned ? "bg-mint-400 text-navy-900" : "bg-gray-100 text-gray-400 dark:bg-navy-700 dark:text-gray-500")
                }
              >
                {a.earned ? <Award className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
              </span>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Stage {a.stage} · {a.label}
              </p>
              {a.earned && a.earnedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Earned {new Date(a.earnedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                </p>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
