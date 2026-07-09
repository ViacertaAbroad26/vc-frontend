import type { ReactNode } from "react";

import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { Spinner } from "./Spinner";

type Props<T> = {
  isLoading: boolean;
  error: unknown;
  data: T | undefined;
  isEmpty?: (d: T) => boolean;
  children: (data: T) => ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: (err: unknown) => ReactNode;
  emptyFallback?: ReactNode;
};

export function AsyncBoundary<T>({
  isLoading,
  error,
  data,
  isEmpty,
  children,
  loadingFallback,
  errorFallback,
  emptyFallback,
}: Props<T>) {
  if (isLoading) return <>{loadingFallback ?? <Spinner />}</>;
  if (error) return <>{errorFallback ? errorFallback(error) : <ErrorState error={error} />}</>;
  if (data === undefined) return <>{loadingFallback ?? <Spinner />}</>;
  if (isEmpty?.(data)) return <>{emptyFallback ?? <EmptyState />}</>;
  return <>{children(data)}</>;
}
