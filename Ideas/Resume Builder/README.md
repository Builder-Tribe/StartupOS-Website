# PM Resume Studio

An interactive, no-build resume builder designed for Product Managers who want a polished, ATS-friendly resume.

## What it does

- Lets you tailor a PM resume to a target role and company type
- Encourages impact-oriented bullets with metrics and PM keywords
- Generates a single-column ATS-safe resume preview
- Scores ATS readiness based on sections, metrics, and keyword coverage
- Imports existing resume text and maps it into the PM template
- Saves progress in local storage
- Supports print-to-PDF export from the browser

## Run it

Open `index.html` in a browser, or start a local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Notes

- The resume preview intentionally uses standard headings like `Professional Summary`, `Professional Experience`, `Skills`, and `Education`
- Links are kept as plain text for better ATS compatibility
- For existing resumes, upload a text-based file or paste text copied from a PDF/DOCX document
- Export using the browser's print dialog and choose `Save as PDF`
