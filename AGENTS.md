# Project Agent Guide

This project is a mobile-first Vite + React single-page quiz app for the local electrician question bank.

## Planning Context

- Project context: `.planning/PROJECT.md`
- Requirements: `.planning/REQUIREMENTS.md`
- Roadmap: `.planning/ROADMAP.md`
- State: `.planning/STATE.md`
- Research: `.planning/research/`

## Current Scope

Build a static app that uses the existing `questions.json` and `options.json` source files. The app should merge them at build time, support sequential practice for true/false, single-choice, and multiple-choice questions, persist records locally, and support JSON export/import.

## Constraints

- Use Vite + React.
- Keep v1 static and deployable to Vercel/GitHub Pages.
- Do not add a backend or account system.
- Preserve source JSON files as source data.
- Mobile-first UI decisions take priority.

## Next Recommended Command

`$gsd-plan-phase 1`
