import { Button, Card, CardBody, Input, Spinner } from "@viacerta/ui";
import { useEffect, useRef, useState } from "react";

import {
  useAdvisorMessageThread,
  useMarkAdvisorThreadRead,
  useSendAdvisorMessage,
} from "./useAdvisorMessageThread";

export function AdvisorMessageThreadView({ studentId }: { studentId: string }) {
  const { data: thread, isLoading } = useAdvisorMessageThread(studentId);
  const sendMessage = useSendAdvisorMessage(studentId);
  const markRead = useMarkAdvisorThreadRead(studentId);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (thread && thread.unreadCount > 0) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread?.unreadCount]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  if (isLoading || !thread) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-14rem)] max-w-2xl flex-col space-y-4">
      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardBody className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {thread.messages.length === 0 && (
            <p className="m-auto text-sm text-gray-500">No messages yet with this student.</p>
          )}
          {thread.messages.map((m) => (
            <div key={m.id} className={`flex ${m.senderRole === "ADVISOR" ? "justify-end" : "justify-start"}`}>
              <div
                className={
                  "max-w-[75%] rounded-2xl px-4 py-2 text-sm " +
                  (m.senderRole === "ADVISOR" ? "bg-navy-700 text-white" : "bg-gray-100 text-gray-900")
                }
              >
                <p>{m.text}</p>
                <p className="mt-1 text-[10px] opacity-60">
                  {new Date(m.sentAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </CardBody>
      </Card>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          sendMessage.mutate(text.trim());
          setText("");
        }}
      >
        <Input
          className="flex-1"
          placeholder="Reply to student..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" variant="accent" disabled={sendMessage.isPending || !text.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
