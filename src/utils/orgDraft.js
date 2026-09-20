/**
 * Tracks which organization the multi-step registration/upgrade wizard
 * (Registration -> OnlinePresence -> ShowWork -> Congratulations) is currently
 * building, so each step can attach documents/social links to the right org
 * without a shared React context between routed pages.
 */
const DRAFT_ORG_KEY = "afrivate_draft_org_id";

export function getDraftOrgId() {
  return localStorage.getItem(DRAFT_ORG_KEY);
}

export function setDraftOrgId(id) {
  if (id) localStorage.setItem(DRAFT_ORG_KEY, id);
}

export function clearDraftOrgId() {
  localStorage.removeItem(DRAFT_ORG_KEY);
}
