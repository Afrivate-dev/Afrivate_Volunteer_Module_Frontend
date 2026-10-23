/**
 * Returns a display-safe organization name. Never shows URLs (e.g. https://afrivate.com/Magodo) as the org name.
 */
export function getOrgName(item) {
  const n = item?.created_by_name;
  if (!n || typeof n !== "string") return "Organization";
  if (n.startsWith("http") || n.includes(".com")) return "Organization";
  return n.trim() || "Organization";
}

const EXTERNAL_SOURCE_LABELS = {
  myjobmag: "MyJobMag",
  reliefweb: "ReliefWeb",
  telegram: "Telegram",
};

/** Display name of the site a scraped (external) opportunity was found on. */
export function getExternalSourceLabel(source) {
  return EXTERNAL_SOURCE_LABELS[source] || source || "the original site";
}

// A scraped link is untrusted input: only ever render http(s) addresses
// (a `javascript:` URL in an href would run script in our origin).
export function getSafeExternalUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url) ? url : null;
}

// Always use this instead of navigate("/volunteer-details", { state: { job } }) directly.
// Direct navigation passed the abbreviated preview object which stripped the `description`
// field, breaking custom question parsing in ApplyApplication.
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
    // _raw carries the full API response; ApplyApplication reads _raw.description
    // to access the [CUSTOM_QUESTIONS] marker that may be absent from the preview string.
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
