import type {NotebookCourse} from './notebook-course';
export const ciCourse:NotebookCourse={
  "id": "test-to-deploy",
  "title": "From tests to deployment",
  "stack": "Python \u00b7 GitHub Actions \u00b7 CI/CD",
  "filename": "test-to-deploy.ipynb",
  "packages": [
    "numpy",
    "pandas",
    "pyyaml"
  ],
  "lessons": [
    {
      "id": "app",
      "title": "Start with a tiny app",
      "goal": "Create the code your pipeline will protect.",
      "body": "You will build a static portfolio page with Python, test it, and prepare a GitHub Actions deployment to GitHub Pages. These browser exercises run real Python locally; they do not run GitHub Actions or publish a site. Each source string becomes a file in the repository you export at the end.",
      "steps": [
        "Run the supplied app_source to create a page renderer.",
        "Try another title and a whitespace-only title. Empty titles should raise ValueError.",
        "Notice escape(): a title is text, not executable HTML."
      ],
      "hint": "Edit app_source, then re-run the cell to update render. Keep the function named render.",
      "starter": "# This string becomes app.py in your downloadable repository.\napp_source = 'from html import escape\\n\\ndef render(title):\\n    title = title.strip()\\n    if not title:\\n        raise ValueError(\"Title cannot be empty\")\\n    return \\'<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><title>\\' + escape(title) + \"</title><h1>\" + escape(title) + \"</h1></html>\"\\n'\napp_namespace = {}\nexec(app_source, app_namespace)\nrender = app_namespace[\"render\"]\nprint(render(\"My portfolio\"))",
      "solution": "# This string becomes app.py in your downloadable repository.\napp_source = 'from html import escape\\n\\ndef render(title):\\n    title = title.strip()\\n    if not title:\\n        raise ValueError(\"Title cannot be empty\")\\n    return \\'<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><title>\\' + escape(title) + \"</title><h1>\" + escape(title) + \"</h1></html>\"\\n'\napp_namespace = {}\nexec(app_source, app_namespace)\nrender = app_namespace[\"render\"]\nprint(render(\"My portfolio\"))",
      "check": "assert \"<h1>Example</h1>\" in render(\" Example \"), \"Render a trimmed heading.\"\nassert \"<script>\" not in render(\"<script>\"), \"Escape user-provided titles.\"\ntry:\n    render(\"   \")\n    raise AssertionError(\"Reject empty titles.\")\nexcept ValueError:\n    pass",
      "source": "https://docs.python.org/3/library/html.html"
    },
    {
      "id": "tests",
      "title": "Write checks that can fail",
      "goal": "Test normal inputs and edge cases.",
      "body": "Continuous integration runs checks on every proposed change. Python\u2019s unittest returns a failing exit status when an assertion fails, so later workflow steps stop. A green run is only useful when your tests can catch a real bug.",
      "steps": [
        "Write four PageTests methods in test_source: heading, whitespace, empty input and HTML escaping.",
        "Use assertIn, assertNotIn and assertRaises.",
        "Run the cell. Expect four tests and an OK result."
      ],
      "hint": "The reference includes the full test_app.py. Keep its import line: the local helper substitutes the app under test, while GitHub imports app.py normally.",
      "starter": "test_source = 'import unittest\\nfrom app import render\\n\\nclass PageTests(unittest.TestCase):\\n    # TODO: add the four tests.\\n    pass\\n'\n# Execute exactly the test file against the app source, without filesystem imports.\nimport io\nimport unittest\n\ndef run_tests(source):\n    namespace = {}\n    exec(source, namespace)\n    test_namespace = {\"render\": namespace[\"render\"]}\n    exec(test_source.replace(\"from app import render\", \"\"), test_namespace)\n    suite = unittest.defaultTestLoader.loadTestsFromTestCase(test_namespace[\"PageTests\"])\n    log = io.StringIO()\n    result = unittest.TextTestRunner(stream=log, verbosity=2).run(suite)\n    print(log.getvalue())\n    return result\n\nresult = run_tests(app_source)\n",
      "solution": "test_source = 'import unittest\\nfrom app import render\\n\\nclass PageTests(unittest.TestCase):\\n    def test_heading(self):\\n        self.assertIn(\"<h1>My portfolio</h1>\", render(\"My portfolio\"))\\n\\n    def test_whitespace(self):\\n        self.assertIn(\"<h1>Hello</h1>\", render(\"  Hello  \"))\\n\\n    def test_empty(self):\\n        with self.assertRaises(ValueError):\\n            render(\"   \")\\n\\n    def test_escape(self):\\n        page = render(\"<script>alert(1)</script>\")\\n        self.assertNotIn(\"<script>\", page)\\n        self.assertIn(\"&lt;script&gt;\", page)\\n'\n# Execute exactly the test file against the app source, without filesystem imports.\nimport io\nimport unittest\n\ndef run_tests(source):\n    namespace = {}\n    exec(source, namespace)\n    test_namespace = {\"render\": namespace[\"render\"]}\n    exec(test_source.replace(\"from app import render\", \"\"), test_namespace)\n    suite = unittest.defaultTestLoader.loadTestsFromTestCase(test_namespace[\"PageTests\"])\n    log = io.StringIO()\n    result = unittest.TextTestRunner(stream=log, verbosity=2).run(suite)\n    print(log.getvalue())\n    return result\n\nresult = run_tests(app_source)\n",
      "check": "assert result.testsRun >= 4 and result.wasSuccessful(), \"Write at least four passing tests, including the listed edge cases.\"",
      "source": "https://docs.python.org/3/library/unittest.html"
    },
    {
      "id": "failure",
      "title": "Watch a pipeline fail",
      "goal": "Prove the tests stop a broken change.",
      "body": "The red output in this exercise is intentional. A whitespace regression should break the tests. In a real workflow, a failed test step skips later build/upload steps, and a dependent deployment job is skipped. Never add continue-on-error to a required quality gate just to make it green.",
      "steps": [
        "Create broken_source by removing title.strip() in a copy of app_source.",
        "Run the tests against the broken version and confirm they fail.",
        "Run the original version to restore a green result."
      ],
      "hint": "Use a separate string so the exported app stays correct.",
      "starter": "# TODO: create broken_source and compare broken_result with fixed_result.",
      "solution": "# Remove trimming in a separate copy, leaving app_source unchanged.\nbroken_source = app_source.replace(\"title = title.strip()\", \"title = title\")\nbroken_result = run_tests(broken_source)\nprint(\"Build blocked:\", not broken_result.wasSuccessful())\nfixed_result = run_tests(app_source)\n",
      "check": "assert broken_source != app_source, \"Introduce a bug in a separate copy.\"\nassert broken_result.testsRun >= 4 and not broken_result.wasSuccessful(), \"Your tests must catch the deliberate regression.\"\nassert fixed_result.wasSuccessful(), \"Restore the passing app before building.\"",
      "source": "https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-jobs"
    },
    {
      "id": "build",
      "title": "Build a deployable artifact",
      "goal": "Turn source into the file a host will serve.",
      "body": "Source files and deployment artifacts have different jobs. build.py generates dist/index.html; that dist folder is what GitHub Pages receives. This app uses only the Python standard library, so no pip install step or dependency lockfile is needed.",
      "steps": [
        "Set build_source to create dist and write the rendered page to dist/index.html.",
        "Run the tests before executing the build.",
        "Inspect the generated HTML. A failed test should block the build."
      ],
      "hint": "Path(\"dist\").mkdir(exist_ok=True) makes repeated builds safe.",
      "starter": "# TODO: define build_source, run passing tests, and read the generated HTML into artifact.",
      "solution": "from pathlib import Path\nbuild_source = 'from pathlib import Path\\nfrom app import render\\n\\nPath(\"dist\").mkdir(exist_ok=True)\\nPath(\"dist/index.html\").write_text(render(\"My portfolio\"), encoding=\"utf-8\")\\nprint(\"Built dist/index.html\")\\n'\n# A real gate: fail before executing the build if tests are red.\nresult = run_tests(app_source)\nassert result.testsRun >= 4 and result.wasSuccessful(), \"Tests failed: build blocked\"\nnamespace = {}\nexec(app_source, namespace)\nexec(build_source.replace(\"from app import render\", \"\"), namespace)\nartifact = Path(\"dist/index.html\").read_text(encoding=\"utf-8\")\nprint(artifact)\n",
      "check": "assert result.testsRun >= 4 and result.wasSuccessful(), \"Tests must pass before building.\"\nassert Path(\"dist/index.html\").is_file() and artifact == Path(\"dist/index.html\").read_text(encoding=\"utf-8\"), \"Create and read the build artifact.\"\nassert \"<h1>My portfolio</h1>\" in artifact, \"Build the portfolio page.\"",
      "source": "https://docs.github.com/en/actions/tutorials/store-and-share-data"
    },
    {
      "id": "workflow",
      "title": "Define the GitHub pipeline",
      "goal": "Test pull requests and deploy successful main-branch changes.",
      "body": "A workflow is a YAML file under .github/workflows. test-build checks out the repository, selects Python, runs tests, builds, and uploads the Pages artifact in order. deploy requires test-build and only runs on main outside pull requests. Its scoped permissions authorize GitHub Pages deployment. The browser parses this file; GitHub will execute it after you push your repository.",
      "steps": [
        "Create workflow as a multiline YAML string using the reference structure.",
        "Include push to main, pull_request and workflow_dispatch triggers.",
        "Keep tests before build; make deploy depend on test-build.",
        "Run the cell to parse YAML and check the required pipeline structure."
      ],
      "hint": "Indent YAML with spaces. Quote \"on\" so PyYAML preserves it as a string key. needs establishes job ordering; the if condition prevents PR deployment.",
      "starter": "workflow = \"\"\"# TODO: add the test-build and deploy jobs.\n\"\"\"\nimport yaml\nconfig = yaml.safe_load(workflow)\nprint(\"Jobs:\", list(config[\"jobs\"]))\nprint(\"Deploy depends on:\", config[\"jobs\"][\"deploy\"][\"needs\"])\n",
      "solution": "workflow = 'name: Test and deploy\\n\"on\":\\n  push:\\n    branches: [main]\\n  pull_request:\\n  workflow_dispatch:\\npermissions:\\n  contents: read\\nconcurrency:\\n  group: pages-${{ github.ref }}\\n  cancel-in-progress: true\\njobs:\\n  test-build:\\n    runs-on: ubuntu-latest\\n    steps:\\n      - uses: actions/checkout@v6\\n      - uses: actions/setup-python@v5\\n        with:\\n          python-version: \\'3.12\\'\\n      - name: Test\\n        run: python -m unittest discover -v\\n      - name: Build\\n        run: python build.py\\n      - uses: actions/upload-pages-artifact@v3\\n        with:\\n          path: dist\\n  deploy:\\n    if: github.ref == \\'refs/heads/main\\' && github.event_name != \\'pull_request\\'\\n    needs: test-build\\n    runs-on: ubuntu-latest\\n    permissions:\\n      pages: write\\n      id-token: write\\n    environment:\\n      name: github-pages\\n      url: ${{ steps.deployment.outputs.page_url }}\\n    steps:\\n      - name: Deploy\\n        id: deployment\\n        uses: actions/deploy-pages@v4\\n'\nimport yaml\nconfig = yaml.safe_load(workflow)\nprint(\"Jobs:\", list(config[\"jobs\"]))\nprint(\"Deploy depends on:\", config[\"jobs\"][\"deploy\"][\"needs\"])\n",
      "check": "assert isinstance(config, dict), \"Write a YAML workflow.\"\nassert {\"push\", \"pull_request\", \"workflow_dispatch\"} <= set(config[\"on\"]), \"Include all three triggers.\"\nassert config[\"on\"][\"push\"][\"branches\"] == [\"main\"], \"Deploy pushes to main.\"\nsteps = config[\"jobs\"][\"test-build\"][\"steps\"]\nruns = [s.get(\"run\") for s in steps if \"run\" in s]\nassert runs == [\"python -m unittest discover -v\", \"python build.py\"], \"Run tests before the build.\"\nassert not any(s.get(\"continue-on-error\") for s in steps), \"Do not ignore test failures.\"\nassert any(s.get(\"uses\", \"\").startswith(\"actions/checkout@\") for s in steps), \"Check out the code.\"\nassert any(s.get(\"uses\", \"\").startswith(\"actions/setup-python@\") for s in steps), \"Select Python explicitly.\"\nassert any(s.get(\"uses\", \"\").startswith(\"actions/upload-pages-artifact@\") and s.get(\"with\", {}).get(\"path\") == \"dist\" for s in steps), \"Upload the dist artifact.\"\ndeploy = config[\"jobs\"][\"deploy\"]\nassert deploy[\"needs\"] == \"test-build\", \"Require a successful test-build job.\"\nassert deploy[\"if\"] == \"github.ref == 'refs/heads/main' && github.event_name != 'pull_request'\", \"Restrict deployment to main outside PRs.\"\nassert deploy[\"permissions\"] == {\"pages\": \"write\", \"id-token\": \"write\"}, \"Use scoped Pages permissions.\"\nassert deploy[\"environment\"][\"name\"] == \"github-pages\", \"Use the github-pages environment.\"\nassert any(s.get(\"uses\", \"\").startswith(\"actions/deploy-pages@\") for s in deploy[\"steps\"]), \"Add the Pages deployment action.\"",
      "source": "https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages"
    },
    {
      "id": "ship",
      "title": "Export and deploy on GitHub",
      "goal": "Take the project from this lab to your own repository.",
      "body": "Download the ZIP and follow its README. CI checks proposed changes; continuous delivery keeps an artifact ready, while this workflow continuously deploys passing main-branch changes. No GitHub account or deployment is connected to this lab. You perform the actual deployment in your own repository.",
      "steps": [
        "Run this cell and download the ZIP. Extract it and include the hidden .github folder when committing.",
        "Create a GitHub repository on main. In Settings \u2192 Pages, choose GitHub Actions, then push or manually run the workflow.",
        "Watch the real Actions run and open the URL from its github-pages environment.",
        "Open a pull request with a broken test. Add a branch ruleset requiring test-build where supported; a workflow alone does not prevent merging.",
        "To roll back, revert the bad commit and let the pipeline deploy the reverted source. Optional environment reviewers add manual approval where supported."
      ],
      "hint": "If Pages or protection options are missing, check the repository\u2019s plan and organization policy. No personal access token belongs in the code.",
      "starter": "# TODO: assemble repo_files and export the ZIP using the reference.",
      "solution": "import io\nimport zipfile\nreadme = \"# Test-to-deploy portfolio\\n\\nRequires Python 3.12+. No third-party dependencies are needed for the app.\\n\\n1. Run `python -m unittest discover -v` from this folder.\\n2. Run `python build.py`. Open `dist/index.html` in a browser.\\n3. Create your own GitHub repository with a main branch and commit these files, including the hidden .github folder. Do not include secrets.\\n4. In Settings > Pages, select GitHub Actions as the build source. If unavailable, check your account/repository eligibility and organization policy in GitHub's Pages documentation.\\n5. Push to main (or run the workflow manually after configuring Pages). Watch Actions > Test and deploy. The deploy job's environment shows your site URL.\\n6. Create a branch, break a test, and open a pull request: tests should fail and build/deploy must not run. Fix it and push again.\\n7. Configure a branch ruleset for main requiring the test-build status check and pull requests before merging, if your repository plan supports it. A CI workflow alone does not block merging.\\n\\nThe deploy job only runs after a successful test-build job, on main, and never for pull requests. GitHub executes the deployment; the course's in-browser exercises do not publish anything.\\n\\nContinuous integration checks changes. Continuous delivery keeps a deployable artifact ready; this workflow implements continuous deployment from main. To require manual approval, configure reviewers on the github-pages environment where supported.\\n\\nRollback: revert the bad commit with a new commit on main, then let tests and deployment run again. Re-run checks against the reverted source.\\n\\nDocs: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages\\n\"\nrepo_files = {\n    \"app.py\": app_source,\n    \"test_app.py\": test_source,\n    \"build.py\": build_source,\n    \".github/workflows/pages.yml\": workflow,\n    \".gitignore\": \"__pycache__/\\ndist/\\n\",\n    \"README.md\": readme,\n}\nbuffer = io.BytesIO()\nwith zipfile.ZipFile(buffer, \"w\", zipfile.ZIP_DEFLATED) as archive:\n    for name, content in repo_files.items():\n        archive.writestr(name, content)\n# Works here and in a downloaded Jupyter notebook.\ntry:\n    download_file(\"test-to-deploy.zip\", buffer.getvalue())\nexcept NameError:\n    from pathlib import Path\n    Path(\"test-to-deploy.zip\").write_bytes(buffer.getvalue())\n    print(\"Saved test-to-deploy.zip\")\nprint(\"Repository files:\")\nprint(\"\\n\".join(repo_files))\n",
      "check": "assert {\"app.py\", \"test_app.py\", \"build.py\", \".github/workflows/pages.yml\", \"README.md\"} <= set(repo_files), \"Include the app, tests, build, workflow and instructions.\"\nassert repo_files[\"app.py\"] == app_source and repo_files[\".github/workflows/pages.yml\"] == workflow, \"Export your current code and workflow.\"\nassert zipfile.is_zipfile(io.BytesIO(buffer.getvalue())), \"Create a valid repository ZIP.\"",
      "source": "https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs"
    }
  ]
};
