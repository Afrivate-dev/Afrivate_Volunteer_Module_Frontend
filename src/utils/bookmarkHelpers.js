/** Normalize list endpoints that return either an array or `{ results: [] }`. */
export function normalizeBookmarkList(response) {
  if (Array.isArray(response)) return response;
  if (response?.results && Array.isArray(response.results)) return response.results;
  return [];
}

/** Find a generic bookmark row for an enabler (pathfinder saving an org). */
export function findEnablerBookmarkRow(list, enablerProfileId) {
  const want = String(enablerProfileId);
  return list.find((b) => {
    const eid = b.enabler ?? b.enabler_id ?? b.enabler?.id;
    return eid != null && String(eid) === want;
  });
}
