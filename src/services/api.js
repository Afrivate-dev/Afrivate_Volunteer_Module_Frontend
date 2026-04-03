/**
 * Afrivate Backend API client
 * All paths use /api prefix (e.g. /api/auth/register/). Override with REACT_APP_API_BASE_URL in .env if needed.
 * Updated API implementation based on Afrivate API-1 PDF documentation.
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
  if (access && !headers["Authorization"]) {
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

// --- Auth ---

export const auth = {
  login(body) {
    return request("POST", "/auth/login/", { data: body });
  },

  register(body) {
    return request("POST", "/auth/register/", { data: body });
  },

  // Logout - POST with Bearer token (no body)
  logout() {
    return request("POST", "/auth/logout/");
  },

  token(body) {
    return request("POST", "/auth/token/", { data: body });
  },

  tokenRefresh(refresh) {
    return request("POST", "/auth/token/refresh/", { data: { refresh } });
  },

  forgotPassword(body) {
    return request("POST", "/auth/forgot-password/", { data: body });
  },

  verifyOtp(body) {
    return request("POST", "/auth/verify-otp/", { data: body });
  },

  resetPassword(body) {
    return request("POST", "/auth/reset-password/", { data: body });
  },

  changePassword(body) {
    return request("POST", "/auth/change-password/", { data: body });
  },

  verifyEmail(body) {
    return request("POST", "/auth/verify-email/", { data: body });
  },

  google(body) {
    return request("POST", "/auth/google/", { data: body });
  },

  // NEW: Registration (alternative)
  registration(body) {
    return request("POST", "/auth/registration/", { data: body });
  },

  // NEW: Resend verification email
  registrationResendEmail(body) {
    return request("POST", "/auth/registration/resend-email/", { data: body });
  },

  // NEW: Verify email with key
  registrationVerifyEmail(body) {
    return request("POST", "/auth/registration/verify-email/", { data: body });
  },

  // NEW: Password change (different from forgot-password)
  passwordChange(body) {
    return request("POST", "/auth/password/change/", { data: body });
  },

  // NEW: Password reset request
  passwordReset(body) {
    return request("POST", "/auth/password/reset/", { data: body });
  },

  // NEW: Password reset confirm
  passwordResetConfirm(body) {
    return request("POST", "/auth/password/reset/confirm/", { data: body });
  },

  // NEW: Get user profile
  userGet() {
    return request("GET", "/auth/user/");
  },

  // NEW: Update user profile (full)
  userUpdate(body) {
    return request("PUT", "/auth/user/", { data: body });
  },

  // NEW: Update user profile (partial)
  userPatch(body) {
    return request("PATCH", "/auth/user/", { data: body });
  },

  // NEW: Delete user account (for both enabler and pathfinder)
  deleteAccount() {
    return request("DELETE", "/auth/user/");
  },
};

// --- Bookmarks ---

export const bookmark = {
  list() {
    return request("GET", "/bookmark/bookmark/");
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
    return request("POST", "/bookmark/bookmark/", { data });
  },

  delete(id) {
    return request("DELETE", `/bookmark/bookmark/${id}/delete/`);
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
};

/** Alias for backward compatibility: use bookmark (singular) or bookmarks. */
export const bookmarks = bookmark;

// --- Notifications ---

export const notifications = {
  list() {
    return request("GET", "/notifynotifications/");
  },

  create(body) {
    return request("POST", "/notifynotifications/", { data: body });
  },

  get(id) {
    return request("GET", `/notifynotifications/${id}/`);
  },

  update(id, body) {
    return request("PUT", `/notifynotifications/${id}/`, { data: body });
  },

  delete(id) {
    return request("DELETE", `/notifynotifications/${id}/`);
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

  /** Fetch pathfinder profile by user ID (for enabler view). Uses GET /profile/view-profile/{id}/ */
  pathfinderGetById(id) {
    return request("GET", `/profile/view-profile/${id}/`);
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

  credentialsDelete(id) {
    return request("DELETE", `/profile/credentials/${id}/`);
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
// Updated: Endpoint changed from /applications/api/applications/ to /applications/
// Added: cover_letter field support

export const applications = {
  list() {
    return request("GET", "/applications/");
  },

  // Updated: Added cover_letter to request body
  create(body) {
    return request("POST", "/applications/", {
      data: {
        opportunity: body.opportunity,
        cover_letter: body.cover_letter || "",
      },
    });
  },

  get(id) {
    return request("GET", `/applications/${id}/`);
  },

  // Updated: Added cover_letter to request body
  update(id, body) {
    return request("PUT", `/applications/${id}/`, {
      data: {
        opportunity: body.opportunity,
        cover_letter: body.cover_letter || "",
      },
    });
  },

  // Updated: Added cover_letter to request body
  patch(id, body) {
    return request("PATCH", `/applications/${id}/`, {
      data: {
        opportunity: body.opportunity,
        cover_letter: body.cover_letter || "",
      },
    });
  },

  delete(id) {
    return request("DELETE", `/applications/${id}/`);
  },

  // Updated: Changed from PUT to PATCH as per new API
  updateStatus(id, body) {
    return request("PATCH", `/applications/${id}/change_status/`, { data: body });
  },

  // View applicant profile by opportunity (opportunityId, pathfinderId)
  getApplicantProfile(opportunityId, pathfinderId) {
    return request("GET", `/opportunities/opportunities/${opportunityId}/applicants/${pathfinderId}/`);
  },
};

// --- Opportunities ---

export const opportunities = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request("GET", `/opportunities/opportunities/${query ? `?${query}` : ''}`);
  },

  create(body) {
    return request("POST", "/opportunities/opportunities/", { data: body });
  },

  mine() {
    return request("GET", "/opportunities/opportunities/mine/");
  },

  mineCreate(body) {
    return request("POST", "/opportunities/opportunities/mine/", { data: body });
  },

  get(id) {
    return request("GET", `/opportunities/opportunities/${id}/`);
  },

  update(id, body) {
    return request("PUT", `/opportunities/opportunities/${id}/`, { data: body });
  },

  patch(id, body) {
    return request("PATCH", `/opportunities/opportunities/${id}/`, { data: body });
  },

  delete(id) {
    return request("DELETE", `/opportunities/opportunities/${id}/`);
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
