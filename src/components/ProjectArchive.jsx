import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, CATEGORY_ORDER } from "../data/categories.js";
import ProjectLinks from "./ProjectLinks.jsx";

const normalize = (value) => value.toLowerCase();

const SEARCH_DEBOUNCE_MS = 300;
const COPIED_RESET_MS = 2000;

const safeDecode = (value) => {
    try {
        return decodeURIComponent(value);
    } catch {
        // Malformed percent-escape from a hand-edited URL. Return it as-is and
        // let validation drop it rather than throwing during hydration.
        return value;
    }
};

/**
 * Filters are encoded by hand rather than through URLSearchParams because at
 * least one tech value contains a comma ("Rust (Syn, Tokio)"), and
 * URLSearchParams decodes %2C back to a bare comma on read, which would make the
 * separator ambiguous. Encoding each value individually turns an internal comma
 * into %2C, so joining with a literal comma stays unambiguous and readable.
 * Empty params are omitted entirely rather than written as `?category=&q=`.
 */
const buildSearchString = ({ search, selectedTech, selectedCategory }) => {
    const parts = [];
    if (selectedCategory) {
        parts.push(`category=${encodeURIComponent(selectedCategory)}`);
    }
    if (selectedTech.length > 0) {
        parts.push(`tech=${selectedTech.map(encodeURIComponent).join(",")}`);
    }
    const query = search.trim();
    if (query) {
        parts.push(`q=${encodeURIComponent(query)}`);
    }
    return parts.length > 0 ? `?${parts.join("&")}` : "";
};

const parseSearchString = (searchString) => {
    const parsed = { category: null, tech: [], q: "" };
    const raw = searchString.replace(/^\?/, "");
    if (!raw) return parsed;

    for (const pair of raw.split("&")) {
        if (!pair) continue;
        const separator = pair.indexOf("=");
        const key = separator === -1 ? pair : pair.slice(0, separator);
        const value = separator === -1 ? "" : pair.slice(separator + 1);

        if (key === "category") {
            parsed.category = safeDecode(value);
        } else if (key === "q") {
            parsed.q = safeDecode(value);
        } else if (key === "tech") {
            // Split before decoding so a %2C inside a value is not read as a separator.
            parsed.tech = value.split(",").filter(Boolean).map(safeDecode);
        }
    }
    return parsed;
};

export default function ProjectArchive({ projects }) {
    const [search, setSearch] = useState("");
    const [selectedTech, setSelectedTech] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    // Gates URL writes until the mount-time read has run, so initialising from
    // the address bar does not immediately rewrite it.
    const [hasMounted, setHasMounted] = useState(false);
    const [copied, setCopied] = useState(false);
    const copyTimer = useRef(null);

    const techOptions = useMemo(() => {
        const items = new Set();
        projects.forEach((project) => {
            project.tech_stack.forEach((tech) => items.add(tech));
        });
        return Array.from(items).sort();
    }, [projects]);

    // Apply URL params after mount. Initial state matches the server render, so
    // the static HTML hydrates without a mismatch and only then re-filters.
    // Unknown values are dropped silently rather than rendering an empty archive.
    useEffect(() => {
        const { category, tech, q } = parseSearchString(window.location.search);
        if (category && CATEGORIES[category]) setSelectedCategory(category);
        const knownTech = tech.filter((item) => techOptions.includes(item));
        if (knownTech.length > 0) setSelectedTech(knownTech);
        if (q) setSearch(q);
        setHasMounted(true);
    }, [techOptions]);

    // Keep state in sync when the user navigates the history stack.
    useEffect(() => {
        const handlePopState = () => {
            const { category, tech, q } = parseSearchString(window.location.search);
            setSelectedCategory(category && CATEGORIES[category] ? category : null);
            setSelectedTech(tech.filter((item) => techOptions.includes(item)));
            setSearch(q);
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [techOptions]);

    // Mirror filter state into the URL, debounced so typing does not write a
    // history entry per keystroke. Always replaceState: a category change has
    // already pushed its own entry, and this later no-op replace preserves it.
    useEffect(() => {
        if (!hasMounted) return undefined;
        const timer = setTimeout(() => {
            const query = buildSearchString({ search, selectedTech, selectedCategory });
            window.history.replaceState({}, "", `${window.location.pathname}${query}`);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [hasMounted, search, selectedTech, selectedCategory]);

    useEffect(() => () => clearTimeout(copyTimer.current), []);

    const toggleTech = (tech) => {
        setSelectedTech(
            selectedTech.includes(tech)
                ? selectedTech.filter((item) => item !== tech)
                : [...selectedTech, tech]
        );
    };

    const toggleCategory = (categoryId) => {
        const next = selectedCategory === categoryId ? null : categoryId;
        setSelectedCategory(next);
        // Push, so the back button steps between categories (matching FeaturedProjects).
        if (hasMounted) {
            const query = buildSearchString({
                search,
                selectedTech,
                selectedCategory: next,
            });
            window.history.pushState({}, "", `${window.location.pathname}${query}`);
        }
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedTech([]);
        setSelectedCategory(null);
        if (hasMounted) {
            window.history.replaceState({}, "", window.location.pathname);
        }
    };

    const copyLink = async () => {
        const query = buildSearchString({ search, selectedTech, selectedCategory });
        const url = `${window.location.origin}${window.location.pathname}${query}`;
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            // Clipboard unavailable (insecure context or permission denied).
            return;
        }
        setCopied(true);
        clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    };

    const hasActiveFilters =
        search.trim().length > 0 || selectedTech.length > 0 || selectedCategory !== null;

    const filteredProjects = useMemo(() => {
        const query = normalize(search.trim());

        return projects.filter((project) => {
            const matchesSearch =
                query.length === 0 ||
                normalize(
                    [
                        project.project_name,
                        project.project_tagline,
                        project.project_description,
                        project.architecture_overview,
                        project.domain_context,
                        project.tech_stack.join(" "),
                        project.key_challenges
                            .map((challenge) =>
                                [challenge.focus, challenge.challenge, challenge.solution].join(" ")
                            )
                            .join(" "),
                    ].join(" ")
                ).includes(query);

            const matchesTech =
                selectedTech.length === 0 ||
                selectedTech.every((tech) => project.tech_stack.includes(tech));

            const matchesCategory =
                selectedCategory === null ||
                project.categories.includes(selectedCategory);

            return matchesSearch && matchesTech && matchesCategory;
        });
    }, [projects, search, selectedTech, selectedCategory]);

    return (
        <div className="space-y-10">
            <div className="grid gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:grid-cols-[2fr,1fr,1fr]">
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Search
                    </label>
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search keywords like sharding, cron, queue"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORY_ORDER.map((categoryId) => (
                            <button
                                key={categoryId}
                                type="button"
                                onClick={() => toggleCategory(categoryId)}
                                aria-pressed={selectedCategory === categoryId}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${selectedCategory === categoryId
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-gray-200 text-gray-500 hover:border-primary/40"
                                    }`}
                            >
                                {CATEGORIES[categoryId].label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Tech Stack
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                        {techOptions.map((tech) => (
                            <button
                                key={tech}
                                type="button"
                                onClick={() => toggleTech(tech)}
                                aria-pressed={selectedTech.includes(tech)}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${selectedTech.includes(tech)
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-gray-200 text-gray-500 hover:border-primary/40"
                                    }`}
                            >
                                {tech}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                    <span>{filteredProjects.length} projects shown</span>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={copyLink}
                            disabled={!hasActiveFilters}
                            className="font-semibold text-primary transition-colors hover:text-primary/80 disabled:cursor-not-allowed disabled:text-gray-300"
                        >
                            {copied ? "Link copied" : "Copy link to this view"}
                        </button>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-primary font-semibold hover:text-primary/80"
                        >
                            Clear filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProjects.map((project) => (
                    <div
                        key={project.slug}
                        className="group relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                    >
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
                            {project.domain_context}
                        </span>
                        <h3 className="mt-4 text-lg font-bold text-secondary group-hover:text-primary transition-colors">
                            {/* Stretched link: covers the card so the whole surface is clickable,
                                while the outbound links below opt out via `relative z-10`. */}
                            <a
                                href={`/projects/${project.slug}`}
                                className="after:absolute after:inset-0 after:content-['']"
                            >
                                {project.project_name}
                            </a>
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                            {project.project_tagline}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {project.tech_stack.slice(0, 5).map((tech) => (
                                <span
                                    key={tech}
                                    className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-6 text-sm font-semibold">
                            <span className="text-primary">View Case Study →</span>
                            <ProjectLinks project={project} />
                        </div>
                    </div>
                ))}
            </div>

            {filteredProjects.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
                    <p className="text-sm text-gray-500">
                        No projects match your filters. Try clearing filters or searching a
                        different keyword.
                    </p>
                </div>
            )}
        </div>
    );
}
