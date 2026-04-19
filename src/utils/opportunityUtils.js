/**
 * Returns a display-safe organization name. Never shows URLs (e.g. https://afrivate.com/Magodo) as the org name.
 */
export function getOrgName(item) {
  const n = item?.created_by_name;
  if (!n || typeof n !== "string") return "Organization";
  if (n.startsWith("http") || n.includes(".com")) return "Organization";
  return n.trim() || "Organization";
}

/**
 * Navigate to the standard volunteer details page, fetching fresh opportunity data.
 * Used by multiple pathfinder views to ensure the details page always has the latest data.
 */
export async function navigateToVolunteerDetails(navigate, opportunityId, options = {}) {
  const { existingApplication = null, fallbackJob = null } = options;

  const safeJob = (data) => ({
    id: String(data.id),
    title: data.title || "Opportunity",
    company: getOrgName(data),
    type: data.opportunity_type || "Volunteering",
    location: data.location || "",
    description: data.description,
    created_by: data.created_by,
    link: data.link,
    _raw: data,
  });

  try {
    const data = await (await import("../services/api")).opportunities.get(opportunityId);
    navigate("/volunteer-details", {
      state: {
        job: safeJob(data),
        existingApplication,
      },
    });
  } catch (err) {
    console.error("Error loading opportunity:", err);
    const job =
      fallbackJob ||
      (typeof opportunityId !== "undefined"
        ? { id: opportunityId, title: "Opportunity", company: "Organization", location: "", _raw: {} }
        : { id: null, title: "Opportunity", company: "Organization", location: "", _raw: {} });
    navigate("/volunteer-details", {
      state: {
        job,
        existingApplication,
      },
    });
  }
}
