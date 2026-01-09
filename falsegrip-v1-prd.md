# FalseGrip Coach V1 — Product Requirements Document

## Executive Summary

Build a fitness coaching platform with two interfaces served by a single backend:

| Interface | User | Platform | Purpose |
|-----------|------|----------|---------|
| **Coach Dashboard** | Trainers | Next.js Web App (`webapp[coachUI]/`) | Configure bot behavior, view client conversations, analytics |
| **Client Chat** | End Users | Simple chat app (mobile, to be built) | Simple chat interface to interact with AI coach |

**Core Flow**: Coaches define *how* the bot behaves (persona, rules, questions). Clients interact with an *instance* of that configuration through a simple chat app.

**Backend Note**: All API definitions, database schema, and shared types live in `src/` (single backend serving both UIs).

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              MONOREPO                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────┐     ┌──────────────────┐                       │
│  │   webapp[coachUI]/   │     │   mobile/        │                       │
│  │   (Next.js)          │     │   (Expo)         │                       │
│  │  Coach Dashboard     │     │  Client Chat     │                       │
│  │  (front-end)         │     │  (front-end)     │                       │
│  └──────────┬───────────┘     └────────┬─────────┘                       │
│           │                        │                                     │
│           └──────────────┬─────────┘                                     │
│                          ▼                                               │
│                    ┌───────────────────┐                                │
│                    │     src/          │                                │
│                    │  Backend API      │                                │
│                    │  (src/index.ts)   │                                │
│                    │  DB + types       │                                │
│                    │  Prompt modules   │                                │
│                    │  Service layer    │                                │
│                    └───────────────────┘                                │
│                          │                                               │
│                          ▼                                               │
│                    ┌───────────────────┐                                │
│                    │     Database      │                                │
│                    │    (Postgres)     │                                │
│                    └───────────────────┘                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    OpenRouter     │
                    │       API         │
                    └───────────────────┘
```

---

## Directory Structure

```
FalseGrip-Core/
├── src/                           # BACKEND API + core modules (Node/TS)
├── webapp[coachUI]/               # NEXT.JS COACH DASHBOARD (front-end)
│   ├── app/
│   │   └── api/                    # Temporary Next.js API routes (migrate to src)
│   ├── components/
│   ├── lib/
│   └── db/                         # Current schema (Postgres)
├── mobile/                        # CLIENT CHAT APP (Expo, to be created)
│   ├── app/
│   ├── components/
│   └── ...
├── falsegrip-v1-prd.md
└── README.md
```

---

## Current Repo Context (As-Is)

- `src/index.ts` is currently a WhatsApp bot entrypoint (whatsapp-web.js + Puppeteer) used for a demo; this WhatsApp adapter will be deprecated and must not be integrated into the production backend.
- `src/` already includes the OpenRouter client and prompt modules (`openrouter.ts`, `modulePrompt.ts`, `qnaTemplate.ts`, `scienceBrief.ts`, `chatSummary.ts`, `plateCalorieEstimator.ts`).
- `webapp[coachUI]/` is a Next.js coach dashboard with mock data and UI components; it also includes `app/api/client-configs` routes that talk directly to Postgres via `webapp[coachUI]/lib/db.ts`.
- `webapp[coachUI]/db/schema.sql` defines a minimal `client_configs` table (JSONB) and is the only schema currently captured in repo.
- No client chat app exists yet; the client UI must be a simple chat app (mobile) that consumes the `src/` backend.
- There is no root `package.json` for the backend service yet; only `webapp[coachUI]` has app dependencies.

---

# PHASE 1: PROJECT FOUNDATION

## 1.1 Repo Alignment (Current State: src/ backend + webapp[coachUI]/ + client app planned)

### 1.1.1 Workspace Strategy
- **Task**: Decide whether to introduce a root backend package.json and adopt pnpm workspaces.
- **Subtasks**:
  - If adopting workspaces, include `webapp[coachUI]` and `mobile` (when created) and keep root scripts for the backend.
  - Add shared TypeScript base config (`tsconfig.base.json`) if cross-package types are needed.
  - Update root README with dev commands for backend, `webapp[coachUI]/`, and `mobile/`.
  - Add/confirm `.gitignore` entries for `webapp[coachUI]/node_modules`, `webapp[coachUI]/.next`, and backend build output.
  - Update or archive `webapp[coachUI]/plan.md` (currently references `ui/` and conflicts with this structure).

### 1.1.2 Backend Service Entry (`src/`)
- **Task**: Formalize `src/` as the backend service entrypoint (HTTP API + DB).
- **Subtasks**:
  - Replace the WhatsApp bootstrap in `src/index.ts` with an HTTP server entrypoint.
  - Move the WhatsApp demo into `src/demo/whatsapp` or `scripts/whatsapp` so it is not in the production build.
  - Introduce `src/api/` for route handlers and `src/types.ts` for shared request/response types.
  - Add `src/db/` for schema + migrations (per "API + DB live in src" requirement).

### 1.1.3 Environment Variables Strategy
- **Task**: Define environment variable structure across backend, coach UI, and client app.
- **Subtasks**:
  - Keep `.env.example` at repo root for backend (`OPENROUTER_*`, database).
  - Add `.env.example` for `webapp[coachUI]/` with `NEXT_PUBLIC_API_URL`.
  - Add `.env.example` for `mobile/` with `EXPO_PUBLIC_API_URL`.
  - Add runtime env validation in the backend at startup.

---

## 1.2 Database Design

### 1.2.1 Schema Design
- **Task**: Design complete database schema for all entities
- **Existing schema note**: `webapp[coachUI]/db/schema.sql` currently defines `client_configs` with `client_id` (PK) and a `config` JSONB blob. Decide whether to keep JSONB for v1 or migrate to normalized columns; plan the migration either way.
- **Entities to define**:

#### `coaches` table
- `id`: Primary key (TEXT, UUID format)
- `email`: Unique email address
- `name`: Display name
- `created_at`: Timestamp

#### `client_configs` table
- `id`: Primary key
- `coach_id`: Foreign key to coaches (nullable for v1)
- `name`: Human-readable config name
- `coaching_style`: Enum ('supportive', 'strict', 'balanced')
- `diet_stance`: Enum ('vegetarian', 'vegan', 'non_veg', 'no_preference')
- `primary_goal`: Enum ('fat_loss', 'muscle_gain', 'performance', 'general_health')
- `enabled_modes`: JSON array of enabled chat modes
- `custom_instructions`: Free-text additional system prompt
- `constraints`: JSON object (injuries, equipment, time_limits)
- `non_negotiables`: JSON object (protein_target, steps, sleep_hours)
- `created_at`, `updated_at`: Timestamps

#### `clients` table
- `id`: Primary key
- `config_id`: Foreign key to client_configs
- `name`: Client display name
- `phone`: Optional phone number (future channels; not used in V1)
- `profile`: JSON object (age, height, weight, activity_level, goal_timeline)
- `created_at`, `last_active_at`: Timestamps

#### `conversations` table
- `id`: Primary key
- `client_id`: Foreign key to clients
- `config_id`: Foreign key to client_configs
- `started_at`, `ended_at`: Timestamps
- `message_count`: Integer counter

#### `messages` table
- `id`: Primary key
- `conversation_id`: Foreign key to conversations
- `role`: Enum ('user', 'assistant')
- `content`: Message text
- `mode`: Enum ('qna', 'science', 'calories')
- `image_url`: Optional URL for calorie images
- `calorie_estimate`: Optional JSON for estimate results
- `created_at`: Timestamp

#### `analytics_events` table
- `id`: Auto-increment primary key
- `client_id`, `config_id`: Foreign keys
- `event_type`: Enum ('message_sent', 'calorie_logged', 'science_brief', 'session_start')
- `event_data`: JSON payload
- `created_at`: Timestamp

### 1.2.2 Database Client Setup
- **Task**: Set up database client in `src/db/` (backend)
- **Subtasks**:
  - Choose database provider (Postgres is current in `webapp[coachUI]/`; keep it for v1 unless switching to SQLite/Turso)
  - Create connection client with proper error handling (`pg` if Postgres)
  - Implement query helper functions
  - Add connection pooling/reuse for long-lived Node process
  - Port `webapp[coachUI]/db/schema.sql` into `src/db` migrations as the baseline schema
  - Create migration runner for schema changes

### 1.2.3 Indexes and Performance
- **Task**: Define database indexes for common query patterns
- **Subtasks**:
  - Index on `messages.conversation_id` for fetching conversation messages
  - Index on `conversations.client_id` for client conversation history
  - Index on `analytics_events.client_id` and `analytics_events.created_at` for dashboard queries
  - Index on `clients.config_id` for config-to-client lookups

---

## 1.3 Backend Modules (`src/`)

### 1.3.1 OpenRouter Client (Existing)
- **Task**: Reuse `src/openrouter.ts` inside the backend API.
- **Subtasks**:
  - Keep API key injection via env and share a singleton client across route handlers.
  - Decide whether to keep `undici` or switch to Node 18+ global `fetch`.
  - Normalize errors for consistent API responses.

### 1.3.2 Prompt Modules (Existing)
- **Task**: Validate and extend existing prompt modules in `src/`.
- **Files to audit**:
  - `modulePrompt.ts` — `SCIENCE_PROMPT_TEMPLATE` includes `{{CONTEXT_SECTION}}`; update template or builder to replace it
  - `qnaTemplate.ts`
  - `scienceBrief.ts`
  - `chatSummary.ts`
- **Subtasks**:
  - Verify all template placeholders are properly replaced.
  - Remove WhatsApp-specific wording in system prompts now that the backend serves web/mobile clients.
  - Add unit tests for prompt builders.

### 1.3.3 Calorie Estimator (Existing)
- **Task**: Keep `plateCalorieEstimator.ts` in the backend and align output with API response needs.
- **Subtasks**:
  - Support both structured output (analytics) and rendered text (chat UI).
  - Use base64-only for API calls; keep file path support only in legacy debug scripts if required.

### 1.3.4 Create Persona Builder (New)
- **Task**: Create new module that builds persona prompts from coach config
- **Purpose**: Inject coach settings into system prompts at runtime
- **Inputs**:
  - `coaching_style`: Affects tone of responses
  - `diet_stance`: Affects nutrition recommendations
  - `primary_goal`: Affects advice prioritization
  - `constraints`: Client limitations to respect
  - `non_negotiables`: Rules bot must enforce
  - `custom_instructions`: Freeform additions
- **Output**: Formatted string to append to system prompts
- **Subtasks**:
  - Define `CoachConfig` TypeScript interface
  - Create `buildPersonaPrompt(config: CoachConfig): string` function
  - Handle missing/optional fields gracefully
  - Format output for clean injection into existing prompts

### 1.3.5 Modify Prompt Modules for Persona Injection
- **Task**: Update all prompt generators to accept optional persona prompt
- **Modules to modify**:
  - `qnaTemplate.ts` — Add `personaPrompt?: string` parameter
  - `scienceBrief.ts` — Add `personaPrompt?: string` parameter
  - `plateCalorieEstimator.ts` — Add `personaPrompt?: string` parameter
- **Behavior**: When persona prompt provided, append it to system prompt

### 1.3.6 Shared Types
- **Task**: Create `src/types.ts` with all shared TypeScript types (API + DB)
- **Types to define**:
  - `ChatMode`: 'qna' | 'science' | 'calories'
  - `CoachingStyle`: 'supportive' | 'strict' | 'balanced'
  - `DietStance`: 'vegetarian' | 'vegan' | 'non_veg' | 'no_preference'
  - `PrimaryGoal`: 'fat_loss' | 'muscle_gain' | 'performance' | 'general_health'
  - `CoachConfig`: Full config object type
  - `ClientProfile`: Client profile object type
  - `ChatMessage`: Message type for conversations
  - `CalorieEstimate`: Calorie response type

### 1.3.7 WhatsApp Demo Deprecation
- **Task**: Explicitly deprecate the WhatsApp demo adapter and keep it out of production scope.
- **Subtasks**:
  - Remove WhatsApp-specific flow from the backend build path (or park it under a `demo/` or `scripts/` area).
  - Drop `whatsapp-web.js` + `puppeteer` from production dependencies once the demo is isolated.
  - Do not route production API traffic through WhatsApp-specific commands.
  - Update README to reflect the new backend-first architecture.

---

# PHASE 2: BACKEND API (src)

All HTTP endpoints, request/response types, and database access live in `src/`. Both `webapp[coachUI]/` and `mobile/` consume this single backend.

## 2.1 Chat Endpoint

### 2.1.1 `POST /api/chat` — Core Chat Completion
- **Task**: Create main chat endpoint that mobile app calls
- **Request shape**:
  - `client_id`: Required, identifies the client
  - `message`: Required, user's text input
  - `mode`: Required, one of 'qna' | 'science' | 'calories'
  - `image`: Optional, object with `base64` and `mimeType`
  - `conversation_id`: Optional, to continue existing conversation
- **Response shape**:
  - `response`: Assistant's text response
  - `conversation_id`: ID of conversation (new or existing)
  - `message_id`: ID of the assistant message
- **Subtasks**:
  - Validate request body shape
  - Look up client by `client_id`, return 404 if not found
  - Look up client's config by `config_id`
  - Build persona prompt from config using persona builder
  - Get or create conversation record
  - Save user message to database
  - Route to appropriate prompt module based on `mode`
  - Inject persona prompt into system prompt
  - Call OpenRouter API
  - Save assistant message to database
  - Update conversation message count
  - Log analytics event
  - Return response

### 2.1.2 Error Handling for Chat Endpoint
- **Task**: Define error responses and handling
- **Error cases**:
  - Client not found → 404 with message
  - Config not found → 500 (data integrity error)
  - Mode not enabled for config → 400 with message
  - OpenRouter API error → 500 with generic message, log details
  - Missing image for calories mode → 400 with helpful message
  - Invalid request body → 400 with validation errors

### 2.1.3 Rate Limiting (Optional for V1)
- **Task**: Consider basic rate limiting
- **Options**:
  - Per-client message limits
  - Per-IP limits for abuse prevention
  - Use Redis/Upstash or implement a simple in-memory counter

---

## 2.2 Client Config Endpoints
- **Migration note**: `webapp[coachUI]/app/api/client-configs` currently reads/writes `client_configs` by `client_id` with a JSONB `config` blob. Decide whether to preserve this shape for v1 or migrate to the normalized schema; update the coach UI and data accordingly.

### 2.2.1 `GET /api/client-configs` — List Configs
- **Task**: Return all configs for dashboard
- **Query parameters**:
  - `coach_id`: Optional filter by coach
  - `limit`, `offset`: Pagination
- **Response shape**:
  - `configs`: Array of config objects
  - `total`: Total count for pagination
- **Each config includes**:
  - All config fields
  - `client_count`: Number of clients using this config

### 2.2.2 `POST /api/client-configs` — Create Config
- **Task**: Create new bot configuration
- **Request body**: All config fields (see schema)
- **Response**: Created config object with generated ID
- **Subtasks**:
  - Validate all enum fields have valid values
  - Generate unique ID
  - Set timestamps
  - Insert into database
  - Return created record

### 2.2.3 `GET /api/client-configs/[configId]` — Get Single Config
- **Task**: Return single config by ID
- **Response**: Full config object
- **Error**: 404 if not found

### 2.2.4 `PUT /api/client-configs/[configId]` — Update Config
- **Task**: Update existing config
- **Request body**: Partial config (only fields to update)
- **Response**: Updated config object
- **Subtasks**:
  - Validate config exists
  - Validate enum fields if provided
  - Update `updated_at` timestamp
  - Return updated record

### 2.2.5 `DELETE /api/client-configs/[configId]` — Delete Config
- **Task**: Delete config (soft delete recommended)
- **Considerations**:
  - What happens to clients using this config?
  - Option 1: Prevent deletion if clients exist
  - Option 2: Reassign clients to default config
  - Option 3: Soft delete (mark as inactive)
- **Response**: Success message or error

---

## 2.3 Client Endpoints

### 2.3.1 `GET /api/clients` — List Clients
- **Task**: Return clients for dashboard
- **Query parameters**:
  - `config_id`: Filter by config
  - `search`: Search by name
  - `limit`, `offset`: Pagination
- **Response**: Array of client objects with last active time

### 2.3.2 `POST /api/clients` — Create Client
- **Task**: Create new client (called when client onboards in mobile app)
- **Request body**:
  - `config_id`: Required, which config to use
  - `name`: Optional
  - `profile`: Optional profile object
- **Response**: Created client with generated ID
- **Note**: Client ID is what the mobile app stores locally

### 2.3.3 `GET /api/clients/[clientId]` — Get Client Details
- **Task**: Return single client with stats
- **Response includes**:
  - Client record
  - Associated config
  - Message count
  - Last conversation date
  - Recent activity summary

### 2.3.4 `GET /api/clients/[clientId]/config` — Get Client's Config
- **Task**: Return the config assigned to a client
- **Purpose**: Mobile app calls this to know which modes are enabled
- **Response**: Config object (or relevant subset)

---

## 2.4 Conversation Endpoints

### 2.4.1 `GET /api/conversations` — List Conversations
- **Task**: Return conversations for dashboard viewing
- **Query parameters**:
  - `client_id`: Filter by client
  - `config_id`: Filter by config
  - `from`, `to`: Date range
  - `limit`, `offset`: Pagination
- **Response**:
  - Array of conversation summaries
  - Each includes: client name, message count, start time, last message preview
  - Pagination info

### 2.4.2 `GET /api/conversations/[conversationId]` — Get Full Conversation
- **Task**: Return single conversation with all messages
- **Response**:
  - Conversation metadata
  - Array of all messages in order
  - Client info
  - Config info at time of conversation

### 2.4.3 `GET /api/conversations/[conversationId]/messages` — Get Messages Only
- **Task**: Return just messages for a conversation
- **Query parameters**:
  - `limit`, `offset`: For large conversations
- **Response**: Array of message objects

---

## 2.5 Analytics Endpoint

### 2.5.1 `GET /api/analytics` — Dashboard Stats
- **Task**: Return aggregated statistics for dashboard
- **Query parameters**:
  - `config_id`: Optional filter
  - `period`: 'day' | 'week' | 'month'
  - `from`, `to`: Custom date range
- **Response sections**:

#### Summary Stats
- Total clients
- Active clients in period
- Total messages
- Messages in period

#### By Mode Breakdown
- Count of QnA messages
- Count of Science messages
- Count of Calories messages

#### Daily Activity
- Array of date → message count → unique clients
- For charting trends

#### Top Topics (Optional for V1)
- Most common question themes
- Requires text analysis

### 2.5.2 Analytics Data Collection
- **Task**: Define what events to track
- **Events**:
  - `session_start`: Client opens app
  - `message_sent`: Any message (with mode)
  - `calorie_logged`: Calorie estimation completed
  - `science_brief`: Science brief requested
- **Storage**: Insert into `analytics_events` table with JSON payload

---

# PHASE 3: COACH DASHBOARD (Next.js Web App)

Current state: `webapp[coachUI]/` already contains a mock dashboard UI (single-page, mock data) plus temporary Next.js API routes under `app/api/client-configs`. This phase focuses on wiring the UI to the `src/` backend and removing those Next.js API routes once backend endpoints exist.

## 3.1 Project Setup

### 3.1.1 Next.js Configuration
- **Task**: Audit the existing Next.js project in `webapp[coachUI]/`.
- **Subtasks**:
  - Confirm App Router usage (already in place).
  - Set up `NEXT_PUBLIC_API_URL` for backend access.
  - Verify path aliases and environment variable loading.
  - Confirm deployment target for a front-end-only app.
  - Remove/replace `app/api` routes after `src/` endpoints are available.

### 3.1.2 Styling Setup
- **Task**: Confirm Tailwind + global styles are already in place.
- **Subtasks**:
  - Align color tokens with brand palette.
  - Add dark mode only if needed for V1.

### 3.1.3 UI Component Library
- **Task**: Reuse existing shadcn/ui components and add missing ones.
- **Components to ensure**:
  - Button, Input, Textarea
  - Card, CardHeader, CardContent
  - Select, Checkbox
  - Table
  - Tabs
  - Dialog/Modal
  - Toast notifications
- **Subtasks**:
  - Verify components render correctly in `webapp[coachUI]/`.

---

## 3.2 Layout and Navigation

### 3.2.1 Root Layout (`app/layout.tsx`)
- **Task**: Create root layout with providers
- **Elements**:
  - HTML/body wrapper
  - Global styles import
  - Toast provider
  - Any context providers

### 3.2.2 Dashboard Layout (`app/dashboard/layout.tsx`)
- **Task**: Create dashboard shell with sidebar
- **Elements**:
  - Sidebar component (fixed left)
  - Main content area (scrollable)
  - Header with breadcrumbs (optional)

### 3.2.3 Sidebar Component
- **Task**: Create navigation sidebar
- **Navigation items**:
  - Dashboard (home/overview)
  - Clients (list)
  - Configuration (bot settings)
  - Conversations (history)
- **Features**:
  - Active state highlighting
  - Icons for each item
  - Collapsible on mobile (optional for V1)

---

## 3.3 Dashboard Home Page

### 3.3.1 Stats Cards Section
- **Task**: Create summary statistics display
- **Cards to show**:
  - Total Clients (number)
  - Active Clients (last 7 days)
  - Total Messages (all time)
  - Messages Today
- **Subtasks**:
  - Create StatsCard component
  - Fetch data from `/api/analytics`
  - Display loading state
  - Handle errors gracefully

### 3.3.2 Activity Chart Section
- **Task**: Create message activity line/bar chart
- **Chart requirements**:
  - X-axis: Days (last 7 or 30 days)
  - Y-axis: Message count
  - Optional: Overlay unique client count
- **Subtasks**:
  - Choose charting library (Recharts recommended)
  - Create ActivityChart component
  - Fetch daily activity data
  - Implement responsive sizing

### 3.3.3 Recent Conversations Section
- **Task**: Create recent activity feed
- **Display for each conversation**:
  - Client name
  - Time started (relative: "2 hours ago")
  - Message count
  - Last message preview (truncated)
- **Subtasks**:
  - Create ConversationPreviewCard component
  - Fetch recent conversations
  - Link to full conversation view
  - Show empty state if no conversations

### 3.3.4 Mode Distribution Section (Optional)
- **Task**: Show pie/donut chart of message types
- **Segments**:
  - QnA percentage
  - Science percentage
  - Calories percentage
- **Purpose**: Help coach understand how clients use the bot

---

## 3.4 Clients Page

### 3.4.1 Client List View (`app/clients/page.tsx`)
- **Task**: Display all clients in table/grid
- **Columns/fields**:
  - Name
  - Config name (which bot config they use)
  - Last active (relative time)
  - Message count
  - Actions (view details)
- **Features**:
  - Search by name
  - Filter by config
  - Sort by last active / message count
  - Pagination

### 3.4.2 Client Card Component
- **Task**: Create card for grid view option
- **Display**:
  - Client name/avatar
  - Config badge
  - Last active time
  - Quick stats (messages, sessions)
- **Click action**: Navigate to client detail

### 3.4.3 Client Detail Page (`app/clients/[clientId]/page.tsx`)
- **Task**: Show individual client information
- **Sections**:
  - Client profile (name, phone, profile data)
  - Assigned config summary
  - Activity summary (total messages, favorite mode, etc.)
  - Recent conversations list
- **Actions**:
  - Edit client profile
  - Change assigned config
  - View all conversations

### 3.4.4 Client Conversations Page (`app/clients/[clientId]/conversations/page.tsx`)
- **Task**: Show all conversations for a client
- **Display**:
  - List of conversations with dates
  - Message counts
  - Duration
- **Click action**: Open conversation viewer

---

## 3.5 Configuration Page

### 3.5.1 Config List View (`app/config/page.tsx`)
- **Task**: Show all bot configurations
- **Display for each**:
  - Config name
  - Coaching style badge
  - Primary goal
  - Client count using it
  - Created/updated date
- **Actions**:
  - Create new config
  - Edit existing
  - Duplicate config
  - Delete (with confirmation)

### 3.5.2 Config Editor Component
- **Task**: Create form for editing/creating configs
- **Form sections**:

#### Basic Info Section
- Config name (text input)
- Description (optional textarea)

#### Persona Settings Section
- Coaching style (select: supportive/strict/balanced)
- Diet stance (select: vegetarian/vegan/non-veg/no preference)
- Primary goal (select: fat loss/muscle gain/performance/general health)

#### Enabled Features Section
- Checkbox for each mode (QnA, Science, Calories)
- At least one must be selected

#### Non-Negotiables Section
- Protein target (number input, grams)
- Daily steps target (number input)
- Sleep hours target (number input)
- Each is optional

#### Constraints Section
- Injuries/limitations (multi-select or tags input)
- Available equipment (multi-select or tags input)
- Time constraints (text input)

#### Custom Instructions Section
- Free-text textarea for additional bot instructions
- Character limit indicator
- Help text with examples

### 3.5.3 Config Preview
- **Task**: Show how the bot will behave with current settings
- **Display**:
  - Generated persona prompt preview
  - Example response style description
- **Purpose**: Help coach understand impact of settings

### 3.5.4 Config Validation
- **Task**: Validate config before saving
- **Rules**:
  - Name is required
  - At least one mode enabled
  - Enum fields have valid values
  - Number fields are non-negative
- **Display**: Inline error messages

---

## 3.6 Conversation Viewer

### 3.6.1 Conversation List Page (`app/conversations/page.tsx`)
- **Task**: Show all conversations across clients
- **Filters**:
  - By client
  - By config
  - By date range
  - By mode used
- **Sorting**:
  - Most recent
  - Most messages
  - Longest duration

### 3.6.2 Conversation Detail View
- **Task**: Show full conversation as chat log
- **Display**:
  - Messages in chronological order
  - User messages on right, assistant on left
  - Timestamps for each message
  - Mode indicator per message
  - Images inline for calorie messages
- **Features**:
  - Read-only (coach cannot send messages)
  - Scroll to specific message
  - Search within conversation

### 3.6.3 Conversation Viewer Component
- **Task**: Create reusable chat log display
- **Props**:
  - `messages`: Array of message objects
  - `clientName`: For display
  - `configName`: For context
- **Features**:
  - Auto-scroll to bottom
  - Load more for long conversations
  - Message grouping by time

---

## 3.7 Shared Dashboard Components

### 3.7.1 Loading States
- **Task**: Create consistent loading indicators
- **Components**:
  - Page-level skeleton loader
  - Table row skeleton
  - Card skeleton
  - Button loading state

### 3.7.2 Empty States
- **Task**: Create friendly empty state displays
- **Contexts**:
  - No clients yet
  - No conversations yet
  - No configs yet
  - Search returned no results
- **Include**: Helpful message + action button where appropriate

### 3.7.3 Error States
- **Task**: Create error display components
- **Types**:
  - Page-level error
  - Section error (retry button)
  - Form submission error
  - Toast error notifications

---

# PHASE 4: CLIENT CHAT APP (Expo)

Current state: no `mobile/` app exists yet. Create a simple chat app backed by the `src/` API.

## 4.1 Project Setup

### 4.1.1 Expo Configuration
- **Task**: Create a new Expo project in `mobile/` focused on a simple chat UI.
- **Subtasks**:
  - Add Expo Router and configure entry to use router.
  - Configure for Expo Go development.
  - Set up EAS Build for production.
  - Configure app.json with proper identifiers.

### 4.1.2 Styling Strategy
- **Task**: Decide on styling approach for the mobile chat UI.
- **Subtasks**:
  - If using NativeWind, install and configure it.
  - If keeping the current StyleSheet + palette approach, remove unused Tailwind steps.

### 4.1.3 Dependencies
- **Task**: Ensure required Expo packages are installed (add if missing)
- **Packages**:
  - `expo-image-picker`: Camera/gallery access
  - `expo-haptics`: Haptic feedback
  - `@react-native-async-storage/async-storage`: Local storage
  - `react-native-safe-area-context`: Safe area handling
  - `expo-router`: Navigation

### 4.1.4 Environment Configuration
- **Task**: Set up environment variables
- **Variables needed**:
  - `EXPO_PUBLIC_API_URL`: Backend URL
- **Subtasks**:
  - Create `.env` file
  - Configure expo-constants for env access
  - Handle different values for dev/prod

---

## 4.2 API Client Layer

### 4.2.1 API Client Module (`mobile/lib/api.ts`)
- **Task**: Create typed API client for backend calls
- **Methods to implement**:
  - `chat(request)`: Send message, get response
  - `getClientConfig(clientId)`: Fetch config for client
  - `createClient(configId)`: Register new client
  - `getClient(clientId)`: Fetch client details
- **Features**:
  - TypeScript types for all requests/responses
  - Error handling with typed errors
  - Base URL from environment
  - Timeout handling

### 4.2.2 API Error Handling
- **Task**: Define error handling strategy
- **Error types**:
  - Network error (offline)
  - Server error (500)
  - Not found (404)
  - Validation error (400)
- **User-facing messages**: Friendly text for each error type

---

## 4.3 State Management

### 4.3.1 Chat Hook (`mobile/hooks/useChat.ts`)
- **Task**: Create hook for chat state and actions
- **State**:
  - `messages`: Array of messages in current session
  - `conversationId`: Current conversation ID
  - `isLoading`: Loading state for API calls
- **Actions**:
  - `sendMessage(content, mode, image?)`: Send new message
  - `clearMessages()`: Clear current session
- **Behavior**:
  - Optimistic UI update (show user message immediately)
  - Handle API errors gracefully
  - Store conversation ID for continuity

### 4.3.2 Client Config Hook (`mobile/hooks/useClientConfig.ts`)
- **Task**: Create hook to fetch and cache client config
- **State**:
  - `config`: Current config object
  - `enabledModes`: Array of enabled modes
  - `isLoading`: Loading state
- **Behavior**:
  - Fetch on mount
  - Cache in AsyncStorage
  - Refetch on app foreground (optional)

### 4.3.3 Storage Utilities (`mobile/lib/storage.ts`)
- **Task**: Create AsyncStorage helper functions
- **Functions**:
  - `getClientId()`: Get stored client ID
  - `setClientId(id)`: Store client ID
  - `clearClientId()`: Remove client ID (logout)
  - `getCachedConfig()`: Get cached config
  - `setCachedConfig(config)`: Cache config

---

## 4.4 Onboarding Flow

### 4.4.1 Onboarding Screen (`mobile/app/onboarding.tsx`)
- **Task**: Create client ID entry screen
- **Purpose**: New users enter their client ID to connect to their coach
- **UI elements**:
  - Title: "Connect to your coach"
  - Text input for client ID
  - "Connect" button
  - Error message display
- **Flow**:
  1. User enters client ID
  2. App validates ID exists (API call)
  3. On success: Store ID, navigate to chat
  4. On failure: Show error, allow retry

### 4.4.2 QR Code Scanning (Optional for V1)
- **Task**: Allow scanning QR code to get client ID
- **Flow**:
  - Coach generates QR with client ID
  - Client scans QR
  - Auto-fills client ID
- **Consideration**: Can be V1.1 feature

### 4.4.3 Entry Point Logic (`mobile/app/index.tsx`)
- **Task**: Route based on onboarding state
- **Logic**:
  - Check if client ID exists in storage
  - If yes: Navigate to chat
  - If no: Navigate to onboarding

---

## 4.5 Chat Interface

### 4.5.1 Chat Screen (`mobile/app/chat.tsx`)
- **Task**: Main chat interface screen
- **Layout**:
  - Mode selector at top
  - Message list (scrollable, most of screen)
  - Input bar at bottom
- **Behavior**:
  - Load client config on mount
  - Handle keyboard properly (input stays visible)
  - Auto-scroll to new messages

### 4.5.2 Mode Selector Component
- **Task**: Create mode switching UI
- **Display**: Horizontal tabs/pills for each mode
- **Props**:
  - `value`: Current mode
  - `onChange`: Mode change callback
  - `enabledModes`: Which modes to show
- **Behavior**:
  - Only show modes enabled in config
  - Highlight selected mode
  - Smooth transition animation

### 4.5.3 Chat List Component
- **Task**: Create scrollable message list
- **Features**:
  - Render messages in order
  - Auto-scroll to bottom on new message
  - Pull to refresh (optional)
  - Show loading indicator when waiting for response
- **Props**:
  - `messages`: Array of messages
  - `isLoading`: Show typing indicator

### 4.5.4 Chat Bubble Component
- **Task**: Create individual message bubble
- **User message style**:
  - Aligned right
  - Blue background
  - White text
- **Assistant message style**:
  - Aligned left
  - Gray background
  - Dark text
- **Features**:
  - Show image thumbnail for image messages
  - Word wrap for long messages
  - Timestamp (optional, can be subtle)

### 4.5.5 Message Input Component
- **Task**: Create input bar with send functionality
- **Elements**:
  - Text input (multiline, max height)
  - Image attach button (only in calories mode)
  - Send button
- **Behavior**:
  - Send button disabled when empty and no image
  - Show selected image preview before send
  - Clear input after send
  - Haptic feedback on send

### 4.5.6 Image Picker Integration
- **Task**: Implement image selection for calorie mode
- **Trigger**: Tap camera button in input bar
- **Options**:
  - Take photo (camera)
  - Choose from gallery
- **Output**: Base64 encoded image + mime type
- **Preview**: Show thumbnail in input area before send

### 4.5.7 Image Preview Component
- **Task**: Show selected image before sending
- **Display**:
  - Small thumbnail
  - Remove button (X)
- **Position**: Above input bar

### 4.5.8 Loading Indicator Component
- **Task**: Show "typing" indicator while waiting for response
- **Display**: Animated dots or pulsing bubble
- **Position**: In chat list, after last message

---

## 4.6 Polish and UX

### 4.6.1 Keyboard Handling
- **Task**: Ensure input stays visible when keyboard opens
- **Implementation**:
  - Use KeyboardAvoidingView
  - Handle iOS vs Android differences
  - Test with different keyboard heights

### 4.6.2 Haptic Feedback
- **Task**: Add tactile feedback for actions
- **Triggers**:
  - Send message: Light impact
  - Mode change: Selection feedback
  - Error: Error feedback

### 4.6.3 Error States
- **Task**: Handle and display errors gracefully
- **Error scenarios**:
  - Network offline: Show offline message, allow retry
  - API error: Show friendly error, allow retry
  - Image too large: Show size limit message
- **Display**: Inline error in chat or toast notification

### 4.6.4 Empty State
- **Task**: Show helpful UI when no messages yet
- **Display**:
  - Welcome message from bot
  - Suggestion prompts based on mode
  - "Try asking..." examples

### 4.6.5 App Icon and Splash Screen
- **Task**: Create branded launch assets
- **Assets needed**:
  - App icon (multiple sizes)
  - Splash screen
- **Location**: `mobile/assets/`

---

# PHASE 5: INTEGRATION AND TESTING

## 5.1 End-to-End Flow Testing

### 5.1.1 Config → Client Flow
- **Test**: Coach creates config, client uses it
- **Steps**:
  1. Coach creates config with "strict" style
  2. Coach creates client with that config
  3. Client connects using client ID
  4. Client sends message
  5. Verify response reflects "strict" style

### 5.1.2 Mode Enablement Flow
- **Test**: Disabled modes don't appear in client app
- **Steps**:
  1. Coach creates config with only QnA enabled
  2. Client connects
  3. Verify only QnA mode visible in selector
  4. Coach enables Science mode
  5. Client refreshes/reopens app
  6. Verify Science mode now visible

### 5.1.3 Conversation Recording Flow
- **Test**: Conversations appear in dashboard
- **Steps**:
  1. Client sends several messages
  2. Coach opens dashboard
  3. Verify conversation appears in list
  4. Open conversation detail
  5. Verify all messages visible

### 5.1.4 Analytics Flow
- **Test**: Activity appears in dashboard stats
- **Steps**:
  1. Note current message count in dashboard
  2. Client sends messages
  3. Refresh dashboard
  4. Verify counts increased

---

## 5.2 Error Scenario Testing

### 5.2.1 Network Errors
- **Test**: App handles offline gracefully
- **Scenarios**:
  - Send message while offline
  - Load app while offline
  - Network drops mid-conversation

### 5.2.2 Invalid Client ID
- **Test**: Onboarding handles bad IDs
- **Scenarios**:
  - Non-existent client ID
  - Malformed client ID
  - Empty client ID

### 5.2.3 API Errors
- **Test**: Both apps handle 500 errors
- **Scenarios**:
  - OpenRouter API fails
  - Database connection fails

---

## 5.3 Performance Testing

### 5.3.1 Long Conversations
- **Test**: UI handles many messages
- **Scenario**: 100+ messages in conversation
- **Check**: Scrolling remains smooth

### 5.3.2 Large Images
- **Test**: Image handling for calorie estimation
- **Scenarios**:
  - Very large image (>5MB)
  - Very small image
  - Different formats (JPEG, PNG, HEIC)

### 5.3.3 Concurrent Users
- **Test**: Backend handles multiple clients
- **Scenario**: Multiple clients sending messages simultaneously
- **Check**: No race conditions in conversation/message creation

---

# PHASE 6: DEPLOYMENT

## 6.1 Backend Deployment (Node Service)

### 6.1.1 Backend Project Setup
- **Task**: Deploy the `src/` backend as a standalone Node service.
- **Subtasks**:
  - Connect Git repository
  - Set root directory to repo root
  - Configure build/start commands for the backend
  - Set environment variables

### 6.1.2 Database Setup
- **Task**: Provision production database
- **Recommendation**: Postgres (to match current `webapp[coachUI]/` usage)
- **Subtasks**:
  - Create Postgres database
  - Run schema migrations
  - Set connection string in backend env vars

### 6.1.3 Domain Configuration (Optional)
- **Task**: Set up custom domain
- **Subtasks**:
  - Add domain in Vercel
  - Configure DNS
  - Verify SSL

---

## 6.2 Front-End Deployment

### 6.2.1 Coach Dashboard Deployment
- **Task**: Deploy `webapp[coachUI]/` as a front-end app (Vercel or similar).
- **Subtasks**:
  - Set root directory to `webapp[coachUI]/`
  - Configure build command
  - Point `NEXT_PUBLIC_API_URL` to the backend

### 6.2.2 Client Chat App Distribution
- **Task**: Create development build for testing
- **Command**: `eas build --profile development`
- **Output**: Install link for testers

### 6.2.3 Environment Configuration
- **Task**: Update API URL for production
- **Change**: `EXPO_PUBLIC_API_URL` to the backend URL

### 6.2.4 TestFlight / Internal Testing (Optional for V1)
- **Task**: Distribute to testers
- **iOS**: TestFlight
- **Android**: Internal testing track

---

## 6.3 Post-Deployment Verification

### 6.3.1 Smoke Tests
- **Task**: Verify basic functionality in production
- **Checks**:
  - Dashboard loads
  - Can create config
  - Mobile app connects
  - Chat works end-to-end

### 6.3.2 Monitoring Setup (Optional for V1)
- **Task**: Set up error tracking
- **Options**:
  - Vercel Analytics
  - Sentry for error tracking
  - LogTail for logs

---

# APPENDIX

## A. Environment Variables Reference

### Root / Shared
```
DATABASE_URL=<postgres-connection-string>
POSTGRES_URL=<postgres-connection-string>
OPENROUTER_API_KEY=<openrouter-key>
```

### `webapp[coachUI]/` (Next.js)
```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### `mobile/` (Expo)
```
EXPO_PUBLIC_API_URL=https://your-app.vercel.app
```

---

## B. API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chat` | Client sends message, gets response |
| GET | `/api/client-configs` | List all configs |
| POST | `/api/client-configs` | Create new config |
| GET | `/api/client-configs/[id]` | Get single config |
| PUT | `/api/client-configs/[id]` | Update config |
| DELETE | `/api/client-configs/[id]` | Delete config |
| GET | `/api/clients` | List all clients |
| POST | `/api/clients` | Create new client |
| GET | `/api/clients/[id]` | Get client details |
| GET | `/api/clients/[id]/config` | Get client's config |
| GET | `/api/conversations` | List conversations |
| GET | `/api/conversations/[id]` | Get conversation with messages |
| GET | `/api/analytics` | Get dashboard statistics |

---

## C. Validation Checklist

### Coach Dashboard
- [ ] Can create new bot configuration
- [ ] Can edit existing configuration
- [ ] Can view list of clients
- [ ] Can view individual client details
- [ ] Can view conversation history
- [ ] Can view individual conversation messages
- [ ] Analytics charts display data
- [ ] Config changes save successfully

### Client Chat App
- [ ] Can enter client ID to connect
- [ ] Invalid client ID shows error
- [ ] Chat works in QnA mode
- [ ] Chat works in Science mode
- [ ] Chat works in Calories mode with image
- [ ] Mode selector shows only enabled modes
- [ ] Messages persist in conversation
- [ ] Loading states display correctly
- [ ] Errors display user-friendly messages

### Integration
- [ ] Coach config "strict" style → client gets direct responses
- [ ] Coach disables "calories" → client doesn't see mode
- [ ] Coach sets protein target → bot mentions it in advice
- [ ] Client conversation appears in coach dashboard
- [ ] Analytics update after client activity

---

## D. Future Enhancements (Not V1)

- Coach authentication (login system)
- Multiple coaches per account
- Push notifications for clients
- Voice input for messages
- Meal logging history and trends
- Workout programming module
- Check-in/habit tracking mode
- Client progress photos
- Export conversation to PDF
