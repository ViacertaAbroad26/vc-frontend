import { render, screen, userEvent } from "@/test/render";

import DocumentVerifyPage from "./DocumentVerifyPage";

describe("DocumentVerifyPage", () => {
  it("lists pending documents and lets ops verify or reject them", async () => {
    render(<DocumentVerifyPage />, { initialEntries: ["/internal/documents"] });

    expect((await screen.findAllByText("Asha Mehta")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("BANK_STATEMENT")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/bank-statement.pdf/)).length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole("button", { name: "L4" }));

    await userEvent.click(screen.getByRole("button", { name: "Reject document" }));

    const reasonField = screen.getByRole("textbox");
    await userEvent.type(reasonField, "The uploaded file is unreadable.");
    await userEvent.click(screen.getByRole("button", { name: "Reject" }));
  });
});
