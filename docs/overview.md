# Managing Modernization at Scale: A Vision for Firm-Wide Technical Debt Management

## Executive Summary

Over the past two years, we have proven that technical debt can be measured and managed at scale.

![Modernization Progress & Scale](./images/modernization-progress-scale.png)

Our Technology Modernization fleet has helped developers modernize over 1,500 applications, delivering measurable business outcomes: delivery lead times reduced by 20%, and change failure rates cut in half across the board. Through a combination of CIO-sponsored initiatives, super department partnerships, and grassroots efforts, we've improved Technical Fitness Scores from 44% to 63%, reduced non-modern applications from 3,083 to 2,352, and tripled the number of Level 4 (highest quality) applications.

We started this journey with 11 key measurements. Now, we're ready to expand our impact.

This document outlines our vision and plan to measure and manage technical debt in all its forms across the firm. By meeting developers where they are in the Software Development Lifecycle (SDLC)—from planning through operations—we will make modernization journeys frictionless, actionable, and aligned with business value.

**Our approach is built on three pillars:**

- **Modern Architecture** - Well-designed systems that scale and adapt
- **Modern Technology** - Current platforms, languages, and tools
- **Modern Practices** - Efficient workflows and engineering excellence

This is not just about technology. It's about enabling agility, reducing risk, and lowering costs across the entire firm. And it's about building the capabilities—backed by TechMod—to sustain modernization at scale for years to come.

## The Cost of Technical Debt

Technical debt is not just a technical problem—it's a business problem. It directly impacts our ability to deliver on three core technology values, each measured by specific KPIs:

![Outcomes & Metrics Alignment](./images/outcomes-metrics-alignment.png)

**1. Enable Growth & Efficiency**

Technical debt slows us down. Legacy systems, outdated technologies, and poorly documented architectures increase development lead times and delay time to deployment readiness. Every day spent navigating technical debt is a day not spent delivering customer value.

**KPIs:**

- **Development Lead Time** - Time from commit to production deployment
- **Time to Deployment Readiness** - Time from feature request to deployment-ready state

**2. Strengthen Resilience**

Technical debt increases risk. High change failure rates, security vulnerabilities in aging dependencies, and brittle systems that break under change all stem from accumulated technical debt. Resilient systems require modern foundations.

**KPIs:**

- **Change Failure Rate** - Percentage of deployments causing production incidents
- **Hygiene Activities** - Effort spent on maintenance, bug fixes, and technical debt remediation

**3. Improve Effectiveness**

Technical debt drains engineering capacity. When developers spend time working around limitations rather than building new capabilities, we reduce pull requests per developer and increase the cost of maintaining our technology infrastructure.

**KPIs:**

- **Pull Requests per Developer** - Developer productivity and contribution rate
- **Infrastructure IP&C Spend** - Infrastructure investment, provisioning, and consumption costs

### The Opportunity

The good news? We can measure these impacts—and we can improve them.

![ASD Success Story](./images/success-story-asd.png)

One example: **ASD (Advisory & Sales Department)** supporting our Investment Banking & Global Capital Markets business achieved remarkable improvements through systematic modernization. Through close partnership to modernize 500+ web applications—adopting WebStack fully (including Java, Spring, Gradle upgrades, Treadmill/MKS, AutoSDLC, and OIDC)—they delivered measurable outcomes:

**Modernization Progress:**

- **15% increase in Technical Fitness Score** - 86.4% of ASD's applications now classified as 'Modern' (scoring 50% or higher), with dramatic growth in Level 3 and Level 4 applications

**Business Impact:**

- **25%+ improvement in AutoSDLC** - Deployment effort reduced from 120+ hours to ~1 hour
- **2.1 days faster delivery lead times** - Reduced from 9.2 to 7.1 days (average)
- **4.4 days faster development lead time** - Reduced from 12.8 to 8.4 days (average)
- **15%+ decrease in AFS dependencies** - Reduced via LIFT distribution and other modernization efforts
- **13% decrease in inactive code repositories** - Decommissioned legacy repos and GRNs
- **13 GRNs modernized** - Contributing toward firm-wide target of 1,000

All while keeping headcount flat.

**This is the opportunity modernization unlocks:** improved agility, reduced risk, and lower investment costs—all achievable with modest effort when approached systematically.

## Our Mission

Our mission is to **measure and help the firm manage technical debt in all its forms**.

We do this through **TechMod**—our Strategic Product Management platform that provides centralized tracking, measurement, and governance of modernization efforts across the firm.

### From 11 Measurements to Comprehensive Coverage

We started with 11 key measurements that gave us visibility into critical aspects of technical debt. These measurements proved their value: they guided over 1,500 application modernizations and delivered measurable improvements in lead times, stability, and delivery performance.

Now, we're expanding our scope to cover technical debt across **three pillars of modernization**:

**Modern Architecture**

- Well-designed systems that scale and adapt
- Clear separation of concerns and bounded contexts
- Architectural patterns that enable agility and maintainability

**Modern Technology**

- Current platforms, languages, and frameworks
- Elimination of deprecated and high-risk dependencies
- Technology choices aligned with firm standards and industry best practices

**Modern Practices**

- Efficient workflows and engineering excellence
- Automated testing, deployment, and operations
- Documentation, collaboration, and knowledge sharing

By measuring technical debt across all three pillars, we can provide a complete picture of modernization health and guide teams toward sustainable improvement.

## Guiding Principles

Our approach to measuring and managing technical debt is grounded in principles that ensure our work delivers real value to developers and the firm:

### 1. Value-Driven Measurement

Every measurement must tie back to our technology value drivers: Enable Growth & Efficiency, Strengthen Resilience, and Improve Effectiveness. We don't measure for measurement's sake—we measure what matters to business outcomes.

### 2. Accuracy and Reliability

Our measurements must be objective, consistent, and trustworthy. Developers need to trust the data to take action on it. We prioritize automated, tool-based measurements over subjective assessments wherever possible.

### 3. Actionable Scores

Scores and metrics are only valuable if developers can act on them. Every measurement must come with clear guidance: what does this score mean? What should I do about it? How do I improve it?

### 4. Meet Developers Where They Are

We integrate modernization guidance directly into the Software Development Lifecycle (SDLC)—from planning through operations. Whether a developer is drafting a requirement in Jira, authoring an ADR, writing code in their IDE, or reviewing a deployment pipeline, our tooling meets them in their workflow with relevant, timely guidance.

### 5. Make the Right Choice, the Easy Choice

Our modernization "recipes"—the patterns, tools, and workflows we provide—must be as efficient as possible. We reduce friction, automate where we can, and provide clear, repeatable paths to improvement. Developer time is precious; we respect it by making modernization journeys as smooth as possible.

### 6. Common Solutions for Common Problems

We promote re-use and convergence on proven patterns. When applications solve the same problem in different ways, we measure that divergence and guide teams toward shared solutions. This reduces duplication, lowers maintenance burden, and leverages tried-and-tested approaches rather than continuously rediscovering what doesn't work.

## Prioritization Framework

![Prioritization Framework](./images/prioritization-framework.png)

With potentially 50-100 different forms of technical debt we could measure and manage, we need a clear framework for deciding where to focus our efforts. Not all technical debt is created equal, and not all of it is worth tackling immediately.

We prioritize technical debt based on three critical criteria:

### 1. Value Alignment

**Can we tie this technical debt to one or more of our technology value drivers?**

Technical debt that clearly impacts Growth & Efficiency, Resilience, or Effectiveness takes priority. Interesting metrics that don't connect to business outcomes are lower priority—we don't measure for measurement's sake.

### 2. Measurement Accuracy

**Can we measure this technical debt accurately and reliably?**

We need objective, consistent measurements that developers trust. Technical debt that requires subjective assessment or manual data collection is harder to scale and less reliable. We prioritize areas where we can automate measurement and provide consistent, trustworthy data.

### 3. Manageability

**Can developers effectively manage and reduce this technical debt?**

Even if we can measure something accurately, if the journey to fix it is arduous, difficult, or unpalatable for developers, adoption will be low and impact will be limited. We prioritize technical debt where we can provide efficient recipes, clear guidance, and practical paths to improvement.

### Our Priorities & Focus

Based on these criteria, technical debt progresses through four stages of readiness for industrialization:

**Stage 1: Value Undefined** (Define)

- Linkage to technology value drivers unclear, difficult to define, or difficult to quantify
- Interesting but business impact uncertain
- **Action:** Strategic assessment to establish connection to Growth & Efficiency, Resilience, or Effectiveness

**Stage 2: Measurement Undefined** (Measure)

- Clear value driver established
- Difficult to measure technical debt accurately and reliably
- **Action:** Build automated, consistent measurement capabilities before broader rollout

**Stage 3: Adoption Difficult** (Improve)

- Clear value driver
- Can measure accurately
- Adoption journey is difficult—cannot co-exist with old tech, or arduous and difficult to automate
- **Action:** Create efficient recipes, automation, and tooling before broad rollout

**Stage 4: Goldilocks** ⭐ (Enable)

- Clear value driver
- Can measure accurately and reliably
- Adoption journey feasible with reasonable automation and effort
- **This is where we scale with the execution team**

Our current measurements (listed in each pillar above) are all at the Goldilocks stage. Our future measurements represent our pipeline—investments we're making to move items from stages 2 and 3 into Goldilocks.

### Team Structure & Capacity

The Technology Modernization fleet is a 20-person team structured to support this progression model:

- **Strategic Assessment (1 person, 5%)**: Connects technical debt to value drivers, requiring unique skillsets spanning development, infrastructure, and technology costs (Stage 1: Value Undefined)
- **Enablement Leadership (4 people, 20%)**: Builds measurement capabilities and creates efficient recipes to move items into Goldilocks (Stages 2 & 3: Measurement Undefined + Adoption Difficult)
- **Execution Team (15 people, 75%)**: Delivers modernization at scale where items are measurable and manageable (Stage 4: Goldilocks)

This structure is a forcing function that ensures we only scale work that is truly ready for industrialization. The execution team's capacity drives our focus on automation, self-service tooling, and repeatable journeys.

### Governance

[To be written: Decision-making process for backlog prioritization and sign-off]

## Our Definition of Modernization

![Three Pillars of Modernization](./images/three-pillars.png)

Modernization is not a single activity—it's a holistic transformation across three interconnected pillars. Each pillar addresses a different dimension of technical debt and requires distinct measurement and intervention strategies.

### Modern Architecture

Modern Architecture means building systems that are maintainable, scalable, and adaptable to change. It's about reducing complexity and increasing clarity.

**Concrete examples include:**

- **Consolidation + Convergence**: "Make the problem smaller" - reducing the number of applications and converging on common solutions
- **Reusable Patterns + Golden Paths**: Proven architectural patterns that teams can adopt to solve common problems consistently
- **Data-centric Architecture**: Modern data platforms, clear data ownership, and appropriate persistence strategies
- **Resiliency**: Moving from synchronous to asynchronous patterns, implementing self-healing systems, circuit breakers, and graceful degradation
- **Evolvable**: Separation of responsibilities, abstraction of implementations, enabling independent evolution of components

**Our approach to measuring Modern Architecture:**

Modern Architecture is the most challenging pillar to measure objectively. Guided by our principles—particularly the need for accurate, reliable, and actionable measurements—we are starting focused and pragmatic.

We leverage **Moderne's Moddy** to measure code objectively and automatically. Our initial focus is on **divergence**: when applications across the firm solve the same problem in different ways. This creates opportunities for **convergence** toward common solutions.

This approach directly supports our technology principle of **"Common Solutions for Common Problems"** with clear outcomes:

- **Reduce duplication**: Less code to write and maintain
- **Lower volume**: Smaller, more focused codebases
- **Proven patterns**: Roll out tried-and-tested solutions rather than rediscovering what doesn't work

By measuring divergence, we can guide teams toward re-use, reduce architectural complexity over time, and ensure consistent patterns across the firm.

**What we currently measure:**

- Code divergence patterns using Moderne's Moddy (identifying when applications solve the same problems differently)
- Opportunities for convergence toward common solutions

**What we will measure:**

- Architectural complexity metrics (cyclomatic complexity, coupling, cohesion)
- System dependency maps and criticality analysis
- ADR coverage, quality, and adherence
- Service boundaries and API design quality
- Database modernization (monolithic databases, data lakes, event streams)
- Re-use metrics (shared libraries, common components, pattern adoption)

### Modern Technology

Modern Technology means staying current with platforms, languages, frameworks, and tools that are actively supported, secure, and performant.

**Concrete examples include:**

- **Cloud-friendly Technologies**: Leveraging cloud-native services, managed platforms, and scalable infrastructure
- **Open Standards**: Containerized environments (Docker, Kubernetes), observability standards (OpenTelemetry), API standards (REST, GraphQL)
- **Standard Software Repositories**: Node package manager (npm), Maven, NuGet, PyPI - centralized dependency management
- **Databases**: Modern data stores like Postgres, MongoDB, Redis, Elasticsearch aligned with use case requirements
- **Modern Authentication**: OIDC, OAuth 2.0, SAML for secure, standardized identity management
- **Linked Data and Semantic Technology**: Graph databases, RDF, knowledge graphs for rich data relationships

**How we define and communicate modernity:**

We leverage the **TBM 5 taxonomy** to organize all technology products into sensible categories and sub-categories. Within each product sub-category, we define what is considered "modern" and what is "legacy," providing clear guidance to help developers on their modernization journey.

These decisions are documented in **Product Decision Records (PDRs)**—inspired by Architectural Decision Records—that capture:

- **Why**: The rationale behind the modernity classification
- **Business Case**: The value and impact of modernization
- **Options Evaluated**: Alternative technologies and approaches considered
- **Pros/Cons**: Trade-offs for each option
- **Implications**: What this means for teams using or migrating from these technologies

**TBM 5 Taxonomy - Technology Delivery & Workplace:**

| Type                        | Category                      | Sub-Category                                                                                                                                                                                                          |
| --------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Workplace**               | Client Computing              | Bring Your Own Device, Computer, Mobile, Virtual Client                                                                                                                                                               |
|                             | Communication & Collaboration | Collaboration, Communication, Print, Productivity                                                                                                                                                                     |
|                             | Connectivity                  | Network Access, Remote Access                                                                                                                                                                                         |
| **Artificial Intelligence** | Agentic                       | Autonomous Navigation, Autonomous Workflow Agent, Intelligent Process Automation (IPA)                                                                                                                                |
|                             | Generative                    | Image & Video Generation, Speech/Music/Audio Generation, Synthetic Data Generation, Text Generation                                                                                                                   |
|                             | Interpretive                  | Computer Vision, Document Processing, Natural Language Processes, Speech Recognition & Processing                                                                                                                     |
|                             | Predictive                    | Predictive Analytics, Predictive Maintenance, Risk Scoring                                                                                                                                                            |
|                             | Prescriptive                  | Automated Planning & Scheduling, Decision Optimization, Recommendation Service                                                                                                                                        |
| **Delivery**                | Development                   | Design & Development, Modernization & Migration, System Integration, Testing                                                                                                                                          |
|                             | Enabling Platforms            | Application Hosting, Content Management, Development Platform, Foundation Platform, Message Bus & Integration, Search, Streaming                                                                                      |
|                             | Operations                    | Capacity Management, Deployment & Administration, Event Management, Scheduling, Tech Service Management                                                                                                               |
|                             | Security & Compliance         | Business Continuity & Disaster Recovery, Cyber Security & Incident Response, Data Privacy & Security, Governance/Risk/Compliance, Identity & Access Management, Security Awareness, Threat & Vulnerability Management |
|                             | Strategy & Planning           | Business Solution Consulting, Enterprise Architecture, Innovation & Ideation, Program/Product/Project Management, Technology Vendor Management, Technology Business Management                                        |
|                             | Support                       | Application Support, Central Print, Service Desk, Tech Training                                                                                                                                                       |
| **Infrastructure**          | Compute                       | Enabling Platforms, Compute on Demand, Mainframe, Physical Compute, Virtual Compute & Containers                                                                                                                      |
|                             | Data Center                   | Enterprise Data Center, Other Data Center                                                                                                                                                                             |
|                             | Data                          | Data Analytics & Visualizations, Data Management, Data Warehouse, Database, Distributed Cache                                                                                                                         |
|                             | Network                       | Data Network, Domain Services, Internet Connectivity, Load Balancing, Virtual Private Network, Voice Network                                                                                                          |
|                             | Storage                       | Backup & Archive, Distributed Storage (CDN), File & Object Storage, Networked Storage                                                                                                                                 |

**What we currently measure:**

- Technology version currency for critical languages and frameworks
- End-of-life (EOL) and end-of-support (EOS) tracking for major platforms
- High-severity CVE exposure

**What we will measure:**

- Comprehensive technology version currency across all language runtimes, frameworks, and libraries
- Full CVE exposure and security vulnerability tracking
- License compliance and open-source governance
- Infrastructure modernization metrics (VM to container, on-prem to cloud)
- Tooling adoption rates (IaC, observability, security scanning)
- PDR coverage and adoption rates per TBM category
- Technology portfolio distribution (modern vs legacy by product sub-category)

### Modern Practices

Modern Practices means adopting workflows, processes, and engineering disciplines that enable teams to deliver faster, more reliably, and with higher quality.

**Concrete examples include:**

- **Arch Documentation**: ADRs (Architectural Decision Records), C4 model diagrams for clear architectural communication
- **Automated Testing + Automated Assurance**: SDLC3 compliance, systematic change management, quality gates in pipelines
- **Everything-As-Code**: Infrastructure, configuration, policy, and documentation managed as version-controlled code
- **Continuous Non-disruptive Deployments**: Blue-green deployments, canary releases, feature flags for zero-downtime updates
- **Security Testing Tools in Build Pipeline**: Static analysis (SAST), dependency scanning, secrets detection, DAST integration
- **Automated Evergreening of Dependencies**: Automated dependency updates, vulnerability patching, version currency tracking
- **SRE Practices**: Blameless postmortems, SLO/SLA tracking, error budgets, on-call rotations
- **Chaos Testing**: Proactive failure injection to validate resilience and recovery mechanisms

**What we currently measure:**

- Deployment frequency and lead time for changes
- Change failure rate and mean time to recovery (MTTR)
- Pull request metrics (size, review time, throughput)

**What we will measure:**

- Test coverage and test execution time
- Documentation coverage and freshness
- Pipeline automation percentage
- Build and test execution times (inner loop speed)
- Developer productivity indicators
- Incident response metrics

## Architectural Implications

These guiding principles have direct architectural implications for how we build TechMod and our broader modernization platform. This section maps each principle to the implications that will aid us in identifying concrete capabilities and system design decisions required to support them.

| Principle                                     | Architectural Implication           | Description                                                                                                                                                                                              |
| --------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Value-Driven Measurement**               | Explicit Value Mapping Requirement  | Every measurement in TechMod must have an explicit mapping to at least one of the three value drivers (Growth & Efficiency, Resilience, Effectiveness) - if it can't be mapped, it shouldn't be measured |
|                                               | Value-Driven Data Model             | The data model must support tracking which value driver(s) each measurement connects to, enabling filtering and reporting by business value                                                              |
|                                               | KPI Measurement and Reporting       | We must be able to measure the value delivered, record these KPIs over time, and report on progress against the value drivers                                                                            |
| **2. Accuracy & Reliability**                 | Deterministic Technology Detection  | We must be able to deterministically confirm what technology an application is using (no guesswork or subjective classification)                                                                         |
|                                               | Traceable Technology Changes        | Changes in what an application is using must be traceable over time (audit trail, version history)                                                                                                       |
|                                               | Common Technology Detection Service | We must use the same common service for determining what technology an application is using (prevents inconsistent detection across tools)                                                               |
|                                               | Common Scoring Service              | We must use the same common service for determining how we're scoring an application (prevents ADR tool recommending one thing while scoring system measures another)                                    |
| **3. Actionable Scores**                      | Meaningful Action Availability      | We can only score on opportunities where the application developer can meaningfully take action (e.g., don't flag old OS version if newer version isn't available to them)                               |
|                                               | Minimum Documentation Requirement   | Every scored item must have, at minimum, documentation on how to address it (we cannot score developers down for not knowing how to fix something we haven't documented)                                 |
| **4. Meet Developers Where They Are**         | SDLC Integration at Every Stage     | Modernization options must be available to developers at every step of the SDLC lifecycle (integrated into Jira and ADR process during planning, IDE during coding, CI/CD pipelines during release)      |
|                                               | Start from Current State            | Modernization journeys must start from where applications already are (no point discussing Python upgrades if teams are running Perl - meet them at their current technology stack)                      |
| **5. Make the Right Choice, the Easy Choice** | Self-Selling Journeys               | Modernization journeys must clearly communicate why they matter to help application teams prioritize them effectively                                                                                    |
|                                               | Discoverability Across SDLC         | Journeys must be easily discoverable across the entire SDLC, not buried in impossible-to-find documentation                                                                                              |
|                                               | Automation and AI Integration       | Use automation and AI to minimize migration effort (integrate with LLMs, use Moderne recipes, automate repetitive tasks)                                                                                 |
|                                               | Incremental Journey Support         | Accept that modernization takes many sprints across complex ecosystems with changing priorities (document the running order, ensure old and new can co-exist during transition)                          |
| **6. Common Solutions for Common Problems**   | [To be written]                     |                                                                                                                                                                                                          |

## The SDLC Lifecycle

![Software Development Lifecycle](./images/sdlc-lifecycle.svg)

Our approach to managing technical debt is built around meeting developers where they are in their daily work. The Software Development Lifecycle (SDLC) provides a natural framework for integrating modernization guidance directly into developer workflows.

We organize our interventions around five key stages:

### Plan

This is where requirements are defined, stories are written, and architectural decisions are made. It's the earliest point where we can influence technical choices and ensure modernization considerations are part of the initial design.

**How we meet developers here:**

- Jira integration that surfaces relevant modernization standards when creating stories
- ADR (Architectural Decision Record) authoring tools that inject recommended patterns and modern technology choices
- Template libraries that guide teams toward proven architectural patterns
- Integration with planning tools to highlight technical debt in the backlog

### Code

This is where developers spend most of their time—writing, reviewing, and refactoring code. It's the most critical stage for embedding modernization guidance directly into the development flow.

**How we meet developers here:**

- IDE plugins aware of internal product documentation and standards
- Code assistants that suggest modern patterns and detect anti-patterns in real-time
- Automated code quality checks that flag technical debt as it's introduced
- Context-aware suggestions based on the TechMod knowledge base

### Test

Testing ensures quality and catches issues before they reach production. Modern testing practices are themselves a key component of technical debt management.

**How we meet developers here:**

- Test coverage analysis and recommendations
- Performance and security testing integrated into CI pipelines
- Automated detection of missing or inadequate tests
- Modernization impact validation (ensuring upgrades don't break functionality)

### Release

The release stage encompasses CI/CD pipelines, deployment automation, and the journey from code commit to production. Modern release practices reduce risk and increase delivery velocity.

**How we meet developers here:**

- Pipeline analysis and optimization recommendations
- Deployment frequency and lead time tracking
- Automated checks for deprecated dependencies before release
- Release gates that enforce modernization standards

### Operate

Once in production, applications must be monitored, maintained, and evolved. Operational excellence is a key indicator of modernization maturity.

**How we meet developers here:**

- Production metrics dashboards showing modernization health
- Incident correlation with technical debt metrics
- Automated alerts for end-of-life technologies in production
- Feedback loops that inform future modernization priorities

By integrating modernization guidance at each stage, we create a continuous, frictionless experience. Developers receive relevant, timely information exactly when they need it—not as an afterthought, but as a natural part of their workflow.

## Scenarios

The following scenarios illustrate how our capabilities come together across the SDLC to meet developers where they are. Each scenario demonstrates how we expose our knowledge base (PDRs, standards, documentation) through MCPs and llms.txt to AI tools, creating seamless integration throughout the software development lifecycle.

### Scenario 1: AI-Assisted ADR Authoring (Plan Stage)

**Context:** A developer needs to document an architectural decision for migrating their application's database layer.

**The Journey:**

1. **Developer opens the ADR web application**
   - Web app provides AI-assisted authoring interface

2. **AI assistant queries TechMod knowledge base via MCP**
   - Knowledge base contains:
     - Product Decision Records (PDRs) for database technologies
     - Architectural standards and patterns
     - Firm-approved technology recommendations
     - Migration guides and recipes

3. **AI provides contextual guidance**
   - Suggests modern database options aligned with firm standards
   - Flags deprecated or legacy technologies automatically
   - Provides pros/cons based on firm's documented experiences (from PDRs)
   - Surfaces relevant migration patterns and success stories

4. **ADR gets authored with firm-aligned recommendations**
   - Decision rationale includes business case from PDRs
   - Options evaluated reflect current firm standards
   - Implications section links to relevant modernization journeys
   - Developer receives consistent guidance aligned with scoring criteria

**Key Capability Requirements:**

- MCP server exposing TechMod knowledge base
- PDR repository with structured metadata
- AI integration layer for ADR web app
- Consistent standards across authoring and scoring systems

### Scenario 2: VSCode Plugin with Integrated Modernization Platform (Code Stage)

**Context:** A developer is working on an application and wants to understand its modernization health and take action to improve it.

**The Journey:**

1. **Developer opens their codebase in VSCode**
   - TechMod VSCode extension activates automatically

2. **Extension displays application modernization dashboard**
   - **Application Score:** Overall modernization health score
   - **Outcome Metrics:** DORA metrics (deployment frequency, lead time, change failure rate, MTTR), incident volumes, technical debt trends
   - **Technology Inventory:** Detected technologies with modernity classifications (modern/legacy/deprecated)

3. **Extension queries TechMod via MCP**
   - Retrieves application's current state and scores
   - Fetches relevant modernization journeys for detected technologies
   - Accesses PDRs, migration guides, and Moderne recipes
   - Pulls outcome metrics from observability platforms

4. **Developer explores recommended modernization journeys**
   - Extension surfaces prioritized journeys based on:
     - Technologies currently in use
     - Highest impact on outcome metrics
     - Goldilocks opportunities (can measure + can manage + clear value)
   - Each journey shows:
     - **Why it matters:** Impact on DORA metrics and business value
     - **Current state:** What needs to change
     - **Target state:** Modern alternative
     - **Effort estimate:** Expected time and complexity

5. **Developer initiates a modernization journey**
   - Selects journey (e.g., "Upgrade Spring Boot 2.7 → 3.2")
   - Extension uses MCP to:
     - Execute diagnostic commands to assess current state
     - Run Moderne recipes to transform code automatically
     - Generate pull requests with changes
     - Update application metadata in TechMod

6. **Code assistant provides ongoing guidance**
   - As developer writes code, assistant queries via llms.txt/MCP
   - Knowledge base provides:
     - Internal product documentation
     - Coding standards and patterns
     - Modern framework usage examples
   - Assistant suggests correct implementations aligned with firm standards
   - Real-time validation against technical debt patterns

7. **Progress tracking and feedback loop**
   - Extension tracks journey progress within TechMod
   - Application score updates as changes are merged
   - Outcome metrics improve over subsequent sprints
   - Success feeds back into knowledge base for future developers

**Key Capability Requirements:**

- VSCode extension with TechMod integration
- MCP server exposing application scores, metrics, and journeys
- Integration with Moderne for automated code transformation
- Connection to observability platforms for outcome metrics
- llms.txt exposure for code assistant integration
- Journey orchestration and progress tracking
- Automated PR generation and metadata updates

### Scenario 3: Marketing Modernization Success (Communicate & Amplify)

**Context:** The modernization fleet wants to showcase impact and benefits at the firm's annual technology conference and through ongoing communications to drive adoption and demonstrate value.

**The Journey:**

1. **Identifying success stories from data**
   - TechMod analytics identify teams with compelling outcomes:
     - Significant improvement in DORA metrics
     - Substantial reduction in technical debt scores
     - High adoption of modernization journeys
     - Measurable business impact (faster delivery, reduced incidents)
   - KPI dashboards surface quantifiable benefits automatically

2. **Tech Comms collaboration using workflow tools**
   - Modernization fleet uses workflow and entitlement tools to:
     - Nominate teams with success stories
     - Coordinate with Tech Comms teams on storytelling
     - Manage approvals and reviews
     - Schedule content across different channels and events

3. **Audience-targeted messaging**
   - **For Technology Leadership (Conferences, Town Halls):**
     - Business impact: "25% reduction in lead time while keeping headcount flat"
     - ROI metrics: Hours saved using modernization tools vs. manual effort
     - Portfolio-level improvements across multiple teams

   - **For Developers (Engineering Blogs, Internal Channels):**
     - Technical details of successful journeys
     - Before/after code examples using Moderne recipes
     - Developer testimonials on improved experience

   - **For Product Owners (Jira Updates, Sprint Reviews):**
     - Velocity improvements and delivery predictability
     - Reduction in production incidents and hotfixes
     - Time reclaimed from technical debt for new features

4. **Multi-channel content distribution**
   - **Annual Conference Expo Booth:**
     - Live dashboards showing firm-wide modernization progress
     - Interactive demos of VSCode plugin and ADR tools
     - Success story showcases with metrics

   - **Internal Communication Channels:**
     - Blog posts and technical articles
     - Slack/Teams announcements with metric highlights
     - Quarterly newsletters with aggregated impact

   - **Executive Reporting:**
     - Business value scorecards tied to technology value drivers
     - Trend analysis showing continuous improvement
     - Investment vs. return analysis

5. **Usage data and ROI tracking**
   - TechMod tracks tool usage and estimates hours saved:
     - Moderne recipe executions vs. manual migration effort
     - Automated PR generation vs. hand-written changes
     - AI-assisted ADR authoring vs. from-scratch documentation
     - VSCode plugin guidance vs. unguided exploration
   - Calculates ROI: developer hours saved × hourly rate = value delivered

6. **Continuous feedback loop**
   - Success stories inform future modernization priorities
   - Marketing effectiveness tracked (engagement, adoption increases)
   - Compelling stories drive further investment and support
   - Demonstrates value to secure continued funding and resources

**Key Capability Requirements:**

- Analytics engine to identify high-impact teams and success stories
- KPI dashboard with business value quantification
- Usage tracking and effort estimation models
- Workflow and entitlement management for Tech Comms collaboration
- Multi-channel content management system
- Audience segmentation and targeted messaging capabilities
- ROI calculation and reporting tools
- Integration with conference/expo presentation systems
- Executive reporting with value driver mapping

## Capabilities

To deliver on our scenarios and architectural implications, we need to build a comprehensive set of capabilities. Each capability is composed of one or more application services that work together to provide specific functionality.

### Capability 1: Identity & Access Management

Secure access and permissions across all modernization platform services.

**Application Services:**

- **Authentication Service** - User identity verification and session management
- **Entitlement Service** - Role-based access control and permission management

### Capability 2: Product Lifecycle Management

Tools for managing products through their lifecycle with clear modernity governance.

**Application Services:**

- **Workflow Service** - Product owner workflows for managing product lifecycle and modernity status
- **Product Catalog Service** - TBM taxonomy-based product catalog with classification and organization
- **Product Modernity Governance Interface** - Tool for governing and ensuring cohesive modernity status across all products
- **PDR Management Service** - Creation, versioning, and management of Product Decision Records

### Capability 3: Knowledge & Documentation

Centralized knowledge base accessible to humans and AI tools throughout the SDLC.

**Application Services:**

- **Documentation Platform** - Central repository for standards, guides, and best practices
- **Documentation Assessment Service** - Identifies missing or weak documentation that needs strengthening
- **MCP Server(s)** - Exposes knowledge base to AI tools (ADR authoring, IDE assistants, etc.)
- **llms.txt Generation Service** - Maintains llms.txt for code assistant integration

### Capability 4: Technology Intelligence

Understanding what technologies are in use and what's appropriate for each context.

**Application Services:**

- **CMDB (Configuration Management Database)** - Technology usage by application inventory
- **Technology Detection Service** - Deterministic identification of technologies in use
- **Localization Management Service** - Documents and manages exceptions where firm-wide recommendations don't apply
- **Localization Governance Tool** - Architecture governance for approved localizations and exceptions

### Capability 5: Measurement & Scoring

Objective, reliable measurement of technical debt and modernization health.

**Application Services:**

- **KPI Service** - Collects and tracks application outcome metrics (DORA, incidents, etc.)
- **Scoring Engine** - Applies scoring methodology to calculate application modernization scores
- **Bi-temporal Scoring Service** - Historical score recalculation when formulae change (enables index rebalancing)
- **Audit & Traceability Service** - Tracks technology changes over time with version history

### Capability 6: Modernization Journey Management

Orchestrating and executing modernization journeys with automated assistance.

**Application Services:**

- **Journey Orchestration Service (LangGraph)** - Manages state and progress of modernization journeys using LangGraph for multi-step, agentic workflows with human-in-the-loop decision points
- **Product Category Agents** - Specialized agents per product category (databases, languages, frameworks) that own and manage their category's recipes, coordinate through LangGraph cycles to handle cross-domain modernization
- **Recommendation Engine** - Surfaces prioritized journeys based on technology stack, impact, and Goldilocks opportunities
- **Moderne Integration Service** - Executes automated code transformations and generates pull requests

### Capability 7: Analytics & Impact Tracking

Understanding usage, impact, and ROI of modernization efforts.

**Application Services:**

- **Usage Tracking & Analytics Service** - Tracks tool usage and estimates effort saved vs. manual approaches
- **Success Story Identification Engine** - Identifies teams with compelling modernization outcomes
- **ROI Calculation Service** - Calculates developer hours saved and business value delivered
- **Integration Layer** - Connects to observability platforms, DORA metrics sources, and incident management systems

### Capability 8: Developer Experience

Meeting developers in their workflow with integrated guidance and tooling.

**Application Services:**

- **VSCode Extension** - IDE plugin showing scores, metrics, journeys, and enabling journey execution
- **IDE Plugin Framework** - Extensible framework for other IDE integrations (IntelliJ, etc.)
- **ADR Authoring Web Application** - AI-assisted architectural decision record authoring tool
- **Code Assistant Integration** - Exposes standards and patterns to AI code assistants via MCP/llms.txt

### Capability 9: Communication & Marketing

Amplifying success stories and demonstrating value across different audiences.

**Application Services:**

- **Multi-Channel Content Management** - Manages content distribution across conferences, blogs, newsletters, executive reports
- **Audience Segmentation Service** - Tailors messaging for leadership, developers, and product owners
- **Executive Reporting & Dashboards** - Business value scorecards tied to technology value drivers
- **Conference & Expo Integration** - Live dashboards and interactive demos for annual events

### Capability 10: Platform Foundation

Cross-cutting concerns that support all other capabilities.

**Application Services:**

- **API Gateway** - Unified entry point for all services with rate limiting and monitoring
- **Event Bus** - Asynchronous communication between services for loose coupling
- **Telemetry & Observability** - Logging, metrics, and tracing for the platform itself
- **Data Warehouse** - Centralized analytics data store for historical analysis and reporting

## From Capabilities to Delivery

The capabilities outlined above represent our comprehensive modernization platform architecture. Delivering all 10 capabilities at once is neither practical nor aligned with our prioritization principles.

Our delivery approach follows the same Goldilocks focus that guides our technical debt prioritization: we build capabilities that enable us to **measure accurately, manage effectively, and deliver clear value**.

**Capability Dependencies and Sequencing:**

Some capabilities are foundational and must be delivered early (Platform Foundation, Identity & Access Management, Technology Intelligence), while others build upon them (Journey Management, Developer Experience). The backlog section that follows maps these dependencies into phased delivery milestones.

**Alignment with Team Structure:**

Our 20-person team structure informs capability prioritization:

- **Strategic Assessment** identifies which capabilities unlock the most value
- **Enablement Leadership** builds foundational capabilities and tooling
- **Execution Team** operationalizes capabilities at scale once measurement and management paths are proven

This ensures we only industrialize capabilities that are ready for broad adoption and can be maintained sustainably.

## Backlog

[To be written]

**Context to cover:**

- Roadmap/phases for capability delivery
- Prioritization aligned to Goldilocks focus (can measure + can manage + clear value)
- Timeline and sequencing
- Capability dependencies and critical path

## TODO: Diagrams & Charts

### Must Have (Core Narrative)

- [x] **Prioritization Framework with Team Structure Overlay** - Horizontal progression showing 4 stages of readiness (Value Undefined → Measurement Undefined → Adoption Difficult → Goldilocks), with resource allocation overlay showing 5% / 20% / 75% distribution across Strategic Assessment / Enablement Leadership / Execution Team
- [x] **Three Pillars of Modernization** - Visual showing Modern Architecture / Modern Technology / Modern Practices with examples and interconnections (saved at `docs/images/three-pillars.png`)
- [x] **Outcomes ↔ Metrics Alignment** - Flow diagram mapping 3 value drivers → 6 KPIs → specific modernization measurements (saved at `docs/images/outcomes-metrics-alignment.png`)
- [ ] **Capabilities Architecture** - 10 capabilities with dependencies, relationships, and Platform Foundation layer

### High Value (Proves Credibility)

- [x] **Modernization Success & KPI Progress** - Impact dashboard showing 1,500 apps modernized, TFS growth 44%→63%, app reduction 3,083→2,352, Level 4 applications tripled (saved at `docs/images/modernization-progress-scale.png`)
- [x] **Success Story: ASD Case Study** - Before/After comparison showing 15% modernity increase, 25%+ AutoSDLC improvement, 2.1 days faster delivery (saved at `docs/images/success-story-asd.png`)

### Nice to Have (Explains How)

- [ ] **Scenario Flows** - UML sequence diagrams for 3 scenarios showing Developer → Tool → MCP → TechMod → External Systems interactions (start with Scenario 2: VSCode plugin)
- [ ] **LangGraph Agent Orchestration** - Cycle showing Product Category Agents coordinating through LangGraph with human-in-the-loop decision points and Moderne recipe connections
- [ ] **Modernization Journey Template** - Example journey (e.g., Spring Boot 2.7 → 3.2) showing: current state detection → Moderne recipe → PR generation → validation → score improvement
- [ ] **SDLC Lifecycle** - Already referenced at `./images/sdlc-lifecycle.svg` (verify exists or create)

### Supporting Detail

- [x] **TBM Taxonomy Table** - Technology Delivery & Workplace taxonomy showing Type → Category → Sub-Category structure (added as table in Modern Technology section)
- [ ] **Measurement Coverage Matrix** - [To be clarified: visualization approach TBD]
