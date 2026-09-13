# Afrivate Opportunities & Applications API Specification

**Base URLs:**
- Opportunities: `/api/opportunities/`
- Applications: `/api/applications/`

**Date:** April 2026

---

## OPPORTUNITIES API

### 1. BROWSE ALL OPPORTUNITIES (Public)

**Endpoint:** `GET /api/opportunities/`

**Auth required:** No (public endpoint)

**Query parameters:**
- `?opportunity_type=job` — Filter by type (job, internship, volunteering)
- `?is_open=true` — Filter by status
- `?search=marketing` — Search title and description
- `?page=2` — Page number (for pagination)
- `?page_size=20` — Items per page (max 100)

**Example:** `/api/opportunities/?opportunity_type=internship&is_open=true`

**Response (200):**
```json
{
  "count": 48,
  "next": ".../api/opportunities/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Marketing Intern at TechCorp",
      "opportunity_type": "internship",
      "description": "...",
      "link": "https://techcorp.africa/apply",
      "posted_at": "2026-04-01T10:00:00Z",
      "is_open": true,
      "created_by": 5,
      "created_by_name": "TechCorp Africa"
    }
  ]
}
```

---

### 2. VIEW SINGLE OPPORTUNITY (Public)

**Endpoint:** `GET /api/opportunities/<id>/`

**Auth required:** No

**Response (200):** Single opportunity object (same structure as above)

---

### 3. POST AN OPPORTUNITY (Enabler only)

**Endpoint:** `POST /api/opportunities/`

**Auth required:** Yes (Enabler role only)

**Request body:**
```json
{
  "title": "Volunteer Community Manager",
  "opportunity_type": "volunteering",
  "description": "We need a passionate community manager...",
  "link": "https://ourorg.africa/volunteer"
}
```

**Validation rules:**
- `link` must start with `https://`
- `opportunity_type` must be one of: `job`, `internship`, `volunteering`
- All fields are required

**Response (201):** Created opportunity object

**Error responses:**
- `403` — Pathfinder trying to post (unauthorized role)
- `400` — Link is not HTTPS
- `400` — Missing required fields

---

### 4. EDIT AN OPPORTUNITY (Enabler only, within 12 hours of posting)

**Endpoint:** `PATCH /api/opportunities/<id>/`

**Auth required:** Yes (must be the creator)

**Request body (only include fields to update):**
```json
{
  "description": "Updated description..."
}
```

**Response (200):** Updated opportunity object

**Error responses:**
- `400` — Edit window has closed (12 hours passed)
- `403` — Not the creator

---

### 5. DELETE AN OPPORTUNITY (Enabler only)

**Endpoint:** `DELETE /api/opportunities/<id>/`

**Auth required:** Yes (must be the creator)

**Response (no applicants):** `204 No Content`

**Response (has applicants):**
```json
{
  "message": "Opportunity has applicants and cannot be deleted. It has been closed instead."
}
```

**Note:** Opportunities with existing applicants cannot be deleted; they are closed instead.

---

### 6. MY POSTED OPPORTUNITIES (Enabler only)

**Endpoint:** `GET /api/opportunities/mine/`

**Auth required:** Yes (Enabler)

**Response (200):** Array of opportunities posted by the logged-in enabler

---

### 7. LIST APPLICANTS FOR AN OPPORTUNITY (Enabler only)

**Endpoint:** `GET /api/opportunities/<id>/applicants/`

**Auth required:** Yes (must be the opportunity creator)

**Response (200):**
```json
[
  {
    "id": 1,
    "applicant_id": 42,
    "username": "jane_doe",
    "email": "jane@gmail.com",
    "status": "pending",
    "cover_letter": "Dear Hiring Manager...",
    "applied_at": "2026-04-02T14:30:00Z",
    "resume": "https://res.cloudinary.com/..."
  }
]
```

---

### 8. VIEW AN APPLICANT'S FULL PROFILE (Enabler only)

**Endpoint:** `GET /api/opportunities/<id>/applicants/<applicant_id>/`

**Auth required:** Yes (must be the opportunity creator)

**Response (200):** Full pathfinder profile including:
- Skills
- Education
- Certifications
- Credentials

---

## APPLICATIONS API

### 9. SUBMIT AN APPLICATION (Pathfinder only)

**Endpoint:** `POST /api/applications/`

**Auth required:** Yes (Pathfinder role only)

**Option A — JSON with existing credential as resume:**
```json
{
  "opportunity": 1,
  "cover_letter": "Dear Hiring Manager, I am excited to apply...",
  "profile_resume": 3
}
```

**Option B — Multipart/form-data with resume file upload:**
```
POST /api/applications/
Content-Type: multipart/form-data

opportunity: 1
cover_letter: Dear Hiring Manager...
resume: [PDF file]
```

**Field definitions:**
- `opportunity` (required, int) — ID of the opportunity to apply for
- `cover_letter` (optional, string) — Applicant's cover letter
- `profile_resume` (optional, int) — ID of a credential the pathfinder already uploaded to their profile
- `resume` (optional for file upload) — PDF file to upload

**Note:** Either `profile_resume` or file `resume` can be provided, not both.

**Response (201):** Created application object

**Error responses:**
- `400` — Pathfinder has already applied to this opportunity
- `400` — Opportunity is closed
- `403` — Enabler trying to apply (unauthorized role)

---

### 10. LIST MY APPLICATIONS

**Endpoint:** `GET /api/applications/`

**Auth required:** Yes

**Response (200):** Array of applications

**User context:**
- **Pathfinder:** Returns all applications they submitted
- **Enabler:** Returns all applications received for their opportunities

**Application status values:**
- `pending` — Not yet reviewed (yellow badge)
- `accepted` — Accepted (green badge)
- `rejected` — Rejected (red badge)

---

### 11. WITHDRAW AN APPLICATION (Pathfinder only)

**Endpoint:** `DELETE /api/applications/<id>/`

**Auth required:** Yes (must be the applicant)

**Response (204):** No Content

**Error responses:**
- `400` — Cannot withdraw once accepted or rejected

**Note:** Only allow the Withdraw button if status is still `pending`.

---

### 12. ACCEPT OR REJECT AN APPLICATION (Enabler only)

**Endpoint:** `PATCH /api/applications/<id>/change_status/`

**Auth required:** Yes (Enabler, must own the opportunity)

**Request body:**
```json
{
  "status": "accepted"
}
```

Or:

```json
{
  "status": "rejected"
}
```

**Response (200):**
```json
{
  "message": "Application marked as accepted"
}
```

**Error responses:**
- `400` — Invalid status value

---

## KEY BUSINESS RULES

1. **A pathfinder cannot apply to the same opportunity twice** — Backend validates this on application create
2. **Only Pathfinders can apply; only Enablers can post** — Role-based authorization on relevant endpoints
3. **Deleting an opportunity with existing applicants closes it instead** — DELETE returns 200 with message instead of 204
4. **Opportunity links must be HTTPS** — Validated on POST/PATCH
5. **Opportunities can only be edited within 12 hours of posting** — Backend enforces this window
6. **Only the enabler who posted the opportunity can view its applicants or change application status** — Ownership check required
7. **Cover letter is optional when applying** — Pathfinders can submit applications without coverage letters
8. **Applications cannot be withdrawn once accepted or rejected** — Only pending applications can be withdrawn

---

## Integration Guide (Frontend)

### Using the API Client (src/services/api.js)

**Browse Opportunities:**
```javascript
const opportunities = await opportunities.list({ 
  opportunity_type: 'internship', 
  is_open: true, 
  search: 'marketing',
  page: 1,
  page_size: 20 
});
```

**Get Single Opportunity:**
```javascript
const opportunity = await opportunities.get(1);
```

**Post Opportunity (Enabler):**
```javascript
const newOpp = await opportunities.create({
  title: "Community Manager",
  opportunity_type: "volunteering",
  description: "...",
  link: "https://..."
});
```

**Apply with Profile Resume:**
```javascript
const app = await applications.create({
  opportunity: 1,
  cover_letter: "...",
  profile_resume: 3
});
```

**Apply with File Upload:**
```javascript
const formData = new FormData();
formData.append('opportunity', 1);
formData.append('cover_letter', 'Dear Hiring Manager...');
formData.append('resume', fileInput.files[0]);

const app = await applications.create(formData);
```

**Get My Applications:**
```javascript
const myApps = await applications.list();
```

**Withdraw Application:**
```javascript
await applications.withdraw(applicationId);
```

**Accept/Reject Application (Enabler):**
```javascript
await applications.updateStatus(applicationId, { 
  status: 'accepted' 
});

await applications.updateStatus(applicationId, { 
  status: 'rejected' 
});
```

**Get Applicants for Opportunity (Enabler):**
```javascript
const applicants = await opportunities.applicantsList(opportunityId);
```

**View Applicant Profile (Enabler):**
```javascript
const profile = await opportunities.getApplicant(opportunityId, applicantId);
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK / Success |
| `201` | Created (new resource created) |
| `204` | No Content (successful delete with no response body) |
| `400` | Bad Request (validation error or conflict) |
| `403` | Forbidden (authorization error, wrong role) |
| `404` | Not Found (resource does not exist) |
| `401` | Unauthorized (not logged in or token expired) |

---

## Error Response Format

All error responses follow this format:

```json
{
  "detail": "Error message here"
}
```

Or for validation errors:

```json
{
  "field_name": ["Error message", "Another error"]
}
```

Frontend should use `getApiErrorMessage()` from `src/services/api.js` to extract user-friendly error text.
