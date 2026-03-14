# SMART Goals Assistant

A local React app for creating, managing, and tracking SMART performance targets.
Supports multi-provider AI integration (9 providers including free options), Kanban board, analytics, and cloud sync via GitHub Gist.

## Features

### Core
- **Multi-User Profiles** — Switch between multiple user profiles locally
- **Year-by-Year Workspaces** — Goals organized by year with context-aware AI generation
- **Quarterly Plans** — Break each goal into Q1–Q4 action items
- **Milestones & Criteria Tracking** — Interactive checkboxes, status cycling (planned → in progress → completed)
- **Activity Log** — Automatic history of status changes, EM feedback, AI actions, and manual notes
- **Search & Filter** — Filter goals by status (draft/active/completed) and full-text search

### Target Board (Kanban)
- **Three columns: Draft → Active → Completed** — visual pipeline like Jira
- **Drag & Drop** — drag cards between columns to change status (native HTML5 DnD, no extra libraries)
- **Move buttons** — hover a card to see forward/backward buttons as an alternative
- **Milestone pipeline** — each card shows a chain of milestone status icons
- **Due dates & overdue warnings** — red highlight for overdue targets

### AI Integration (9 Providers)
- **Ollama** — free, local, fully offline (no API key needed)
- **Google Gemini** — free tier: 15 req/min, 1500 req/day
- **Groq** — ultra-fast inference, generous free tier
- **OpenRouter** — aggregator with free models (`:free` tag)
- **Cloudflare Workers AI** — 10,000 neurons/day free
- **DeepSeek** — high-quality reasoning at low cost
- **xAI (Grok)** — Grok models with real-time knowledge
- **OpenAI** — GPT-4o and other models
- **Anthropic** — Claude models
- **Custom model input** — type any model name manually for any provider
- **AI Settings page** — dedicated page with provider cards, model selection, and built-in test chat
- **Quick LLM selector in chat** — switch provider/model on the fly without leaving the conversation

### AI-Powered Features
- **Goal Generation** — generate 5–7 SMART targets from your profile
- **Goal Improvement with Diff View** — paste manager feedback, see before/after comparison
- **Chat Sidebar** — conversational AI assistant with 3 modes (Generate Ideas, Improve Goal, General Chat)
- **Independent chat histories** — each mode has its own persistent message history per goal

### Analytics & Progress
- **Progress Dashboard** — visual overview of milestones, criteria, and overdue items
- **Analytics Page** — category breakdown, on-track indicator, milestone timeline
- **Per-goal progress bars** — on dashboard cards and board cards

### Export & Sharing
- **JSON Export/Import** — full backup of all data
- **GitHub Gist Sync** — cross-browser access via personal gist
- **Print Export** — clean printable layout for copy-paste

### UX
- **Dark Mode** — system-aware theme with manual toggle
- **Auto-Save** — profile changes auto-save with debounce
- **Keyboard Shortcuts** — `N` new goal, `/` search, `Esc` unfocus, `Backspace` go back
- **Code Splitting** — lazy-loaded pages for fast initial load
- **Error Boundaries** — graceful error handling

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## AI Setup

Go to **AI Settings** (robot icon in the toolbar) and choose a provider:

| Provider | Cost | Setup |
|----------|------|-------|
| Ollama | Free | [Download](https://ollama.com/download), run locally, no key needed |
| Google Gemini | Free tier | Get key at [aistudio.google.com](https://aistudio.google.com/apikey) |
| Groq | Free tier | Get key at [console.groq.com](https://console.groq.com/keys) |
| OpenRouter | Free models | Get key at [openrouter.ai](https://openrouter.ai/keys) |
| Cloudflare AI | Free tier | Get token at [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) |
| DeepSeek | Paid (cheap) | Get key at [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| xAI (Grok) | Paid | Get key at [console.x.ai](https://console.x.ai) |
| OpenAI | Paid | Get key at [platform.openai.com](https://platform.openai.com/api-keys) |
| Anthropic | Paid | Get key at [console.anthropic.com](https://console.anthropic.com/settings/keys) |

All API keys are stored locally in your browser only. The app works fully without AI — you can create goals manually.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui (Radix primitives)
- localStorage for persistence
- GitHub Gist API for optional cloud sync
- Native HTML5 Drag & Drop (no DnD libraries)

## Project Structure

```
src/
├── pages/           # Route pages (Landing, Dashboard, Profile, NewGoal, GoalDetail, Analytics, AISettings, TargetBoard)
├── components/
│   ├── ui/          # shadcn/ui primitives (Button, Card, Dialog, Tabs, etc.)
│   ├── goals/       # Goal-specific (GoalCard, MilestoneList, NotesLog, ProgressOverview, etc.)
│   └── chat/        # AI chat sidebar with LLM quick selector
├── hooks/           # Custom hooks (useUserStore, useAI, useGistSync, useTheme, useDebounce, etc.)
├── lib/             # Utilities (constants, dates, progress, formatters, prompts, seedGoals)
└── types/           # TypeScript type definitions
```
