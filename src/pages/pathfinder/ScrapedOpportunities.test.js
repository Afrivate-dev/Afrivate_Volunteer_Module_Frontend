import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AvailableOpportunities from "./AvailableOpportunities";
import VolunteerDetails from "./VolunteerDetails";
import { opportunities, bookmarks, applications } from "../../services/api";

jest.mock("../../components/auth/Navbar", () => () => null);
jest.mock("../../services/api", () => ({
  opportunities: { list: jest.fn(), get: jest.fn() },
  bookmarks: { opportunitiesSavedList: jest.fn() },
  applications: { list: jest.fn() },
  profile: { enablerGetById: jest.fn() },
  getAccessToken: jest.fn(() => null),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Shapes copied from GET /api/opportunities/ (scraped rows have no owner).
const scraped = {
  id: 7,
  title: "Data Analyst Intern",
  opportunity_type: "internship",
  description: "Summary\n• Analyse data\n• Build dashboards",
  link: "https://www.myjobmag.com/job/data-analyst-intern-7",
  posted_at: "2026-10-23T11:57:55Z",
  is_open: true,
  created_by: null,
  created_by_name: "Example Ltd",
  is_external: true,
  source: "myjobmag",
  organization_name: "Example Ltd",
  location: "Lagos, Nigeria",
  work_mode: "On-site",
  deadline: "2026-11-04T00:00:00Z",
  field: "tech",
};
const owned = {
  id: 3,
  title: "Community Volunteer",
  opportunity_type: "volunteering",
  description: "Help us out",
  link: "https://afrivate.org/x",
  posted_at: "2026-10-01T00:00:00Z",
  is_open: true,
  created_by: 5,
  created_by_name: "Helping Hands",
  is_external: false,
  source: "",
  organization_name: "",
  location: "",
  work_mode: null,
  deadline: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  bookmarks.opportunitiesSavedList.mockResolvedValue([]);
  applications.list.mockResolvedValue([]);
});

describe("AvailableOpportunities with scraped listings", () => {
  it("loads every page and marks scraped listings with their source and deadline", async () => {
    opportunities.list
      .mockResolvedValueOnce({ count: 2, next: "page2", results: [scraped] })
      .mockResolvedValueOnce({ count: 2, next: null, results: [owned] });

    render(<MemoryRouter><AvailableOpportunities /></MemoryRouter>);

    expect(await screen.findByText("Data Analyst Intern")).toBeInTheDocument();
    expect(screen.getByText("Community Volunteer")).toBeInTheDocument();
    expect(opportunities.list).toHaveBeenNthCalledWith(1, { is_open: true, page_size: 100, page: 1 });
    expect(opportunities.list).toHaveBeenNthCalledWith(2, { is_open: true, page_size: 100, page: 2 });

    const card = within(screen.getByText("Data Analyst Intern").closest(".rounded-2xl"));
    expect(card.getByText("via MyJobMag")).toBeInTheDocument();
    expect(screen.getAllByText(/^via /)).toHaveLength(1); // not on Afrivate's own listing
    expect(card.getByText("Example Ltd • Lagos, Nigeria")).toBeInTheDocument();
    expect(card.getByText("On-site")).toBeInTheDocument();
    expect(card.getByText("Closes 04 Nov 2026")).toBeInTheDocument();
  });

  it("filters scraped internships with the existing Internship filter", async () => {
    opportunities.list.mockResolvedValueOnce({ count: 2, next: null, results: [scraped, owned] });
    render(<MemoryRouter><AvailableOpportunities /></MemoryRouter>);
    await screen.findByText("Data Analyst Intern");

    userEvent.click(screen.getByRole("button", { name: "Internship" }));

    await waitFor(() => expect(screen.queryByText("Community Volunteer")).not.toBeInTheDocument());
    expect(screen.getByText("Data Analyst Intern")).toBeInTheDocument();
  });
});

describe("VolunteerDetails for a scraped listing", () => {
  const renderDetails = (job) =>
    render(
      <MemoryRouter initialEntries={[{ pathname: "/volunteer-details", state: { job } }]}>
        <VolunteerDetails />
      </MemoryRouter>
    );
  const asJob = (raw) => ({
    id: String(raw.id), title: raw.title, company: raw.created_by_name, type: "Internship",
    location: raw.location, description: raw.description, link: raw.link, created_by: raw.created_by, _raw: raw,
  });

  beforeEach(() => opportunities.list.mockResolvedValue({ results: [] }));

  it("offers an Apply link to the original site instead of in-app apply", async () => {
    renderDetails(asJob(scraped));

    const apply = await screen.findByRole("link", { name: /Apply on MyJobMag/ });
    expect(apply).toHaveAttribute("href", scraped.link);
    expect(apply).toHaveAttribute("target", "_blank");
    expect(apply).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.queryByText("Apply now")).not.toBeInTheDocument();
    expect(screen.queryByText(/Message recruiter/)).not.toBeInTheDocument();
    expect(screen.getByText(/You'll apply on their site/)).toBeInTheDocument();
  });

  it("never renders a non-http(s) apply link", async () => {
    renderDetails(asJob({ ...scraped, link: "javascript:alert(1)" })); // eslint-disable-line no-script-url

    expect(await screen.findByText("Application link unavailable")).toBeDisabled();
    expect(screen.queryByRole("link", { name: /Apply on/ })).not.toBeInTheDocument();
  });

  it("keeps the in-app Apply button for Afrivate's own opportunities", async () => {
    renderDetails(asJob(owned));

    expect(await screen.findByText("Apply now")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Apply on/ })).not.toBeInTheDocument();
  });
});
