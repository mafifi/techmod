# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TechMod is a platform for centrally tracking and managing modernization strategy across firms. It helps organizations model products, govern lifecycle, categorize with TBM, track usage, score applications, provide modernization pathways, and govern business cases.

**Tech Stack:**
- **Frontend:** SvelteKit with Svelte 5 and TailwindCSS
- **Backend:** Convex for data management and APIs
- **Deployment:** Cloudflare Workers via adapter-cloudflare
- **Testing:** Vitest (unit) + Playwright (e2e)

## Essential Commands

### Development
- `npm run dev` - Start development server (Vite + SvelteKit)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run ESLint and Prettier checks
- `npm run format` - Format code with Prettier
- `npm run check` - TypeScript checking with svelte-check

### Testing
- `npm run test:unit` - Run Vitest unit tests
- `npm run test:e2e` - Run Playwright e2e tests
- `npm run test` - Run both unit and e2e tests

### Convex Backend
- `npx convex -h` - Convex CLI help
- `npx convex docs` - Open Convex documentation
- `npx convex dev` - Start Convex development server

## Architecture Overview

### Frontend Structure
- `src/routes/` - SvelteKit routes and pages
- `src/lib/ui/` - Reusable UI components and utilities
- `src/lib/modules/` - Business domain modules (organized by feature)
- `src/app.css` - Global styles and TailwindCSS imports

### Backend Structure  
- `src/convex/` - Convex backend functions
- `src/convex/_generated/` - **DO NOT EDIT** - Auto-generated Convex types and bindings
- `src/convex/schema.ts` - Database schema definition
- `src/convex/spm/` - Strategic Product Management domain functions

### Key Patterns

**Service Portfolio Management (SPM) Architecture:**
- Convex-heavy architecture leveraging integrated reactivity, cron scheduling, and triggers
- Eliminates need for complex infrastructure (separate DBs, queues, schedulers)
- Multi-language support (TypeScript, Python, Rust) through Convex
- Domain-driven design with clear separation of concerns

**Domain-Driven Structure:**
- Business entities defined with Zod schemas in `src/lib/modules/spm/domain/`
- Convex tables defined in `src/convex/spm/[entity]/tables.ts`
- Operations separated across specialized files per entity:
  - `storage.query.ts` - Read-only queries
  - `commands.mutations.ts` - Write operations  
  - `orchestration.action.ts` - External system integrations
  - `trigger.ts` - Reactive triggers and event handling

**Testing Setup:**
- Vitest configured for both client (browser) and server environments
- Client tests use `*.svelte.{test,spec}.{js,ts}` pattern
- Server tests use standard `*.{test,spec}.{js,ts}` pattern
- Playwright tests in `e2e/` directory

## Architecture Standards

### Mandatory SPM Entity Pattern

When adding new SPM entities, **ALWAYS** follow this exact file structure and naming pattern:

```
src/lib/modules/spm/domain/[Entity]DTO.ts    # Zod schema + TypeScript types
src/convex/spm/[entity]/tables.ts            # Convex table definition
src/convex/spm/[entity]/storage.query.ts     # Read-only queries
src/convex/spm/[entity]/commands.mutations.ts # Write operations
src/convex/spm/[entity]/orchestration.action.ts # External integrations  
src/convex/spm/[entity]/trigger.ts           # Reactive triggers
```

### File Responsibilities

**Domain Layer (`src/lib/modules/spm/domain/`):**
- Define Zod schemas with validation rules
- Export TypeScript types using `z.infer<typeof Schema>`
- Keep domain logic pure and framework-agnostic

**Table Definition (`tables.ts`):**
- Single table export using `zodOutputToConvex(Schema)`
- Import schema from domain layer
- No business logic, only table structure

**Storage Queries (`storage.query.ts`):**
- Read-only operations using `query({})`
- Data retrieval, filtering, aggregation
- No mutations or side effects

**Commands (`commands.mutations.ts`):**
- Write operations using `mutation({})`
- Create, update, delete operations
- Validation using Zod schemas

**Orchestration (`orchestration.action.ts`):**
- External system integrations using `action({})`
- API calls, file operations, third-party services
- Convex convention for side-effect operations

**Triggers (`trigger.ts`):**
- Event-driven reactions using Convex triggers
- Automated workflows and business rules
- Cross-entity operations and notifications

## Critical Conventions

### Convex Integration
- Never edit files in `src/convex/_generated/` - they are auto-generated
- Use `convex-svelte` hooks for data fetching: `useQuery()`, `useMutation()`
- Convex functions export `query({})` or `mutation({})` from `convex/server`
- Schema validation uses Zod with `zodOutputToConvex()` and `zodToConvex()` helpers

### Zod Schema Guidelines

**Domain Schema Structure:**
- Always create separate `[Entity]PropsSchema` and `[Entity]Schema`
- PropsSchema contains business properties only
- Schema extends PropsSchema with Convex metadata (`_id`, `_creationTime`)
- Use descriptive validation rules (min/max lengths, number ranges)

**Validation Best Practices:**
- Define schemas in domain layer, not in Convex functions
- Use `zodOutputToConvex()` for table definitions
- Use `zodToConvex()` for function argument validation
- Export TypeScript types with `z.infer<typeof Schema>`
- Keep schemas focused on single responsibility

**Schema Integration Pattern:**
```typescript
// Domain (Pure Zod)
export const EntityPropsSchema = z.object({...});
export const EntitySchema = EntityPropsSchema.extend({...});

// Table (Convex + Zod)
export const entities = defineTable(zodOutputToConvex(EntityPropsSchema));

// Function Args (Convex + Zod)
export const create = mutation({
  args: zodToConvex(EntityPropsSchema),
  handler: async (ctx, args) => {...}
});
```

### SvelteKit Specifics
- Uses Svelte 5 syntax with runes (`$props`, `$state`, etc.)
- Layout in `src/routes/+layout.svelte` sets up Convex connection
- Run `npm run prepare` or `svelte-kit sync` after route/schema changes

### Deployment
- Uses `@sveltejs/adapter-cloudflare` for Cloudflare Workers
- Configuration in `wrangler.jsonc` with environment-specific Convex URLs
- Production: `coordinated-hare-711.convex.cloud`
- Staging: `third-parakeet-727.convex.cloud`

## Common Development Workflows

### Adding a New SPM Entity

**MANDATORY: Follow this exact sequence for all new SPM entities**

1. **Define Domain Schema:**
   ```typescript
   // src/lib/modules/spm/domain/[Entity]DTO.ts
   import { z } from 'zod';
   
   export const [Entity]PropsSchema = z.object({
     // Define entity properties with validation
   });
   
   export const [Entity]Schema = [Entity]PropsSchema.extend({
     _id: z.string(),
     _creationTime: z.number().optional(),
   });
   
   export type [Entity]Props = z.infer<typeof [Entity]PropsSchema>;
   export type [Entity] = z.infer<typeof [Entity]Schema>;
   ```

2. **Create Table Definition:**
   ```typescript
   // src/convex/spm/[entity]/tables.ts
   import { defineTable } from 'convex/server';
   import { zodOutputToConvex } from 'convex-helpers/server/zod';
   import { [Entity]PropsSchema } from '../../../lib/modules/spm/domain/[Entity]DTO';
   
   export const [entity]s = defineTable(zodOutputToConvex([Entity]PropsSchema));
   ```

3. **Create Operation Files (create all, even if initially empty):**
   - `src/convex/spm/[entity]/storage.query.ts` - Read operations
   - `src/convex/spm/[entity]/commands.mutations.ts` - Write operations
   - `src/convex/spm/[entity]/orchestration.action.ts` - External integrations
   - `src/convex/spm/[entity]/trigger.ts` - Event triggers

4. **Update Schema Registration:**
   ```typescript
   // src/convex/schema.ts
   import { [entity]s } from "./spm/[entity]/tables";
   
   export default defineSchema({
     [entity]s,
     // ... other tables
   });
   ```

### Adding Operations to Existing SPM Entity

**For Read Operations (`storage.query.ts`):**
```typescript
import { query } from "convex/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("[entity]s").collect();
  },
});
```

**For Write Operations (`commands.mutations.ts`):**
```typescript
import { mutation } from "convex/server";
import { zodToConvex } from "convex-helpers/server/zod";
import { [Entity]PropsSchema } from "../../../lib/modules/spm/domain/[Entity]DTO";

export const create = mutation({
  args: zodToConvex([Entity]PropsSchema),
  handler: async (ctx, args) => {
    return await ctx.db.insert("[entity]s", args);
  },
});
```

**Before committing:**
1. Run `npm run lint` to ensure code quality
2. Run `npm run check` for TypeScript validation
3. Run `npm run test` for full test suite