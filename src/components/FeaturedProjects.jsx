import { useState, useEffect, useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES, CATEGORY_ORDER, DEFAULT_CATEGORY } from "../data/categories.js";
import ProjectLinks from "./ProjectLinks.jsx";

const FEATURED_LIMIT = 4;

export default function FeaturedProjects({ allProjects }) {
    // Starts on DEFAULT_CATEGORY so the server render and the first client
    // render agree. The cards are part of the static HTML: crawlers, link
    // previews and visitors without JS see real case studies, not a skeleton.
    const [activeCategory, setActiveCategory] = useState(DEFAULT_CATEGORY);

    // Apply ?category= after hydration, once the static markup is already up.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const categoryParam = params.get("category");
        if (categoryParam && CATEGORIES[categoryParam]) {
            setActiveCategory(categoryParam);
        }
    }, []);

    // Update URL on category change (after mount)
    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
        const url = new URL(window.location.href);
        url.searchParams.set("category", categoryId);
        window.history.pushState({}, "", url.toString());
    };

    // Projects in the active category: pinned (is_featured) first, then array
    // order fills the remaining slots. Stable within each group.
    const filteredProjects = useMemo(() => {
        const inCategory = allProjects.filter((project) =>
            project.categories.includes(activeCategory)
        );
        return [
            ...inCategory.filter((project) => project.is_featured),
            ...inCategory.filter((project) => !project.is_featured),
        ].slice(0, FEATURED_LIMIT);
    }, [allProjects, activeCategory]);

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
                            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
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
                    <div
                        key={project.slug}
                        className="group relative flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
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
                                {/* Stretched link: covers the card so the whole surface is
                                    clickable, while ProjectLinks opts out via `relative z-10`. */}
                                <a
                                    href={`/projects/${project.slug}`}
                                    className="after:absolute after:inset-0 after:content-['']"
                                >
                                    {project.project_name}
                                </a>
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

                        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-6 text-sm font-semibold">
                            <span className="flex items-center gap-2 text-primary">
                                Read Case Study
                                <ArrowUpRight size={16} />
                            </span>
                            <ProjectLinks project={project} />
                        </div>
                    </div>
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
