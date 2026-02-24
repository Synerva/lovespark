# LoveSpark: Relationship Intelligence Platform

LoveSpark is an AI-first Relationship Intelligence Operating System that helps high-achieving individuals and couples UNDERSTAND, ALIGN, and ELEVATE their relationships through data-driven insights and behavioral optimization.

**Experience Qualities**:
1. **Premium & Analytical** - The platform feels like a sophisticated intelligence system, not a therapy app, with data-rich dashboards and precise metrics
2. **Empowering & Non-Judgmental** - Users feel equipped with insights and tools, never pathologized, with AI guidance that's warm yet analytical
3. **Dynamic & Adaptive** - The interface responds to user progress, relationship status changes, and behavioral patterns with context-aware personalization

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a multi-module platform with AI integration, real-time score calculations, dynamic user flows, persistent data tracking, assessment systems, and both individual and couple modes requiring sophisticated state management and routing.

## Essential Features

### Onboarding Flow
- **Functionality**: Multi-step intake capturing attachment style, communication patterns, relationship history, and generating initial RIS baseline
- **Purpose**: Establishes user profile foundation and creates first psychological snapshot for AI personalization
- **Trigger**: First app launch or account creation
- **Progression**: Welcome screen → Mode selection (Individual/Couple) → Attachment assessment → Communication tendencies → Relationship history → AI processing → RIS reveal with animated score ring → Dashboard entry
- **Success criteria**: User completes all intake steps, receives RIS score 0-100, sees personalized first insight, and lands on dashboard

### RIS Score System
- **Functionality**: Calculates and displays Relationship Intelligence Score (0-100) based on three pillars: UNDERSTAND (35%), ALIGN (35%), ELEVATE (30%), with animated delta tracking
- **Purpose**: Provides quantifiable relationship intelligence metric that updates weekly to motivate progress
- **Trigger**: Initial assessment completion, weekly check-ins, protocol completions
- **Progression**: Data input → AI analysis → Sub-score calculations → Weighted aggregation → Animated score update with delta pulse → Insight generation
- **Success criteria**: Score displays prominently with smooth animation, delta shows +/- change, pillar breakdown is accessible

### AI Coach Interface
- **Functionality**: Context-aware conversational AI that knows user's RIS, active challenges, recent check-ins, and provides analytical guidance
- **Purpose**: Offers 24/7 behavioral insights, pattern recognition, and actionable recommendations without therapeutic jargon
- **Trigger**: User initiates chat from dashboard or any module
- **Progression**: User message → Context injection (RIS + pillar scores + recent activity) → GPT-4o processing → Streamed analytical response → Follow-up suggestions
- **Success criteria**: AI responds within 2s, maintains conversation context, suggests relevant exercises, can escalate to human psychologist

### Weekly Check-In
- **Functionality**: Structured 5-10 question reflection on relationship patterns, emotional states, and behavioral wins/challenges
- **Purpose**: Gathers behavioral data for RIS updates and insight generation, creating habit of self-reflection
- **Trigger**: Weekly notification or user-initiated from dashboard
- **Progression**: Check-in prompt → Question cards (slider/multiple choice) → Submission → AI processing animation → RIS update reveal → New insights delivery → Dashboard refresh
- **Success criteria**: Completes in under 3 minutes, generates 2-3 insights, updates RIS with visible delta, feels rewarding

### UNDERSTAND Module
- **Functionality**: Houses Relationship Pattern Scan, Emotional Intelligence Profile, Attachment Style results, Trigger Map, and Behavioral Blind Spot analysis
- **Purpose**: Builds self-awareness foundation through psychological assessments and AI pattern recognition
- **Trigger**: Dashboard pillar card tap or onboarding completion
- **Progression**: Module entry → Assessment selection → Multi-question flow → AI analysis → Visual results (charts/maps) → Insight cards → Progress tracking
- **Success criteria**: User completes at least one assessment, sees visual profile, receives 3+ insights, understand pillar score increases

### ALIGN Module
- **Functionality**: Compatibility Intelligence tools, Communication Analyzer, Couple Alignment Dashboard, Expectation Clarity exercises
- **Purpose**: Surfaces misalignments and provides communication optimization for couples or self-reflection for individuals
- **Trigger**: Dashboard access or after completing UNDERSTAND assessments
- **Progression**: Tool selection → Input communication patterns or couple responses → AI comparative analysis → Alignment score visualization → Guided conversation prompts → Practice exercises
- **Success criteria**: Identifies 2+ alignment gaps, provides actionable communication scripts, improves align pillar score

### ELEVATE Module
- **Functionality**: Weekly Optimization Briefs, Growth Protocols (habit tracks), Progress Charts, Psychologist Session booking
- **Purpose**: Translates insights into behavioral change through structured protocols and professional support
- **Trigger**: Automated weekly brief delivery or user-initiated protocol start
- **Progression**: Brief review → Protocol selection → Daily habit tracking → Streak visualization → Milestone celebrations → Optional session booking
- **Success criteria**: User maintains 3+ day streak, completes one protocol, sees elevate score increase, feels momentum

### Couple Mode
- **Functionality**: Partner invitation system, shared Alignment Score, synchronized check-ins, couple-specific insights
- **Purpose**: Enables both partners to contribute data for richer AI analysis and relationship-level metrics
- **Trigger**: Mode toggle in onboarding or settings
- **Progression**: Invite sent → Partner accepts → Profiles link → Shared dashboard unlocks → Both complete check-ins → Couple-level RIS + Alignment Score generated → Shared insights
- **Success criteria**: Partner successfully links, both see shared metrics, couple insights differ from individual insights

## Edge Case Handling

- **Incomplete Assessments** - Save progress automatically, allow resume from any step, show completion % on dashboard
- **Negative Score Deltas** - Reframe as learning opportunities, provide context (e.g., "Heightened awareness often reveals growth areas"), suggest targeted protocols
- **Stale Data** - Send gentle reminders after 10 days of inactivity, show "Data freshness affects RIS accuracy" message, maintain last known score
- **Partner Disconnection** - Gracefully handle when couple mode partner stops using app, offer "Continue as Individual" with data migration
- **AI Response Failures** - Show "AI Coach is thinking..." with 10s timeout, fallback to pre-written guidance library, offer retry
- **Sensitive Content Detection** - AI identifies crisis language (self-harm, abuse), immediately surfaces crisis resources + psychologist escalation

## Design Direction

The design should evoke intelligence, precision, and empowerment - like a personal analytics dashboard for your relationship. Users should feel they're accessing a sophisticated system that reveals hidden patterns, not entering a therapy office. The aesthetic balances data-rich interfaces with warm, approachable interactions through subtle animations and confident typography.

## Color Selection

A refined palette that avoids romantic clichés, emphasizing intelligence and sophistication.

- **Primary Color (Deep Navy)**: `oklch(0.22 0.04 250)` - Projects authority, depth, and analytical precision; used for headers, key CTAs, and data visualizations
- **Secondary Color (Warm Gold)**: `oklch(0.72 0.12 75)` - Communicates premium quality and achievement; used for score rings, milestones, and success states
- **Accent Color (Soft Teal)**: `oklch(0.65 0.09 195)` - Provides calm, trust, and clarity; used for active states, highlights, and AI coach interface
- **Background (Clean White/Soft Gray)**: `oklch(0.98 0 0)` / `oklch(0.95 0 0)` - Ensures readability and premium feel
- **Muted (Slate Gray)**: `oklch(0.55 0.02 250)` - For secondary text and borders

**Foreground/Background Pairings**:
- Deep Navy (`oklch(0.22 0.04 250)`): White text `oklch(1 0 0)` - Ratio 11.2:1 ✓
- Warm Gold (`oklch(0.72 0.12 75)`): Deep Navy text `oklch(0.22 0.04 250)` - Ratio 7.8:1 ✓
- Soft Teal (`oklch(0.65 0.09 195)`): White text `oklch(1 0 0)` - Ratio 4.9:1 ✓
- White Background (`oklch(0.98 0 0)`): Deep Navy text `oklch(0.22 0.04 250)` - Ratio 12.1:1 ✓

## Font Selection

Typography should convey modern sophistication and scientific precision while remaining approachable for extended reading.

**Primary Typeface**: Sora (geometric sans-serif with refined warmth)
**Secondary Typeface**: Inter (for body text and data labels)

- **Typographic Hierarchy**:
  - **H1 (Module Headers)**: Sora SemiBold / 32px / tight (-0.02em) / 1.2 line height
  - **H2 (Section Titles)**: Sora Medium / 24px / tight (-0.01em) / 1.3 line height
  - **H3 (Card Titles)**: Sora Medium / 18px / normal / 1.4 line height
  - **Body (Insights/Content)**: Inter Regular / 16px / normal / 1.6 line height
  - **Small (Labels/Metadata)**: Inter Medium / 14px / slight (0.005em) / 1.5 line height
  - **Data (Scores/Metrics)**: Sora SemiBold / 48px / tight (-0.02em) / 1.1 line height

## Animations

Animations serve to reinforce progress, reveal insights, and provide tactile feedback - never decorative, always purposeful.

**Key Animation Moments**:
- **RIS Score Ring Fill**: 1.2s ease-out animation when score first appears or updates, with golden gradient fill
- **Score Delta Pulse**: Subtle scale pulse (1.0 → 1.05 → 1.0) over 0.6s when delta appears
- **Pillar Progress Bars**: Staggered fill animation (0.8s each with 0.1s delay) using spring physics
- **Check-In Completion**: Checkmark draw animation + confetti burst for streaks
- **AI Message Stream**: Text streams in character-by-character with 20ms delay for natural feel
- **Insight Card Reveal**: Cards fade in + slide up 20px over 0.4s with stagger for multiple cards
- **Assessment Progress**: Step indicator grows smoothly with subtle bounce
- **Hover States**: 0.2s ease transition for all interactive elements

## Component Selection

- **Components**: 
  - **Dialog** - Onboarding steps, insight reveals, partner invite flow, RIS score updates
  - **Card** - Insight cards, weekly brief, protocol trackers, module entry points
  - **Progress** - Pillar scores, assessment completion, habit streaks, RIS ring (custom SVG)
  - **Tabs** - Switching between UNDERSTAND/ALIGN/ELEVATE modules, Individual/Couple views
  - **Button** - Primary (Warm Gold bg), Secondary (Deep Navy outline), Ghost (text only for AI coach)
  - **Input/Textarea** - AI coach message input, assessment text responses
  - **Select/Radio** - Assessment multiple choice questions
  - **Slider** - Assessment scale questions (1-10), emotional intensity inputs
  - **Badge** - Score deltas (+5), new insight indicators, streak counts
  - **Avatar** - User profile, partner profile in couple mode
  - **Separator** - Module section dividers
  - **Scroll Area** - AI chat history, insight feed

- **Customizations**: 
  - **RIS Score Ring**: Custom SVG circular progress with dual-ring design (inner: current score, outer: goal), golden gradient stroke
  - **Pillar Bar**: Custom component with icon + label + animated progress bar + score number
  - **AI Chat Bubble**: Distinct styling - AI (Soft Teal bg, left-aligned), User (Deep Navy bg, right-aligned)
  - **Assessment Card**: Elevated card with question number badge, smooth slide transitions between questions
  - **Weekly Brief Card**: Hero card with gradient border, prominent date, "Generated by AI" badge

- **States**: 
  - **Buttons**: Default → Hover (brightness +10%, scale 1.02) → Active (scale 0.98) → Disabled (opacity 50%)
  - **Input Focus**: Border color transitions to Soft Teal, subtle glow shadow
  - **Cards**: Hover elevates with shadow increase (0.2s ease)
  - **Score Ring**: Loading (pulsing shimmer), Updating (smooth arc transition), Complete (subtle glow)

- **Icon Selection** (Phosphor Icons):
  - **Modules**: Brain (UNDERSTAND), UsersThree (ALIGN), TrendUp (ELEVATE)
  - **Actions**: ChatCircle (AI Coach), CalendarCheck (Check-In), ChartLine (Progress)
  - **Navigation**: House (Dashboard), Gear (Settings), User (Profile)
  - **Feedback**: CheckCircle (Success), Info (Insights), Lightning (AI Processing)

- **Spacing**: 
  - **Container Padding**: px-6 (mobile), px-8 (tablet), px-12 (desktop)
  - **Section Gaps**: gap-8 (mobile), gap-12 (desktop)
  - **Card Padding**: p-6 (standard), p-8 (hero cards)
  - **Element Spacing**: space-y-4 (default), space-y-6 (sections)

- **Mobile**: 
  - **Bottom Tab Navigation**: Fixed bottom bar with 4 tabs (Dashboard, Coach, Check-In, Profile)
  - **Collapsible Module Headers**: Sticky headers that shrink on scroll
  - **Swipeable Cards**: Assessment questions, insight cards use swipe gestures
  - **Floating Action Button**: Quick access to AI Coach (persistent)
  - **Adaptive Grid**: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop) for insight cards
  - **Touch Targets**: Minimum 44px height for all interactive elements
