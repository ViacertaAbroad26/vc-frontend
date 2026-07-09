import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn";

export function Divider({ className, ...rest }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("border-t border-gray-200", className)} {...rest} />;
}
