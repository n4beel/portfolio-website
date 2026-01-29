import { useMemo, useState } from "react";

const normalize = (value) => value.toLowerCase();

const CATEGORIES = {
    financial: "Financial Infrastructure",
    security: "Security & DevOps",
    consumer: "Consumer & Growth",
};

const CATEGORY_ORDER = ["financial", "security", "consumer"];

export default function ProjectArchive({ projects }) {
    const [search, setSearch] = useState("");
    const [selectedTech, setSelectedTech] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const techOptions = useMemo(() => {
        const items = new Set();
        projects.forEach((project) => {
            project.tech_stack.forEach((tech) => items.add(tech));
        });
        return Array.from(items).sort();
    }, [projects]);

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
                project.category === selectedCategory;

            return matchesSearch && matchesTech && matchesCategory;
        });
    }, [projects, search, selectedTech, selectedCategory]);

    const toggleTech = (tech) => {
        setSelectedTech(
            selectedTech.includes(tech)
                ? selectedTech.filter((item) => item !== tech)
                : [...selectedTech, tech]
        );
    };

    const toggleCategory = (categoryId) => {
        setSelectedCategory(
            selectedCategory === categoryId ? null : categoryId
        );
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedTech([]);
        setSelectedCategory(null);
    };

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
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${selectedCategory === categoryId
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-gray-200 text-gray-500 hover:border-primary/40"
                                    }`}
                            >
                                {CATEGORIES[categoryId]}
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

                <div className="md:col-span-3 flex items-center justify-between text-xs text-gray-500">
                    <span>{filteredProjects.length} projects shown</span>
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="text-primary font-semibold hover:text-primary/80"
                    >
                        Clear filters
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProjects.map((project) => (
                    <a
                        key={project.slug}
                        href={`/projects/${project.slug}`}
                        className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                    >
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
                            {project.domain_context}
                        </span>
                        <h3 className="mt-4 text-lg font-bold text-secondary group-hover:text-primary transition-colors">
                            {project.project_name}
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
                        <div className="mt-auto pt-6 text-sm font-semibold text-primary">
                            View Case Study →
                        </div>
                    </a>
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
