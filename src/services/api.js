/**
 * Afrivate Backend API client
 * All paths use /api prefix (e.g. /api/auth/register/). Override with REACT_APP_API_BASE_URL in .env if needed.
 * See API_DOCS.md for full endpoint reference.
 */

const BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || "https://afrivate-backend-production.up.railway.app"
).replace(/\/$/, "");

const API_PREFIX = process.env.REACT_APP_API_PREFIX ?? "/api";

/** Turn API error body into a single user-facing string. */
export function getApiErrorMessage(err) {
  if (!err) return "Something went wrong.";
  if (err.message && err.message !== "API request failed") return err.message;
  const b = err.body;
  if (b && typeof b === "object") {
    if (typeof b.detail === "string") return b.detail;
    if (typeof b.message === "string") return b.message;
    if (typeof b.error === "string") return b.error;
    if (Array.isArray(b.detail)) return b.detail.join(". ");
    if (b.non_field_errors && Array.isArray(b.non_field_errors)) return b.non_field_errors.join(". ");
    const parts = [];
    for (const [k, v] of Object.entries(b)) {
      if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
      else if (typeof v === "string") parts.push(`${k}: ${v}`);
    }
    if (parts.length) return parts.join(". ");
  }
  if (err.status) return `Request failed (${err.status}). Check your connection or try again.`;
  return "Cannot reach server. Check your connection or try again.";
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

async function request(method, path, options = {}) {
  const url = path.startsWith("http") ? path : BASE_URL + API_PREFIX + path;
  const access = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (access && !headers.Authorization) headers.Authorization = `Bearer ${access}`;
  if (options.body instanceof FormData) delete headers["Content-Type"];

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: options.body ?? (options.data ? JSON.stringify(options.data) : undefined),
      ...options,
    });
  } catch (networkErr) {
    const msg = networkErr?.message?.toLowerCase?.().includes("fetch")
      ? "Cannot reach server. Check your connection or try again."
      : (networkErr?.message || "Network error.");
    throw Object.assign(new Error(msg), { status: 0, body: null });
  }

  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${getAccessToken()}` };
      res = await fetch(url, {
        method,
        headers: retryHeaders,
        body: options.body ?? (options.data ? JSON.stringify(options.data) : undefined),
        ...options,
      });
    }
  }

  if (!res.ok) {
    let body = null;
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) body = await res.json();
    } catch (_) {}
    const err = new Error();
    err.status = res.status;
    err.body = body;
    err.message = getApiErrorMessage({ status: res.status, body });
    throw err;
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch (_) {
      return null;
    }
  }
  return res;
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}${API_PREFIX}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    const data = res.ok ? await res.json() : null;
    if (data && data.access) {
      setTokens(data.access, data.refresh || refresh);
      return true;
    }
  } catch (_) {}
  clearTokens();
  return false;
}

// --- Auth ---

export const auth = {
  login(body) {
    return request("POST", "/auth/login/", { data: body });
  },

  register(body) {
    return request("POST", "/auth/register/", {
      data: {
        username: body.username,
        email: body.email,
        password: body.password,
        password2: body.password2,
        role: body.role,
      },
    });
  },

  logout() {
    return request("POST", "/auth/logout/").finally(clearTokens);
  },

  token(body) {
    return request("POST", "/auth/token/", { data: { email: body.email, password: body.password } });
  },

  tokenRefresh(refresh) {
    return request("POST", "/auth/token/refresh/", { data: { refresh } });
  },

  forgotPassword(body) {
    return request("POST", "/auth/forgot-password/", { data: { email: body.email } });
  },

  changePassword(body) {
    return request("POST", "/auth/change-password/", {
      data: {
        old_password: body.old_password,
        new_password: body.new_password,
        confirm_password: body.confirm_password,
      },
    });
  },

  verifyEmail(body) {
    return request("POST", "/auth/verify-email/", { data: { token: body.token } });
  },

  verifyOtp(body) {
    return request("POST", "/auth/verify-otp/", { data: { email: body.email, otp: body.otp } });
  },

  /** Reset password after OTP (no Bearer). If backend uses different path, update here. */
  resetPassword(body) {
    return request("POST", "/auth/reset-password/", {
      data: {
        email: body.email,
        new_password: body.new_password,
        confirm_password: body.confirm_password,
      },
    });
  },

  /**
   * Exchange Google id_token for app JWT. Backend should verify id_token with Google and return access/refresh.
   * Body: { id_token: string, role?: "enabler" | "pathfinder" } (role for new signups).
   */
  google(body) {
    return request("POST", "/auth/google/", {
      data: { id_token: body.id_token, role: body.role },
    });
  },
};

// --- Bookmark ---

export const bookmark = {
  list() {
    return request("GET", "/bookmark/bookmarks/");
  },

  create(body) {
    return request("POST", "/bookmark/bookmarks/", { data: body });
  },

  delete(id) {
    return request("DELETE", `/bookmark/bookmarks/${id}/delete/`);
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
    return request("POST", "/bookmark/opportunities/saved/", { data: body });
  },
};

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

const apiClient = {
  BASE_URL,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  request,
  auth,
  bookmark,
  notifications,
  profile,
  waitlist,
};

export default apiClient;
