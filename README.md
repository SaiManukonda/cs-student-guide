# CS Student Guide

A minimal workspace for computer science students at Rutgers–New Brunswick, UMD–College Park, UIUC, Georgia Tech, and Virginia Tech. New accounts must select a university before entering the workspace; the sidebar allows switching later.

**[Open the website](https://cs-fieldnotes.nappingexpert.chatgpt.site)** · ChatGPT sign-in required

## Features

- **Application tracker:** save roles, update statuses, and keep notes.
- **Opportunity board:** searchable internship listings from Simplify and Pitt CSC.
- **Project library:** video walkthroughs with prerequisites and exercises.
- **AI literacy:** a seven-section written Claude Code course with a Python practice project.
- **Git literacy:** an eight-section written course with branching, merge conflicts, GitHub collaboration, and undo exercises.
- **Resume studio:** Jake’s Resume LaTeX template, browser compilation, PDF preview, and saved drafts.
- **Coding practice:** all 75 Blind 75 questions, searchable by topic and difficulty, with JavaScript, Python, Java, and C++ execution and saved submission history.
- **Course planner:** School-specific catalogs, course statuses, earned-credit progress and graduation checklists. Rutgers retains its B.S./B.A. audit and 55 approved electives. New schools have foundation checklists and separate saved plans; Georgia Tech includes all 36 two-Thread curriculum combinations. UMD covers the general track, UIUC the Grainger CS B.S., and Virginia Tech the CS major. These planners do not certify graduation eligibility.
- **CS clubs:** University-specific organizations and official directories.

Saved applications, resume drafts, bookmarks, course checklists, and practice submissions belong to each signed-in account. All features are currently free.

## Stack

React 19, TypeScript, Vinext/Vite, Tailwind CSS, Radix UI, Cloudflare Workers, and D1. Resume compilation uses SwiftLaTeX with PDF.js for display.

## Run locally

Requires Node.js 22.13+ (a supported LTS version is recommended), npm, and Git.

```sh
git clone https://github.com/SaiManukonda/cs-student-guide.git
cd cs-student-guide
npm run install:ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_dry_wind_dancer.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_happy_stepford_cuckoos.sql
npm run dev
```

Open the URL printed by the development server, normally `http://localhost:5173`. Local development provides a simulated ChatGPT account; it does not require production credentials. Apply both migrations once per new local database. Existing checkouts need only the new migration.

```sh
node tests/practice.mjs # Practice catalog and grading checks
node tests/practice-expanded.mjs # Expanded fixtures and cross-language checks
node tests/courses.mjs  # Degree progress and catalog checks
npx tsc --noEmit   # Type-check
npm run build     # Production Worker build
```

`npm start` previews the production Worker locally, but does not simulate sign-in. Use `npm run dev` for normal local work.

## Hosting and authentication

The live site uses OpenAI Sites hosting and its ChatGPT sign-in service. The source can run locally without Sites credentials, but deploying to another host requires replacing the platform authentication integration and configuring a real D1 database. The `.openai/hosting.json` project ID identifies the existing site; it is not a credential.

Authentication is enforced on the server. Only a trusted authentication gateway should supply the identity headers consumed by `app/chatgpt-auth.ts`.

## Project structure

| Path | Purpose |
| --- | --- |
| `app/workspace.tsx` | Shared navigation and application tracker |
| `app/library.tsx` | Page selection and opportunity board |
| `app/course-planner.tsx`, `app/rutgers-courses.ts` | Course planner and degree calculations |
| `app/rutgers-catalog.json` | Sourced Rutgers core, electives, and science courses |
| `app/ai-course.tsx`, `app/git-course.tsx` | Written AI and Git courses |
| `app/learning.tsx` | Project videos and club directory |
| `app/resume-studio.tsx` | LaTeX editor and saved drafts |
| `app/practice.tsx` | Coding practice interface |
| `app/practice-data/` | Blind 75 catalog, starters, remote harnesses, and grading |
| `app/api/` | Account state and opportunity endpoints |
| `db/`, `drizzle/` | Database access, schema, and migrations |
| `public/vendor/` | Browser LaTeX compiler and PDF worker |

See [PRODUCT.md](PRODUCT.md) for implementation details and [development notes](docs/DEVELOPMENT.md) for the hosting and local runtime setup.

## Attribution and limitations

- University branding and links come from official sources; see `public/branding/SOURCES.md`. This is an unofficial student project.
- Jake’s Resume is used under its [MIT license](public/templates/JAKES-LICENSE.txt); [original template](https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs).
- SwiftLaTeX notices and source links are in [NOTICE.txt](public/vendor/latex/NOTICE.txt); PDF.js retains its [license](public/vendor/pdfjs/LICENSE).
- Listings are community maintained; course checklists are not degree audits.
- [Blind 75](https://www.techinterviewhandbook.org/best-practice-questions/) was curated by Yangshun Tay. Prompts and practice cases here are independently authored; original problem links lead to LeetCode.
- Coding runs send solution code (not account identity) to Wandbox with saved public snippets disabled. The server checks results against independently authored practice cases. Availability depends on Wandbox; these are learning checks, not a competitive judge. There is a per-account limit of one run per five seconds and 200 runs per UTC day.
- Resume compilation downloads TeX packages from TeXlyre. Source is compiled in the browser; saving a draft stores it in the signed-in workspace.

Environment files, local databases, dependencies, and build output are excluded from Git. Third-party code and assets retain their respective licenses.
