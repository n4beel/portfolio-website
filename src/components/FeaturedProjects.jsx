import { useState, useEffect, useMemo } from "react";
import { ArrowUpRight } from "lucide-react";

const CATEGORIES = {
    financial: {
        id: "financial",
        label: "Financial Infrastructure",
        context: "High-frequency exchanges, P2P bridges, and regulated custody.",
    },
    security: {
        id: "security",
        label: "Security & DevOps",
        context: "Automated auditing tools, sandboxed execution, and infrastructure hardening.",
    },
    consumer: {
        id: "consumer",
        label: "Consumer & Growth",
        context: "Product-led growth, GameFi, and AI-powered browser experiences.",
    },
};

const CATEGORY_ORDER = ["financial", "security", "consumer"];
const DEFAULT_CATEGORY = "financial";

export default function FeaturedProjects({ allProjects }) {
    const [hasMounted, setHasMounted] = useState(false);
    const [activeCategory, setActiveCategory] = useState(DEFAULT_CATEGORY);

    // Parse URL on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const categoryParam = params.get("category");
        if (categoryParam && CATEGORIES[categoryParam]) {
            setActiveCategory(categoryParam);
        }
        setHasMounted(true);
    }, []);

    // Update URL on category change (after mount)
    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
        const url = new URL(window.location.href);
        url.searchParams.set("category", categoryId);
        window.history.pushState({}, "", url.toString());
    };

    // Filter projects by active category, limit to 4
    const filteredProjects = useMemo(() => {
        return allProjects
            .filter((project) => project.category === activeCategory)
            .slice(0, 4);
    }, [allProjects, activeCategory]);

    // SSR placeholder to prevent hydration mismatch
    if (!hasMounted) {
        return (
            <div className="space-y-8">
                <div className="flex flex-wrap gap-3">
                    {CATEGORY_ORDER.map((catId) => (
                        <div
                            key={catId}
                            className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-400"
                        >
                            {CATEGORIES[catId].label}
                        </div>
                    ))}
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-72 animate-pulse rounded-3xl border border-gray-100 bg-gray-50"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-3">
                {CATEGORY_ORDER.map((catId) => {
                    const category = CATEGORIES[catId];
                    const isActive = activeCategory === catId;
                    return (
                        <button
                            key={catId}
                            type="button"
                            onClick={() => handleCategoryChange(catId)}
                            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                                isActive
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-gray-200 text-gray-500 hover:border-primary/40 hover:text-gray-700"
                            }`}
                        >
                            {category.label}
                        </button>
                    );
                })}
            </div>

            {/* Context Description */}
            <p className="text-sm text-gray-500">
                {CATEGORIES[activeCategory].context}
            </p>

            {/* Projects Grid with fade animation */}
            <div
                key={activeCategory}
                className="grid gap-6 md:grid-cols-2 animate-fade-in"
            >
                {filteredProjects.map((project) => (
                    <a
                        key={project.slug}
                        href={`/projects/${project.slug}`}
                        className="group flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                                {project.domain_context}
                            </span>
                            <ArrowUpRight
                                className="text-gray-400 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
                                size={22}
                            />
                        </div>

                        <div className="mt-6">
                            <h4 className="text-xl md:text-2xl font-bold text-secondary group-hover:text-primary transition-colors">
                                {project.project_name}
                            </h4>
                            <p className="mt-3 text-sm leading-relaxed text-gray-600">
                                {project.project_tagline}
                            </p>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {project.tech_stack.slice(0, 6).map((tech) => (
                                <span
                                    key={tech}
                                    className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600"
                                >
                                    {tech}
                                </span>
                            ))}
                            {project.tech_stack.length > 6 && (
                                <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                                    +{project.tech_stack.length - 6} more
                                </span>
                            )}
                        </div>

                        <div className="mt-auto pt-6 text-sm font-semibold text-primary flex items-center gap-2">
                            Read Case Study
                            <ArrowUpRight size={16} />
                        </div>
                    </a>
                ))}
            </div>

            {/* View All Link */}
            <div className="flex justify-center pt-4">
                <a
                    href="/projects"
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-secondary shadow-sm transition-all duration-200 hover:border-primary/40 hover:text-primary hover:shadow-md"
                >
                    View All Projects
                    <ArrowUpRight size={16} />
                </a>
            </div>
        </div>
    );
}
