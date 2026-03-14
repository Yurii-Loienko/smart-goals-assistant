# SMART Goals Assistant

A local React app for creating, managing, and tracking SMART performance targets for Workday.
Supports AI-assisted goal generation via Claude API and cloud sync via GitHub Gist.

## Features

- **AI-Powered Generation** — Generate 5-7 SMART targets from your profile using Claude API
- **Manual & Template Modes** — Create goals manually or start from pre-built templates
- **Quarterly Plans** — Break each goal into Q1-Q4 action items
- **Milestones & Criteria Tracking** — Track progress with interactive checkboxes and status cycling
- **Progress Dashboard** — Visual overview of milestones completed, criteria met, and overdue items
- **AI Improvement with Diff View** — Paste manager feedback, see before/after comparison before applying
- **AI Chat Sidebar** — Conversational AI assistant for brainstorming and refining goals
- **Multi-User Profiles** — Switch between multiple user profiles locally
- **Year-by-Year Workspaces** — Goals organized by year, with previous year context for AI generation
- **Search & Filter** — Filter goals by status (draft/active/completed) and search by text
- **Export/Import** — JSON export for backup, GitHub Gist sync for cross-browser access
- **Print Export** — Clean printable layout for Workday copy-paste
- **Keyboard Shortcuts** — `N` new goal, `/` search, `Esc` unfocus, `Backspace` go back
- **Dark Mode** — System-aware theme with manual toggle
- **Auto-Save** — Profile changes auto-save with debounce

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## AI Setup (Optional)

To enable AI features, create a `.env` file:

```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Restart the dev server after adding the key. The app works fully without AI — you can create goals manually or from templates.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui (Radix primitives)
- Claude API (Anthropic) for AI features
- localStorage for persistence
- GitHub Gist API for optional cloud sync

## Project Structure

```
src/
├── pages/           # Route pages (Landing, Dashboard, Profile, NewGoal, GoalDetail)
├── components/
│   ├── ui/          # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   ├── goals/       # Goal-specific components (GoalCard, MilestoneList, etc.)
│   └── chat/        # AI chat sidebar
├── hooks/           # Custom hooks (useUserStore, useClaudeAPI, useGistSync, etc.)
├── lib/             # Utilities (constants, dates, formatters, prompts, templates)
└── types/           # TypeScript type definitions
```
