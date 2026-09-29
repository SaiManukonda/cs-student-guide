# CS Student Guide

A minimal workspace for computer science students, starting with Rutgers–New Brunswick.

**[Open the website](https://cs-fieldnotes.nappingexpert.chatgpt.site)** · ChatGPT sign-in required

## Features

- **Application tracker:** save roles, update statuses, and keep notes.
- **Opportunity board:** searchable internship listings from Simplify and Pitt CSC.
- **Project library:** video walkthroughs with prerequisites and exercises.
- **AI literacy:** a seven-section written Claude Code course with a Python practice project.
- **Resume studio:** Jake’s Resume LaTeX template, browser compilation, PDF preview, and saved drafts.
- **Coding practice:** original JavaScript problems with a sandboxed runner and submission history.
- **Course planner:** Rutgers CS course checklist and official degree references.
- **CS clubs:** links to Rutgers student organizations.

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
npm run dev
```

Open the URL printed by the development server, normally `http://localhost:5173`. Local development provides a simulated ChatGPT account; it does not require production credentials. Apply the initial migration once per new local database.

```sh
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
| `app/library.tsx` | Opportunity board and course planner |
| `app/ai-course.tsx` | Written Claude Code course |
| `app/learning.tsx` | Project videos and club directory |
| `app/resume-studio.tsx` | LaTeX editor and saved drafts |
| `app/practice.tsx` | Coding practice interface |
| `app/api/` | Account state and opportunity endpoints |
| `db/`, `drizzle/` | Database access, schema, and migrations |
| `public/vendor/` | Browser LaTeX compiler and PDF worker |

See [PRODUCT.md](PRODUCT.md) for implementation details and [development notes](docs/DEVELOPMENT.md) for the hosting and local runtime setup.

## Attribution and limitations

- Rutgers branding and links come from university sources. This is an unofficial student project.
- Jake’s Resume is used under its [MIT license](public/templates/JAKES-LICENSE.txt); [original template](https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs).
- SwiftLaTeX notices and source links are in [NOTICE.txt](public/vendor/latex/NOTICE.txt); PDF.js retains its [license](public/vendor/pdfjs/LICENSE).
- Listings are community maintained; course checklists are not degree audits.
- Coding results are browser-generated practice feedback, not a secure competitive judge.
- Resume compilation downloads TeX packages from TeXlyre. Source is compiled in the browser; saving a draft stores it in the signed-in workspace.

Environment files, local databases, dependencies, and build output are excluded from Git. Third-party code and assets retain their respective licenses.
