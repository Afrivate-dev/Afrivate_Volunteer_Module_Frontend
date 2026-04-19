import { normalizeWebsiteForStorage } from "./websiteUrl";

/**
 * Pathfinder profile request shape (POST/PUT/PATCH):
 * - base_details: bio, contact_email, phone_number, address, state, country, website
 * - social_links: [{ platform_name, platform_url }]
 * - skills | educations | certifications: [{ name }]
 * - first_name, last_name, other_name, title, about, work_experience, languages, gmail
 */

export function normalizeSocialLink(link) {
  if (!link || typeof link !== "object") return null;
  const platform_name = String(
    link.platform_name ?? link.platform ?? link.name ?? ""
  ).trim();
  const platform_url = String(
    link.platform_url ?? link.url ?? link.link ?? ""
  ).trim();
  if (!platform_name && !platform_url) return null;
  const out = { platform_name, platform_url };
  if (link.id != null) out.id = link.id;
  return out;
}

export function normalizeSkillEntry(s) {
  const name =
    typeof s === "string"
      ? s.trim()
      : String(s?.name ?? s?.skill ?? "").trim();
  if (!name) return null;
  return { name };
}

export function normalizeEducationEntry(e) {
  const name =
    typeof e === "string"
      ? e.trim()
      : String(e?.name ?? e?.institution ?? "").trim();
  if (!name) return null;
  return { name };
}

export function normalizeCertificationEntry(c) {
  const name =
    typeof c === "string"
      ? c.trim()
      : String(c?.name ?? c?.title ?? "").trim();
  if (!name) return null;
  return { name };
}

/**
 * Nested base_details for API (optional id for PUT/PATCH nested update).
 */
export function buildPathfinderBaseDetails({
  bio = "",
  contact_email = "",
  phone_number = "",
  address = "",
  state = "",
  country = "",
  website = "",
  id = undefined,
}) {
  const out = {
    bio: String(bio ?? "").trim(),
    contact_email: String(contact_email ?? "").trim(),
    phone_number: String(phone_number ?? "").trim(),
    address: String(address ?? "").trim(),
    state: String(state ?? "").trim(),
    country: String(country ?? "").trim(),
    website: normalizeWebsiteForStorage(website),
  };
  if (id != null) out.id = id;
  return out;
}

/**
 * Full pathfinder profile body for create/update.
 */
export function buildPathfinderProfileBody({
  first_name,
  last_name,
  other_name = "",
  title = "",
  about = "",
  work_experience = "",
  languages = "",
  gmail = "",
  base_details,
  social_links = [],
  skills = [],
  educations = [],
  certifications = [],
}) {
  const social = (social_links || [])
    .map(normalizeSocialLink)
    .filter(Boolean);

  return {
    base_details,
    social_links: social,
    skills: (skills || []).map(normalizeSkillEntry).filter(Boolean),
    educations: (educations || []).map(normalizeEducationEntry).filter(Boolean),
    certifications: (certifications || [])
      .map(normalizeCertificationEntry)
      .filter(Boolean),
    first_name: String(first_name ?? "").trim(),
    last_name: String(last_name ?? "").trim(),
    other_name: String(other_name ?? "").trim(),
    title: String(title ?? "").trim(),
    about: String(about ?? "").trim(),
    work_experience: String(work_experience ?? "").trim(),
    languages: String(languages ?? "").trim(),
    gmail: String(gmail ?? "").trim(),
  };
}

/** Strip nested base_details.id (e.g. before POST create). */
export function stripBaseDetailsId(body) {
  if (!body?.base_details || body.base_details.id == null) return body;
  const { id, ...rest } = body.base_details;
  return { ...body, base_details: rest };
}
