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
  - `query.ts` - Read-only queries
  - `mutations.ts` - Write operations  
  - `action.ts` - External system integrations
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
src/convex/spm/[entity]/query.ts     # Read-only queries
src/convex/spm/[entity]/mutations.ts # Write operations
src/convex/spm/[entity]/action.ts # External integrations  
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

**Storage Queries (`query.ts`):**
- Read-only operations using `query({})`
- Data retrieval, filtering, aggregation
- No mutations or side effects

**Commands (`mutations.ts`):**
- Write operations using `mutation({})`
- Create, update, delete operations
- Validation using Zod schemas

**Orchestration (`action.ts`):**
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

## Specialized Agent Usage

This project uses specialized agents for different aspects of development. **ALWAYS** use the appropriate agent for the task at hand to ensure architectural consistency and quality standards.

### When to Use Each Agent

**spm-architect** - Use for:
- Designing complex features that span multiple entities
- Planning system architecture and integration points
- Breaking down large requirements into coordinated work streams
- Orchestrating cross-domain implementations

**convex-developer** - Use for:
- Creating or modifying any Convex backend code
- Adding new SPM entities following the mandatory pattern
- Implementing queries, mutations, actions, or triggers
- Database schema changes and Zod integration

**ui-mvvm-developer** - Use for:
- Creating or modifying Svelte components
- Implementing MVVM pattern Views and ViewModels
- Building route pages and CRUD dialog components
- Ensuring design system compliance

**tbm-itsm-expert** - Use for:
- Validating business domain models against TBM 5 standards
- Ensuring ITSM process alignment
- Reviewing entity schemas for industry compliance
- Providing naming conventions and taxonomy guidance

**spm-testing-expert** - Use for:
- Creating comprehensive test coverage for new features
- Writing unit tests for SPM entities and Convex functions
- Implementing integration and e2e testing scenarios
- Ensuring quality standards across all layers

### Agent Collaboration Pattern

For new features, follow this collaboration sequence:
1. **spm-architect** - Design the overall feature architecture
2. **tbm-itsm-expert** - Validate business alignment and standards
3. **convex-developer** - Implement backend components
4. **ui-mvvm-developer** - Create frontend components  
5. **spm-testing-expert** - Add comprehensive test coverage

### Using Specialized Agents

**IMPORTANT**: When working on tasks that match an agent's expertise, use the Task tool to delegate to the appropriate agent:

```typescript
// Example: Creating a new entity
Task tool with subagent_type: "spm-architect" 
→ Design the entity architecture and relationships

Task tool with subagent_type: "tbm-itsm-expert"
→ Validate entity aligns with TBM 5 standards

Task tool with subagent_type: "convex-developer" 
→ Implement the backend entity following SPM patterns

Task tool with subagent_type: "ui-mvvm-developer"
→ Create MVVM components for entity management

Task tool with subagent_type: "spm-testing-expert"
→ Add comprehensive test coverage for the entity
```

This ensures each aspect of development follows the established patterns and quality standards.

## Common Development Workflows

### Adding a New SPM Entity

**MANDATORY: Follow this exact sequence for all new SPM entities**

**Important**: Use the `convex-developer` agent for all backend implementation work. The agent contains detailed code examples and enforces the SPM architecture patterns.

1. **Define Domain Schema** in `src/lib/modules/spm/domain/[Entity]DTO.ts`
2. **Create Table Definition** in `src/convex/spm/[entity]/tables.ts` 
3. **Create Operation Files** (create all, even if initially empty):
   - `query.ts` - Read operations
   - `mutations.ts` - Write operations
   - `action.ts` - External integrations
   - `trigger.ts` - Event triggers
4. **Update Schema Registration** in `src/convex/schema.ts`

**Detailed Implementation**: The `convex-developer` agent contains comprehensive code examples and workflow guidance for each step.

### Agent Integration Notes

- **convex-developer** agent contains detailed code examples for all SPM entity patterns
- **ui-mvvm-developer** agent has comprehensive MVVM component examples  
- **spm-testing-expert** agent provides testing strategies for all layers
- **tbm-itsm-expert** agent validates business domain alignment
- **spm-architect** agent coordinates complex multi-entity features

**Before committing:**
1. Run `npm run lint` to ensure code quality
2. Run `npm run check` for TypeScript validation  
3. Run `npm run test` for full test suite