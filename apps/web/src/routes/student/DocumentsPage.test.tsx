import { render, screen } from "@/test/render";

import DocumentsPage from "./DocumentsPage";

describe("DocumentsPage", () => {
  it("renders required and optional document tiles with their status", async () => {
    render(<DocumentsPage />);

    expect(await screen.findByText("Academic transcript")).toBeInTheDocument();
    expect(screen.getByText("transcript.pdf")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();

    expect(screen.getByText("CV / résumé")).toBeInTheDocument();
    expect(screen.getByText("Optional — improves your evidence score")).toBeInTheDocument();
    expect(screen.getByText("Other document")).toBeInTheDocument();
  });
});
