/**
 * Single source of truth for project categories.
 * Consumed by FeaturedProjects.jsx, ProjectArchive.jsx and scripts/validate-projects.js.
 *
 * Projects carry a `categories` array, so an entry can legitimately appear under
 * more than one heading (e.g. Bulwark is both security tooling and applied AI).
 */
export const CATEGORIES = {
    ai: {
        id: "ai",
        label: "AI & Automation",
        context:
            "Multi-agent orchestration, LLM-backed pipelines, and the deterministic guardrails that keep them honest.",
    },
    financial: {
        id: "financial",
        label: "Financial Infrastructure",
        context: "High-frequency exchanges, P2P bridges, and regulated custody.",
    },
    security: {
        id: "security",
        label: "Security & DevOps",
        context:
            "Automated auditing tools, sandboxed execution, and infrastructure hardening.",
    },
    consumer: {
        id: "consumer",
        label: "Consumer & Growth",
        context: "Product-led growth, GameFi, and consumer mobile experiences.",
    },
};

export const CATEGORY_ORDER = ["ai", "financial", "security", "consumer"];

export const DEFAULT_CATEGORY = "ai";
