import { type PropsWithChildren } from "react";

export function PageContainer({ children }: PropsWithChildren) {
  return <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">{children}</div>;
}
