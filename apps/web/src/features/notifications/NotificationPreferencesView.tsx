import { type NotificationPreferencesResponse, type NotificationPreferenceItem } from "@viacerta/api-client";
import { AsyncBoundary, Button, Card, CardBody, Checkbox, EmptyState } from "@viacerta/ui";
import { useState, useEffect } from "react";

const CHANNEL_OPTIONS = ["EMAIL", "WHATSAPP", "SMS"] as const;

const TEMPLATE_LABELS: Record<string, string> = {
  "intake-reminder": "Intake reminder",
  "pre-session1": "Before Session 1",
  "gap-loop-checkin": "Gap loop check-in",
  "session2-followup": "Session 2 follow-up",
  "application-deadline": "Application deadlines",
  "pre-departure": "Pre-departure",
  "dispute-opened": "Dispute opened",
  "session1-questions-drafted": "Session 1 questions drafted",
};

type Props = {
  data: NotificationPreferencesResponse | undefined;
  isLoading: boolean;
  error: unknown;
  onSave: (preferences: NotificationPreferenceItem[]) => void;
  isSaving?: boolean;
};

export function NotificationPreferencesView({ data, isLoading, error, onSave, isSaving }: Props) {
  const [preferences, setPreferences] = useState<NotificationPreferenceItem[]>([]);

  useEffect(() => {
    if (data) setPreferences(data.preferences);
  }, [data]);

  function toggleChannel(template: string, channel: string) {
    setPreferences((prev) =>
      prev.map((p) =>
        p.template === template
          ? {
              ...p,
              channels: p.channels.includes(channel)
                ? p.channels.filter((c) => c !== channel)
                : [...p.channels, channel],
            }
          : p,
      ),
    );
  }

  return (
    <AsyncBoundary
      isLoading={isLoading}
      error={error}
      data={data}
      isEmpty={() => preferences.length === 0}
      emptyFallback={<EmptyState title="No configurable notifications" description="There's nothing to configure yet." />}
    >
      {() => (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose how you want to be reminded. In-app notifications are always sent.
          </p>
          <ul className="space-y-3">
            {preferences.map((pref) => (
              <li key={pref.template}>
                <Card>
                  <CardBody className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      {TEMPLATE_LABELS[pref.template] ?? pref.template}
                    </p>
                    <div className="flex gap-4">
                      {CHANNEL_OPTIONS.map((channel) => (
                        <label key={channel} className="flex items-center gap-2 text-sm text-gray-700">
                          <Checkbox
                            checked={pref.channels.includes(channel)}
                            onCheckedChange={() => toggleChannel(pref.template, channel)}
                          />
                          {channel}
                        </label>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
          <Button onClick={() => onSave(preferences)} disabled={isSaving}>
            Save preferences
          </Button>
        </div>
      )}
    </AsyncBoundary>
  );
}
