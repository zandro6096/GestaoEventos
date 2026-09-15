# Feature Specification: UX & SaaS Platform Enhancements

**Feature Branch**: `003-ux-saas-improvements`  
**Created**: February 12, 2026  
**Status**: Clarified  
**Last Updated**: February 12, 2026  
**Input**: Comprehensive UX analysis and SaaS robustness improvements for the GestaoEventos hierarchical event management platform

## Executive Summary

This specification addresses critical UX issues and proposes enhancements to transform GestaoEventos into a robust SaaS platform for hierarchical event management. The platform enables organizations to manage events across flexible hierarchical structures where higher-level users (e.g., Pastors) can view and manage events at all subordinate levels (e.g., Obreiros, Discipuladores, Líderes), with customizable permissions, event aliasing, and comprehensive attendance tracking.

**Key Issues Identified**:
- Critical API errors preventing data loading
- Inconsistent navigation and missing routes
- Login page lacks SaaS credibility indicators
- Dashboard provides minimal contextual information
- Missing key SaaS features (pricing tiers, onboarding, help system)
- Insufficient hierarchy visualization and drill-down capabilities
- Limited permission management visibility

## Clarifications

### Session 2026-02-12

- Q: How should the Free tier event limit be calculated? → A: 5 eventos ativos por mês (janela de 30 dias corridos) - eventos passados não contam contra o limite após terem ocorrido
- Q: What layout should be used for the organizational chart visualization? → A: Árvore vertical colapsável (top-down, níveis expandem individualmente) para melhor escalabilidade e familiaridade
- Q: Which payment gateway should be integrated? → A: Mercado Pago (foco Brasil/LATAM, Pix integrado, taxas competitivas)
- Q: How should permission conflicts be resolved when a user belongs to multiple groups? → A: Mais restritiva vence (segurança primeiro, nega acesso em caso de conflito)
- Q: Should internationalization be supported from the beginning? → A: Arquitetura i18n preparada desde o início, mas apenas PT-BR ativo no MVP

## User Scenarios & Testing

### User Story 1 - First-Time User Onboarding (Priority: P1)

A new user arrives at the platform and needs to understand the value proposition, create an account, and get started with their first structure creation or join an existing structure via invitation code.

**Why this priority**: This is the entry point for all users and directly impacts conversion rates and user activation.

**Independent Test**: Can be fully tested by navigating to the landing page, signing up, and completing the onboarding wizard without creating any events.

**Acceptance Scenarios**:

1. **Given** a new visitor on the login page, **When** they click "Solicite acesso", **Then** they should see a clear landing page explaining the platform's value proposition, pricing tiers (Free/Premium), and signup options
2. **Given** a user signing up for the first time, **When** they complete registration, **Then** they should enter a guided onboarding flow with 3 clear options: "Create New Structure", "Join with Invite Code", or "Start Free Trial"
3. **Given** a user selecting "Create New Structure", **When** they complete the wizard, **Then** they should define the hierarchy levels (e.g., Pastor > Obreiro > Discipulador > Líder) and create at least one group
4. **Given** a user on the Free plan, **When** they view features, **Then** they should see clear indicators of limitations (e.g., "5 events/month - Upgrade for unlimited")

---

### User Story 2 - Hierarchical View & Drill-Down (Priority: P1)

A high-level user (e.g., Pastor) needs to view their entire organizational structure and drill down to see specific groups, events, and attendance from the perspective of lower-level users.

**Why this priority**: This is the core value proposition of the platform - hierarchical visibility and management.

**Independent Test**: Can be tested by creating a multi-level structure with events at different levels and verifying the drill-down navigation works correctly.

**Acceptance Scenarios**:

1. **Given** a Pastor user logged in, **When** they access the Dashboard, **Then** they should see an interactive organizational chart showing all subordinate levels with event statistics
2. **Given** a Pastor viewing the hierarchy, **When** they click on a specific Obreiro, **Then** they should see the Dashboard exactly as that Obreiro would see it, including their events and groups
3. **Given** a Pastor in drill-down mode, **When** viewing a subordinate's event (e.g., "Célula"), **Then** they should see the event's nickname, attendance records, who attended, who was absent, and all metadata
4. **Given** a Pastor viewing subordinate data, **When** they want to return to their level, **Then** they should see a clear breadcrumb trail (e.g., "Pastor > Obreiro João > Célula Alpha") with navigation
5. **Given** a user at any hierarchy level, **When** they view events, **Then** they should only see events and data they have permission to access based on their structural position

---

### User Story 3 - Event Creation with Permissions & Aliasing (Priority: P2)

A user needs to create an event, select participating groups/users from their structure, set permissions (can add participants, can edit event details, can change location/time), and define an event nickname for easy identification.

**Why this priority**: Core functionality for event management with the flexible permission system that makes the platform powerful.

**Independent Test**: Can be tested by creating an event, assigning groups, setting various permissions, and verifying they work for different user roles.

**Acceptance Scenarios**:

1. **Given** a user creating an event, **When** they access "Criar Evento", **Then** they should see a clear form with sections: Basic Info, Participants, Permissions, and Schedule
2. **Given** a user in the Participants section, **When** they select groups/users, **Then** they should see a hierarchical tree view of their structure with checkboxes and search functionality
3. **Given** a user setting permissions, **When** they configure options, **Then** they should be able to toggle: "Allow adding participants", "Allow editing event alias", "Allow changing location", "Allow changing date/time"
4. **Given** a user creating an event, **When** they set an event alias, **Then** they should be able to define a custom nickname (e.g., "Célula Vida Nova" instead of just "Célula")
5. **Given** a user with limited permissions viewing an event, **When** they try to edit restricted fields, **Then** those fields should be disabled with a tooltip explaining why

---

### User Story 4 - Dashboard Context & Quick Actions (Priority: P2)

A user logging in needs immediate context about their role, structure position, upcoming events, recent activity, and quick access to common actions.

**Why this priority**: First impression after login significantly impacts daily engagement and perceived value.

**Independent Test**: Can be tested by logging in with different user roles and verifying the dashboard shows appropriate contextual information.

**Acceptance Scenarios**:

1. **Given** a user logging into the dashboard, **When** the page loads, **Then** they should see: their name/role, current structure context (e.g., "Videira Guarulhos"), today's events, and quick action buttons
2. **Given** a user on the dashboard, **When** no events are scheduled for today, **Then** they should see helpful guidance like "No events today" with a "Create Event" CTA
3. **Given** a user viewing the dashboard, **When** they have upcoming events in next 7 days, **Then** they should see a "Próximos Eventos" widget with dates and quick access
4. **Given** a user with unconfirmed attendance, **When** viewing recent events, **Then** they should see pending actions highlighted (e.g., "3 eventos aguardando confirmação de presença")
5. **Given** a user on the dashboard, **When** API errors occur, **Then** they should see user-friendly error messages with retry options instead of technical errors

---

### User Story 5 - SaaS Features & Account Management (Priority: P3)

A user needs to manage their account, view their subscription status, upgrade/downgrade plans, invite team members, and access help resources.

**Why this priority**: Essential for SaaS business model but not blocking core event management functionality.

**Independent Test**: Can be tested by accessing account settings and verifying all SaaS-specific features are present and functional.

**Acceptance Scenarios**:

1. **Given** a user clicking their profile icon, **When** viewing account menu, **Then** they should see options: "My Account", "Subscription & Billing", "Invite Members", "Help & Support", "Logout"
2. **Given** a Free plan user, **When** they access "Subscription & Billing", **Then** they should see current usage (e.g., "3/5 events this month"), plan limits, and a clear "Upgrade to Pro" button with pricing
3. **Given** a user inviting team members, **When** they enter email addresses, **Then** they should specify the role/level in hierarchy and system should send invitation emails with secure tokens
4. **Given** a user needing help, **When** they click "Help & Support", **Then** they should access: Documentation, Video Tutorials, FAQs, and Contact Support
5. **Given** a user viewing any feature, **When** they hover over a "Pro" badge, **Then** they should see a tooltip: "This feature requires Pro plan - Upgrade now"

---

### Edge Cases

- **Orphaned Users**: What happens when a user's superior is deleted from the hierarchy? System should either reassign to next level up or flag for admin review
- **Permission Conflicts**: When a user has conflicting permissions from multiple groups - system MUST apply most restrictive permission (security-first approach: if one group denies access while another allows, denial prevails)
- **Hierarchy Depth Limits**: How deep can hierarchies go? System enforces maximum of 6 levels for performance and UX clarity
- **Event Timezone Handling**: When users in different timezones participate - all times should be stored in UTC and displayed in user's local timezone
- **Bulk Operations**: When a Pastor wants to perform actions on 100+ subordinate events - system should offer batch selection and confirm before applying
- **Offline Access**: When users lose internet connection during event - should support offline attendance marking with sync on reconnect
- **Data Export**: When users want to export attendance records - should support CSV/Excel export with date ranges and filters
- **Account Deactivation**: When a user leaves the organization - their events and data should be transferable to another user before account deletion
- **Invalid Invite Codes**: When a user tries to join with expired/invalid code - show clear error with option to request new invitation
- **Concurrent Editing**: When two users edit the same event simultaneously - last save should win with notification to both users

## Requirements

### Functional Requirements

#### Authentication & Onboarding
- **FR-001**: System MUST provide a public landing page explaining the platform's value proposition, target users (churches, organizations with hierarchies), and key features
- **FR-002**: System MUST offer two signup flows: "Create New Structure" (become organization owner) and "Join with Invite Code" (join existing structure)
- **FR-003**: System MUST implement a guided onboarding wizard with progress indicators (Step 1 of 3) for new structure creation
- **FR-004**: System MUST validate invite codes, check expiration, and automatically assign users to the correct hierarchy level upon acceptance

#### Dashboard & Navigation
- **FR-005**: System MUST display user context prominently: name, role, current structure, and current group selection
- **FR-006**: System MUST show today's events on dashboard with quick actions: "View Details", "Mark Attendance", "Edit"
- **FR-007**: System MUST handle API errors gracefully with user-friendly messages and retry mechanisms instead of showing technical error details
- **FR-008**: System MUST provide a search function to quickly find events, groups, and users across the accessible hierarchy
- **FR-009**: System MUST fix broken navigation routes (e.g., /estrutura/hierarquia currently returns 404)

#### Hierarchical Management
- **FR-010**: System MUST display an interactive organizational chart as a vertical collapsible tree (top-down layout) showing the full structure hierarchy where each level can expand/collapse individually
- **FR-011**: System MUST allow high-level users to "drill down" and view dashboards/events from the perspective of any subordinate user
- **FR-012**: System MUST show a breadcrumb trail when in drill-down mode (e.g., "Dashboard > Pastor João > Obreiro Maria > Célula Alpha")
- **FR-013**: System MUST enforce permission boundaries - users can only view/edit within their authorized scope
- **FR-014**: System MUST allow structure creators to define custom hierarchy level names (not hardcoded to Pastor/Obreiro/etc.)
- **FR-015**: System MUST support up to 6 levels of hierarchy depth for organizational flexibility

#### Event Management
- **FR-016**: System MUST allow users to create events and select participating groups/users via an interactive hierarchy tree picker
- **FR-017**: System MUST support event aliasing - users can assign custom nicknames to events (e.g., "Célula Vida Nova" for a cell group meeting)
- **FR-018**: System MUST provide granular permission settings per event: add participants, edit alias, change location, change date/time
- **FR-019**: System MUST show who attended and who was absent for each event with timestamps and optional notes
- **FR-020**: System MUST allow event creators to transfer ownership to another user within the structure
- **FR-021**: System MUST support recurring events with customizable patterns (daily, weekly, monthly, custom)

#### SaaS Features
- **FR-022**: System MUST implement a Free tier with limitation of 5 active events per rolling 30-day period (past events don't count after occurrence), 1 structure maximum, and basic email support
- **FR-023**: System MUST implement at least one paid tier (Pro/Premium) with expanded limits: unlimited events, unlimited structures, and priority support
- **FR-024**: System MUST display plan limitations contextually throughout the UI (e.g., "3/5 events used this month")
- **FR-025**: System MUST provide a subscription management page showing current plan, usage (e.g., "3/5 events in last 30 days"), billing history, and upgrade options
- **FR-026**: System MUST support secure payment processing for plan upgrades via Mercado Pago integration with support for credit/debit cards, Pix, and boleto bancário
- **FR-027**: System MUST allow users to invite team members with role assignment via email invitations

#### Help & Support
- **FR-028**: System MUST provide accessible help resources: Documentation, Video Tutorials, FAQs
- **FR-029**: System MUST offer contextual help tooltips on complex features using'?' icons or info indicators
- **FR-030**: System MUST provide a contact support mechanism (email, chat, or ticket system) with response time expectations
- **FR-031**: System MUST include a product tour/walkthrough for new users highlighting key features

#### Data & Export
- **FR-032**: System MUST support data export (CSV/Excel) for events, attendance records, and user lists within permission boundaries
- **FR-033**: System MUST store all dates/times in UTC and display in user's local timezone with clear timezone indicators
- **FR-034**: System MUST maintain audit logs for sensitive actions (permission changes, user deletions, structure modifications)
- **FR-035**: System MUST implement internationalization (i18n) architecture from the start using Angular i18n or ngx-translate, with Portuguese (PT-BR) as the only active language in MVP

### Key Entities

- **User**: Represents an authenticated user with email, name, role, associated structures, and permission sets
- **Structure**: Represents an organizational hierarchy with owner, custom level names, and member count; one user can belong to multiple structures
- **Hierarchy Level**: Custom-named level within a structure (e.g., "Pastor", "Líder de Célula") with depth position (1-6)
- **Group**: A collection of users at a specific hierarchy level within a structure (e.g., "Obreiros São Paulo")
- **Event**: A scheduled gathering with name, alias, date/time, location, creator, assigned groups/users, attendance records, and permission settings
- **Event Permission**: Granular settings controlling who can modify specific event attributes (participants, alias, location, schedule)
- **Attendance Record**: Documents who attended/missed an event with timestamp, notes, and recording user
- **Invite Code**: Time-limited token for joining structures with target hierarchy level and expiration date
- **Subscription**: User's or Structure's plan (Free/Pro), current period, usage metrics, payment status, and billing history
- **Drill-Down Context**: Temporary session state tracking current hierarchical focus for superior users viewing subordinate perspectives

## Success Criteria

### Measurable Outcomes

#### User Experience
- **SC-001**: New users complete account creation and onboarding (create or join structure) in under 5 minutes with 80%+ success rate
- **SC-002**: Dashboard loads with full contextual information (events, structure, quick actions) in under 2 seconds
- **SC-003**: Zero technical error messages visible to end users - all errors presented in user-friendly language with clear next steps
- **SC-004**: Users can navigate from high-level dashboard to specific subordinate event details in 3 clicks or less
- **SC-005**: 90%+ of users successfully create their first event with correct permissions on first attempt without help docs

#### SaaS Business Metrics
- **SC-006**: Free-to-paid conversion rate increases as plan limitations become visible throughout the UI
- **SC-007**: Average time-to-first-value (first event created) decreases by 50% with improved onboarding
- **SC-008**: User retention after 30 days improves due to better dashboard engagement and hierarchy visibility
- **SC-009**: Support ticket volume decreases by 40% with comprehensive help system and contextual tooltips

#### Technical Performance
- **SC-010**: All API endpoints return responses successfully with <500ms latency for 95% of requests
- **SC-011**: System handles 1,000 concurrent users without performance degradation
- **SC-012**: Hierarchical data queries (drill-down views) complete in under 1 second for structures up to 500 users
- **SC-013**: Zero critical navigation errors (404s, broken routes) exist in production environment

#### Feature Adoption
- **SC-014**: 60%+ of power users (those with subordinates) actively use drill-down feature weekly
- **SC-015**: 75%+ of events have custom aliases set, indicating users find value in the feature
- **SC-016**: Average number of permission customizations per event exceeds 2, showing granular control is utilized
- **SC-017**: Data export feature is used by 30%+ of users monthly, validating need for reporting capabilities

## Assumptions & Dependencies

### Assumptions
- Users have reliable internet connectivity (minimum 3G mobile or better)
- Organizations using the platform have at least 5 members to benefit from hierarchical features
- Users are comfortable with web-based applications and basic navigation patterns
- Payment processing will use Mercado Pago for Brazil/LATAM market with support for Pix, credit/debit cards, and boleto
- Email delivery for invitations has 99%+ reliability through transactional email service
- Backend API will be enhanced to support all hierarchical queries efficiently
- Users primarily access from desktop browsers; mobile optimization is secondary (70/30 usage split assumption)
- Free tier users understand the 30-day rolling window for event limits and can track their usage in the UI
- Frontend will be architected with i18n support from day one, allowing future language additions without refactoring

### Dependencies
- **Backend API Team**: Must implement new endpoints for hierarchy drill-down queries and permission enforcement with most-restrictive conflict resolution
- **Mercado Pago Integration**: Requires business account setup, API credentials, webhook configuration, and PCI compliance validation
- **Email Service**: Transactional email service (SendGrid/AWS SES) must be configured for invitations
- **Database Performance**: May require indexing optimization for hierarchical queries on large datasets; composite indexes for rolling 30-day event queries
- **Design Team**: UI/UX designs for new components (collapsible tree org chart, drill-down breadcrumbs) needed before implementation
- **Documentation Team**: Help content, videos, and FAQs must be created in parallel with feature development in Portuguese (PT-BR)
- **i18n Setup**: Angular i18n or ngx-translate library must be configured; translation keys structure defined; future language files prepared

### External Constraints
- **PCI Compliance**: Payment processing must meet PCI-DSS requirements - no card data stored locally
- **GDPR/Privacy**: User data export and deletion workflows must comply with data protection regulations
- **Browser Support**: Must support Chrome, Firefox, Safari, Edge (latest 2 versions); IE11 not supported
- **Accessibility**: Should meet WCAG 2.1 Level AA standards for inclusive access

## Open Questions

1. **Mobile Strategy**: Should we build a responsive web app first or native mobile apps? Recommendation: Responsive web first, native apps in Phase 2 based on demand
2. **Email Service Selection**: Should we use SendGrid (better deliverability, higher cost) or AWS SES (lower cost, requires more setup)? Recommendation: SendGrid for ease of setup and reliability

## Out of Scope

The following items are explicitly excluded from this specification and may be considered for future iterations:

- **Native Mobile Applications**: iOS/Android apps (responsive web only for MVP)
- **Advanced Analytics Dashboard**: Business intelligence, charts, trend analysis beyond basic counts
- **Integration with External Calendars**: Sync with Google Calendar, Outlook, iCal
- **Video Conferencing Integration**: Built-in Zoom/Teams meeting links and management
- **Custom Branding**: White-label options for organizations to customize colors/logos
- **API for Third-Party Integrations**: Public REST API for external developers
- **Advanced Reporting Engine**: Custom report builder with filters, grouping, scheduling
- **Multi-Tenancy at Database Level**: Separate database instances per organization (single DB with isolation for MVP)
- **Offline-First Architecture**: Full PWA with comprehensive offline capabilities (basic offline attendance only)
- **AI-Powered Features**: Attendance predictions, scheduling suggestions, anomaly detection

## Notes

**Context from UX Analysis**: 
During browser testing using MCP Playwright, several critical issues were identified:
- Login page lacks trust signals and value proposition for SaaS conversion
- Dashboard shows technical API errors ("Recurso não encontrado") instead of user-friendly messages
- Navigation sidebar is present but several routes return 404 errors (/estrutura/hierarquia)
- Onboarding page exists but provides limited guidance on next steps
- No visible indication of user's current hierarchical context or role
- "Pastores" dropdown exists in header but purpose and functionality unclear
- PrimeNG Sakai branding in footer should be replaced with GestaoEventos branding
- No visible help system, documentation links, or tooltips for complex features
- Subscription/billing status not visible anywhere in interface

**Technical Observations**:
- Angular application with standalone components architecture
- PrimeNG component library utilized for UI elements
- Context service for managing user's structure/group state exists
- Authentication working but post-login experience needs enhancement
- API consistently returns 404/405 errors suggesting backend incomplete or mismatched routes

**Priority Justification**:
P1 items (Onboarding, Hierarchical View, Dashboard) are gating factors for user activation and core value delivery. Without these, users cannot effectively use the platform's unique hierarchical capabilities. P2 items (Event Creation, Permissions) enable the main workflow once users are activated. P3 items (SaaS Features, Account Management) are business-critical but can function with basic implementations initially while refining based on user feedback.
