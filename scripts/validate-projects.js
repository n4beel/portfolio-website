#!/usr/bin/env node
/**
 * Project Data Validation Script
 * Validates that all project entries have required fields
 * Run: node scripts/validate-projects.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REQUIRED_FIELDS = [
    'slug',
    'project_name',
    'project_tagline',
    'domain_context',
    'tech_stack',
    'project_description',
    'architecture_overview',
    'key_challenges',
];

const REQUIRED_CHALLENGE_FIELDS = ['focus', 'challenge', 'solution'];

function validateProjects() {
    const projectsPath = path.join(__dirname, '../src/data/projects.json');

    if (!fs.existsSync(projectsPath)) {
        console.error('❌ Error: projects.json not found at', projectsPath);
        process.exit(1);
    }

    const rawData = fs.readFileSync(projectsPath, 'utf-8');
    const projects = JSON.parse(rawData);

    let hasErrors = false;
    const slugs = new Set();

    console.log('\n🔍 Validating project data...\n');

    projects.forEach((project, index) => {
        const projectName = project.project_name || `Project at index ${index}`;
        const errors = [];

        // Check required fields
        REQUIRED_FIELDS.forEach((field) => {
            if (!project[field]) {
                errors.push(`Missing required field: "${field}"`);
            }
        });

        // Validate slug uniqueness
        if (project.slug) {
            if (slugs.has(project.slug)) {
                errors.push(`Duplicate slug: "${project.slug}"`);
            }
            slugs.add(project.slug);
        }

        // Validate tech_stack is an array
        if (project.tech_stack && !Array.isArray(project.tech_stack)) {
            errors.push('"tech_stack" must be an array');
        }

        // Validate key_challenges structure
        if (project.key_challenges) {
            if (!Array.isArray(project.key_challenges)) {
                errors.push('"key_challenges" must be an array');
            } else {
                project.key_challenges.forEach((challenge, cIndex) => {
                    REQUIRED_CHALLENGE_FIELDS.forEach((field) => {
                        if (!challenge[field]) {
                            errors.push(
                                `key_challenges[${cIndex}] is missing required field: "${field}"`
                            );
                        }
                    });
                });
            }
        }

        // Report results for this project
        if (errors.length > 0) {
            hasErrors = true;
            console.log(`❌ ${projectName}`);
            errors.forEach((error) => console.log(`   └─ ${error}`));
            console.log('');
        } else {
            console.log(`✅ ${projectName}`);
        }
    });

    console.log('\n' + '─'.repeat(50));

    if (hasErrors) {
        console.log('❌ Validation failed. Please fix the errors above.\n');
        process.exit(1);
    } else {
        console.log(`✅ All ${projects.length} projects validated successfully!\n`);

        // Show featured projects summary
        const featured = projects.filter(p => p.is_featured);
        console.log(`📌 Featured Projects (${featured.length}):`);
        featured.forEach(p => console.log(`   • ${p.project_name} (${p.domain_context})`));
        console.log('');
    }
}

validateProjects();
