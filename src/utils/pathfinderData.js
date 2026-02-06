/**
 * Shared pathfinder profile data by id. Used by PathfinderProfile, ContactPathfinder, EnablerPathfinderBookmarks.
 * Empty by default - populated from API/profile when available.
 */
export const pathfinderDataById = {};

export function getPathfinderById(id) {
  if (id == null) return null;
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  const byNum = !Number.isNaN(numId) ? pathfinderDataById[numId] : null;
  const byKey = pathfinderDataById[id] || pathfinderDataById[String(id)];
  return byNum || byKey || null;
}
