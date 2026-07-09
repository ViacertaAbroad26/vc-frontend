import type { ProfileChangeRequest } from "@viacerta/api-client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Textarea,
} from "@viacerta/ui";
import { useState } from "react";

export function ChangeRequestPanel({
  section,
  requests,
  onSubmit,
  isSubmitting = false,
}: {
  section: string;
  requests: ProfileChangeRequest[];
  onSubmit: (message: string) => void;
  isSubmitting?: boolean;
}) {
  const [message, setMessage] = useState("");

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="request-changes">
        <AccordionTrigger>Request changes to this section</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <Textarea
              rows={3}
              placeholder="Describe what you'd like an advisor to update in this section…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              loading={isSubmitting}
              disabled={!message.trim()}
              onClick={() => {
                onSubmit(message.trim());
                setMessage("");
              }}
            >
              Send request
            </Button>

            {requests.length > 0 && (
              <div className="space-y-2 pt-2">
                {requests.map((req) => (
                  <div key={req.id} className="flex items-start justify-between gap-3 rounded-md border border-gray-200 p-3">
                    <p className="text-sm text-gray-700">{req.message}</p>
                    <Badge variant={req.status === "RESOLVED" ? "green" : "amber"}>
                      {req.status === "RESOLVED" ? "Resolved" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
