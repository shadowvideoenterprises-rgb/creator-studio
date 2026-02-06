# Workflow Protocols

## 1. Task Workflow
When implementing a task from the plan, follow these steps strictly:

1.  **Context Analysis**:
    * Read the relevant files to understand the current state.
    * Review `spec.md` to ensure alignment with the goal.

2.  **Atomic Implementation**:
    * Make changes to **one file at a time**.
    * After editing a file, check for basic syntax errors.

3.  **Verification**:
    * Verify that the changes match the requirements in the `spec.md`.
    * Ensure no existing functionality is broken.

4.  **Completion**:
    * Mark the task as done in the `plan.md` file (change `[ ]` to `[x]`).
    * Move to the next task in the plan.

## 2. Coding Standards
* **Framework**: Use Next.js 14+ (App Router) patterns.
* **Styling**: Use Tailwind CSS for all styling.
* **Safety**: Do not delete user data or existing functionality without explicit instruction.