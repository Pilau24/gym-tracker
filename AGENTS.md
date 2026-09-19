# Agent Instructions

## Feature branch workflow

- Use dedicated feature branch for each feature or bug fix; never change default branch directly.
- Create branch from current base before editing, with descriptive name such as `feature/<short-description>` or `fix/<short-description>`.
- Check working tree before branching; preserve unrelated changes. Never reset, discard, or overwrite them.
- Keep each branch focused on one feature or fix.

### Preparing for a new branch

1. Check the current branch:

   ```powershell
   git branch --show-current
   ```

2. Check and review working tree:

   ```powershell
   git status --short
   git diff
   git diff --staged
   ```

3. Preserve existing work by committing, stashing, or intentionally carrying it into new branch:

   ```powershell
   git stash push -u -m "work before creating branch"
   ```

4. Never discard, reset, or overwrite unrelated changes.

### Creating and switching to a new branch

1. Update the base branch:

   ```powershell
   git fetch origin
   git switch main
   git pull --ff-only origin main
   ```

   Replace `main` with the repository's default branch when necessary.

2. Create and switch to dedicated branch:

   ```powershell
   git switch -c feature/<short-description>
   ```

   Use `fix/<short-description>` for bug fixes.

3. Confirm branch and working tree:

   ```powershell
   git branch --show-current
   git status --short
   ```

4. Restore stashed work when needed:

   ```powershell
   git stash list
   git stash pop
   ```

5. Resolve conflicts before starting new work.

Before editing, confirm correct branch, preserved existing changes, current base, no unexpected modifications, and one-feature scope.

### Finalising a branch and creating a pull request

Finalise only after user confirms work complete.

1. Confirm branch and inspect worktree:

   ```powershell
   git branch --show-current
   git status --short
   git diff
   git diff --staged
   ```

2. Fetch latest origin changes and update base branch:

   ```powershell
   git fetch origin
   git switch main
   git pull --ff-only origin main
   git switch <feature-branch>
   ```

   Replace `main` with the repository's default branch when necessary.

3. Merge updated base into feature branch:

   ```powershell
   git merge main
   git status
   ```

4. If conflicts appear, resolve all deliberately; verify no markers remain:

   ```powershell
   git diff --check
   git grep -n -E '^(<<<<<<<|=======|>>>>>>>)' -- .
   ```

   After resolving:

   ```powershell
   git add <resolved-files>
   git commit
   ```

5. Run relevant project checks. Do not create pull request with failures or unresolved conflicts.

6. Review final diff; commit only branch files:

   ```powershell
   git status --short
   git diff main...HEAD
   git diff --check
   git log --oneline main..HEAD
   git add <files>
   git commit -m "type: describe the change"
   ```

7. Push branch and create pull request:

   ```powershell
   git push -u origin <feature-branch>
   gh pr create --base main --head <feature-branch> --title "<short change title>" --body "## Summary
   - <what changed>

   ## Checks
   - <checks run and result>"
   ```

   Keep title specific and summary minimal: list primary user-visible or technical changes and checks run.

## Completion and commits

- Implement and validate requested change; do not commit merely because implementation or tests appear complete.
- Treat feature as complete only after user confirms or requests commit.
- After confirmation, review diff, run relevant checks, stage only feature files, and create clear commit.
- Do not push, merge, rebase, or delete feature branch without explicit request.

## Next.js documentation

- Project uses Next.js 16.3.5 with App Router.
- Prefer official Next.js documentation at https://nextjs.org/docs.
- Verify framework APIs against installed Next.js version before changing code.
- Project MCP configuration includes `next-devtools`, exposing version-accurate Next.js documentation and live development-server context.
- Without user completion confirmation, report status and leave changes uncommitted.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
 
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Development server

- Assume the Next.js development server is already running when working on this project.
- Reuse the running server for browser checks and runtime diagnostics instead of starting another dev server.

## Validation preference

- Do not run a production build for routine UI/layout changes when the live instance is available.
- Validate UI and layout changes against the already-open live browser instance instead.
- Treat the provided live instance as the source of truth, even when its behavior or appearance does not match the current repository or origin.
