# Afrivate Volunteer Module — Frontend

> **Full documentation:** [FRONTEND_CHANGES.md](FRONTEND_CHANGES.md)  
> **Change log (light branch):** [LIGHT_BRANCH_CHANGES.md](LIGHT_BRANCH_CHANGES.md)

Afrivate is a volunteer-matching platform connecting African volunteers (**Pathfinders**) with organisations that post opportunities (**Enablers**). This React SPA handles authentication, profile management, opportunity browsing, application submission, bookmarks, and notifications.

---

## Tech Stack

- **React 18** with React Router v6 (BrowserRouter)
- **Tailwind CSS v3** — brand color `#6A00B1`
- **Native fetch** (no axios) via centralized `src/services/api.js`
- **@react-oauth/google** for Google OAuth
- **Deployed on Vercel** (CI=true, warnings treated as errors)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install and run

```bash
git clone <repo-url>
cd <repo-directory>
npm install
npm start          # http://localhost:3000
```

### Build

```bash
npm run build
```

`CI=true` is required for Vercel (converts ESLint warnings to errors). Check locally with:

```bash
CI=true npm run build
```

### Environment variables

| Variable | Default |
|---|---|
| `REACT_APP_API_BASE_URL` | `https://afrivate-backend-production.up.railway.app` |
| `REACT_APP_API_PREFIX` | `/api` |

Create `.env.local` for local overrides. These are baked in at build time.

---

## Key Files

| File | Purpose |
|---|---|
| `src/App.js` | Route tree, `ErrorBoundary`, `RoleRedirect` |
| `src/context/UserContext.js` | Auth state — `user`, `loading`, `refetchUser` |
| `src/services/api.js` | All API calls, token management, 401 auto-refresh |
| `src/pages/pathfinder/EditNewProfile.js` | Profile create/edit/preview (most complex page) |
| `src/utils/descriptionUtils.js` | `combineDescription` / `parseDescription` for multi-section descriptions |
| `src/utils/opportunityUtils.js` | `navigateToVolunteerDetails` — always use instead of direct `navigate()` |

---

## Roles

| Role | Dashboard | Profile setup |
|---|---|---|
| **Pathfinder** (volunteer) | `/pathf` | `/pathfinder/profile-setup` or `/profile` |
| **Enabler** (organisation) | `/enabler/dashboard` | `/enabler/profile-setup` |

Auth tokens and role are stored in `localStorage` under keys `afrivate_access`, `afrivate_refresh`, `afrivate_role`.

---

## Documentation

- **[FRONTEND_CHANGES.md](FRONTEND_CHANGES.md)** — comprehensive reference: all routes, API client, architecture, page-by-page guide, custom questions pattern, deployment
- **[LIGHT_BRANCH_CHANGES.md](LIGHT_BRANCH_CHANGES.md)** — what changed vs the master branch
- **[DOCUMENTATION.md](DOCUMENTATION.md)** — plain-English user-facing guide (see note at top for outdated sections)
