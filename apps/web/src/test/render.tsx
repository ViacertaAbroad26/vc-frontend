import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render as rtlRender,
  type RenderOptions,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";

export { act, fireEvent, screen, waitFor, within };
export { default as userEvent } from "@testing-library/user-event";

type Options = RenderOptions & {
  initialEntries?: string[];
  queryClient?: QueryClient;
};

export function render(ui: ReactElement, opts: Options = {}) {
  const { initialEntries, queryClient, ...renderOptions } = opts;
  const qc =
    queryClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });

  return rtlRender(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={initialEntries ?? ["/"]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
    renderOptions,
  );
}
