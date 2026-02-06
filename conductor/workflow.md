# Workflow

## 1. Test Code Coverage
**Required Coverage:** 80%

## 2. Commit Strategy
**Commit Frequency:** After each task

## 3. Task Summary
**Recording Method:** Git Notes

## 4. Phase Completion Verification and Checkpointing Protocol
Upon completing all tasks within a given phase, the user MUST perform the following steps:
1.  **Review Code:** Conduct a thorough self-review of all changes made during the phase.
2.  **Run All Tests:** Ensure all unit, integration, and end-to-end tests pass without errors.
3.  **Manual Verification:** Manually test the implemented features or fixes according to the `spec.md`'s acceptance criteria.
4.  **Update `plan.md`:** Mark all completed tasks within the phase as `[x]` in the `plan.md` file.
5.  **Commit Changes:** Commit all changes with a descriptive message, including a summary of the phase's accomplishments.
6.  **Update `metadata.json`:** If the phase completion signifies a change in the track's overall status (e.g., from `in_progress` to `awaiting_review`), update the `metadata.json` accordingly.
7.  **Notify Stakeholders:** Inform relevant team members or stakeholders of the phase completion and readiness for review.