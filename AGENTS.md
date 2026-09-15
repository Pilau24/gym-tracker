# Agent Instructions

## Feature branch workflow

- Work on a dedicated feature branch for each feature or bug fix; do not make feature changes directly on the default branch.
- Create the branch from the current base branch before editing, using a descriptive name such as `feature/<short-description>` or `fix/<short-description>`.
- Check the working tree before branching and preserve any unrelated user changes. Do not reset, discard, or overwrite them.
- Keep each branch focused on one feature or fix and avoid mixing unrelated changes.

## Completion and commits

- Implement and validate the requested change, but do not commit it merely because the implementation or tests appear complete.
- Treat the feature as complete only when the user explicitly says it is complete or otherwise asks for the work to be committed.
- Once the user confirms completion, review the diff, run the relevant existing checks, stage only the changes belonging to the feature, and create a clear commit.
- Do not push, merge, rebase, or delete the feature branch unless the user explicitly requests it.
- If the user has not confirmed completion, report the current status and leave the changes uncommitted.
