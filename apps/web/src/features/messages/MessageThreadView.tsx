import { ApiError } from "@viacerta/api-client";
import { Button, Card, CardBody, EmptyState, Input, PageHeader, Spinner } from "@viacerta/ui";
import { MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useMarkThreadRead, useMessageThread, useSendMessage } from "./useMessageThread";

export function MessageThreadView() {
  const { data: thread, isLoading, error } = useMessageThread();
  const sendMessage = useSendMessage();
  const markRead = useMarkThreadRead();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (thread && thread.unreadCount > 0) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread?.unreadCount]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  const notReady = error instanceof ApiError && error.status === 422;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!thread || notReady) {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <EmptyState
          icon={<MessageSquare className="h-8 w-8" aria-hidden />}
          title="Messages unlock once an advisor is assigned"
          description="You'll be able to message your advisor directly here once you're matched."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col space-y-4">
      <PageHeader title="Messages" description="Direct messages with your advisor." />

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardBody className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {thread.messages.length === 0 && (
            <p className="m-auto text-sm text-gray-500 dark:text-gray-400">
              No messages yet — say hello to your advisor.
            </p>
          )}
          {thread.messages.map((m) => (
            <div key={m.id} className={`flex ${m.senderRole === "STUDENT" ? "justify-end" : "justify-start"}`}>
              <div
                className={
                  "max-w-[75%] rounded-2xl px-4 py-2 text-sm " +
                  (m.senderRole === "STUDENT"
                    ? "bg-mint-400 text-navy-900"
                    : "bg-gray-100 text-gray-900 dark:bg-navy-700 dark:text-gray-100")
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
          placeholder="Type a message..."
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
