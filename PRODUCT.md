# Rutgers CS Student Guide

A minimal, newspaper-styled, responsive CS student workspace built with React, Vinext, and Cloudflare Workers.

## Implemented

- Nine routes: application tracker, live internship directory, video project tutorials, AI literacy, Git literacy, resumes, Blind 75 coding practice, Rutgers–New Brunswick course planner, and CS clubs.
- Applications: create, edit, remove, search, status filter, dates, notes, and source links.
- ChatGPT prototype sign-in via hosting-provided identity. Local development offers a simulated account. Google OAuth is intentionally deferred, as agreed.
- D1 stores one private workspace per server-authenticated user. User IDs never come from the request body. Origin checks protect writes; input schemas limit accepted data. No browser storage is used for durable user records.
- Projects, course completion, and recent practice submissions persist per account.
- Live opportunities come from Simplify/Pitt CSC active, visible listings, with attribution, fetch time, category/location search, pagination, and failure states. Coverage is not exhaustive; employer status may change before the feed updates.
- The exact Jake’s Resume starter source from the user-selected Overleaf template (MIT), retaining its original layout and sample content, account-saved source, real browser pdfLaTeX compilation via SwiftLaTeX, PDF.js preview, .tex/PDF downloads, logs, stale-preview labels, and a 60-second worker cutoff. TeX packages come from texlive.texlyre.org; resume content stays in the browser during compilation. The original starter downloads remain available.
- All 75 Blind 75 problems have independently written prompts, examples, hints, and cases. JavaScript, Python, Java, and C++ programs execute in Wandbox sandboxes, never on the app host. Server-owned cases use language-specific node adapters, order-aware grading, compilation diagnostics, and persistent per-account rate limits. Saved submissions include their language; solved IDs survive history truncation. This is practice feedback, not certification or a competitive judge.
- Rutgers planner covers nine core courses, all 55 currently approved electives, and eight accepted B.S. science sequences. Inline course details include credits, summaries, prerequisites, and sources. Planned/in-progress/completed statuses, degree selection, accepted transfer credit, independent-study approval, awarded-credit overrides, and graduation confirmations persist per account. Degree-credit and major-checklist percentages are separate; elective slots enforce department/level distribution and the independent-study cap. This is a self-reported planner, not an official degree audit.
- Every account is free. The server-controlled `plan` column is reserved for future entitlements. No checkout or billing integration is present.

## Next iteration

Connect Google sign-in through a supported external auth path; add server-side session verification before exposing it. Expand the college catalog, add a managed isolated multi-language judge if needed, and add broader job feeds. A competitive judge would require a dedicated execution service and broader hidden-case coverage.

## Run

Install with `npm run install:ci`; start with `npm run dev`. Build with `npm run build`; type-check with `npx tsc --noEmit`. Generate schema migrations with `npm run db:generate`. Local DB migration instructions are in README.md. Production migrations are packaged and applied by Sites.

## Sources

Course content links to Rutgers official requirements, synopses, and track guides. AI literacy is a seven-section written Claude Code course with deep-linkable lessons, copyable commands, an original Python regression-test exercise, answer disclosures, and official documentation links. Git literacy adds eight written sections with local repository exercises, branching, a reproducible conflict, GitHub pull requests, undo workflows, and checkpoints. Project tutorials link to freeCodeCamp. Clubs use the official Rutgers CS directory and club websites. The Rutgers mark comes from rutgers.edu; the app identifies itself as an unofficial student guide. Opportunity records retain original application URLs and source attribution. Reviewed September 29, 2026.

## Interface

Pages prioritize task controls and content. Decorative mastheads, slogans, subtitles, and promotional links are removed. Tutorial prerequisites and exercises, LaTeX help, and degree notes are available in collapsed disclosures.

Navigation uses normal anchors because the production Vinext client router fails during prefetch and navigation. Each destination loads server-rendered content; account state reloads from D1, and the resume editor’s existing unsaved-draft warning remains active.
