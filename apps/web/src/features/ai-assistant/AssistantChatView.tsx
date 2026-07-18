import { ApiError } from "@viacerta/api-client";
import { Button, Card, CardBody, Input, PageHeader, Spinner } from "@viacerta/ui";
import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAssistantConversation, useSendAssistantMessage } from "./useAssistantConversation";

export function AssistantChatView() {
  const { data: conversation, isLoading } = useAssistantConversation();
  const sendMessage = useSendAssistantMessage();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.turns.length]);

  if (isLoading || !conversation) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const errorText =
    sendMessage.error instanceof ApiError ? sendMessage.error.message : null;

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col space-y-4">
      <PageHeader
        title="AI Assistant"
        description="Ask about your scores, documents, visa status, or what's next — grounded in your own data."
      />

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardBody className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {conversation.turns.length === 0 && (
            <div className="m-auto flex flex-col items-center gap-2 text-center text-sm text-gray-500 dark:text-gray-400">
              <Sparkles className="h-8 w-8 text-mint-400" />
              <p>Ask me anything about your journey — e.g. "What's my GCSS score?"</p>
            </div>
          )}
          {conversation.turns.map((t, i) => (
            <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm " +
                  (t.role === "user"
                    ? "bg-mint-400 text-navy-900"
                    : "bg-gray-100 text-gray-900 dark:bg-navy-700 dark:text-gray-100")
                }
              >
                {t.content}
              </div>
            </div>
          ))}
          {sendMessage.isPending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-gray-100 px-4 py-2 text-sm text-gray-500 dark:bg-navy-700 dark:text-gray-400">
                <Spinner />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </CardBody>
      </Card>

      {errorText && <p className="text-xs text-flag-red-text">{errorText}</p>}

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
          placeholder="Ask the AI Assistant..."
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
