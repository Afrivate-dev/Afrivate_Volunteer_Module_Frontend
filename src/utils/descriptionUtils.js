/**
 * Utility functions for combining and parsing multi-section opportunity descriptions.
 * Since the backend only has a single `description` field, we embed multiple sections
 * using markers that can be parsed back out for display.
 */

const SECTION_MARKERS = {
  DESCRIPTION: "[DESCRIPTION]",
  KEY_RESPONSIBILITIES: "[KEY_RESPONSIBILITIES]",
  REQUIREMENTS_BENEFITS: "[REQUIREMENTS_BENEFITS]",
  ABOUT_COMPANY: "[ABOUT_COMPANY]",
  APPLICATION_INSTRUCTIONS: "[APPLICATION_INSTRUCTIONS]",
  LOCATION: "[LOCATION]",
  WORK_MODEL: "[WORK_MODEL]",
  TIME_COMMITMENT: "[TIME_COMMITMENT]",
  CUSTOM_QUESTIONS: "[CUSTOM_QUESTIONS]",
};

/**
 * Combines multiple sections into a single description string with markers.
 * @param {Object} sections - Object containing the section values
 * @returns {string} Combined description string
 */
export function combineDescription(sections) {
  const {
    description = "",
    keyResponsibilities = "",
    requirementsBenefits = "",
    aboutCompany = "",
    applicationInstructions = "",
    location = "",
    workModel = "",
    timeCommitment = "",
    customQuestions = [],
  } = sections;

  const parts = [];

  if (description.trim()) {
    parts.push(`${SECTION_MARKERS.DESCRIPTION}\n${description.trim()}`);
  }
  if (keyResponsibilities.trim()) {
    parts.push(`${SECTION_MARKERS.KEY_RESPONSIBILITIES}\n${keyResponsibilities.trim()}`);
  }
  if (requirementsBenefits.trim()) {
    parts.push(`${SECTION_MARKERS.REQUIREMENTS_BENEFITS}\n${requirementsBenefits.trim()}`);
  }
  if (aboutCompany.trim()) {
    parts.push(`${SECTION_MARKERS.ABOUT_COMPANY}\n${aboutCompany.trim()}`);
  }
  if (applicationInstructions.trim()) {
    parts.push(`${SECTION_MARKERS.APPLICATION_INSTRUCTIONS}\n${applicationInstructions.trim()}`);
  }
  if (location.trim()) {
    parts.push(`${SECTION_MARKERS.LOCATION}\n${location.trim()}`);
  }
  if (workModel.trim()) {
    parts.push(`${SECTION_MARKERS.WORK_MODEL}\n${workModel.trim()}`);
  }
  if (timeCommitment.trim()) {
    parts.push(`${SECTION_MARKERS.TIME_COMMITMENT}\n${timeCommitment.trim()}`);
  }
  if (Array.isArray(customQuestions) && customQuestions.length > 0) {
    parts.push(`${SECTION_MARKERS.CUSTOM_QUESTIONS}\n${JSON.stringify(customQuestions)}`);
  }

  return parts.join("\n\n") || "See details.";
}

/**
 * Parses a combined description string back into separate sections.
 * @param {string} combinedDescription - The combined description from API
 * @returns {Object} Object with parsed sections
 */
export function parseDescription(combinedDescription) {
  const result = {
    description: "",
    keyResponsibilities: "",
    requirementsBenefits: "",
    aboutCompany: "",
    applicationInstructions: "",
    location: "",
    workModel: "",
    timeCommitment: "",
    customQuestions: [],
  };

  if (!combinedDescription || typeof combinedDescription !== "string") {
    return result;
  }

  const hasMarkers = Object.values(SECTION_MARKERS).some((marker) =>
    combinedDescription.includes(marker)
  );

  if (!hasMarkers) {
    result.description = combinedDescription.trim();
    return result;
  }

  const extractSection = (marker) => {
    const startIndex = combinedDescription.indexOf(marker);
    if (startIndex === -1) return "";

    const contentStart = startIndex + marker.length;
    let contentEnd = combinedDescription.length;

    for (const m of Object.values(SECTION_MARKERS)) {
      if (m === marker) continue;
      const nextIndex = combinedDescription.indexOf(m, contentStart);
      if (nextIndex !== -1 && nextIndex < contentEnd) {
        contentEnd = nextIndex;
      }
    }

    return combinedDescription.substring(contentStart, contentEnd).trim();
  };

  result.description = extractSection(SECTION_MARKERS.DESCRIPTION);
  result.keyResponsibilities = extractSection(SECTION_MARKERS.KEY_RESPONSIBILITIES);
  result.requirementsBenefits = extractSection(SECTION_MARKERS.REQUIREMENTS_BENEFITS);
  result.aboutCompany = extractSection(SECTION_MARKERS.ABOUT_COMPANY);
  result.applicationInstructions = extractSection(SECTION_MARKERS.APPLICATION_INSTRUCTIONS);
  result.location = extractSection(SECTION_MARKERS.LOCATION);
  result.workModel = extractSection(SECTION_MARKERS.WORK_MODEL);
  result.timeCommitment = extractSection(SECTION_MARKERS.TIME_COMMITMENT);
  const rawQuestions = extractSection(SECTION_MARKERS.CUSTOM_QUESTIONS);
  if (rawQuestions) {
    try {
      result.customQuestions = JSON.parse(rawQuestions);
    } catch (_) {
      result.customQuestions = [];
    }
  }

  return result;
}

/**
 * Creates a safe URL link from opportunity details.
 * Format: job-type-job-title-company
 * @param {string} title - The opportunity title
 * @param {string} opportunityType - The opportunity type (e.g., "volunteering")
 * @param {string} company - The company/organization name
 * @returns {string} A valid URL
 */
export function createOpportunityLink(title, opportunityType = "", company = "") {
  const createSlug = (text) => {
    if (!text || typeof text !== "string") return "";
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const typeSlug = createSlug(opportunityType) || "opportunity";
  const titleSlug = createSlug(title);
  const companySlug = createSlug(company);

  const parts = [typeSlug, titleSlug, companySlug].filter(Boolean);
  const slug = parts.join("-");

  if (!slug) return "https://afrivate.com";
  return `https://afrivate.com/${encodeURIComponent(slug)}`.substring(0, 200);
}

/**
 * Formats text content to render bullet points, numbered lists, and line breaks.
 * Returns an array of React elements for rendering.
 * @param {string} text - The text to format
 * @returns {Array} Array of formatted elements
 */
export function formatTextContent(text) {
  if (!text || typeof text !== "string") return [];

  const lines = text.split("\n");
  const elements = [];
  let currentListType = null;
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      if (currentListType === "ul") {
        elements.push({ type: "ul", items: [...listItems], key: `ul-${elements.length}` });
      } else if (currentListType === "ol") {
        elements.push({ type: "ol", items: [...listItems], key: `ol-${elements.length}` });
      }
      listItems = [];
      currentListType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Check for bullet points (-, *, •)
    const bulletMatch = trimmedLine.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      if (currentListType !== "ul") {
        flushList();
        currentListType = "ul";
      }
      listItems.push(bulletMatch[1]);
      continue;
    }

    // Check for numbered lists (1., 2., etc.)
    const numberMatch = trimmedLine.match(/^(\d+)[.)]\s+(.+)$/);
    if (numberMatch) {
      if (currentListType !== "ol") {
        flushList();
        currentListType = "ol";
      }
      listItems.push(numberMatch[2]);
      continue;
    }

    // Regular text - flush any pending list first
    flushList();

    if (trimmedLine === "") {
      elements.push({ type: "br", key: `br-${elements.length}` });
    } else {
      elements.push({ type: "p", content: trimmedLine, key: `p-${elements.length}` });
    }
  }

  // Flush any remaining list
  flushList();

  return elements;
}
