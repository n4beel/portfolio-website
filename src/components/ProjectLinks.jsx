/**
 * Outbound links (live product / source repo) for a project card.
 *
 * Card surfaces use a stretched-link pattern for the case study, so these sit on
 * `relative z-10` to stay clickable, and stop propagation so a click here never
 * also triggers the card navigation.
 */
export default function ProjectLinks({ project }) {
    if (!project.live_url && !project.repo_url) return null;

    return (
        <span className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-2">
            {project.live_url && (
                <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="text-gray-500 underline-offset-4 hover:text-primary hover:underline"
                >
                    Live ↗
                </a>
            )}
            {project.repo_url && (
                <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="text-gray-500 underline-offset-4 hover:text-primary hover:underline"
                >
                    Source ↗
                </a>
            )}
        </span>
    );
}
