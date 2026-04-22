# AI Memory Instructions

To maintain perfect continuity in this project, every new session must follow these steps:

## 🏁 Session Initialization
As your first action, even before answering the user's first prompt, you MUST:
1.  Read `.memory/product_context.md`.
2.  Read `.memory/architecture.md`.
3.  Read `.memory/storage_logic.md`.
4.  Read `.memory/progress.md`.

## 🔄 Maintaining the Memory
-   **When finishing a feature**: Update `.memory/progress.md`.
-   **When changing major rules (e.g. storage limits)**: Update `.memory/storage_logic.md`.
-   **When adding new tech stack components**: Update `.memory/architecture.md`.
-   **When finishing a session**: Summary of what was done should be appended to the progress log.

## ⚠️ Special Rule: "No Free Storage"
If you are tasked with creating a new feature that saves data (a new table or file upload), you **MUST** ensure it is registered in `src/lib/quota.ts` and that its size is accounted for.
