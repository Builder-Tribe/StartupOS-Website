const STORAGE_KEY = "pm-resume-studio-state";

const defaultState = {
  targetRole: "",
  companyType: "",
  jobKeywords: "",
  fullName: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  links: "",
  summary: "",
  skills: "",
  tools: "",
  domains: "",
  experience: [],
  projects: [],
  education: [],
  certifications: [],
};

const sampleState = {
  targetRole: "Senior Product Manager",
  companyType: "B2B SaaS / AI product company",
  jobKeywords:
    "product strategy, roadmap prioritization, user research, experimentation, analytics, SQL, stakeholder management, go-to-market, retention, AI products",
  fullName: "Aarav Mehta",
  headline: "Product Manager | Growth, Platform, and AI Experiences",
  email: "aarav.mehta@example.com",
  phone: "+91 98765 43210",
  location: "Bengaluru, India",
  links: "linkedin.com/in/aaravmehta | aaravmehta.dev",
  summary:
    "Product Manager with 5+ years leading growth and platform initiatives across SaaS and consumer products. Partnered with engineering, design, data, and GTM teams to launch user-centered features that increased activation, improved retention, and unlocked revenue expansion. Strong in roadmap prioritization, experimentation, analytics, and translating ambiguous business goals into measurable product outcomes.",
  skills:
    "Product strategy, roadmap prioritization, user research, customer discovery, A/B testing, stakeholder management, agile delivery, pricing, lifecycle optimization",
  tools: "SQL, Amplitude, Mixpanel, GA4, Jira, Confluence, Figma, Tableau",
  domains: "B2B SaaS, growth, monetization, AI copilots, platform products",
  experience: [
    {
      role: "Senior Product Manager",
      company: "Northstar Cloud",
      dates: "Jul 2022 - Present",
      location: "Bengaluru",
      bullets:
        "- Owned onboarding and activation roadmap for SMB segment, improving trial-to-paid conversion by 21% in 2 quarters\n- Led discovery with 35+ customers and partnered with design and engineering to ship a self-serve setup flow that reduced time-to-value from 4 days to 45 minutes\n- Built experimentation framework with analytics team, increasing experiment velocity by 3x and enabling weekly decision reviews\n- Launched AI-assisted workflow recommendations that drove 14% lift in weekly active usage",
    },
    {
      role: "Product Manager",
      company: "Pulse Commerce",
      dates: "Jan 2020 - Jun 2022",
      location: "Mumbai",
      bullets:
        "- Drove roadmap for merchant retention initiatives, reducing monthly churn by 11% through segmentation and lifecycle interventions\n- Partnered with finance and sales on packaging and pricing changes contributing $1.2M in expansion ARR\n- Coordinated GTM for inventory insights dashboard used by 2,000+ merchants within 90 days of launch",
    },
  ],
  projects: [
    {
      name: "AI Copilot for Support Teams",
      scope: "0 to 1 product launch",
      description:
        "Defined problem statement, prioritized MVP, and led pilot launch with 12 design partners. Reduced average ticket resolution time by 28% and generated a qualified pipeline for enterprise upsell.",
    },
    {
      name: "Pricing and Packaging Refresh",
      scope: "Monetization",
      description:
        "Synthesized customer interviews, usage data, and sales feedback to restructure plans and feature gates, improving plan clarity and expansion conversion.",
    },
  ],
  education: [
    {
      institution: "B.Tech University",
      degree: "B.Tech, Computer Science",
      dates: "2015 - 2019",
      details: "Graduated with distinction; product club lead",
    },
  ],
  certifications: [
    { name: "Product Analytics Micro-Certification", issuer: "Product School, 2024" },
    { name: "Google Project Management Certificate", issuer: "Google, 2023" },
  ],
};

const form = document.getElementById("resumeForm");
const preview = document.getElementById("resumePreview");
const atsScoreEl = document.getElementById("atsScore");
const scoreFillEl = document.getElementById("scoreFill");
const atsChecklistEl = document.getElementById("atsChecklist");
const resumeUploadInput = document.getElementById("resumeUpload");
const resumePasteInput = document.getElementById("resumePaste");
const importResumeBtn = document.getElementById("importResumeBtn");
const importStatusEl = document.getElementById("importStatus");

const lists = {
  experience: document.getElementById("experienceList"),
  projects: document.getElementById("projectsList"),
  education: document.getElementById("educationList"),
  certifications: document.getElementById("certificationList"),
};

const templates = {
  experience: document.getElementById("experienceTemplate"),
  projects: document.getElementById("projectTemplate"),
  education: document.getElementById("educationTemplate"),
  certifications: document.getElementById("certificationTemplate"),
};

const buttonMap = {
  experience: document.getElementById("addExperienceBtn"),
  projects: document.getElementById("addProjectBtn"),
  education: document.getElementById("addEducationBtn"),
  certifications: document.getElementById("addCertificationBtn"),
};

const emptyEntries = {
  experience: { role: "", company: "", dates: "", location: "", bullets: "" },
  projects: { name: "", scope: "", description: "" },
  education: { institution: "", degree: "", dates: "", details: "" },
  certifications: { name: "", issuer: "" },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseBulletLines(text) {
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*[-•]\s*/, "").trim())
    .filter(Boolean);
}

function parseKeywordList(text) {
  return text
    .split(/,|\n/)
    .map((word) => word.trim())
    .filter(Boolean);
}

function normalizeText(text) {
  return text.replace(/\r/g, "").replace(/\u2022/g, "•").replace(/\t/g, " ").trim();
}

function sectionKeyForHeading(line) {
  const normalized = line.toLowerCase().replace(/:$/, "").trim();
  const aliases = {
    summary: ["summary", "professional summary", "profile", "about", "objective"],
    experience: ["experience", "professional experience", "work experience", "employment", "work history"],
    projects: ["projects", "selected projects", "product wins"],
    skills: ["skills", "core competencies", "technical skills", "areas of expertise"],
    education: ["education", "academic background"],
    certifications: ["certifications", "licenses", "certificates"],
  };

  for (const [section, names] of Object.entries(aliases)) {
    if (names.includes(normalized)) return section;
  }

  return null;
}

function splitIntoSections(text) {
  const lines = normalizeText(text).split("\n");
  const sections = {
    preamble: [],
    summary: [],
    experience: [],
    projects: [],
    skills: [],
    education: [],
    certifications: [],
  };

  let current = "preamble";
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      sections[current].push("");
      return;
    }

    const nextSection = sectionKeyForHeading(trimmed);
    if (nextSection) {
      current = nextSection;
      return;
    }

    sections[current].push(trimmed);
  });

  return sections;
}

function extractContactInfo(text) {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone =
    text.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{3,5}[\s-]?\d{0,4}/)?.[0]?.trim() || "";
  const links = Array.from(
    new Set(
      (text.match(/(?:https?:\/\/|www\.|linkedin\.com\/in\/|github\.com\/|portfolio\.)[^\s|,;]+/gi) || []).map((item) =>
        item.replace(/[),.]+$/, "")
      )
    )
  ).join(" | ");

  return { email, phone, links };
}

function splitBlocks(lines) {
  return lines.join("\n").split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
}

function parseExperienceBlocks(lines) {
  return splitBlocks(lines).map((block) => {
    const blockLines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const bulletLines = blockLines.filter((line) => /^[-•]/.test(line));
    const descriptorLines = blockLines.filter((line) => !/^[-•]/.test(line));
    const header = descriptorLines[0] || "";
    const subheader = descriptorLines[1] || "";
    const dateLine = descriptorLines.find((line) => /\b(19|20)\d{2}\b|present|current/i.test(line)) || "";

    let role = header;
    let company = "";
    if (header.includes(" at ")) {
      [role, company] = header.split(/\s+at\s+/i);
    } else if (header.includes("|")) {
      [role, company] = header.split("|").map((part) => part.trim());
    } else if (subheader && subheader !== dateLine) {
      company = subheader;
    }

    const locationCandidate = descriptorLines.find(
      (line) => line !== header && line !== subheader && line !== dateLine && !/^[-•]/.test(line)
    );

    return {
      role: role.trim(),
      company: company.trim(),
      dates: dateLine.trim(),
      location: (locationCandidate || "").trim(),
      bullets: bulletLines.join("\n"),
    };
  });
}

function parseProjectBlocks(lines) {
  return splitBlocks(lines).map((block) => {
    const blockLines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const firstLine = blockLines[0] || "";
    const rest = blockLines.slice(1);
    const description = rest.join(" ");

    if (firstLine.includes("|")) {
      const [name, scope] = firstLine.split("|").map((part) => part.trim());
      return { name, scope, description };
    }

    return {
      name: firstLine,
      scope: "",
      description,
    };
  });
}

function parseEducationBlocks(lines) {
  return splitBlocks(lines).map((block) => {
    const blockLines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    return {
      institution: blockLines[0] || "",
      degree: blockLines[1] || "",
      dates: blockLines.find((line) => /\b(19|20)\d{2}\b/.test(line)) || "",
      details: blockLines.slice(2).join(" "),
    };
  });
}

function parseCertificationLines(lines) {
  return lines
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s[-|,]\s/);
      if (parts.length >= 2) {
        return { name: parts[0].trim(), issuer: parts.slice(1).join(", ").trim() };
      }
      return { name: line, issuer: "" };
    });
}

function inferSummaryFromPreamble(lines, name, headline) {
  return lines
    .filter((line) => line && line !== name && line !== headline)
    .filter((line) => !/@|linkedin|github|www\.|https?:\/\/|\+?\d/.test(line))
    .join(" ")
    .trim();
}

function inferSkills(text) {
  const pmLexicon = [
    "product strategy",
    "roadmap",
    "prioritization",
    "stakeholder management",
    "user research",
    "experimentation",
    "a/b testing",
    "sql",
    "analytics",
    "go-to-market",
    "retention",
    "activation",
    "monetization",
    "agile",
    "customer discovery",
    "jira",
    "figma",
    "amplitude",
    "mixpanel",
    "ga4",
  ];

  return pmLexicon.filter((term) => text.toLowerCase().includes(term)).join(", ");
}

function inferTargetRole(text) {
  const roleMatches = [
    "Director of Product",
    "Group Product Manager",
    "Senior Product Manager",
    "Lead Product Manager",
    "Product Manager",
    "Associate Product Manager",
  ];
  return roleMatches.find((role) => text.toLowerCase().includes(role.toLowerCase())) || "Product Manager";
}

function inferDomains(text) {
  const domainLexicon = ["AI products", "B2B SaaS", "fintech", "marketplace", "consumer products", "platform"];
  return domainLexicon.filter((term) => text.toLowerCase().includes(term.toLowerCase())).join(", ");
}

function parseImportedResume(text) {
  const normalized = normalizeText(text);
  const sections = splitIntoSections(normalized);
  const preamble = sections.preamble.filter(Boolean);
  const { email, phone, links } = extractContactInfo(normalized);
  const fullName = preamble[0] || "";
  const headline = preamble.find((line, index) => index > 0 && !/@|linkedin|github|www\.|https?:\/\/|\+?\d/.test(line)) || "";
  const summary = sections.summary.filter(Boolean).join(" ") || inferSummaryFromPreamble(preamble, fullName, headline);
  const skillsSection = sections.skills
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean)
    .join(", ");

  const inferredSkills = inferSkills(normalized);
  const importedState = {
    ...defaultState,
    targetRole: inferTargetRole(normalized),
    fullName,
    headline,
    email,
    phone,
    links,
    summary,
    skills: skillsSection || inferredSkills,
    tools: inferredSkills
      .split(", ")
      .filter((term) => ["sql", "jira", "figma", "amplitude", "mixpanel", "ga4"].includes(term))
      .join(", "),
    domains: inferDomains(normalized),
    experience: parseExperienceBlocks(sections.experience).filter(
      (item) => item.role || item.company || item.bullets
    ),
    projects: parseProjectBlocks(sections.projects).filter((item) => item.name || item.description),
    education: parseEducationBlocks(sections.education).filter((item) => item.institution || item.degree),
    certifications: parseCertificationLines(sections.certifications),
  };

  if (!importedState.projects.length && importedState.experience.length > 1) {
    importedState.projects = importedState.experience
      .slice(0, 2)
      .map((item) => ({
        name: `${item.role || "Product"} Initiative`,
        scope: item.company,
        description: parseBulletLines(item.bullets).slice(0, 2).join(" "),
      }))
      .filter((item) => item.description);
  }

  if (!importedState.summary) {
    importedState.summary =
      "Product Manager focused on customer problems, cross-functional execution, and measurable business impact.";
  }

  if (!importedState.jobKeywords) {
    importedState.jobKeywords =
      "product strategy, roadmap prioritization, user research, experimentation, analytics, stakeholder management, go-to-market, retention";
  }

  if (!importedState.experience.length) importedState.experience = [emptyEntries.experience];
  if (!importedState.education.length) importedState.education = [emptyEntries.education];
  if (!importedState.certifications.length) importedState.certifications = [emptyEntries.certifications];
  if (!importedState.projects.length) importedState.projects = [emptyEntries.projects];

  return importedState;
}

function createEntryCard(type, data = {}) {
  const node = templates[type].content.firstElementChild.cloneNode(true);
  const inputs = node.querySelectorAll("input, textarea");

  inputs.forEach((input) => {
    input.value = data[input.name] || "";
    input.addEventListener("input", handleInput);
  });

  node.querySelector(".remove-entry").addEventListener("click", () => {
    node.remove();
    sync();
  });

  return node;
}

function collectEntries(container) {
  return Array.from(container.children).map((card) => {
    const values = {};
    card.querySelectorAll("input, textarea").forEach((field) => {
      values[field.name] = field.value.trim();
    });
    return values;
  });
}

function getState() {
  const state = { ...defaultState };
  Array.from(form.elements).forEach((field) => {
    if (!field.name) return;
    state[field.name] = field.value.trim();
  });

  state.experience = collectEntries(lists.experience);
  state.projects = collectEntries(lists.projects);
  state.education = collectEntries(lists.education);
  state.certifications = collectEntries(lists.certifications);

  return state;
}

function setSimpleFields(state) {
  Object.entries(state).forEach(([key, value]) => {
    if (Array.isArray(value)) return;
    const field = form.elements.namedItem(key);
    if (field) field.value = value;
  });
}

function renderEntries(state) {
  Object.keys(lists).forEach((type) => {
    lists[type].innerHTML = "";
    const entries = state[type] && state[type].length ? state[type] : [emptyEntries[type]];
    entries.forEach((entry) => {
      lists[type].appendChild(createEntryCard(type, entry));
    });
  });
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return null;
  }
}

function renderResume(state) {
  const hasContent = state.fullName || state.summary || state.experience.some((item) => item.role || item.company);

  if (!hasContent) {
    preview.innerHTML = `
      <div class="placeholder-state">
        <div>
          <h3>Your resume preview will appear here</h3>
          <p>Start with your name, target PM role, and impact-focused experience.</p>
        </div>
      </div>
    `;
    return;
  }

  const contactBits = [state.email, state.phone, state.location, state.links].filter(Boolean);
  const experienceHtml = state.experience
    .filter((item) => item.role || item.company || item.bullets)
    .map((item) => {
      const bullets = parseBulletLines(item.bullets);
      return `
        <div class="resume-item">
          <div class="resume-item-header">
            <span>${escapeHtml(item.role || "Product Role")}</span>
            <span>${escapeHtml(item.dates || "")}</span>
          </div>
          <div class="resume-item-subheader">
            <span>${escapeHtml(item.company || "")}</span>
            <span>${escapeHtml(item.location || "")}</span>
          </div>
          ${bullets.length ? `<ul class="resume-bullets">${bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}
        </div>
      `;
    })
    .join("");

  const projectHtml = state.projects
    .filter((item) => item.name || item.description)
    .map(
      (item) => `
        <div class="resume-item">
          <div class="resume-item-header">
            <span>${escapeHtml(item.name || "Project")}</span>
            <span>${escapeHtml(item.scope || "")}</span>
          </div>
          <ul class="resume-project">
            <li>${escapeHtml(item.description || "")}</li>
          </ul>
        </div>
      `
    )
    .join("");

  const educationHtml = state.education
    .filter((item) => item.institution || item.degree)
    .map(
      (item) => `
        <div class="resume-item">
          <div class="resume-item-header">
            <span>${escapeHtml(item.institution || "")}</span>
            <span>${escapeHtml(item.dates || "")}</span>
          </div>
          <div class="resume-item-subheader">
            <span>${escapeHtml(item.degree || "")}</span>
            <span>${escapeHtml(item.details || "")}</span>
          </div>
        </div>
      `
    )
    .join("");

  const certifications = state.certifications
    .filter((item) => item.name || item.issuer)
    .map((item) => `${item.name}${item.issuer ? `, ${item.issuer}` : ""}`)
    .filter(Boolean);

  const skillsLine = [state.skills, state.tools && `Tools: ${state.tools}`, state.domains && `Domains: ${state.domains}`]
    .filter(Boolean)
    .join(" | ");

  preview.innerHTML = `
    <header class="resume-header">
      <h1 class="resume-name">${escapeHtml(state.fullName || "Your Name")}</h1>
      <p class="resume-title">${escapeHtml(state.headline || state.targetRole || "Product Manager")}</p>
      <p class="resume-meta">${escapeHtml(contactBits.join(" | "))}</p>
    </header>
    ${state.summary ? `<section class="resume-section"><h3>Professional Summary</h3><p>${escapeHtml(state.summary)}</p></section>` : ""}
    ${experienceHtml ? `<section class="resume-section"><h3>Professional Experience</h3>${experienceHtml}</section>` : ""}
    ${projectHtml ? `<section class="resume-section"><h3>Selected Projects</h3>${projectHtml}</section>` : ""}
    ${skillsLine ? `<section class="resume-section"><h3>Skills</h3><p class="resume-inline-list">${escapeHtml(skillsLine)}</p></section>` : ""}
    ${educationHtml ? `<section class="resume-section"><h3>Education</h3>${educationHtml}</section>` : ""}
    ${certifications.length ? `<section class="resume-section"><h3>Certifications</h3><p class="resume-inline-list">${escapeHtml(certifications.join(" | "))}</p></section>` : ""}
  `;
}

function scoreResume(state) {
  const checks = [];
  let score = 0;

  if (state.fullName && state.email && state.phone) {
    score += 12;
    checks.push("Contact details are present.");
  } else {
    checks.push("Add full contact details for recruiter accessibility.");
  }

  if (state.targetRole) {
    score += 10;
    checks.push("Target role is clearly defined.");
  } else {
    checks.push("Set a specific PM target role to sharpen positioning.");
  }

  if (state.summary.length >= 90) {
    score += 12;
    checks.push("Professional summary is substantial.");
  } else {
    checks.push("Expand the summary with PM scope, customer focus, and outcomes.");
  }

  const bullets = state.experience.flatMap((item) => parseBulletLines(item.bullets));
  if (bullets.length >= 4) {
    score += 14;
    checks.push("Experience section includes enough impact bullets.");
  } else {
    checks.push("Add more experience bullets with measurable product impact.");
  }

  const quantifiedBullets = bullets.filter((bullet) => /\d/.test(bullet));
  if (quantifiedBullets.length >= 3) {
    score += 18;
    checks.push("Quantified achievements are strong.");
  } else {
    checks.push("Use numbers in more bullets: growth, retention, revenue, time saved, or adoption.");
  }

  const keywordList = parseKeywordList(state.jobKeywords);
  const haystack = [
    state.summary,
    state.skills,
    state.tools,
    state.domains,
    ...bullets,
    ...state.projects.map((item) => `${item.name} ${item.scope} ${item.description}`),
  ]
    .join(" ")
    .toLowerCase();
  const matchedKeywords = keywordList.filter((keyword) => haystack.includes(keyword.toLowerCase()));

  if (keywordList.length) {
    score += Math.min(16, matchedKeywords.length * 2);
    checks.push(
      matchedKeywords.length
        ? `${matchedKeywords.length}/${keywordList.length} target keywords appear in the resume.`
        : "Add job-specific PM keywords so ATS systems can match your resume better."
    );
  } else {
    checks.push("Paste keywords from the target job description for ATS optimization.");
  }

  const standardSections = [
    state.summary && "summary",
    state.experience.some((item) => item.role || item.company) && "experience",
    (state.skills || state.tools || state.domains) && "skills",
    state.education.some((item) => item.institution || item.degree) && "education",
  ].filter(Boolean);

  if (standardSections.length >= 4) {
    score += 10;
    checks.push("Standard ATS-friendly resume sections are covered.");
  } else {
    checks.push("Include the core ATS sections: summary, experience, skills, and education.");
  }

  if (state.links && !/https?:\/\//i.test(state.links) && state.links.length > 5) {
    score += 4;
    checks.push("Links are written in plain text, which is ATS-safe.");
  } else if (state.links) {
    score += 2;
    checks.push("Links are included.");
  } else {
    checks.push("Add LinkedIn or portfolio links in plain text.");
  }

  return { score: Math.min(100, score), checks };
}

function renderScore(state) {
  const { score, checks } = scoreResume(state);
  atsScoreEl.textContent = String(score);
  scoreFillEl.style.width = `${score}%`;
  atsChecklistEl.innerHTML = checks.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function sync() {
  const state = getState();
  saveState(state);
  renderResume(state);
  renderScore(state);
}

function hydrate(state) {
  setSimpleFields(state);
  renderEntries(state);
  sync();
}

function handleInput() {
  sync();
}

form.addEventListener("input", handleInput);

Object.entries(buttonMap).forEach(([type, button]) => {
  button.addEventListener("click", () => {
    lists[type].appendChild(createEntryCard(type, emptyEntries[type]));
    sync();
  });
});

document.getElementById("loadSampleBtn").addEventListener("click", () => {
  hydrate(sampleState);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  hydrate(defaultState);
});

document.getElementById("printBtn").addEventListener("click", () => {
  window.print();
});

async function readUploadedFile(file) {
  return file.text();
}

importResumeBtn.addEventListener("click", async () => {
  const pastedText = resumePasteInput.value.trim();
  const file = resumeUploadInput.files?.[0];

  if (!pastedText && !file) {
    importStatusEl.textContent = "Paste resume text or upload a .txt, .md, or .rtf file first.";
    return;
  }

  try {
    importStatusEl.textContent = "Importing your resume and reshaping it into the PM template...";
    const fileText = file ? await readUploadedFile(file) : "";
    const parsedState = parseImportedResume(pastedText || fileText);
    hydrate(parsedState);
    importStatusEl.textContent =
      "Resume imported. Review the extracted fields and tighten bullets with PM metrics if needed.";
  } catch {
    importStatusEl.textContent =
      "I couldn't parse that file cleanly. Try a plain text upload or paste text copied from your current resume.";
  }
});

hydrate(loadSavedState() || sampleState);
