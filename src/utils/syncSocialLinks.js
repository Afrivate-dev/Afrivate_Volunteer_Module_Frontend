import { profile } from "../services/api";

function norm(link) {
  if (!link || typeof link !== "object") return null;
  const platform_name = String(link.platform_name || "").trim();
  const platform_url = String(link.platform_url || "").trim();
  if (!platform_name && !platform_url) return null;
  const out = { platform_name, platform_url };
  if (link.id != null) out.id = link.id;
  return out;
}

/** True if any link has a REST id (use /profile/social-links/<id>/ instead of nested profile payload). */
export function socialLinksHaveRestIds(links) {
  return (links || []).some((l) => l != null && l.id != null);
}

/**
 * Sync social links via POST/PATCH/DELETE on /api/profile/social-links/
 * Call after saving the profile without nested social_links when {@link socialLinksHaveRestIds} applies.
 */
export async function syncSocialLinksRestApi(previous, next) {
  const prev = (previous || []).map(norm).filter(Boolean);
  const nxt = (next || []).map(norm).filter(Boolean);
  const prevById = new Map(prev.filter((l) => l.id != null).map((l) => [l.id, l]));
  const nextWithId = nxt.filter((l) => l.id != null);
  const nextIds = new Set(nextWithId.map((l) => l.id));

  for (const id of prevById.keys()) {
    if (!nextIds.has(id)) {
      await profile.socialLinksDelete(id);
    }
  }

  for (const link of nxt) {
    if (link.id != null) {
      const old = prevById.get(link.id);
      if (
        old &&
        (old.platform_name !== link.platform_name || old.platform_url !== link.platform_url)
      ) {
        await profile.socialLinksPatch(link.id, {
          platform_name: link.platform_name,
          platform_url: link.platform_url,
        });
      }
    } else {
      await profile.socialLinksCreate({
        platform_name: link.platform_name,
        platform_url: link.platform_url,
      });
    }
  }
}
