# Fieldnotes

A dark, responsive CS student workspace built with React, Vinext, and Cloudflare Workers.

## Implemented

- Seven routes: application tracker, live internship directory, project briefs, AI literacy, resumes, JavaScript coding practice, and Rutgers–New Brunswick course planner.
- Applications: create, edit, remove, search, status filter, dates, notes, and source links.
- ChatGPT prototype sign-in via hosting-provided identity. Local development offers a simulated account. Google OAuth is intentionally deferred, as agreed.
- D1 stores one private workspace per server-authenticated user. User IDs never come from the request body. Origin checks protect writes; input schemas limit accepted data. No browser storage is used for durable user records.
- Projects, course completion, and recent practice submissions persist per account.
- Live opportunities come from Simplify/Pitt CSC active, visible listings, with attribution, fetch time, category/location search, pagination, and failure states. Coverage is not exhaustive; employer status may change before the feed updates.
- Two original LaTeX and plain-text resume templates.
- JavaScript practice runs in a sandboxed opaque-origin iframe and a terminable worker with network blocked by CSP. This is a learning checker, not a trusted competitive judge. Saved results are client-reported. Never use them for credentials or paid contests.
- Rutgers catalog is a sourced core plus selected elective checklist, not a full degree audit. Prerequisites and current term availability are linked to official sources.
- Every account is free. The server-controlled `plan` column is reserved for future entitlements. No checkout or billing integration is present.

## Next iteration

Connect Google sign-in through a supported external auth path; add server-side session verification before exposing it. Expand the college catalog, add a managed isolated multi-language judge if needed, and add broader job feeds. Production judging requires stronger resource limits and server-verified results.

## Run

Install with `npm run install:ci`; start with `npm run dev`. Build with `npm run build`; type-check with `npx tsc --noEmit`. Generate schema migrations with `npm run db:generate`. Local DB migration instructions are in README.md. Production migrations are packaged and applied by Sites.

## Sources

Course content links to Rutgers official requirements, synopses, and track guides. AI cards link to vendor websites. Opportunity records retain original application URLs and source attribution. Reviewed September 27, 2026.
