# LoveSpark: Relationship Intelligence Platform

LoveSpark is an AI-first Relationship Intelligence Operating System that helps high-achieving individuals UNDERSTAND, ALIGN, and ELEVATE their relationships through data-driven insights and behavioral optimization.

**Experience Qualities**:
1. **Premium & Analytical** - The platform feels like a sophisticated intelligence system, not a therapy app, with data-rich dashboards and precise metrics
2. **Empowering & Non-Judgmental** - Users feel equipped with insights and tools, never pathologized, with AI guidance that's warm yet analytical
3. **Dynamic & Adaptive** - The interface responds to user progress, relationship status changes, and behavioral patterns with context-aware personalization

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a multi-module platform with AI integration, real-time score calculations, dynamic user flows, persistent data tracking, assessment systems, and individual mode requiring sophisticated state management and routing.

## Essential Features

### Onboarding Flow
- **Functionality**: Multi-step intake capturing attachment style, communication patterns, relationship history, and generating initial RIS baseline
- **Purpose**: Establishes user profile foundation and creates first psychological snapshot for AI personalization
- **Trigger**: First app launch or account creation
- **Progression**: Welcome screen → Attachment assessment → Communication tendencies → Relationship history → AI processing → RIS reveal with animated score ring → Dashboard entry
- **Success criteria**: User completes all intake steps, receives RIS score 0-100, sees personalized first insight, and lands on dashboard

### RIS Score System
- **Functionality**: Calculates and displays Relationship Intelligence Score (0-100) based on three pillars: UNDERSTAND (35%), ALIGN (35%), ELEVATE (30%), with animated delta tracking
- **Purpose**: Provides quantifiable relationship intelligence metric that updates weekly to motivate progress
- **Trigger**: Initial assessment completion, weekly check-ins, protocol completions
- **Progression**: Data input → AI analysis → Sub-score calculations → Weighted aggregation → Animated score update with delta pulse → Insight generation
- **Success criteria**: Score displays prominently with smooth animation, delta shows +/- change, pillar breakdown is accessible

### AI Assistant Interface
- **Functionality**: Context-aware conversational AI that knows user's RIS, active challenges, recent check-ins, and provides analytical guidance
- **Purpose**: Offers 24/7 behavioral insights, pattern recognition, and actionable recommendations without therapeutic jargon
- **Trigger**: User initiates chat from dashboard or any module
- **Progression**: User message → Context injection (RIS + pillar scores + recent activity) → GPT-4o processing → Streamed analytical response → Follow-up suggestions
- **Success criteria**: AI responds within 2s, maintains conversation context, suggests relevant exercises

### Weekly Check-In
- **Functionality**: Structured 5-10 question reflection on relationship patterns, emotional states, and behavioral wins/challenges
- **Purpose**: Gathers behavioral data for RIS updates and insight generation, creating habit of self-reflection
- **Trigger**: Weekly notification or user-initiated from dashboard
- **Progression**: Check-in prompt → Question cards (slider/multiple choice) → Submission → AI processing animation → RIS update reveal → New insights delivery → Dashboard refresh
- **Success criteria**: Completes in under 3 minutes, generates 2-3 insights, updates RIS with visible delta, feels rewarding

### Check-In History & Trends
- **Functionality**: Comprehensive view of all completed check-ins with RIS score progression charts, pillar-specific trend analysis, statistics, and insight timeline
- **Purpose**: Enables users to visualize their relationship intelligence journey over time, identify patterns, and track progress across all three pillars
- **Trigger**: User accesses from dashboard "View History" button or profile settings
- **Progression**: History view entry → Overview tab (statistics + score progression chart) → Trends tab (individual pillar charts with change metrics) → Insights timeline tab (historical check-ins with generated insights) → Back to dashboard
- **Success criteria**: Displays all check-ins chronologically, shows overall and pillar-specific trends with clear visualizations, calculates streak and progress statistics, allows users to review past insights

### UNDERSTAND Module
- **Functionality**: Houses Relationship Pattern Scan, Emotional Intelligence Profile, Attachment Style results, Trigger Map, and Behavioral Blind Spot analysis
- **Purpose**: Builds self-awareness foundation through psychological assessments and AI pattern recognition
- **Trigger**: Dashboard pillar card tap or onboarding completion
- **Progression**: Module entry → Assessment selection → Multi-question flow → AI analysis → Visual results (charts/maps) → Insight cards → Progress tracking
- **Success criteria**: User completes at least one assessment, sees visual profile, receives 3+ insights, understand pillar score increases

### ALIGN Module
- **Functionality**: Communication Analyzer, Expectation Clarity exercises, Self-Reflection tools
- **Purpose**: Surfaces communication patterns and provides self-reflection for individuals to improve alignment with current or future partners
- **Trigger**: Dashboard access or after completing UNDERSTAND assessments
- **Progression**: Tool selection → Input communication patterns or self-responses → AI analysis → Insight visualization → Guided reflection prompts → Practice exercises
- **Success criteria**: Identifies 2+ communication patterns, provides actionable insights, improves align pillar score

### ELEVATE Module
- **Functionality**: Weekly Optimization Briefs, Growth Protocols (habit tracks), Progress Charts
- **Purpose**: Translates insights into behavioral change through structured protocols
- **Trigger**: Automated weekly brief delivery or user-initiated protocol start
- **Progression**: Brief review → Protocol selection → Daily habit tracking → Streak visualization → Milestone celebrations
- **Success criteria**: User maintains 3+ day streak, completes one protocol, sees elevate score increase, feels momentum

## Edge Case Handling

- **Incomplete Assessments** - Save progress automatically, allow resume from any step, show completion % on dashboard
- **Negative Score Deltas** - Reframe as learning opportunities, provide context (e.g., "Heightened awareness often reveals growth areas"), suggest targeted protocols
- **Stale Data** - Send gentle reminders after 10 days of inactivity, show "Data freshness affects RIS accuracy" message, maintain last known score
- **AI Response Failures** - Show "AI Coach is thinking..." with 10s timeout, fallback to pre-written guidance library, offer retry
- **Sensitive Content Detection** - AI identifies crisis language (self-harm, abuse), immediately surfaces crisis resources + psychologist escalation

## Design Direction

The design should evoke warmth, connection, and emotional intelligence - like a sophisticated companion that understands the heart of relationships. Users should feel they're accessing an empathetic yet analytical system that reveals patterns with care and sophistication. The aesthetic balances emotional warmth through rose-red tones with clean, data-rich interfaces, creating an experience that feels both heartfelt and intelligent.

## Color Selection

A vibrant, emotionally intelligent palette with distinct, vivid colors that provide clear visual coding for different UI states and content types, creating an energetic and engaging experience while maintaining sophistication.

- **Primary Color (Deep Crimson)**: `oklch(0.52 0.28 28)` - Rich, saturated crimson that commands attention; used for primary CTAs, main navigation highlights, and key interactive elements
- **Secondary Color (Vibrant Rose)**: `oklch(0.75 0.18 340)` - Bright, energetic rose-magenta; used for secondary actions, alternative paths, and supporting elements  
- **Accent Color (Warm Amber)**: `oklch(0.65 0.24 60)` - Sunny, optimistic amber-yellow; used for highlights, achievements, and moments of celebration
- **Success Color (Fresh Emerald)**: `oklch(0.62 0.20 145)` - Lively green signaling growth and positive outcomes; used for confirmations, progress indicators, and wins
- **Warning Color (Bright Gold)**: `oklch(0.75 0.18 80)` - Eye-catching golden yellow; used for important notices, tips, and attention-requiring items
- **Info Color (Electric Violet)**: `oklch(0.60 0.22 240)` - Striking blue-violet for informational content; used for insights, educational content, and system messages
- **Destructive Color (Bold Scarlet)**: `oklch(0.58 0.26 25)` - Clear danger signal; used for errors, warnings, and destructive actions
- **Understand Pillar (Mystic Purple)**: `oklch(0.65 0.22 280)` - Deep, thoughtful purple representing self-awareness and introspection
- **Align Pillar (Passionate Magenta)**: `oklch(0.62 0.24 340)` - Vibrant magenta-pink representing connection and harmony between partners
- **Elevate Pillar (Vibrant Mint)**: `oklch(0.68 0.20 140)` - Fresh, energizing green-cyan representing growth and forward momentum
- **Background (Warm White)**: `oklch(0.99 0.008 30)` - Slightly warm white base for premium feel and readability
- **Foreground (Rich Charcoal)**: `oklch(0.18 0.03 20)` - Deep, slightly warm charcoal for strong contrast and readability

**Foreground/Background Pairings**:
- Deep Crimson Primary (`oklch(0.52 0.28 28)`): White text `oklch(1 0 0)` - Ratio 5.2:1 ✓
- Vibrant Rose Secondary (`oklch(0.75 0.18 340)`): White text `oklch(0.98 0 0)` - Ratio 4.6:1 ✓
- Warm Amber Accent (`oklch(0.65 0.24 60)`): White text `oklch(0.98 0 0)` - Ratio 4.7:1 ✓
- Fresh Emerald Success (`oklch(0.62 0.20 145)`): White text `oklch(0.98 0 0)` - Ratio 4.9:1 ✓
- Bright Gold Warning (`oklch(0.75 0.18 80)`): Dark charcoal text `oklch(0.15 0.02 80)` - Ratio 8.1:1 ✓
- Electric Violet Info (`oklch(0.60 0.22 240)`): White text `oklch(0.98 0 0)` - Ratio 5.1:1 ✓
- Mystic Purple Understand (`oklch(0.65 0.22 280)`): White text `oklch(0.98 0 0)` - Ratio 4.8:1 ✓
- Passionate Magenta Align (`oklch(0.62 0.24 340)`): White text `oklch(0.98 0 0)` - Ratio 4.9:1 ✓
- Vibrant Mint Elevate (`oklch(0.68 0.20 140)`): White text `oklch(0.98 0 0)` - Ratio 4.5:1 ✓
- Warm White Background (`oklch(0.99 0.008 30)`): Rich Charcoal text `oklch(0.18 0.03 20)` - Ratio 14.2:1 ✓

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
  - **Actions**: ChatCircle (AI Assistant), CalendarCheck (Check-In), ChartLine (Progress)
  - **Navigation**: House (Dashboard), Gear (Settings), User (Profile)
  - **Feedback**: CheckCircle (Success), Info (Insights), Lightning (AI Processing)

- **Spacing**: 
  - **Container Padding**: px-6 (mobile), px-8 (tablet), px-12 (desktop)
  - **Section Gaps**: gap-8 (mobile), gap-12 (desktop)
  - **Card Padding**: p-6 (standard), p-8 (hero cards)
  - **Element Spacing**: space-y-4 (default), space-y-6 (sections)

- **Mobile**: 
  - **Bottom Tab Navigation**: Fixed bottom bar with 4 tabs (Dashboard, Assistant, Check-In, Profile)
  - **Collapsible Module Headers**: Sticky headers that shrink on scroll
  - **Swipeable Cards**: Assessment questions, insight cards use swipe gestures
  - **Floating Action Button**: Quick access to AI Assistant (persistent)
  - **Adaptive Grid**: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop) for insight cards
  - **Touch Targets**: Minimum 44px height for all interactive elements
