import { Route, Routes } from "react-router-dom";

import { render, screen, userEvent } from "@/test/render";

import CountryMappingPage from "./CountryMappingPage";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/students/:studentId/country-mapping" element={<CountryMappingPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("CountryMappingPage", () => {
  it("lists GCRI-seeded country candidates and lets an advisor confirm a shortlist", async () => {
    renderAt("/students/student-1/country-mapping");

    expect(await screen.findByText("Germany")).toBeInTheDocument();
    expect(screen.getByText("Netherlands")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();

    const [firstCheckbox] = screen.getAllByRole("checkbox");
    await userEvent.click(firstCheckbox!);

    await userEvent.click(screen.getByRole("button", { name: "Confirm shortlist" }));

    expect(await screen.findByText("Confirmed")).toBeInTheDocument();
  });
});
