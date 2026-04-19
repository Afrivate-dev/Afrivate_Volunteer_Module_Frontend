/**
 * Afrivate Backend API client. Paths use the /api prefix (e.g. /api/auth/register/).
 * Override base URL with REACT_APP_API_BASE_URL; prefix with REACT_APP_API_PREFIX.
 *
 * Auth and profile endpoints follow the product specs (Bearer JWT, JSON bodies unless multipart).
 */

const BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || "https://afrivate-backend-production.up.railway.app"
).replace(/\/$/, "");

const API_PREFIX = process.env.REACT_APP_API_PREFIX ?? "/api";

/** Flatten nested validation errors (e.g. { base_details: { contact_email: ["Required."] } }) into one string. */
function flattenValidationErrors(obj, prefix = "") {
  const parts = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) parts.push(`${key}: ${v.join(", ")}`);
    else if (typeof v === "string") parts.push(`${key}: ${v}`);
    else if (v && typeof v === "object" && !Array.isArray(v)) parts.push(...flattenValidationErrors(v, key));
  }
  return parts;
}

/** Turn error response into a single user-facing message (no technical jargon). */
export function getApiErrorMessage(err) {
  if (!err) return "Something went wrong.";
  if (err.message && err.message !== "Request failed") return err.message;
  const b = err.body;
  if (b && typeof b === "object") {
    if (typeof b.detail === "string") return b.detail;
    if (typeof b.message === "string") return b.message;
    if (typeof b.error === "string") return b.error;
    if (Array.isArray(b.detail)) return b.detail.join(". ");
    if (b.non_field_errors && Array.isArray(b.non_field_errors)) return b.non_field_errors.join(". ");
    const flat = flattenValidationErrors(b);
    if (flat.length) return flat.join(". ");
  }
  if (err.status) return "Something went wrong. Please check your connection and try again.";
  return "We couldn't connect. Please check your connection and try again.";
}

const ACCESS_KEY = "afrivate_access";
const REFRESH_KEY = "afrivate_refresh";
export const ROLE_KEY = "afrivate_role"; // "enabler" | "pathfinder"

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access, refresh) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function setRole(role) {
  if (role) localStorage.setItem(ROLE_KEY, role);
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

/** Whether we are currently retrying after a 401 refresh (avoid infinite loop). */
let isRetryingAfter401 = false;

async function request(method, path, options = {}) {
  const url = path.startsWith("http") ? path : BASE_URL + API_PREFIX + path;
  const access = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (access && !headers["Authorization"] && !options.public) {
    headers["Authorization"] = `Bearer ${access}`;
  }

  const config = {
    method,
    headers,
  };

  if (options.body !== undefined) {
    config.body = options.body instanceof FormData ? options.body : JSON.stringify(options.body);
  } else if (options.data !== undefined) {
    config.body = options.data instanceof FormData ? options.data : JSON.stringify(options.data);
  }

  // Content-Type must not be set when sending FormData (browser sets multipart boundary)
  if (config.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  let res;
  try {
    res = await fetch(url, config);
  } catch (networkError) {
    const err = new Error("Request failed");
    err.status = null;
    throw err;
  }

  let data = null;
  const isJson = res.headers.get("content-type")?.includes("application/json");
  if (isJson) {
    try {
      data = await res.json();
    } catch (_) {}
  }

  // On 401, try to refresh token and retry once (unless we are already retrying)
  if (res.status === 401 && !isRetryingAfter401) {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        isRetryingAfter401 = true;
        const tokens = await auth.tokenRefresh(refresh);
        if (tokens && tokens.access) {
          setTokens(tokens.access, tokens.refresh || refresh);
          return request(method, path, options);
        }
      } catch (refreshErr) {
        clearTokens();
        const err = new Error("Session expired. Please sign in again.");
        err.status = 401;
        err.body = data;
        throw err;
      } finally {
        isRetryingAfter401 = false;
      }
    }
  }

  if (!res.ok) {
    const err = new Error(data?.detail || "Request failed");
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

// --- Auth (POST /api/auth/... JSON unless noted; Bearer on protected routes) ---

export const auth = {
  register(body) {
    return request("POST", "/auth/register/", { data: body });
  },

  verifyOtp(body) {
    return request("POST", "/auth/verify-otp/", { data: body });
  },

  resendOtp(body) {
    return request("POST", "/auth/resend-otp/", { data: body });
  },

  login(body) {
    return request("POST", "/auth/login/", { data: body });
  },

  forgotPassword(body) {
    return request("POST", "/auth/forgot-password/", { data: body });
  },

  verifyPasswordResetOtp(body) {
    return request("POST", "/auth/verify-password-reset-otp/", { data: body });
  },

  resetPassword(body) {
    return request("POST", "/auth/reset-password/", { data: body });
  },

  changePassword(body) {
    return request("POST", "/auth/change-password/", { data: body });
  },

  logout() {
    const refresh = getRefreshToken();
    const data = refresh ? { refresh } : {};
    return request("POST", "/auth/logout/", { data });
  },

  tokenRefresh(refresh) {
    return request("POST", "/auth/token/refresh/", { data: { refresh } });
  },

  googlePathfinder(body) {
    return request("POST", "/auth/google/pathfinder/", { data: body });
  },

  googleEnabler(body) {
    return request("POST", "/auth/google/enabler/", { data: body });
  },

  setPassword(body) {
    return request("POST", "/auth/set-password/", { data: body });
  },

  /** Not listed in the public auth spec; used by settings “delete account”. */
  async deleteAccount() {
    try {
      return await request("DELETE", "/auth/delete-account/");
    } catch (e) {
      if (e.status === 404) {
        return request("DELETE", "/auth/user/");
      }
      throw e;
    }
  },
};

/**
 * Google: send `{ token: "<google_id_token>" }` from the SDK. Signup uses role-specific routes;
 * login tries pathfinder then enabler.
 */
export async function googleAuthWithRole({ idToken, mode, role }) {
  const data = { token: idToken };
  if (mode === "signup") {
    if (role === "enabler") {
      return auth.googleEnabler(data);
    }
    return auth.googlePathfinder(data);
  }
  try {
    return await auth.googlePathfinder(data);
  } catch (e1) {
    if (e1.status !== 400 && e1.status !== 404) throw e1;
    return auth.googleEnabler(data);
  }
}

// --- Bookmarks ---

export const bookmark = {
  list() {
    return request("GET", "/bookmark/");
  },

  // Updated: Now accepts full opportunity object along with opportunity_id
  create(body) {
    // build payload without sending explicit nulls (backend dislikes them)
    const data = {};
    if (body.opportunity) data.opportunity = body.opportunity;
    if (body.opportunity_id != null) data.opportunity_id = body.opportunity_id;
    if (body.enabler != null) data.enabler = body.enabler;
    if (body.pathfinder != null) data.pathfinder = body.pathfinder;
    // log for debug so picking up server validation errors easier
    console.debug("bookmark.create payload", data);
    return request("POST", "/bookmark/", { data });
  },

  delete(id) {
    return request("DELETE", `/bookmark/${id}/delete/`);
  },

  opportunitiesList() {
    return request("GET", "/bookmark/opportunities/");
  },

  opportunitiesCreate(body) {
    return request("POST", "/bookmark/opportunities/", {
      data: {
        title: body.title,
        description: body.description || "",
        link: body.link || "https://afrivate.com",
        is_open: body.is_open !== false,
      },
    });
  },

  opportunitiesSavedList() {
    return request("GET", "/bookmark/opportunities/saved/");
  },

  opportunitiesSavedCreate(body) {
    const data = {};
    if (body.opportunity != null) data.opportunity = body.opportunity;
    const oid = body.opportunity_id ?? body.opportunity?.id;
    if (oid != null) data.opportunity_id = oid;
    return request("POST", "/bookmark/opportunities/saved/", { data });
  },

  /** Pathfinder: remove a saved opportunity by opportunity id. */
  opportunitiesSavedDelete(opportunityId) {
    return request("DELETE", `/bookmark/opportunities/saved/${opportunityId}/`);
  },

  /** Enabler: list saved pathfinder bookmarks. GET /api/bookmark/applicants/saved/ */
  applicantsSavedList() {
    return request("GET", "/bookmark/applicants/saved/");
  },

  /** Enabler: single saved bookmark (view). GET /api/bookmark/applicants/saved/{pathfinder_id}/ */
  applicantsSavedGet(pathfinderId) {
    return request("GET", `/bookmark/applicants/saved/${pathfinderId}/`);
  },

  /** Enabler: bookmark a pathfinder (e.g. applicant). POST /api/bookmark/applicants/saved/ */
  applicantsSavedCreate(body) {
    const data = {};
    if (body.pathfinder != null) data.pathfinder = body.pathfinder;
    if (body.pathfinder_id != null) data.pathfinder_id = body.pathfinder_id;
    if (body.opportunity != null) data.opportunity = body.opportunity;
    if (body.opportunity_id != null) data.opportunity_id = body.opportunity_id;
    return request("POST", "/bookmark/applicants/saved/", { data });
  },

  /** Enabler: remove saved bookmark by pathfinder id. DELETE /api/bookmark/applicants/saved/{pathfinder_id}/ */
  applicantsSavedDelete(pathfinderId) {
    return request("DELETE", `/bookmark/applicants/saved/${pathfinderId}/`);
  },

  /** Pathfinder: bookmark an enabler. POST /api/bookmark/enablers/saved/ */
  enablersSavedCreate(body) {
    const data = {};
    if (body.enabler != null) data.enabler = body.enabler;
    if (body.enabler_id != null) data.enabler_id = body.enabler_id;
    return request("POST", "/bookmark/enablers/saved/", { data });
  },

  /** Pathfinder: list bookmarked enablers. GET /api/bookmark/enablers/saved/ */
  enablersSavedList() {
    return request("GET", "/bookmark/enablers/saved/");
  },

  /** Pathfinder: remove an enabler bookmark. DELETE /api/bookmark/enablers/saved/{enabler_id}/ */
  enablersSavedDelete(enablerId) {
    return request("DELETE", `/bookmark/enablers/saved/${enablerId}/`);
  },
};

/** Alias for backward compatibility: use bookmark (singular) or bookmarks. */
export const bookmarks = bookmark;

// --- Notifications ---

export const notifications = {
  list() {
    return request("GET", "/notify/notifications/");
  },

  create(body) {
    return request("POST", "/notify/notifications/", { data: body });
  },

  markRead(notificationId) {
    return request("POST", `/notify/notifications/${notificationId}/mark-read/`);
  },

  markAllRead() {
    return request("POST", "/notify/notifications/mark-all-read/");
  },
};

// --- Profile ---

export const profile = {
  enablerGet() {
    return request("GET", "/profile/enablerprofile/");
  },

  /**
   * Fetch enabler profile by user ID (for public org/profile view).
   *
   * Pathfinders use this when viewing an organization; API now exposes
   * `/profile/enablerprofile/user/{user_id}/` which looks up the enabler
   * record associated with the given user identifier.
   */
  enablerGetById(userId) {
    return request("GET", `/profile/enablerprofile/user/${userId}/`);
  },


  enablerCreate(body) {
    return request("POST", "/profile/enablerprofile/", { data: body });
  },

  enablerUpdate(body) {
    return request("PUT", "/profile/enablerprofile/", { data: body });
  },

  enablerPatch(body) {
    return request("PATCH", "/profile/enablerprofile/", { data: body });
  },

  pathfinderGet() {
    return request("GET", "/profile/pathfinderprofile/");
  },

  /** Public pathfinder by Django user id: GET /profile/pathfinderprofile/user/<user_id>/ */
  pathfinderGetById(userId) {
    return request("GET", `/profile/pathfinderprofile/user/${userId}/`);
  },

  pathfinderCreate(body) {
    return request("POST", "/profile/pathfinderprofile/", { data: body });
  },

  pathfinderUpdate(body) {
    return request("PUT", "/profile/pathfinderprofile/", { data: body });
  },

  pathfinderPatch(body) {
    return request("PATCH", "/profile/pathfinderprofile/", { data: body });
  },

  pictureGet() {
    return request("GET", "/profile/profile/picture/");
  },

  picturePatch(formData) {
    return request("PATCH", "/profile/profile/picture/", {
      body: formData,
      headers: {},
    });
  },

  /** Government Credentials / Documents: GET list, POST upload (multipart: document_name, document). */
  credentialsList() {
    return request("GET", "/profile/credentials/");
  },

  credentialsCreate(formData) {
    return request("POST", "/profile/credentials/", {
      body: formData,
      headers: {},
    });
  },

  credentialsGet(id) {
    return request("GET", `/profile/credentials/${id}/`);
  },

  credentialsPut(id, body) {
    return request("PUT", `/profile/credentials/${id}/`, { data: body });
  },

  credentialsPatch(id, body) {
    if (body instanceof FormData) {
      return request("PATCH", `/profile/credentials/${id}/`, { body, headers: {} });
    }
    return request("PATCH", `/profile/credentials/${id}/`, { data: body });
  },

  credentialsDelete(id) {
    return request("DELETE", `/profile/credentials/${id}/`);
  },

  socialLinksCreate(body) {
    return request("POST", "/profile/social-links/", { data: body });
  },

  socialLinksGet(id) {
    return request("GET", `/profile/social-links/${id}/`);
  },

  socialLinksPut(id, body) {
    return request("PUT", `/profile/social-links/${id}/`, { data: body });
  },

  socialLinksPatch(id, body) {
    return request("PATCH", `/profile/social-links/${id}/`, { data: body });
  },

  socialLinksDelete(id) {
    return request("DELETE", `/profile/social-links/${id}/`);
  },
};

// --- Waitlist ---

export const waitlist = {
  create(body) {
    return request("POST", "/waitlist/", { data: { email: body.email, name: body.name || null } });
  },

  stats() {
    return request("GET", "/waitlist/stats/");
  },
};

// --- Applications ---
// Spec: POST /api/applications/ supports two options:
//   Option A — JSON with existing credential: { opportunity, cover_letter, profile_resume }
//   Option B — multipart/form-data with file: form-data with opportunity, cover_letter, resume (File)

export const applications = {
  /**
   * List my applications.
   * Pathfinder: returns all applications they submitted
   * Enabler: returns all applications received for their opportunities
   */
  list() {
    return request("GET", "/applications/");
  },

  /**
   * Submit an application (Pathfinder only).
   *
   * Supports two options:
   * Option A — Existing credential as resume:
   *   { opportunity: 1, cover_letter: "...", profile_resume: 3 }
   *
   * Option B — File upload (multipart/form-data):
   *   FormData with: opportunity, cover_letter, resume (File object)
   */
  create(body) {
    // If body is FormData (file upload), pass directly
    if (body instanceof FormData) {
      return request("POST", "/applications/", {
        body: body,
        headers: {},
      });
    }

    // Otherwise, JSON with optional profile_resume or cover_letter
    const data = {};
    if (body.opportunity != null) data.opportunity = body.opportunity;
    if (body.cover_letter) data.cover_letter = body.cover_letter;
    if (body.profile_resume != null) data.profile_resume = body.profile_resume;

    return request("POST", "/applications/", { data });
  },

  get(id) {
    return request("GET", `/applications/${id}/`);
  },

  update(id, body) {
    return request("PUT", `/applications/${id}/`, { data: body });
  },

  patch(id, body) {
    return request("PATCH", `/applications/${id}/`, { data: body });
  },

  /**
   * Withdraw an application (Pathfinder only).
   * Only possible if status is still "pending".
   * DELETE /api/applications/<id>/
   */
  withdraw(id) {
    return request("DELETE", `/applications/${id}/`);
  },

  /**
   * Accept or reject an application (Enabler only).
   * PATCH /api/applications/<id>/change_status/ with { status: "accepted" | "rejected" }
   */
  updateStatus(id, body) {
    return request("PATCH", `/applications/${id}/change_status/`, { data: body });
  },

  /**
   * @deprecated Use opportunities.getApplicant — same endpoint, kept for imports that still use applications.
   */
  getApplicantProfile(opportunityId, applicantId) {
    return request(
      "GET",
      `/opportunities/${opportunityId}/applicants/${applicantId}/`
    );
  },
};

// --- Opportunities ---
// Spec endpoints:
// 1. GET /api/opportunities/?opportunity_type=...&is_open=...&search=...&page=...&page_size=... — Browse all (public)
// 2. GET /api/opportunities/<id>/ — View single opportunity (public)
// 3. POST /api/opportunities/ — Post opportunity (Enabler only)
// 4. PATCH /api/opportunities/<id>/ — Edit opportunity (Enabler only, within 12 hours)
// 5. DELETE /api/opportunities/<id>/ — Delete opportunity (Enabler only)
// 6. GET /api/opportunities/mine/ — My posted opportunities (Enabler only)
// 7. GET /api/opportunities/<id>/applicants/ — List applicants for opportunity (Enabler only)
// 8. GET /api/opportunities/<id>/applicants/<applicant_id>/ — View applicant's full profile (Enabler only)

export const opportunities = {
  /**
   * Browse all opportunities (public endpoint, no auth required).
   * Supports query params:
   *   - opportunity_type: 'job', 'internship', 'volunteering'
   *   - is_open: true/false
   *   - search: search title and description
   *   - page: page number
   *   - page_size: items per page (max 100)
   */
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request("GET", `/opportunities/${query ? `?${query}` : ""}`);
  },

  /**
   * Post an opportunity (Enabler only).
   * Required fields in body: title, opportunity_type, description, link
   * link must start with https://
   */
  create(body) {
    return request("POST", "/opportunities/", { data: body });
  },

  /**
   * Get my posted opportunities (Enabler only).
   * GET /api/opportunities/mine/
   */
  mine() {
    return request("GET", "/opportunities/mine/");
  },

  /**
   * Create opportunity via mine endpoint (alternative to create()).
   */
  mineCreate(body) {
    return request("POST", "/opportunities/mine/", { data: body });
  },

  /**
   * View single opportunity (public endpoint, no auth required).
   */
  get(id) {
    return request("GET", `/opportunities/${id}/`, { public: true });
  },

  /**
   * Update opportunity (Enabler only, within 12 hours of posting).
   */
  update(id, body) {
    return request("PUT", `/opportunities/${id}/`, { data: body });
  },

  /**
   * Patch opportunity (Enabler only, within 12 hours of posting).
   * Include only fields to update.
   */
  patch(id, body) {
    return request("PATCH", `/opportunities/${id}/`, { data: body });
  },

  /**
   * Delete opportunity (Enabler only).
   * If no applicants: response 204 No Content
   * If has applicants: response 200 with message, opportunity closed instead
   */
  delete(id) {
    return request("DELETE", `/opportunities/${id}/`);
  },

  /**
   * List all applicants for an opportunity (Enabler only, must be creator).
   * GET /api/opportunities/<id>/applicants/
   * Returns array of applicant objects with status, cover_letter, applied_at, resume
   */
  applicantsList(opportunityId) {
    return request("GET", `/opportunities/${opportunityId}/applicants/`);
  },

  /**
   * View an applicant's full profile (Enabler only, must be opportunity creator).
   * GET /api/opportunities/<id>/applicants/<applicant_id>/
   * Returns full pathfinder profile including skills, education, certifications, credentials
   */
  getApplicant(opportunityId, applicantId) {
    return request("GET", `/opportunities/${opportunityId}/applicants/${applicantId}/`);
  },
};

const apiClient = {
  BASE_URL,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  setRole,
  getRole,
  request,
  googleAuthWithRole,
  auth,
  bookmark,
  bookmarks: bookmark, // Alias for backward compatibility
  notifications,
  profile,
  waitlist,
  applications,
  opportunities,
};

export default apiClient;
